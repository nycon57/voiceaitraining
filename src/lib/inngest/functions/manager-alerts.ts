import { EVENT_NAMES } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/memory/supabase'
import { sendNotification, type NotificationType } from '@/lib/notifications'

const CRITICAL_SCORE_THRESHOLD = 40
const DECLINING_WINDOW = 3
const ACHIEVEMENT_SCORE_THRESHOLD = 90

interface Alert {
  type: NotificationType
  title: string
  body: string
}

interface Manager {
  userId: string
  name: string | undefined
  email: string | undefined
}

interface SendResult {
  managerId: string
  alertType: string
  notificationId: string | null
  error?: string
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
    const { attemptId, userId, orgId, scenarioId, score } = event.data

    const alerts = await step.run('evaluate-alert-rules', async () => {
      const supabase = createServiceClient()
      const matched: Alert[] = []

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

      if (traineeResult.error) {
        console.error('[manager-alerts] Failed to fetch trainee:', traineeResult.error.message)
      }
      if (scenarioResult.error) {
        console.error('[manager-alerts] Failed to fetch scenario:', scenarioResult.error.message)
      }

      const traineeName = formatName(
        traineeResult.data?.first_name,
        traineeResult.data?.last_name,
      )
      const scenarioName = scenarioResult.data?.title ?? 'Unknown scenario'

      // Rule 1: Score < 40 → critical alert
      if (score < CRITICAL_SCORE_THRESHOLD) {
        matched.push({
          type: 'critical_score',
          title: `Low score alert: ${traineeName} scored ${score} on ${scenarioName}`,
          body: `${traineeName} scored ${score} on "${scenarioName}", below the critical threshold of ${CRITICAL_SCORE_THRESHOLD}. Review their attempt and schedule a coaching session.`,
        })
      }

      // Rule 2: 3+ consecutive declining scores → trend alert
      // Exclude the current attempt to detect a true prior trend
      const { data: recentAttempts, error: attemptsError } = await supabase
        .from('scenario_attempts')
        .select('score')
        .eq('clerk_user_id', userId)
        .eq('org_id', orgId)
        .eq('status', 'completed')
        .not('score', 'is', null)
        .neq('id', attemptId)
        .order('started_at', { ascending: false })
        .limit(DECLINING_WINDOW - 1)

      if (attemptsError) {
        console.error('[manager-alerts] Failed to fetch recent attempts:', attemptsError.message)
      }

      if (recentAttempts && recentAttempts.length >= DECLINING_WINDOW - 1) {
        // Prepend current score (newest) to the prior scores (also newest-first)
        const scores = [
          score,
          ...recentAttempts
            .map((a) => a.score)
            .filter((s): s is number => typeof s === 'number'),
        ]

        // Scores are newest-first; declining means each older score is higher than the newer one
        const isDeclining =
          scores.length >= DECLINING_WINDOW &&
          scores.every((s, i) => i === 0 || s > scores[i - 1])

        if (isDeclining) {
          const chronological = [...scores].reverse()
          matched.push({
            type: 'declining_trend',
            title: `Declining trend: ${traineeName} has ${DECLINING_WINDOW}+ consecutive declining scores`,
            body: `${traineeName}'s scores are declining: ${chronological.join(' → ')}. Review recent attempts and schedule a coaching session.`,
          })
        }
      }

      // Rule 3: First completed attempt with score > 90 → achievement
      const { count, error: countError } = await supabase
        .from('scenario_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('clerk_user_id', userId)
        .eq('org_id', orgId)
        .eq('status', 'completed')
        .not('score', 'is', null)

      if (countError) {
        console.error('[manager-alerts] Failed to count attempts:', countError.message)
      }

      if (count === 1 && score > ACHIEVEMENT_SCORE_THRESHOLD) {
        matched.push({
          type: 'achievement',
          title: `Achievement: ${traineeName} scored ${score} on first attempt`,
          body: `${traineeName} scored ${score} on their first attempt at "${scenarioName}". Consider recognizing this in your next team sync.`,
        })
      }

      return matched
    })

    if (alerts.length === 0) {
      return { dispatched: false, reason: 'no_alerts_triggered' }
    }

    const managers = await step.run('find-managers', async (): Promise<Manager[]> => {
      const supabase = createServiceClient()
      const { data: managerUsers, error } = await supabase
        .from('users')
        .select('clerk_user_id, first_name, email')
        .eq('org_id', orgId)
        .eq('role', 'manager')

      if (error) {
        console.error('[manager-alerts] Failed to fetch managers:', error.message)
        return []
      }

      if (!managerUsers || managerUsers.length === 0) return []

      return managerUsers.map((manager) => ({
        userId: manager.clerk_user_id,
        name: manager.first_name ?? undefined,
        email: manager.email ?? undefined,
      }))
    })

    if (managers.length === 0) {
      return { dispatched: false, reason: 'no_managers_found' }
    }

    // Continue past individual send failures so one broken notification doesn't block the rest
    const sendResults = await step.run('send-alerts', async () => {
      const results: SendResult[] = []

      for (const manager of managers) {
        for (const alert of alerts) {
          try {
            const { notificationId } = await sendNotification({
              userId: manager.userId,
              orgId,
              type: alert.type,
              title: alert.title,
              body: alert.body,
              recipientEmail: manager.email,
              recipientName: manager.name,
            })

            results.push({
              managerId: manager.userId,
              alertType: alert.type,
              notificationId,
            })
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            console.error(
              `[manager-alerts] Failed to send ${alert.type} to manager ${manager.userId}:`,
              message,
            )
            results.push({
              managerId: manager.userId,
              alertType: alert.type,
              notificationId: null,
              error: message,
            })
          }
        }
      }

      return results
    })

    return {
      dispatched: true,
      alertCount: alerts.length,
      managerCount: managers.length,
      results: sendResults,
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
