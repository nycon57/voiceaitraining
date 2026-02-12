import { logAgentActivity } from '@/lib/agents/activity-log'
import { generateTraineeDigest, type TraineeDigest } from '@/lib/agents/coach/daily-digest'
import { EVENT_NAMES, type CoachRecommendationReadyPayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/memory/supabase'

const AGENT_ID = 'coach-agent'
const ACTIVE_WINDOW_DAYS = 14
const MS_PER_DAY = 1000 * 60 * 60 * 24
const PAGE_SIZE = 1000

interface ActiveTrainee {
  orgId: string
  userId: string
}

/** Active trainees = users with at least one completed attempt in the last 14 days. */
export const sendDailyDigest = inngest.createFunction(
  { id: 'coach/send-daily-digest', name: 'Coach: Send Daily Digest' },
  { cron: '0 8 * * *' },
  async ({ step }) => {
    const activeTrainees = await step.run('find-active-trainees', async () => {
      const supabase = createServiceClient()

      const cutoff = new Date(Date.now() - ACTIVE_WINDOW_DAYS * MS_PER_DAY).toISOString()
      const seen = new Map<string, ActiveTrainee>()
      let offset = 0

      while (true) {
        const { data, error } = await supabase
          .from('scenario_attempts')
          .select('org_id, clerk_user_id')
          .eq('status', 'completed')
          .gte('started_at', cutoff)
          .range(offset, offset + PAGE_SIZE - 1)

        if (error) {
          throw new Error(`Failed to query active trainees: ${error.message}`)
        }

        if (!data || data.length === 0) break

        for (const row of data) {
          if (!row.clerk_user_id) continue
          const key = `${row.org_id}|${row.clerk_user_id}`
          if (!seen.has(key)) {
            seen.set(key, { orgId: row.org_id, userId: row.clerk_user_id })
          }
        }

        if (data.length < PAGE_SIZE) break
        offset += PAGE_SIZE
      }

      return Array.from(seen.values())
    })

    let digestCount = 0
    let failures = 0

    for (const trainee of activeTrainees) {
      try {
        const digest = await step.run(
          `generate-digest-${trainee.orgId}-${trainee.userId}`,
          async () => {
            return generateTraineeDigest(trainee.orgId, trainee.userId)
          },
        )

        await step.run(
          `log-digest-${trainee.orgId}-${trainee.userId}`,
          async () => {
            await logAgentActivity({
              orgId: trainee.orgId,
              userId: trainee.userId,
              agentId: AGENT_ID,
              eventType: 'daily_digest',
              action: 'generate_daily_digest',
              details: {
                attempts: digest.summary.attempts,
                avgScore: digest.summary.avgScore,
                trend: digest.summary.trend,
                noRecentActivity: digest.noRecentActivity,
                streak: digest.streak,
              },
            })
          },
        )

        await step.run(
          `emit-digest-${trainee.orgId}-${trainee.userId}`,
          async () => {
            const payload: CoachRecommendationReadyPayload = {
              userId: trainee.userId,
              orgId: trainee.orgId,
              recommendationType: 'daily_digest',
              message: formatDigestMessage(digest),
            }

            await inngest.send({
              name: EVENT_NAMES.COACH_RECOMMENDATION_READY,
              data: payload,
            })
          },
        )

        digestCount++
      } catch (error) {
        console.error(
          `[coach-agent] Failed to generate digest for user ${trainee.userId} in org ${trainee.orgId}:`,
          error instanceof Error ? error.message : error,
        )
        failures++
      }
    }

    return { activeTrainees: activeTrainees.length, digestsSent: digestCount, failures }
  },
)

function formatDigestMessage(digest: TraineeDigest): string {
  if (digest.noRecentActivity) {
    const streakNote =
      digest.streak > 0 ? ` You're on a ${digest.streak}-day streak.` : ''
    return `You haven't practiced in the last 24 hours.${streakNote} ${digest.nextActions[0] ?? ''}`
  }

  const parts: string[] = []

  const { attempts, avgScore, trend } = digest.summary
  const sessionLabel = attempts === 1 ? 'session' : 'sessions'
  parts.push(`You completed ${attempts} practice ${sessionLabel} in the last 24 hours`)
  if (avgScore != null) {
    parts[0] += ` with an average score of ${avgScore}%`
  }
  parts[0] += '.'

  if (trend === 'improving') parts.push('Your scores are trending up.')
  else if (trend === 'declining') parts.push('Your scores dropped compared to the previous 24 hours.')

  if (digest.topImprovement) {
    const [key, delta] = splitDelta(digest.topImprovement)
    parts.push(`Biggest improvement: ${key.replace(/_/g, ' ')} (${delta}).`)
  }

  if (digest.topDecline) {
    const [key, delta] = splitDelta(digest.topDecline)
    parts.push(`Area to focus: ${key.replace(/_/g, ' ')} (${delta}).`)
  }

  if (digest.streak > 0) {
    parts.push(`Current streak: ${digest.streak} day${digest.streak > 1 ? 's' : ''}.`)
  }

  if (digest.nextActions.length > 0) {
    parts.push(digest.nextActions[0])
  }

  return parts.join(' ')
}

function splitDelta(s: string): [string, string] {
  const lastSpace = s.lastIndexOf(' ')
  if (lastSpace === -1) return [s, '']
  return [s.slice(0, lastSpace), s.slice(lastSpace + 1)]
}
