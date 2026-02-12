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
