import { createClient } from '@supabase/supabase-js'

import { EVENT_NAMES, type CoachRecommendationReadyPayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { logAgentActivity } from '@/lib/agents/activity-log'
import { generateTraineeDigest, type TraineeDigest } from '@/lib/agents/coach/daily-digest'

const AGENT_ID = 'coach-agent'
const ACTIVE_WINDOW_DAYS = 14
const MS_PER_DAY = 1000 * 60 * 60 * 24
const PAGE_SIZE = 1000

interface ActiveTrainee {
  orgId: string
  userId: string
}

/**
 * Daily cron: generates a progress digest for each active trainee
 * and emits coach.recommendation.ready events with type 'daily_digest'.
 *
 * Active trainees = users with at least one completed attempt in the last 14 days.
 * Runs at 8am UTC daily.
 */
export const sendDailyDigest = inngest.createFunction(
  { id: 'coach/send-daily-digest', name: 'Coach: Send Daily Digest' },
  { cron: '0 8 * * *' },
  async ({ step }) => {
    const activeTrainees = await step.run('find-active-trainees', async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

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

    for (const trainee of activeTrainees) {
      const digest: TraineeDigest = await step.run(
        `generate-digest-${trainee.orgId}-${trainee.userId}`,
        async () => {
          return generateTraineeDigest(trainee.orgId, trainee.userId)
        },
      )

      await step.run(
        `log-and-emit-${trainee.orgId}-${trainee.userId}`,
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

          const message = formatDigestMessage(digest)

          const payload: CoachRecommendationReadyPayload = {
            userId: trainee.userId,
            orgId: trainee.orgId,
            recommendationType: 'daily_digest',
            message,
          }

          await inngest.send({
            name: EVENT_NAMES.COACH_RECOMMENDATION_READY,
            data: payload,
          })
        },
      )

      digestCount++
    }

    return { activeTrainees: activeTrainees.length, digestsSent: digestCount }
  },
)

/** Build a human-readable digest message from the structured data. */
function formatDigestMessage(digest: TraineeDigest): string {
  if (digest.noRecentActivity) {
    const streakNote =
      digest.streak > 0 ? ` You have a ${digest.streak}-day streak — don't lose it!` : ''
    return `No practice sessions in the last 24 hours.${streakNote} ${digest.nextActions[0] ?? ''}`
  }

  const parts: string[] = []

  const { attempts, avgScore, trend } = digest.summary
  const sessionLabel = attempts === 1 ? 'session' : 'sessions'
  parts.push(`You completed ${attempts} practice ${sessionLabel} yesterday`)
  if (avgScore != null) {
    parts[0] += ` with an average score of ${avgScore}%`
  }
  parts[0] += '.'

  if (trend === 'improving') parts.push('Your scores are trending upward.')
  else if (trend === 'declining') parts.push('Your scores dipped compared to the previous day.')

  if (digest.topImprovement) {
    const [key, delta] = splitDelta(digest.topImprovement)
    parts.push(`Top improvement: ${key.replace(/_/g, ' ')} (${delta}).`)
  }

  if (digest.topDecline) {
    const [key, delta] = splitDelta(digest.topDecline)
    parts.push(`Needs attention: ${key.replace(/_/g, ' ')} (${delta}).`)
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
