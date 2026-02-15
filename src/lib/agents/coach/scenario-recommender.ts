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

interface RecentAttemptRow {
  scenario_id: string | null
}

interface CandidateScore {
  scenario: ScenarioRow
  score: number
  matchedGapKeys: string[]
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

/** Gap keys addressed by the conversation_quality rubric section. */
const CONVERSATION_QUALITY_GAPS = new Set([
  'clarity',
  'professionalism',
  'empathy',
  'talk_listen_balance',
  'filler_words',
])

const RECENT_DAYS = 7
const RECENT_ATTEMPT_THRESHOLD = 3
const DIRECT_RUBRIC_MATCH_SCORE = 10
const CONVERSATION_QUALITY_MATCH_SCORE = 4
const EASY_DIFFICULTY_CONFIDENCE_SCORE = 6

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

  // Fetch active scenarios scoped to the organization.
  const { data: scenarios, error: scenarioError } = await supabase
    .from('scenarios')
    .select('id, title, difficulty, rubric')
    .eq('org_id', orgId)
    .eq('status', 'active')

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
    return {
      recommendation: null,
      reason: 'All active scenarios have been practiced 3+ times in the last 7 days.',
    }
  }

  // Score each candidate against the gaps
  const scored = candidates.map((scenario) => scoreScenarioForGaps(scenario, gaps))

  // Sort by score descending, pick best
  scored.sort((a, b) => b.score - a.score)

  const best = scored[0]
  if (best.score === 0) {
    return { recommendation: null, reason: 'No scenarios match the identified skill gaps.' }
  }

  const reason = buildRecommendationReason(best.scenario, best.matchedGapKeys, gaps)

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
 * - confidence/professionalism/clarity gap + easy scenario: +6 points
 * - conversation_quality rubric present for quality gaps: +4 points
 */
function scoreScenarioForGaps(scenario: ScenarioRow, gaps: SkillGap[]): CandidateScore {
  const { rubric } = scenario
  let score = 0
  const matchedGapKeys: string[] = []

  for (let i = 0; i < gaps.length; i++) {
    const gap = gaps[i]
    const positionWeight = gaps.length - i // first gap is most important

    // Direct rubric field match (e.g. objection_handling -> objections_handled)
    const rubricField = GAP_TO_RUBRIC_FIELD[gap.key]
    if (rubricField && rubric?.[rubricField]) {
      score += DIRECT_RUBRIC_MATCH_SCORE * positionWeight
      matchedGapKeys.push(gap.key)
    }

    if (CONFIDENCE_RELATED_GAPS.has(gap.key) && scenario.difficulty === 'easy') {
      score += EASY_DIFFICULTY_CONFIDENCE_SCORE * positionWeight
      matchedGapKeys.push(gap.key)
    }

    // conversation_quality rubric covers general quality gaps
    if (rubric?.conversation_quality && CONVERSATION_QUALITY_GAPS.has(gap.key)) {
      score += CONVERSATION_QUALITY_MATCH_SCORE * positionWeight
      matchedGapKeys.push(gap.key)
    }
  }

  return {
    scenario,
    score,
    matchedGapKeys: Array.from(new Set(matchedGapKeys)),
  }
}

function buildRecommendationReason(
  scenario: ScenarioRow,
  matchedGapKeys: string[],
  gaps: SkillGap[],
): string {
  const matchedGaps = matchedGapKeys.map((gapKey) => gapKey.replace(/_/g, ' '))

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
    .eq('status', 'completed')
    .gte('started_at', cutoff)
    .not('scenario_id', 'is', null)

  if (error) {
    throw new Error(`Failed to fetch recent attempts: ${error.message}`)
  }

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as RecentAttemptRow[]) {
    if (!row.scenario_id) continue
    counts.set(row.scenario_id, (counts.get(row.scenario_id) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([scenario_id, count]) => ({
    scenario_id,
    count,
  }))
}
