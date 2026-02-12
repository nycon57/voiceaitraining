import { createClient } from '@supabase/supabase-js'

import { EVENT_NAMES } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'

const INACTIVITY_THRESHOLD_DAYS = 3
const PAGE_SIZE = 1000

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

      // Fetch all completed attempts with pagination. PostgREST defaults
      // to 1000 rows — paginate to avoid silent truncation.
      // Grouping happens in TypeScript because PostgREST lacks GROUP BY.
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
