import { createElement } from 'react'
import { Resend } from 'resend'
import { z } from 'zod'

import { createServiceClient } from '@/lib/memory/supabase'

import { emailTemplates, type NotificationType } from './email-templates'

// Validation

const sendNotificationSchema = z.object({
  userId: z.string().min(1),
  orgId: z.string().uuid(),
  type: z.enum([
    'coach_recommendation',
    'daily_digest',
    'practice_reminder',
    'weakness_update',
    'assignment_created',
    'assignment_overdue',
  ]),
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

// Preferences

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

  return {
    channel_email: data.channel_email ?? true,
    channel_in_app: data.channel_in_app ?? true,
    quiet_hours_start: data.quiet_hours_start,
    quiet_hours_end: data.quiet_hours_end,
    quiet_hours_timezone: data.quiet_hours_timezone ?? 'UTC',
  }
}

// Quiet hours

/**
 * Check if the current time falls within the user's quiet hours.
 *
 * Quiet hours are defined as a start and end time in the user's timezone.
 * Supports overnight ranges (e.g., 22:00 to 08:00).
 */
function isQuietHours(prefs: NotificationPreferences): boolean {
  if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false

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

  const [startH, startM] = prefs.quiet_hours_start.split(':').map(Number)
  const [endH, endM] = prefs.quiet_hours_end.split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  // Overnight range (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  }

  // Same-day range (e.g., 13:00 to 15:00)
  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

// In-app notification

async function createInAppNotification(
  params: SendNotificationParams,
  channelsSent: string[],
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
      channel_sent: channelsSent,
      metadata: params.metadata ?? null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create in-app notification: ${error.message}`)
  }

  return data.id as string
}

// Email sending

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

async function sendEmail(params: SendNotificationParams): Promise<boolean> {
  if (!params.recipientEmail) return false

  const Template = emailTemplates[params.type as NotificationType]
  if (!Template) return false

  const element = createElement(Template, {
    title: params.title,
    body: params.body,
    actionUrl: params.actionUrl,
    recipientName: params.recipientName,
  })

  const { error } = await getResend().emails.send({
    from: process.env.EMAIL_FROM,
    to: params.recipientEmail,
    subject: params.title,
    react: element,
  })

  if (error) {
    console.error(
      `[notifications] Failed to send email to ${params.recipientEmail}:`,
      error.message,
    )
    return false
  }

  return true
}

// Main dispatcher

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

  const channelsSent: string[] = ['in_app']
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
    if (emailSent) {
      channelsSent.push('email')
    }
  }

  // In-app notification is always created
  const notificationId = await createInAppNotification(validated, channelsSent)

  return {
    inAppCreated: true,
    emailSent,
    emailSuppressedReason,
    notificationId,
  }
}
