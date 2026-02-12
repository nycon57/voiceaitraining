import { createClient } from '@supabase/supabase-js'

import { EVENT_NAMES, type UserInactivePayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'

const INACTIVITY_THRESHOLD_DAYS = 3
const MS_PER_DAY = 1000 * 60 * 60 * 24
const PAGE_SIZE = 1000

/**
 * Daily cron: emits user.inactive events for trainees idle 3+ days
 * so the Coach Agent can send practice reminders.
 *
 * Uses supabase-js with the service-role key directly because
 * Inngest crons run outside Next.js request context (no cookies()).
 */
export const detectInactiveUsers = inngest.createFunction(
  { id: 'detect-inactive-users', name: 'Detect Inactive Users' },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    const inactiveUsers = await step.run('query-inactive-users', async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

      // PostgREST caps responses at 1000 rows and lacks GROUP BY,
      // so we paginate and group by user in TypeScript.
      const latestByUser = new Map<
        string,
        { orgId: string; userId: string; lastAttemptAt: Date }
      >()

      let offset = 0
      while (true) {
        const { data, error } = await supabase
          .from('scenario_attempts')
          .select('org_id, clerk_user_id, started_at')
          .eq('status', 'completed')
          .range(offset, offset + PAGE_SIZE - 1)

        if (error) {
          throw new Error(`Failed to query scenario_attempts: ${error.message}`)
        }

        if (!data || data.length === 0) break

        for (const row of data) {
          if (!row.clerk_user_id) continue

          const key = `${row.org_id}|${row.clerk_user_id}`
          const ts = new Date(row.started_at)
          const existing = latestByUser.get(key)

          if (!existing || ts > existing.lastAttemptAt) {
            latestByUser.set(key, {
              orgId: row.org_id,
              userId: row.clerk_user_id,
              lastAttemptAt: ts,
            })
          }
        }

        if (data.length < PAGE_SIZE) break
        offset += PAGE_SIZE
      }

      // Keep only users past the inactivity threshold
      const now = new Date()
      const inactive: UserInactivePayload[] = []

      for (const user of latestByUser.values()) {
        const daysSince = Math.floor(
          (now.getTime() - user.lastAttemptAt.getTime()) / MS_PER_DAY,
        )

        if (daysSince >= INACTIVITY_THRESHOLD_DAYS) {
          inactive.push({
            userId: user.userId,
            orgId: user.orgId,
            lastAttemptAt: user.lastAttemptAt.toISOString(),
            daysSinceLastAttempt: daysSince,
          })
        }
      }

      return inactive
    })

    // Single send call to batch all events
    if (inactiveUsers.length > 0) {
      await step.sendEvent(
        'emit-inactive-events',
        inactiveUsers.map((user) => ({
          name: EVENT_NAMES.USER_INACTIVE,
          data: user,
        })),
      )
    }

    return { detectedCount: inactiveUsers.length }
  },
)
