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

/**
 * Analyze a trainee's skill gaps from their agent context.
 * Returns the top 3 weaknesses prioritized by trend (declining first),
 * then by lowest score as a tiebreaker.
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

  const gaps: SkillGap[] = weaknesses.map((w) => ({
    key: w.key,
    score: w.score ?? 0,
    trend: (w.trend as Trend) ?? 'new',
    evidenceCount: w.evidenceCount,
  }))

  // Sort by trend priority (declining first), then by score ascending (worst first)
  gaps.sort((a, b) => {
    const trendDiff = TREND_PRIORITY[a.trend] - TREND_PRIORITY[b.trend]
    if (trendDiff !== 0) return trendDiff
    return a.score - b.score
  })

  const topGaps = gaps.slice(0, 3)
  const focusArea = topGaps[0].key
  const reasoning = buildReasoning(topGaps)

  return { topGaps, focusArea, reasoning }
}

function buildReasoning(gaps: SkillGap[]): string {
  const parts = gaps.map((gap) => {
    const label = gap.key.replace(/_/g, ' ')
    const trendLabel = gap.trend === 'declining'
      ? 'declining'
      : gap.trend === 'stable'
        ? 'not improving'
        : gap.trend === 'new'
          ? 'newly identified'
          : 'improving'
    return `${label} at ${gap.score}% (${trendLabel})`
  })

  return `Top gaps: ${parts.join(', ')}.`
}
