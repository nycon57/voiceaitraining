import { EVENT_NAMES, type CoachWeaknessUpdatedPayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { logAgentActivity } from '@/lib/agents/activity-log'
import { generateWeaknessProfile, type DimensionResult } from '@/lib/memory/weakness-profiler'

const AGENT_ID = 'coach-agent'

/**
 * Recalculates the trainee's weakness profile after a scored attempt,
 * logs the activity, and emits a weakness-updated event for downstream agents.
 *
 * Each step.run() is independently retryable by Inngest.
 */
export const onAttemptScored = inngest.createFunction(
  { id: 'coach/on-attempt-scored', name: 'Coach: On Attempt Scored' },
  { event: EVENT_NAMES.ATTEMPT_SCORED },
  async ({ event, step }) => {
    const { orgId, userId, attemptId } = event.data

    // Catch errors to prevent profile failures from blocking the log and event steps.
    const profile = await step.run('update-weakness-profile', async () => {
      try {
        return await generateWeaknessProfile(orgId, userId)
      } catch (error) {
        console.error('[coach-agent] Failed to generate weakness profile:', error)
        return []
      }
    })

    await step.run('log-activity', async () => {
      await logAgentActivity({
        orgId,
        userId,
        agentId: AGENT_ID,
        eventType: EVENT_NAMES.ATTEMPT_SCORED,
        action: 'update_weakness_profile',
        details: {
          attemptId,
          dimensionsUpdated: profile.length,
        },
      })
    })

    await step.run('emit-weakness-updated', async () => {
      const weaknesses = profile.filter((d: DimensionResult) => d.score < 70)
      const strengths = profile.filter((d: DimensionResult) => d.score >= 70)

      const payload: CoachWeaknessUpdatedPayload = {
        userId,
        orgId,
        weaknesses: weaknesses.map(toDimensionSummary),
        strengths: strengths.map(toDimensionSummary),
        trajectory: determineTrajectory(profile),
      }

      await inngest.send({
        name: EVENT_NAMES.COACH_WEAKNESS_UPDATED,
        data: payload,
      })
    })

    return { updated: profile.length }
  },
)

function toDimensionSummary(d: DimensionResult) {
  return { key: d.key, score: d.score, trend: d.trend, evidenceCount: d.evidenceCount }
}

/** Determine overall trajectory by comparing improving vs. declining dimension counts. */
function determineTrajectory(profile: DimensionResult[]): string {
  if (profile.length === 0) return 'new'

  const improving = profile.filter((d) => d.trend === 'improving').length
  const declining = profile.filter((d) => d.trend === 'declining').length

  if (improving > declining) return 'improving'
  if (declining > improving) return 'declining'
  return 'stable'
}
