import { createClient } from '@supabase/supabase-js'

import { EVENT_NAMES } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'

const INACTIVITY_THRESHOLD_DAYS = 3

/**
 * Daily cron that detects trainees inactive for 3+ days and emits
 * user.inactive events so the Coach Agent can send practice reminders.
 *
 * Uses the bare supabase-js client with the service-role key because
 * Inngest cron jobs have no Next.js request context (no cookies()).
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

      // Single query: fetch org_id, clerk_user_id, started_at for all
      // completed attempts. Grouping happens in TypeScript below because
      // PostgREST does not support GROUP BY directly.
      const { data, error } = await supabase
        .from('scenario_attempts')
        .select('org_id, clerk_user_id, started_at')
        .eq('status', 'completed')

      if (error) {
        throw new Error(`Failed to query scenario_attempts: ${error.message}`)
      }

      if (!data || data.length === 0) return []

      // GROUP BY (org_id, clerk_user_id) — keep only the latest started_at
      const latestByUser = new Map<
        string,
        { orgId: string; userId: string; lastAttemptAt: Date }
      >()

      for (const row of data) {
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

      // Filter to users whose last completed attempt is 3+ days ago
      const now = new Date()
      const inactive: Array<{
        userId: string
        orgId: string
        lastAttemptAt: string
        daysSinceLastAttempt: number
      }> = []

      for (const user of latestByUser.values()) {
        const daysSince = Math.floor(
          (now.getTime() - user.lastAttemptAt.getTime()) / (1000 * 60 * 60 * 24),
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

    // Batch-emit all user.inactive events in a single Inngest send call
    if (inactiveUsers.length > 0) {
      await step.sendEvent(
        'emit-inactive-events',
        inactiveUsers.map((user) => ({
          name: EVENT_NAMES.USER_INACTIVE as typeof EVENT_NAMES.USER_INACTIVE,
          data: user,
        })),
      )
    }

    return { detectedCount: inactiveUsers.length }
  },
)
