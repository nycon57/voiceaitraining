import { createServiceClient } from './supabase'
import { getWeaknessProfile, getSkillLevels, type WeaknessEntry, type SkillLevel, type Trend } from './user-memory'

export interface AttemptSummary {
  id: string
  scenarioId: string | null
  scenarioTitle: string
  score: number | null
  status: string
  startedAt: string
  durationSeconds: number | null
}

export interface PracticePattern {
  totalAttempts: number
  avgAttemptsPerWeek: number
  lastAttemptDaysAgo: number | null
  streakDays: number
}

export interface AgentContext {
  weaknesses: WeaknessEntry[]
  strengths: SkillLevel[]
  recentAttempts: AttemptSummary[]
  trajectory: Trend
  practicePattern: PracticePattern
  relevantInsights: string[]
}

/** Row shapes from Supabase joins */
interface AttemptWithScenarioRow {
  id: string
  scenario_id: string | null
  score: number | null
  status: string
  started_at: string
  duration_seconds: number | null
  scenarios: { title: string }[] | { title: string } | null
}

interface AttemptTimestampRow {
  started_at: string
  score: number | null
}

const MS_PER_DAY = 1000 * 60 * 60 * 24
const TREND_RECENT_COUNT = 5

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

function extractScenarioTitle(
  scenarios: { title: string }[] | { title: string } | null,
): string {
  if (!scenarios) return 'Untitled Scenario'
  const s = Array.isArray(scenarios) ? scenarios[0] : scenarios
  return s?.title ?? 'Untitled Scenario'
}

/**
 * Fetch recent attempts joined with scenario titles.
 * Uses a single query with an inner join -- no N+1.
 */
export async function getRecentAttemptSummaries(
  orgId: string,
  userId: string,
  limit = 10,
): Promise<AttemptSummary[]> {
  const { data, error } = await createServiceClient()
    .from('scenario_attempts')
    .select('id, scenario_id, score, status, started_at, duration_seconds, scenarios(title)')
    .eq('org_id', orgId)
    .eq('clerk_user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch recent attempt summaries: ${error.message}`)
  }

  const rows = (data ?? []) as AttemptWithScenarioRow[]

  return rows.map((row) => ({
    id: row.id,
    scenarioId: row.scenario_id,
    scenarioTitle: extractScenarioTitle(row.scenarios),
    score: row.score,
    status: row.status,
    startedAt: row.started_at,
    durationSeconds: row.duration_seconds,
  }))
}

/**
 * Calculate practice frequency, streak, and recency for a user.
 * Single query fetching completed attempt timestamps, grouped in JS.
 */
export async function getPracticePattern(
  orgId: string,
  userId: string,
): Promise<PracticePattern> {
  const rows = await fetchCompletedAttempts(orgId, userId)
  return computePracticePattern(rows)
}

/** Fetch all completed attempts for a user (newest first). */
async function fetchCompletedAttempts(
  orgId: string,
  userId: string,
): Promise<AttemptTimestampRow[]> {
  const { data, error } = await createServiceClient()
    .from('scenario_attempts')
    .select('started_at, score')
    .eq('org_id', orgId)
    .eq('clerk_user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch completed attempts: ${error.message}`)
  }

  return (data ?? []) as AttemptTimestampRow[]
}

/** Compute practice pattern from pre-fetched attempt rows. */
function computePracticePattern(rows: AttemptTimestampRow[]): PracticePattern {
  if (rows.length === 0) {
    return {
      totalAttempts: 0,
      avgAttemptsPerWeek: 0,
      lastAttemptDaysAgo: null,
      streakDays: 0,
    }
  }

  const now = new Date()
  const lastAttempt = new Date(rows[0].started_at)
  const lastAttemptDaysAgo = Math.floor((now.getTime() - lastAttempt.getTime()) / MS_PER_DAY)

  // Compute average attempts per week over the span from first to last attempt
  const firstAttempt = new Date(rows[rows.length - 1].started_at)
  const spanMs = lastAttempt.getTime() - firstAttempt.getTime()
  const spanWeeks = Math.max(spanMs / (MS_PER_DAY * 7), 1)
  const avgAttemptsPerWeek = Math.round((rows.length / spanWeeks) * 10) / 10

  // Streak: count consecutive days with at least one attempt, working backward from today
  const streakDays = calculateStreakDays(rows.map((r) => r.started_at))

  return {
    totalAttempts: rows.length,
    avgAttemptsPerWeek,
    lastAttemptDaysAgo,
    streakDays,
  }
}

/** Count consecutive days with at least one attempt, starting from today. */
function calculateStreakDays(timestamps: string[]): number {
  const practiceDays = new Set<string>()
  for (const ts of timestamps) {
    practiceDays.add(new Date(ts).toISOString().slice(0, 10))
  }

  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const day = new Date(today.getTime() - i * MS_PER_DAY).toISOString().slice(0, 10)
    if (practiceDays.has(day)) {
      streak++
    } else if (i === 0) {
      // If no practice today, still check yesterday to allow for "active" streaks
      continue
    } else {
      break
    }
  }
  return streak
}

/**
 * Determine overall trajectory from recent completed attempt scores.
 * Compares the last N scores against the previous N to detect improvement.
 */
function computeTrajectory(attempts: AttemptTimestampRow[]): Trend {
  const scores = attempts
    .filter((a) => a.score != null)
    .map((a) => a.score!)

  if (scores.length < TREND_RECENT_COUNT) return 'new'

  // scores are newest-first from DB; reverse for chronological order
  const chronological = [...scores].reverse()
  const recent = chronological.slice(-TREND_RECENT_COUNT)
  const previous = chronological.slice(
    Math.max(0, chronological.length - TREND_RECENT_COUNT * 2),
    chronological.length - TREND_RECENT_COUNT,
  )

  if (previous.length === 0) return 'new'

  const diff = average(recent) - average(previous)

  if (diff > 5) return 'improving'
  if (diff < -5) return 'declining'
  return 'stable'
}

/**
 * Return comprehensive user context for agent consumption.
 * Runs weakness/strength/attempts/pattern queries in parallel.
 * Completed attempts are fetched once and reused for both practice pattern and trajectory.
 */
export async function getAgentContext(params: {
  orgId: string
  userId: string
}): Promise<AgentContext> {
  const { orgId, userId } = params

  const [weaknesses, strengths, recentAttempts, completedAttempts] =
    await Promise.all([
      getWeaknessProfile(orgId, userId),
      getSkillLevels(orgId, userId),
      getRecentAttemptSummaries(orgId, userId),
      fetchCompletedAttempts(orgId, userId),
    ])

  const practicePattern = computePracticePattern(completedAttempts)
  const trajectory = computeTrajectory(
    completedAttempts.slice(0, TREND_RECENT_COUNT * 2),
  )

  const relevantInsights = buildInsights(weaknesses, strengths, practicePattern, trajectory)

  return {
    weaknesses,
    strengths,
    recentAttempts,
    trajectory,
    practicePattern,
    relevantInsights,
  }
}

/** Generate human-readable insights from the context data. */
function buildInsights(
  weaknesses: WeaknessEntry[],
  strengths: SkillLevel[],
  pattern: PracticePattern,
  trajectory: Trend,
): string[] {
  const insights: string[] = []

  if (weaknesses.length > 0) {
    const worst = weaknesses[0]
    insights.push(`Weakest area: ${worst.key} (score: ${worst.score})`)
  }

  if (strengths.length > 0) {
    const best = strengths[strengths.length - 1]
    if (best.score != null) {
      insights.push(`Strongest area: ${best.key} (score: ${best.score})`)
    }
  }

  if (pattern.totalAttempts === 0) {
    insights.push('No completed attempts yet')
  } else {
    if (pattern.lastAttemptDaysAgo != null && pattern.lastAttemptDaysAgo > 3) {
      insights.push(`Inactive for ${pattern.lastAttemptDaysAgo} days`)
    }
    if (pattern.streakDays > 0) {
      insights.push(`Current practice streak: ${pattern.streakDays} day${pattern.streakDays > 1 ? 's' : ''}`)
    }
    if (trajectory === 'improving') {
      insights.push('Performance trending upward')
    } else if (trajectory === 'declining') {
      insights.push('Performance trending downward — may need intervention')
    }
  }

  return insights
}
