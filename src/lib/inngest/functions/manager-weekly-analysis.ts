import { generateManagerInsights } from '@/lib/agents/manager/insight-generator'
import { analyzeTeamPerformance } from '@/lib/agents/manager/team-analyzer'
import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/memory/supabase'
import { sendNotification } from '@/lib/notifications'

const AGENT_ID = 'manager-intelligence'

/**
 * Weekly cron: Monday 9am UTC.
 * Runs team analysis per org, converts to insights, and sends
 * notifications to all managers and admins.
 *
 * Uses the service client (bypasses RLS) because this runs as a
 * system-level cron without user context. All queries filter by
 * org_id explicitly.
 */
export const managerWeeklyAnalysis = inngest.createFunction(
  { id: 'manager-weekly-analysis', name: 'Manager: Weekly Team Analysis' },
  { cron: '0 9 * * 1' },
  async ({ step }) => {
    const orgIds = await step.run('list-active-orgs', async () => {
      const supabase = createServiceClient()
      const { data, error } = await supabase.from('orgs').select('id')

      if (error) throw new Error(`Failed to fetch orgs: ${error.message}`)
      return (data ?? []).map((o: { id: string }) => o.id)
    })

    let totalInsights = 0
    let totalNotifications = 0
    const failedOrgs: string[] = []

    for (const orgId of orgIds) {
      try {
        const analysis = await step.run(`analyze-${orgId}`, () =>
          analyzeTeamPerformance(orgId),
        )

        const insights = await step.run(`insights-${orgId}`, () =>
          generateManagerInsights(analysis),
        )

        if (insights.length === 0) continue
        totalInsights += insights.length

        // Find managers/admins and send filtered insights in one step
        // to avoid Inngest Jsonify serialization mismatches across steps.
        const sent = await step.run(`notify-${orgId}`, async () => {
          const managers = await findOrgManagers(orgId)
          if (managers.length === 0) return 0

          let notified = 0

          for (const manager of managers) {
            const filtered = manager.lowPriorityAlerts
              ? insights
              : insights.filter((i) => i.priority !== 'low')

            if (filtered.length === 0) continue

            for (const insight of filtered) {
              try {
                await sendNotification({
                  userId: manager.userId,
                  orgId,
                  type: 'weekly_insight',
                  title: insight.title,
                  body: insight.message,
                  agentId: AGENT_ID,
                  recipientEmail: manager.email,
                  recipientName: manager.name,
                  metadata: {
                    insightType: insight.type,
                    priority: insight.priority,
                    ...insight.metadata,
                  },
                })
                notified++
              } catch (err) {
                console.error(
                  `[manager-weekly] Failed to notify manager ${manager.userId}:`,
                  err instanceof Error ? err.message : String(err),
                )
              }
            }
          }

          return notified
        })

        totalNotifications += sent
      } catch (err) {
        console.error(
          `[manager-weekly] Failed to process org ${orgId}:`,
          err instanceof Error ? err.message : String(err),
        )
        failedOrgs.push(orgId)
      }
    }

    return {
      orgsProcessed: orgIds.length,
      totalInsights,
      totalNotifications,
      failures: failedOrgs.length,
      failedOrgs,
    }
  },
)

// ── Helpers ─────────────────────────────────────────────────────────

interface ManagerInfo {
  userId: string
  name?: string
  email?: string
  lowPriorityAlerts: boolean
}

async function findOrgManagers(orgId: string): Promise<ManagerInfo[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('org_id', orgId)
    .in('role', ['manager', 'admin'])

  if (error) {
    console.error(
      `[manager-weekly] Failed to fetch managers for org ${orgId}:`,
      error.message,
    )
    return []
  }

  if (!data || data.length === 0) return []

  const managerIds = data.map((m: { user_id: string }) => m.user_id)

  const [usersResult, prefsResult] = await Promise.all([
    supabase
      .from('users')
      .select('clerk_user_id, first_name, email')
      .in('clerk_user_id', managerIds),
    supabase
      .from('notification_preferences')
      .select('user_id, low_priority_alerts')
      .eq('org_id', orgId)
      .in('user_id', managerIds),
  ])

  if (usersResult.error) {
    console.error(
      '[manager-weekly] Failed to fetch manager details:',
      usersResult.error.message,
    )
  }

  // low_priority_alerts column may not exist yet; default to true
  const prefsData = prefsResult.error
    ? []
    : ((prefsResult.data ?? []) as Array<{
        user_id: string
        low_priority_alerts: boolean | null
      }>)

  if (prefsResult.error) {
    console.error(
      '[manager-weekly] Failed to fetch notification preferences:',
      prefsResult.error.message,
    )
  }

  const users = (usersResult.data ?? []) as Array<{
    clerk_user_id: string
    first_name: string | null
    email: string | null
  }>

  const userMap = new Map(users.map((u) => [u.clerk_user_id, u]))
  const prefsMap = new Map(prefsData.map((p) => [p.user_id, p]))

  return managerIds.map((id) => ({
    userId: id,
    name: userMap.get(id)?.first_name ?? undefined,
    email: userMap.get(id)?.email ?? undefined,
    lowPriorityAlerts: prefsMap.get(id)?.low_priority_alerts ?? true,
  }))
}
