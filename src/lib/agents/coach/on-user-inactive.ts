import { EVENT_NAMES, type CoachRecommendationReadyPayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { logAgentActivity } from '@/lib/agents/activity-log'
import { getAgentContext } from '@/lib/memory/query'

const AGENT_ID = 'coach-agent'

/**
 * Triggered when a user is detected as inactive (3+ days without practice).
 * Fetches their weakness profile and emits a practice reminder recommendation.
 *
 * Each step.run() is independently retryable by Inngest.
 */
export const onUserInactive = inngest.createFunction(
  { id: 'coach/on-user-inactive', name: 'Coach: On User Inactive' },
  { event: EVENT_NAMES.USER_INACTIVE },
  async ({ event, step }) => {
    const { orgId, userId, daysSinceLastAttempt } = event.data

    const context = await step.run('fetch-context', async () => {
      return getAgentContext({ orgId, userId })
    })

    const message = buildReminderMessage(context.weaknesses, daysSinceLastAttempt)

    await step.run('log-activity', async () => {
      await logAgentActivity({
        orgId,
        userId,
        agentId: AGENT_ID,
        eventType: EVENT_NAMES.USER_INACTIVE,
        action: 'send_practice_reminder',
        details: {
          daysSinceLastAttempt,
          weaknessCount: context.weaknesses.length,
        },
      })
    })

    await step.run('emit-recommendation', async () => {
      const scenarioId = context.weaknesses[0]
        ? undefined // Scenario selection left to downstream consumers
        : undefined

      const payload: CoachRecommendationReadyPayload = {
        userId,
        orgId,
        recommendationType: 'practice_reminder',
        scenarioId,
        message,
      }

      await inngest.send({
        name: EVENT_NAMES.COACH_RECOMMENDATION_READY,
        data: payload,
      })
    })

    return { reminded: true, daysSinceLastAttempt }
  },
)

/** Build a personalized reminder message based on weakness data. */
function buildReminderMessage(
  weaknesses: { key: string; score?: number | null }[],
  daysSinceLastAttempt: number,
): string {
  const dayLabel = daysSinceLastAttempt === 1 ? 'day' : 'days'

  if (weaknesses.length === 0) {
    return `You haven't practiced in ${daysSinceLastAttempt} ${dayLabel}. A quick session will keep your skills sharp.`
  }

  const weakest = weaknesses[0]
  return (
    `You haven't practiced in ${daysSinceLastAttempt} ${dayLabel}. ` +
    `Your weakest area is ${weakest.key}` +
    (weakest.score != null ? ` (score: ${weakest.score})` : '') +
    `. A focused practice session could help improve it.`
  )
}
