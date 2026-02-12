'use server'

import { assertHuman } from '@/lib/botid'
import { withOrgGuard } from '@/lib/auth'
import { z } from 'zod'

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz })
    return true
  } catch {
    return false
  }
}

const notificationPreferencesSchema = z.object({
  channel_email: z.boolean(),
  channel_push: z.boolean(),
  channel_in_app: z.boolean(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').nullable(),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').nullable(),
  quiet_hours_timezone: z
    .string()
    .refine(isValidTimezone, {
      message: 'Invalid timezone. Please select a valid IANA timezone.',
    }),
  digest_frequency: z.enum(['daily', 'weekly', 'none']),
  coach_nudges: z.boolean(),
})

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>

export interface NotificationPreferences {
  id: string
  channel_email: boolean
  channel_push: boolean
  channel_in_app: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  quiet_hours_timezone: string
  digest_frequency: string
  coach_nudges: boolean
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'id'> = {
  channel_email: true,
  channel_push: true,
  channel_in_app: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
  quiet_hours_timezone: 'UTC',
  digest_frequency: 'daily',
  coach_nudges: true,
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return withOrgGuard(async (user, orgId, supabase) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('id, channel_email, channel_push, channel_in_app, quiet_hours_start, quiet_hours_end, quiet_hours_timezone, digest_frequency, coach_nudges')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch notification preferences: ${error.message}`)
    }

    if (!data) {
      return { id: '', ...DEFAULT_PREFERENCES }
    }

    return data
  })
}

export async function updateNotificationPreferences(
  prefs: NotificationPreferencesInput
): Promise<NotificationPreferences> {
  await assertHuman()

  const validated = notificationPreferencesSchema.parse(prefs)

  return withOrgGuard(async (user, orgId, supabase) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          org_id: orgId,
          user_id: user.id,
          ...validated,
        },
        { onConflict: 'org_id,user_id' }
      )
      .select('id, channel_email, channel_push, channel_in_app, quiet_hours_start, quiet_hours_end, quiet_hours_timezone, digest_frequency, coach_nudges')
      .single()

    if (error) {
      throw new Error(`Failed to update notification preferences: ${error.message}`)
    }

    return data
  })
}

// ============================================================================
// Notification CRUD (US-022)
// ============================================================================

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  action_url: string | null
  agent_id: string | null
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export async function getNotifications(
  limit: number = 20,
  offset: number = 0,
): Promise<Notification[]> {
  const validated = paginationSchema.parse({ limit, offset })

  return withOrgGuard(async (user, orgId, supabase) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, body, action_url, agent_id, read, metadata, created_at')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(validated.offset, validated.offset + validated.limit - 1)

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`)
    }

    return data ?? []
  })
}

export async function getUnreadCount(): Promise<number> {
  return withOrgGuard(async (user, orgId, supabase) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      throw new Error(`Failed to fetch unread count: ${error.message}`)
    }

    return count ?? 0
  })
}

const markAsReadSchema = z.string().uuid()

export async function markAsRead(id: string): Promise<void> {
  await assertHuman()
  const validId = markAsReadSchema.parse(id)

  return withOrgGuard(async (user, orgId, supabase) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', validId)
      .eq('org_id', orgId)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`)
    }
  })
}

export async function markAllAsRead(): Promise<void> {
  await assertHuman()

  return withOrgGuard(async (user, orgId, supabase) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`)
    }
  })
}
