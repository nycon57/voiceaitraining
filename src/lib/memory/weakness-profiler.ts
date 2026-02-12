import { createServiceClient } from './supabase'
import { upsertMemory, type MemoryType, type Trend } from './user-memory'

// Types

interface AttemptRow {
  id: string
  kpis: Record<string, unknown> | null
  score: number | null
  score_breakdown: Record<string, unknown> | null
  started_at: string
}

export interface DimensionResult {
  key: string
  score: number
  trend: Trend
  evidenceCount: number
  lastEvidenceAt: string
}

/** Configuration for extracting and normalizing a performance dimension. */
interface DimensionConfig {
  key: string
  extract: (attempt: AttemptRow) => number | null
}

// Constants

const WEAKNESS_THRESHOLD = 70
const RECENCY_DECAY = 0.85
const TREND_WINDOW = 5
const TREND_THRESHOLD = 5

// Normalization helpers

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Return a 0-100 score if the value is already in that range, or null. */
function clampScore(value: unknown): number | null {
  if (typeof value !== 'number' || isNaN(value)) return null
  return clamp(value, 0, 100)
}

/** Inverse count scoring: 0 items = 100, maxBad items = 0. */
function inverseCount(count: number, maxBad: number): number {
  return clamp(100 - (count / maxBad) * 100, 0, 100)
}

/** Direct count scoring: 0 items = 0, maxGood items = 100. */
function countScore(count: number, maxGood: number): number {
  return clamp((count / maxGood) * 100, 0, 100)
}

/** Talk ratio scoring: 40-60% talk is ideal (100), deviations penalized. */
function talkRatioScore(userPercentage: number): number {
  const deviation = Math.abs(userPercentage - 50)
  return clamp(100 - deviation * 2.5, 0, 100)
}

/** Filler word rate scoring: 0/min = 100, 6+/min = 0. */
function fillerRateScore(ratePerMinute: number): number {
  return clamp(100 - (ratePerMinute / 6) * 100, 0, 100)
}

/** Response time scoring: <=1s = 100, >=5s = 0. */
function responseTimeScore(avgMs: number): number {
  if (avgMs <= 1000) return 100
  if (avgMs >= 5000) return 0
  return clamp(100 - ((avgMs - 1000) / 4000) * 100, 0, 100)
}

// Type guards for score_breakdown shapes

function isScoreObject(val: unknown): val is { score: number } {
  return val != null && typeof val === 'object' && typeof (val as Record<string, unknown>).score === 'number'
}

function isPercentageObject(val: unknown): val is { percentage: number } {
  return val != null && typeof val === 'object' && typeof (val as Record<string, unknown>).percentage === 'number'
}

// KPI extraction helpers

/** Get a numeric value from a flat KPI object. */
function getFlat(kpis: Record<string, unknown> | null, key: string): number | null {
  if (!kpis) return null
  const val = kpis[key]
  return typeof val === 'number' && !isNaN(val) ? val : null
}

/** Get a numeric value from a nested KPI path like ['global', 'filler_words', 'count']. */
function getNested(kpis: Record<string, unknown> | null, path: string[]): number | null {
  if (!kpis) return null
  let current: unknown = kpis
  for (const key of path) {
    if (current == null || typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'number' && !isNaN(current) ? current : null
}

// Dimension factory helpers

/** Create a dimension that reads a flat KPI and clamps it to 0-100. */
function flatScoreDimension(key: string, kpiKey: string): DimensionConfig {
  return { key, extract: (a) => clampScore(getFlat(a.kpis, kpiKey)) }
}

/** Create a dimension that reads a flat KPI count and inverts it. */
function flatInverseDimension(key: string, kpiKey: string, maxBad: number): DimensionConfig {
  return {
    key,
    extract: (a) => {
      const val = getFlat(a.kpis, kpiKey)
      return val != null ? inverseCount(val, maxBad) : null
    },
  }
}

// Dimension extraction + normalization

const DIMENSIONS: DimensionConfig[] = [
  flatInverseDimension('question_handling', 'unanswered_questions_count', 5),
  flatScoreDimension('confidence', 'confidence_score'),
  flatScoreDimension('professionalism', 'professionalism_score'),
  flatScoreDimension('clarity', 'clarity_score'),
  {
    key: 'talk_listen_balance',
    extract: (a) => {
      const flat = a.kpis?.talk_listen_ratio
      if (typeof flat === 'string') {
        const parts = flat.split(':').map(Number)
        if (parts.length === 2 && !isNaN(parts[0])) return talkRatioScore(parts[0])
      }
      if (typeof flat === 'number') return talkRatioScore(flat)
      const nested = getNested(a.kpis, ['global', 'talk_listen_ratio', 'user_percentage'])
      return nested != null ? talkRatioScore(nested) : null
    },
  },
  {
    key: 'filler_words',
    extract: (a) => {
      const flat = getFlat(a.kpis, 'filler_words_count')
      if (flat != null) return inverseCount(flat, 20)
      const rate = getNested(a.kpis, ['global', 'filler_words', 'rate_per_minute'])
      if (rate != null) return fillerRateScore(rate)
      const count = getNested(a.kpis, ['global', 'filler_words', 'count'])
      return count != null ? inverseCount(count, 20) : null
    },
  },
  {
    key: 'response_time',
    extract: (a) => {
      const flat = getFlat(a.kpis, 'avg_response_time_ms')
      if (flat != null) return responseTimeScore(flat)
      const nested = getNested(a.kpis, ['global', 'response_time', 'average_ms'])
      return nested != null ? responseTimeScore(nested) : null
    },
  },
  {
    key: 'empathy',
    extract: (a) => {
      const flat = getFlat(a.kpis, 'empathy_signals_count')
      return flat != null ? countScore(flat, 10) : null
    },
  },
  {
    key: 'objection_handling',
    extract: (a) => {
      // Direct number from ScoreBreakdown.objection_handling
      const direct = a.score_breakdown?.objection_handling
      if (typeof direct === 'number') return clamp(direct, 0, 100)
      // { score: 0-1, weight, max_points } from calculateOverallScore
      const scenarioOH = a.score_breakdown?.scenario_objection_handling
      if (isScoreObject(scenarioOH)) return clamp(scenarioOH.score * 100, 0, 100)
      // { score, maxScore, percentage } from rubric scorer
      if (isPercentageObject(direct)) return clamp(direct.percentage, 0, 100)
      // Nested scenario KPIs (success_rate is already 0-100)
      const rate = getNested(a.kpis, ['scenario', 'objection_handling', 'success_rate'])
      return rate != null ? clamp(rate, 0, 100) : null
    },
  },
  flatInverseDimension('dead_air', 'dead_air_instances', 5),
]

// Core profiling logic

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/**
 * Calculate a weighted score for a dimension across multiple attempts.
 * Recent attempts are weighted more heavily using exponential decay.
 */
function weightedScore(scores: number[]): number {
  if (scores.length === 0) return 0
  let weightSum = 0
  let valueSum = 0
  for (let i = 0; i < scores.length; i++) {
    const weight = Math.pow(RECENCY_DECAY, scores.length - 1 - i)
    valueSum += scores[i] * weight
    weightSum += weight
  }
  if (weightSum === 0) return 0
  return Math.round(valueSum / weightSum)
}

/** Determine trend by comparing last TREND_WINDOW vs previous TREND_WINDOW. */
function calculateTrend(scores: number[]): Trend {
  if (scores.length < TREND_WINDOW) return 'new'

  const recent = scores.slice(-TREND_WINDOW)
  const previous = scores.slice(-TREND_WINDOW * 2, -TREND_WINDOW)
  if (previous.length === 0) return 'new'

  const diff = average(recent) - average(previous)
  if (diff > TREND_THRESHOLD) return 'improving'
  if (diff < -TREND_THRESHOLD) return 'declining'
  return 'stable'
}

/** Aggregate a single dimension across all attempts (oldest-first order). */
function aggregateDimension(
  config: DimensionConfig,
  attempts: AttemptRow[],
): DimensionResult | null {
  const scores: number[] = []
  let lastEvidenceAt = ''

  for (const attempt of attempts) {
    const score = config.extract(attempt)
    if (score != null) {
      scores.push(score)
      lastEvidenceAt = attempt.started_at
    }
  }

  if (scores.length === 0) return null

  return {
    key: config.key,
    score: weightedScore(scores),
    trend: calculateTrend(scores),
    evidenceCount: scores.length,
    lastEvidenceAt,
  }
}

// Main function

/**
 * Analyze a user's attempt history and update their weakness profile.
 * Queries the last 20 completed attempts, aggregates 10+ performance
 * dimensions, and persists each as a weakness_profile or skill_level entry.
 */
export async function generateWeaknessProfile(
  orgId: string,
  userId: string,
): Promise<DimensionResult[]> {
  const supabase = createServiceClient()

  // Fetch newest 20 completed attempts, then reverse to oldest-first
  // for correct recency weighting (index 0 = oldest, index N = newest).
  const { data: attempts, error } = await supabase
    .from('scenario_attempts')
    .select('id, kpis, score, score_breakdown, started_at')
    .eq('org_id', orgId)
    .eq('clerk_user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(`Failed to fetch attempts for weakness profile: ${error.message}`)
  }

  if (!attempts || attempts.length === 0) {
    return []
  }

  const rows = (attempts as AttemptRow[]).reverse()
  const results: DimensionResult[] = []

  for (const dim of DIMENSIONS) {
    const result = aggregateDimension(dim, rows)
    if (!result) continue

    results.push(result)

    const memoryType: MemoryType = result.score < WEAKNESS_THRESHOLD
      ? 'weakness_profile'
      : 'skill_level'

    await upsertMemory({
      orgId,
      userId,
      memoryType,
      key: result.key,
      value: {
        dimension: result.key,
        rawScore: result.score,
        evidenceCount: result.evidenceCount,
      },
      score: result.score,
      trend: result.trend,
      lastEvidenceAt: result.lastEvidenceAt,
      evidenceCount: result.evidenceCount,
    })
  }

  return results
}
