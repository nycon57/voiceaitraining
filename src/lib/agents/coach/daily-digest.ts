import { createServiceClient } from '@/lib/memory/supabase'
import { getWeaknessProfile, getSkillLevels } from '@/lib/memory/user-memory'
import { getPracticePattern } from '@/lib/memory/query'
import {
  type AttemptRow,
  extractDimensionAverages,
} from '@/lib/memory/weakness-profiler'

// Types

export interface DigestSummary {
  attempts: number
  avgScore: number | null
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  bestDimension: string | null
  worstDimension: string | null
}

export interface TraineeDigest {
  summary: DigestSummary
  topImprovement: string | null
  topDecline: string | null
  nextActions: string[]
  streak: number
  noRecentActivity: boolean
}

// Constants

const MS_PER_DAY = 1000 * 60 * 60 * 24
const TREND_THRESHOLD = 3

// Helpers

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

async function fetchPeriodAttempts(
  orgId: string,
  userId: string,
  from: Date,
  to: Date,
): Promise<AttemptRow[]> {
  const { data, error } = await createServiceClient()
    .from('scenario_attempts')
    .select('id, score, kpis, score_breakdown, started_at')
    .eq('org_id', orgId)
    .eq('clerk_user_id', userId)
    .eq('status', 'completed')
    .gte('started_at', from.toISOString())
    .lt('started_at', to.toISOString())
    .order('started_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch attempts for digest: ${error.message}`)
  }

  return (data ?? []) as AttemptRow[]
}

/**
 * Find dimension with largest change between periods.
 * Returns formatted string like 'objection_handling +6' or null.
 */
function findTopDelta(
  current: Map<string, number>,
  previous: Map<string, number>,
  direction: 'improvement' | 'decline',
): string | null {
  let bestKey: string | null = null
  let bestDelta = 0

  for (const [key, currentScore] of current) {
    const prevScore = previous.get(key)
    if (prevScore == null) continue
    const delta = currentScore - prevScore

    if (direction === 'improvement' && delta > bestDelta) {
      bestKey = key
      bestDelta = delta
    } else if (direction === 'decline' && delta < bestDelta) {
      bestKey = key
      bestDelta = delta
    }
  }

  if (bestKey == null || bestDelta === 0) return null

  const sign = bestDelta > 0 ? '+' : ''
  return `${bestKey} ${sign}${bestDelta}`
}

function buildNextActions(
  hasRecentActivity: boolean,
  worstDimension: string | null,
  topDecline: string | null,
): string[] {
  if (!hasRecentActivity) {
    if (worstDimension) {
      const label = worstDimension.replace(/_/g, ' ')
      return [`Try a session focused on ${label} to strengthen this skill.`]
    }
    return ['Complete a practice session to build momentum.']
  }

  const actions: string[] = []

  if (topDecline) {
    const dimKey = topDecline.split(' ')[0]
    const label = dimKey.replace(/_/g, ' ')
    actions.push(`Practice ${label} to reverse the recent dip.`)
  }

  if (worstDimension) {
    const label = worstDimension.replace(/_/g, ' ')
    if (!actions.some((a) => a.includes(label))) {
      actions.push(`Strengthen ${label} with focused practice.`)
    }
  }

  if (actions.length === 0) {
    actions.push('Complete another session to keep building your skills.')
  }

  return actions
}

// Main function

/**
 * Generate a daily progress digest for a trainee.
 *
 * Compares last 24h of attempts against previous 24h to identify trends,
 * top improvement/decline, and recommended next actions.
 */
export async function generateTraineeDigest(
  orgId: string,
  userId: string,
): Promise<TraineeDigest> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - MS_PER_DAY)
  const twoDaysAgo = new Date(now.getTime() - 2 * MS_PER_DAY)

  const [currentAttempts, previousAttempts, weaknesses, strengths, practicePattern] =
    await Promise.all([
      fetchPeriodAttempts(orgId, userId, oneDayAgo, now),
      fetchPeriodAttempts(orgId, userId, twoDaysAgo, oneDayAgo),
      getWeaknessProfile(orgId, userId),
      getSkillLevels(orgId, userId),
      getPracticePattern(orgId, userId),
    ])

  const worstDimension = weaknesses.length > 0 ? weaknesses[0].key : null
  const bestDimension =
    strengths.length > 0 ? strengths[strengths.length - 1].key : null

  if (currentAttempts.length === 0) {
    return {
      summary: {
        attempts: 0,
        avgScore: null,
        trend: 'insufficient_data',
        bestDimension,
        worstDimension,
      },
      topImprovement: null,
      topDecline: null,
      nextActions: buildNextActions(false, worstDimension, null),
      streak: practicePattern.streakDays,
      noRecentActivity: true,
    }
  }

  const scores = currentAttempts
    .map((a) => a.score)
    .filter((s): s is number => s != null)
  const avgScore =
    scores.length > 0 ? Math.round(average(scores)) : null

  const prevScores = previousAttempts
    .map((a) => a.score)
    .filter((s): s is number => s != null)
  const prevAvg = prevScores.length > 0 ? average(prevScores) : null

  let trend: DigestSummary['trend'] = 'insufficient_data'
  if (avgScore != null && prevAvg != null) {
    const diff = avgScore - prevAvg
    if (diff > TREND_THRESHOLD) trend = 'improving'
    else if (diff < -TREND_THRESHOLD) trend = 'declining'
    else trend = 'stable'
  }

  const currentDims = extractDimensionAverages(currentAttempts)
  const previousDims = extractDimensionAverages(previousAttempts)

  const topImprovement = findTopDelta(currentDims, previousDims, 'improvement')
  const topDecline = findTopDelta(currentDims, previousDims, 'decline')

  // Override best/worst with current period data when available
  let periodBest = bestDimension
  let periodWorst = worstDimension
  if (currentDims.size > 0) {
    let maxScore = -1
    let minScore = 101
    for (const [key, score] of currentDims) {
      if (score > maxScore) {
        maxScore = score
        periodBest = key
      }
      if (score < minScore) {
        minScore = score
        periodWorst = key
      }
    }
  }

  return {
    summary: {
      attempts: currentAttempts.length,
      avgScore,
      trend,
      bestDimension: periodBest,
      worstDimension: periodWorst,
    },
    topImprovement,
    topDecline,
    nextActions: buildNextActions(true, periodWorst, topDecline),
    streak: practicePattern.streakDays,
    noRecentActivity: false,
  }
}
