import type { AgentContext } from '@/lib/memory/query'
import type { Trend } from '@/lib/memory/user-memory'

export interface SkillGap {
  key: string
  score: number
  trend: Trend
  evidenceCount: number
}

export interface SkillGapAnalysis {
  topGaps: SkillGap[]
  focusArea: string | null
  reasoning: string
}

/** Priority order for trends: declining is most urgent, improving is least. */
const TREND_PRIORITY: Record<Trend, number> = {
  declining: 0,
  stable: 1,
  new: 2,
  improving: 3,
}

const TOP_GAPS_LIMIT = 3

/**
 * Analyze a trainee's skill gaps from their agent context.
 * Returns the top weaknesses prioritized by trend urgency
 * (declining > stable > new > improving), then by lowest score.
 */
export function analyzeSkillGaps(context: AgentContext): SkillGapAnalysis {
  const { weaknesses } = context

  if (weaknesses.length === 0) {
    return {
      topGaps: [],
      focusArea: null,
      reasoning: 'No weaknesses identified yet — not enough data to analyze skill gaps.',
    }
  }

  const gaps = weaknesses.map((w): SkillGap => ({
    key: w.key,
    score: w.score ?? 0,
    trend: w.trend ?? 'new',
    evidenceCount: w.evidenceCount,
  }))

  const notImproving = gaps
    .filter((gap) => gap.trend !== 'improving')
    .sort(compareGapPriority)

  const improving = gaps
    .filter((gap) => gap.trend === 'improving')
    .sort(compareGapPriority)

  const topGaps = [...notImproving, ...improving].slice(0, TOP_GAPS_LIMIT)
  const focusArea = topGaps[0]?.key ?? null
  const reasoning = buildReasoning(topGaps)

  return { topGaps, focusArea, reasoning }
}

function compareGapPriority(a: SkillGap, b: SkillGap): number {
  const trendDiff = TREND_PRIORITY[a.trend] - TREND_PRIORITY[b.trend]
  if (trendDiff !== 0) return trendDiff

  const scoreDiff = a.score - b.score
  if (scoreDiff !== 0) return scoreDiff

  return a.evidenceCount - b.evidenceCount
}

function trendLabel(trend: Trend): string {
  switch (trend) {
    case 'declining': return 'declining'
    case 'stable': return 'not improving'
    case 'new': return 'newly identified'
    case 'improving': return 'improving'
  }
}

function buildReasoning(gaps: SkillGap[]): string {
  if (gaps.length === 0) {
    return 'No prioritized skill gaps were found.'
  }

  const parts = gaps.map((gap) => {
    const label = gap.key.replace(/_/g, ' ')
    return `${label} at ${gap.score}% (${trendLabel(gap.trend)})`
  })

  return `Prioritized by trend (declining > stable > new > improving): ${parts.join(', ')}.`
}
