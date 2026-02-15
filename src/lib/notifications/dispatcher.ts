import { createHash } from 'crypto'
import { createElement } from 'react'
import { Resend } from 'resend'
import { z } from 'zod'

import { createServiceClient } from '@/lib/memory/supabase'

import { emailTemplates, NOTIFICATION_TYPES } from './email-templates'

const sendNotificationSchema = z.object({
  userId: z.string().min(1),
  orgId: z.string().uuid(),
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().min(1),
  body: z.string().min(1),
  actionUrl: z.string().url().optional(),
  agentId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
})

export type SendNotificationParams = z.infer<typeof sendNotificationSchema>

export interface SendNotificationResult {
  inAppCreated: boolean
  emailSent: boolean
  emailSuppressedReason?: 'quiet_hours' | 'channel_disabled' | 'no_email'
  notificationId: string
}

interface NotificationPreferences {
  channel_email: boolean
  channel_in_app: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  quiet_hours_timezone: string
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  channel_email: true,
  channel_in_app: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
  quiet_hours_timezone: 'UTC',
}

async function getUserPreferences(
  orgId: string,
  userId: string,
): Promise<NotificationPreferences> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('notification_preferences')
    .select(
      'channel_email, channel_in_app, quiet_hours_start, quiet_hours_end, quiet_hours_timezone',
    )
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error(
      `[notifications] Failed to fetch preferences for user ${userId}:`,
      error.message,
    )
    return DEFAULT_PREFERENCES
  }

  if (!data) return DEFAULT_PREFERENCES

  return { ...DEFAULT_PREFERENCES, ...data }
}

/** Parse "HH:MM" or "HH:MM:SS" (PostgreSQL time format) to total minutes. */
function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':')
  if (parts.length < 2) return null
  const hour = parseInt(parts[0], 10)
  const minute = parseInt(parts[1], 10)
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }
  return hour * 60 + minute
}

/**
 * Check if the current time falls within the user's quiet hours.
 * Supports overnight ranges (e.g., 22:00 to 08:00).
 * Fails open (returns false) on invalid timezone or time format.
 */
function isQuietHours(prefs: NotificationPreferences): boolean {
  if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false

  const startMinutes = parseTimeToMinutes(prefs.quiet_hours_start)
  const endMinutes = parseTimeToMinutes(prefs.quiet_hours_end)
  if (startMinutes === null || endMinutes === null) return false

  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: prefs.quiet_hours_timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const parts = formatter.formatToParts(now)
    const hourPart = parts.find((p) => p.type === 'hour')
    const minutePart = parts.find((p) => p.type === 'minute')
    if (!hourPart || !minutePart) return false

    const currentMinutes = parseInt(hourPart.value, 10) * 60 + parseInt(minutePart.value, 10)

    // Overnight range (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    // Same-day range (e.g., 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  } catch {
    // Invalid timezone — fail open (send notification)
    return false
  }
}

async function createInAppNotification(
  params: SendNotificationParams,
): Promise<string> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      org_id: params.orgId,
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      action_url: params.actionUrl ?? null,
      agent_id: params.agentId ?? null,
      read: false,
      channel_sent: ['in_app'],
      metadata: params.metadata ?? null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create in-app notification: ${error.message}`)
  }

  return data.id
}

let resendClient: Resend | null = null
function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

async function sendEmail(params: SendNotificationParams): Promise<boolean> {
  if (!params.recipientEmail) return false

  const from = process.env.EMAIL_FROM
  if (!from) {
    console.error('[notifications] EMAIL_FROM environment variable is not set')
    return false
  }

  const Template = emailTemplates[params.type]
  if (!Template) return false

  const element = createElement(Template, {
    title: params.title,
    body: params.body,
    actionUrl: params.actionUrl,
    recipientName: params.recipientName,
  })

  const { error } = await getResend().emails.send({
    from,
    to: params.recipientEmail,
    subject: params.title,
    react: element,
  })

  if (error) {
    const emailHash = createHash('sha256').update(params.recipientEmail).digest('hex').slice(0, 12)
    console.error(
      `[notifications] Failed to send email (recipient=${emailHash}, userId=${params.userId}):`,
      error.message,
    )
    return false
  }

  return true
}

/**
 * Send a notification to a user, respecting their channel preferences and quiet hours.
 *
 * Always creates an in-app notification. Sends email only if:
 * - User has email channel enabled
 * - Recipient email is provided
 * - Current time is outside quiet hours
 */
export async function sendNotification(
  params: SendNotificationParams,
): Promise<SendNotificationResult> {
  const validated = sendNotificationSchema.parse(params)

  const prefs = await getUserPreferences(validated.orgId, validated.userId)

  const notificationId = await createInAppNotification(validated)

  let emailSent = false
  let emailSuppressedReason: SendNotificationResult['emailSuppressedReason']

  // Determine email eligibility
  if (!validated.recipientEmail) {
    emailSuppressedReason = 'no_email'
  } else if (!prefs.channel_email) {
    emailSuppressedReason = 'channel_disabled'
  } else if (isQuietHours(prefs)) {
    emailSuppressedReason = 'quiet_hours'
  } else {
    emailSent = await sendEmail(validated)
  }

  return {
    inAppCreated: true,
    emailSent,
    emailSuppressedReason,
    notificationId,
  }
}
