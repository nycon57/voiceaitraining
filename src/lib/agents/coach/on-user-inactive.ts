import { EVENT_NAMES, type CoachRecommendationReadyPayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { logAgentActivity } from '@/lib/agents/activity-log'
import { getAgentContext } from '@/lib/memory/query'
import type { WeaknessEntry } from '@/lib/memory/user-memory'

const AGENT_ID = 'coach-agent'

/**
 * Handles user inactivity events by fetching the trainee's weakness profile
 * and emitting a personalized practice reminder recommendation.
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
      const message = buildReminderMessage(context.weaknesses, daysSinceLastAttempt)

      const payload: CoachRecommendationReadyPayload = {
        userId,
        orgId,
        recommendationType: 'practice_reminder',
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

/** Build a personalized reminder message from weakness data and inactivity duration. */
function buildReminderMessage(
  weaknesses: Pick<WeaknessEntry, 'key' | 'score'>[],
  daysSinceLastAttempt: number,
): string {
  const dayLabel = daysSinceLastAttempt === 1 ? 'day' : 'days'
  const prefix = `You haven't practiced in ${daysSinceLastAttempt} ${dayLabel}.`

  if (weaknesses.length === 0) {
    return `${prefix} Jump into a quick session to keep your skills sharp.`
  }

  const weakest = weaknesses[0]
  const label = weakest.key.replace(/_/g, ' ')
  const scoreNote = weakest.score != null ? ` (currently at ${weakest.score}%)` : ''
  return `${prefix} Your weakest area is ${label}${scoreNote}. A focused practice session will help you improve.`
}
