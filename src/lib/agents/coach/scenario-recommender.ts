import { createServiceClient } from '@/lib/memory/supabase'
import type { ScenarioRubric, ScenarioDifficulty } from '@/types/scenario'
import type { SkillGap } from './skill-gap-analyzer'

export interface ScenarioRecommendation {
  scenarioId: string
  scenarioTitle: string
  reason: string
  difficulty: ScenarioDifficulty | null
}

export interface RecommendationResult {
  recommendation: ScenarioRecommendation | null
  reason: string
}

interface ScenarioRow {
  id: string
  title: string
  difficulty: ScenarioDifficulty | null
  rubric: ScenarioRubric | null
}

interface RecentAttemptCountRow {
  scenario_id: string
  count: number
}

/**
 * Map from gap keys to the ScenarioRubric fields that address them.
 * A scenario with a matching rubric field is a good fit for practicing that gap.
 */
const GAP_TO_RUBRIC_FIELD: Record<string, keyof ScenarioRubric> = {
  objection_handling: 'objections_handled',
  question_handling: 'open_questions',
}

/** Gaps that benefit from easier scenarios to rebuild confidence. */
const CONFIDENCE_RELATED_GAPS = new Set(['confidence', 'professionalism', 'clarity'])

const RECENT_DAYS = 7
const RECENT_ATTEMPT_THRESHOLD = 3

/**
 * Recommend the best next scenario for a trainee based on their skill gaps.
 * Always returns a result with a reason — the recommendation is null when
 * no suitable scenario can be found.
 */
export async function recommendNextScenario(
  orgId: string,
  userId: string,
  gaps: SkillGap[],
): Promise<RecommendationResult> {
  if (gaps.length === 0) {
    return { recommendation: null, reason: 'No skill gaps identified yet.' }
  }

  const supabase = createServiceClient()

  // Fetch active scenarios for this org (including universal ones)
  const { data: scenarios, error: scenarioError } = await supabase
    .from('scenarios')
    .select('id, title, difficulty, rubric')
    .eq('status', 'active')
    .or(`visibility.eq.universal,org_id.eq.${orgId}`)

  if (scenarioError) {
    throw new Error(`Failed to fetch scenarios: ${scenarioError.message}`)
  }

  if (!scenarios || scenarios.length === 0) {
    return { recommendation: null, reason: 'No active scenarios available for this organization.' }
  }

  // Fetch recent attempt counts per scenario in the last 7 days
  const recentCutoff = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const recentCounts = await getRecentAttemptCounts(supabase, orgId, userId, recentCutoff)

  // Filter out over-practiced scenarios
  const overPracticed = new Set(
    recentCounts
      .filter((r) => r.count >= RECENT_ATTEMPT_THRESHOLD)
      .map((r) => r.scenario_id),
  )

  const candidates = (scenarios as ScenarioRow[]).filter((s) => !overPracticed.has(s.id))

  if (candidates.length === 0) {
    return { recommendation: null, reason: 'All matching scenarios have been practiced 3+ times in the last 7 days.' }
  }

  // Score each candidate against the gaps
  const scored = candidates.map((scenario) => ({
    scenario,
    score: scoreScenarioForGaps(scenario, gaps),
  }))

  // Sort by score descending, pick best
  scored.sort((a, b) => b.score - a.score)

  const best = scored[0]
  if (best.score === 0) {
    return { recommendation: null, reason: 'No scenarios match the identified skill gaps.' }
  }

  const reason = buildRecommendationReason(best.scenario, gaps)

  return {
    recommendation: {
      scenarioId: best.scenario.id,
      scenarioTitle: best.scenario.title,
      reason,
      difficulty: best.scenario.difficulty,
    },
    reason,
  }
}

/**
 * Score a scenario against skill gaps. Higher = better match.
 *
 * Scoring rules:
 * - Rubric field matches a gap key: +10 points per matching gap (weighted by gap position)
 * - Confidence-related gaps + easy difficulty: +5 points
 * - conversation_quality rubric present for general quality gaps: +3 points
 */
function scoreScenarioForGaps(scenario: ScenarioRow, gaps: SkillGap[]): number {
  const rubric = scenario.rubric
  let score = 0

  for (let i = 0; i < gaps.length; i++) {
    const gap = gaps[i]
    const positionWeight = gaps.length - i // first gap is most important

    // Check direct rubric field match
    const rubricField = GAP_TO_RUBRIC_FIELD[gap.key]
    if (rubricField && rubric?.[rubricField]) {
      score += 10 * positionWeight
    }

    // Confidence-related gaps benefit from easy difficulty
    if (CONFIDENCE_RELATED_GAPS.has(gap.key) && scenario.difficulty === 'easy') {
      score += 5 * positionWeight
    }

    // conversation_quality rubric covers general quality gaps
    if (
      rubric?.conversation_quality &&
      ['clarity', 'professionalism', 'empathy', 'talk_listen_balance', 'filler_words'].includes(gap.key)
    ) {
      score += 3 * positionWeight
    }
  }

  return score
}

function buildRecommendationReason(scenario: ScenarioRow, gaps: SkillGap[]): string {
  const rubric = scenario.rubric
  const matchedGaps: string[] = []

  for (const gap of gaps) {
    const rubricField = GAP_TO_RUBRIC_FIELD[gap.key]
    if (rubricField && rubric?.[rubricField]) {
      matchedGaps.push(gap.key.replace(/_/g, ' '))
    } else if (
      rubric?.conversation_quality &&
      ['clarity', 'professionalism', 'empathy', 'talk_listen_balance', 'filler_words'].includes(gap.key)
    ) {
      matchedGaps.push(gap.key.replace(/_/g, ' '))
    }
  }

  if (matchedGaps.length > 0) {
    return `This scenario targets your weakest areas: ${matchedGaps.join(', ')}.`
  }

  if (CONFIDENCE_RELATED_GAPS.has(gaps[0].key) && scenario.difficulty === 'easy') {
    return `An easier scenario to help rebuild ${gaps[0].key.replace(/_/g, ' ')}.`
  }

  return `Recommended based on your current skill gaps.`
}

/** Query recent attempt counts grouped by scenario_id. */
async function getRecentAttemptCounts(
  supabase: ReturnType<typeof createServiceClient>,
  orgId: string,
  userId: string,
  cutoff: string,
): Promise<RecentAttemptCountRow[]> {
  // Supabase doesn't support GROUP BY in the JS client, so we fetch raw rows and count in JS.
  const { data, error } = await supabase
    .from('scenario_attempts')
    .select('scenario_id')
    .eq('org_id', orgId)
    .eq('clerk_user_id', userId)
    .gte('started_at', cutoff)

  if (error) {
    throw new Error(`Failed to fetch recent attempts: ${error.message}`)
  }

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const sid = (row as { scenario_id: string }).scenario_id
    counts.set(sid, (counts.get(sid) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([scenario_id, count]) => ({
    scenario_id,
    count,
  }))
}
