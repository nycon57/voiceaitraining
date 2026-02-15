import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { createServiceClient } from '@/lib/memory/supabase'
import { getTopWeaknesses } from '@/lib/memory/user-memory'
import type { ScenarioDifficulty, ScenarioRubric } from '@/types/scenario'
import type { WeaknessEntry } from '@/lib/memory/user-memory'

export interface PreviousAttemptSummary {
  attemptId: string
  score: number | null
  startedAt: string
  durationSeconds: number | null
}

export interface PreCallBriefing {
  focusAreas: string[]
  scenarioTips: string[]
  previousAttempts: PreviousAttemptSummary[]
  motivationalNote: string
  estimatedDifficulty: ScenarioDifficulty | 'unknown'
}

interface ScenarioRow {
  id: string
  title: string
  difficulty: string | null
  rubric: ScenarioRubric | null
  description: string | null
}

interface AttemptRow {
  id: string
  score: number | null
  started_at: string
  duration_seconds: number | null
}

const MAX_FOCUS_AREAS = 3
const MAX_TIPS = 3
const MAX_PREVIOUS_ATTEMPTS = 3
const VALID_DIFFICULTIES = new Set<ScenarioDifficulty>(['easy', 'medium', 'hard'])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DEFAULT_FOCUS_AREAS = [
  'Focus on clear communication',
  'Listen actively to the prospect',
  'Ask open-ended questions',
]

/**
 * Generate a personalized pre-call briefing for a trainee about to practice a scenario.
 *
 * Focus areas come from the weakness profile (deterministic).
 * Scenario tips come from the rubric configuration (deterministic).
 * Motivational note is the only LLM call (Gemini Flash).
 */
export async function generatePreCallBriefing(
  orgId: string,
  userId: string,
  scenarioId: string,
): Promise<PreCallBriefing> {
  if (!UUID_RE.test(orgId)) {
    throw new Error(`Invalid orgId format: ${orgId}`)
  }

  const supabase = createServiceClient()

  // Fetch scenario, weaknesses, and previous attempts in parallel
  const [scenario, weaknesses, attempts] = await Promise.all([
    fetchScenario(supabase, orgId, scenarioId),
    getTopWeaknesses(orgId, userId, MAX_FOCUS_AREAS),
    fetchPreviousAttempts(supabase, orgId, userId, scenarioId),
  ])

  const focusAreas = buildFocusAreas(weaknesses, scenario.rubric)
  const scenarioTips = buildScenarioTips(scenario.rubric)
  const previousAttempts = attempts.map(toAttemptSummary)
  const estimatedDifficulty = normalizeDifficulty(scenario.difficulty)

  const motivationalNote = await generateMotivationalNote(
    focusAreas,
    previousAttempts,
    scenario.title,
  )

  return {
    focusAreas,
    scenarioTips,
    previousAttempts,
    motivationalNote,
    estimatedDifficulty,
  }
}

async function fetchScenario(
  supabase: ReturnType<typeof createServiceClient>,
  orgId: string,
  scenarioId: string,
): Promise<ScenarioRow> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('id, title, difficulty, rubric, description')
    .eq('id', scenarioId)
    .or(`visibility.eq.universal,org_id.eq.${orgId}`)
    .single()

  if (error) {
    const message = error.code === 'PGRST116'
      ? `Scenario not found: ${scenarioId}`
      : `Failed to fetch scenario ${scenarioId}: ${error.message}`
    throw new Error(message)
  }

  return data as ScenarioRow
}

async function fetchPreviousAttempts(
  supabase: ReturnType<typeof createServiceClient>,
  orgId: string,
  userId: string,
  scenarioId: string,
): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from('scenario_attempts')
    .select('id, score, started_at, duration_seconds')
    .eq('org_id', orgId)
    .eq('clerk_user_id', userId)
    .eq('scenario_id', scenarioId)
    .order('started_at', { ascending: false })
    .limit(MAX_PREVIOUS_ATTEMPTS)

  if (error) {
    throw new Error(`Failed to fetch previous attempts: ${error.message}`)
  }

  return (data ?? []) as AttemptRow[]
}

/**
 * Build focus areas from the trainee's weakness profile, filtered to
 * weaknesses relevant to this scenario's rubric when possible.
 */
function buildFocusAreas(
  weaknesses: WeaknessEntry[],
  rubric: ScenarioRubric | null,
): string[] {
  if (weaknesses.length === 0) return DEFAULT_FOCUS_AREAS

  const areas: string[] = []

  for (const weakness of weaknesses) {
    if (areas.length >= MAX_FOCUS_AREAS) break
    const tip = weaknessToFocusArea(weakness.key, rubric)
    if (tip) areas.push(tip)
  }

  // Fill remaining slots with generic tips if we don't have enough
  for (const fallback of DEFAULT_FOCUS_AREAS) {
    if (areas.length >= MAX_FOCUS_AREAS) break
    if (!areas.includes(fallback)) areas.push(fallback)
  }

  return areas
}

const WEAKNESS_FOCUS_MAP: Record<string, string> = {
  objection_handling: 'Listen for objections and address them with empathy',
  question_handling: 'Prepare thoughtful open-ended questions',
  clarity: 'Speak clearly and avoid jargon',
  professionalism: 'Maintain a professional and confident tone',
  empathy: 'Show genuine understanding of the prospect\'s situation',
  talk_listen_balance: 'Let the prospect speak — aim for a balanced conversation',
  filler_words: 'Reduce filler words (um, uh, like)',
  confidence: 'Project confidence in your product knowledge',
  goal_achievement: 'Stay focused on the call objective',
  rapport_building: 'Build rapport early in the conversation',
}

/** Map a weakness key to an actionable focus area string. */
function weaknessToFocusArea(key: string, rubric: ScenarioRubric | null): string | null {
  // If the rubric has objections defined, make the tip more specific
  if (key === 'objection_handling' && rubric?.objections_handled?.objection_types?.length) {
    const types = rubric.objections_handled.objection_types.slice(0, 2).join(' and ')
    return `Listen for ${types} objections and use feel-felt-found technique`
  }

  return WEAKNESS_FOCUS_MAP[key] ?? null
}

/** Build scenario-specific tips from the rubric configuration. */
function buildScenarioTips(rubric: ScenarioRubric | null): string[] {
  if (!rubric) return ['Review the scenario description before starting']

  const tips: string[] = []

  if (rubric.goal_achievement) {
    tips.push(rubric.goal_achievement.required
      ? 'Achieving the call goal is required — stay focused on the objective'
      : 'Try to achieve the call goal for maximum points')
  }

  if (rubric.required_phrases?.phrases?.length) {
    const count = rubric.required_phrases.phrases.length
    tips.push(`Include ${count} required phrase${count > 1 ? 's' : ''} during the conversation`)
  }

  if (rubric.open_questions) {
    tips.push(`Ask at least ${rubric.open_questions.minimum_count} open-ended question${rubric.open_questions.minimum_count > 1 ? 's' : ''}`)
  }

  if (rubric.objections_handled?.objection_types?.length) {
    tips.push(`Be ready to handle objections: ${rubric.objections_handled.objection_types.slice(0, 3).join(', ')}`)
  }

  if (rubric.conversation_quality?.metrics?.length) {
    tips.push(`Quality metrics tracked: ${rubric.conversation_quality.metrics.slice(0, 3).join(', ')}`)
  }

  return tips.slice(0, MAX_TIPS)
}

async function generateMotivationalNote(
  focusAreas: string[],
  previousAttempts: PreviousAttemptSummary[],
  scenarioTitle: string,
): Promise<string> {
  const attemptContext = previousAttempts.length > 0
    ? `They have ${previousAttempts.length} previous attempt(s) on this scenario, latest score: ${previousAttempts[0].score ?? 'unscored'}.`
    : 'This is their first time attempting this scenario.'

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      maxOutputTokens: 150,
      prompt: `You are a supportive sales coach. Write a brief (1-2 sentence) motivational note for a trainee about to practice "${scenarioTitle}". ${attemptContext} Their focus areas are: ${focusAreas.join(', ')}. Be encouraging but specific. Do not use emojis.`,
    })

    return text.trim()
  } catch (error) {
    console.error('[coach-agent] Failed to generate motivational note:', error)
    return 'You\'ve got this — focus on your key areas and give it your best shot.'
  }
}

function toAttemptSummary(row: AttemptRow): PreviousAttemptSummary {
  return {
    attemptId: row.id,
    score: row.score,
    startedAt: row.started_at,
    durationSeconds: row.duration_seconds,
  }
}

function normalizeDifficulty(value: string | null): PreCallBriefing['estimatedDifficulty'] {
  if (value && VALID_DIFFICULTIES.has(value as ScenarioDifficulty)) return value as ScenarioDifficulty
  return 'unknown'
}
