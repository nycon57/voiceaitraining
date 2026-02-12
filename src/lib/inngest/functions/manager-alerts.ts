import { EVENT_NAMES } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/memory/supabase'
import { sendNotification, type NotificationType } from '@/lib/notifications'

const CRITICAL_SCORE_THRESHOLD = 40
const DECLINING_WINDOW = 3
const ACHIEVEMENT_SCORE_THRESHOLD = 90

interface AlertPayload {
  type: NotificationType
  title: string
  body: string
}

interface ManagerUser {
  clerk_user_id: string
  first_name: string | null
  email: string | null
}

interface ManagerInfo {
  userId: string
  name: string | undefined
  email: string | undefined
}

/**
 * Subscribes to attempt.scored events and sends real-time alerts to managers
 * when critical scoring events occur:
 * - Score < 40 → critical alert
 * - 3+ consecutive declining scores → trend alert
 * - First attempt score > 90 → achievement notification
 */
export const managerAlerts = inngest.createFunction(
  { id: 'manager-alerts', name: 'Manager Alerts on Critical Scoring Events' },
  { event: EVENT_NAMES.ATTEMPT_SCORED },
  async ({ event, step }) => {
    const { userId, orgId, scenarioId, score } = event.data

    const alerts = await step.run('evaluate-alert-rules', async () => {
      const supabase = createServiceClient()
      const results: AlertPayload[] = []

      // Fetch trainee name and scenario title in parallel
      const [traineeResult, scenarioResult] = await Promise.all([
        supabase
          .from('users')
          .select('first_name, last_name')
          .eq('clerk_user_id', userId)
          .maybeSingle(),
        supabase
          .from('scenarios')
          .select('title')
          .eq('id', scenarioId)
          .maybeSingle(),
      ])

      const traineeName = formatName(
        traineeResult.data?.first_name,
        traineeResult.data?.last_name,
      )
      const scenarioName = scenarioResult.data?.title ?? 'Unknown scenario'

      // Rule 1: Score < 40 → critical alert
      if (score < CRITICAL_SCORE_THRESHOLD) {
        results.push({
          type: 'critical_score',
          title: `Low score alert: ${traineeName} scored ${score} on ${scenarioName}`,
          body: `${traineeName} scored ${score} on "${scenarioName}". This is below the critical threshold of ${CRITICAL_SCORE_THRESHOLD}. Immediate coaching intervention may be needed.`,
        })
      }

      // Rule 2: 3+ consecutive declining scores → trend alert
      const { data: recentAttempts } = await supabase
        .from('scenario_attempts')
        .select('score')
        .eq('clerk_user_id', userId)
        .eq('org_id', orgId)
        .eq('status', 'completed')
        .not('score', 'is', null)
        .order('started_at', { ascending: false })
        .limit(DECLINING_WINDOW)

      if (recentAttempts && recentAttempts.length >= DECLINING_WINDOW) {
        const scores = recentAttempts.map((a) => a.score as number)
        // scores are newest-first; declining means each older score is higher
        const isDeclining = scores.every(
          (s, i) => i === 0 || s < scores[i - 1],
        )
        if (isDeclining) {
          const chronological = [...scores].reverse()
          results.push({
            type: 'declining_trend',
            title: `Declining trend: ${traineeName} has ${DECLINING_WINDOW}+ consecutive declining scores`,
            body: `${traineeName}'s recent scores show a declining trend: ${chronological.join(' → ')}. Consider providing targeted coaching support.`,
          })
        }
      }

      // Rule 3: First completed attempt with score > 90 → achievement
      const { count } = await supabase
        .from('scenario_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('clerk_user_id', userId)
        .eq('org_id', orgId)
        .eq('status', 'completed')
        .not('score', 'is', null)

      if (count === 1 && score > ACHIEVEMENT_SCORE_THRESHOLD) {
        results.push({
          type: 'achievement',
          title: `Achievement: ${traineeName} scored ${score} on first attempt!`,
          body: `${traineeName} scored an impressive ${score} on their very first attempt at "${scenarioName}". Consider recognizing this accomplishment!`,
        })
      }

      return results
    })

    if (alerts.length === 0) {
      return { dispatched: false, reason: 'no_alerts_triggered' }
    }

    // Find managers in the same org
    const managers = await step.run('find-managers', async (): Promise<ManagerInfo[]> => {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('org_members')
        .select('user_id')
        .eq('org_id', orgId)
        .eq('role', 'manager')

      if (error) {
        console.error('[manager-alerts] Failed to fetch managers:', error.message)
        return []
      }

      if (!data || data.length === 0) return []

      // Fetch manager details for email notifications
      const managerIds = (data as Array<{ user_id: string }>).map((m) => m.user_id)
      const { data: managerUsers, error: usersError } = await supabase
        .from('users')
        .select('clerk_user_id, first_name, email')
        .in('clerk_user_id', managerIds)

      if (usersError) {
        console.error('[manager-alerts] Failed to fetch manager details:', usersError.message)
        // Fall back to IDs only (in-app notifications still work without email)
        return managerIds.map((id) => ({ userId: id, name: undefined, email: undefined }))
      }

      const users = (managerUsers ?? []) as ManagerUser[]
      const userMap = new Map(users.map((u) => [u.clerk_user_id, u]))

      return managerIds.map((id) => ({
        userId: id,
        name: userMap.get(id)?.first_name ?? undefined,
        email: userMap.get(id)?.email ?? undefined,
      }))
    })

    if (managers.length === 0) {
      return { dispatched: false, reason: 'no_managers_found' }
    }

    // Send each alert to every manager
    const results = await step.run('send-alerts', async () => {
      const sent: Array<{
        managerId: string
        alertType: string
        notificationId: string
      }> = []

      for (const manager of managers) {
        for (const alert of alerts) {
          const result = await sendNotification({
            userId: manager.userId,
            orgId,
            type: alert.type,
            title: alert.title,
            body: alert.body,
            recipientEmail: manager.email,
            recipientName: manager.name,
          })

          sent.push({
            managerId: manager.userId,
            alertType: alert.type,
            notificationId: result.notificationId,
          })
        }
      }

      return sent
    })

    return {
      dispatched: true,
      alertCount: alerts.length,
      managerCount: managers.length,
      results,
    }
  },
)

function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  return 'Unknown trainee'
}
