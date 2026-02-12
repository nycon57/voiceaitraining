import { google } from '@ai-sdk/google'
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateText } from 'ai'

import { createServiceClient } from '@/lib/memory/supabase'
import {
  getWeaknessProfile,
  getTopStrengths,
  type WeaknessEntry,
  type SkillLevel,
} from '@/lib/memory/user-memory'
import type { ScenarioDifficulty, ScenarioRubric } from '@/types/scenario'

// ── Types ──────────────────────────────────────────────────────────

export interface PerformanceSummary {
  overallScore: number | null
  attemptCount: number
  trend: 'up' | 'down' | 'stable'
  recentScores: number[]
  teamAvgScore: number | null
  comparedToTeam: 'above' | 'below' | 'at' | null
}

export interface RecommendedAssignment {
  scenarioId: string
  scenarioTitle: string
  reason: string
  difficulty: ScenarioDifficulty | null
}

export interface CoachingBrief {
  traineeId: string
  traineeName: string
  generatedAt: string
  performanceSummary: PerformanceSummary
  strengthsToReinforce: string[]
  areasToDiscuss: string[]
  talkingPoints: string[]
  recommendedAssignments: RecommendedAssignment[]
}

// ── Internal row types ─────────────────────────────────────────────

interface AttemptRow {
  clerk_user_id: string
  score: number | null
  started_at: string
}

interface TraineeRow {
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface ScenarioRow {
  id: string
  title: string
  difficulty: ScenarioDifficulty | null
  rubric: ScenarioRubric | null
}

interface RecentCountRow {
  scenarioId: string
  count: number
}

// ── Constants ──────────────────────────────────────────────────────

const MAX_RECENT_SCORES = 10
const MAX_STRENGTHS = 3
const MAX_AREAS_TO_DISCUSS = 3
const MAX_RECOMMENDED_ASSIGNMENTS = 3
const RECENT_DAYS = 7
const RECENT_ATTEMPT_THRESHOLD = 3
const COMPARISON_THRESHOLD = 5

/** Rubric fields that target each gap key. */
const GAP_TO_RUBRIC_FIELD: Record<string, keyof ScenarioRubric> = {
  objection_handling: 'objections_handled',
  question_handling: 'open_questions',
}

/** Gap keys covered by the conversation_quality rubric section. */
const CONVERSATION_QUALITY_GAPS = new Set([
  'clarity',
  'professionalism',
  'empathy',
  'talk_listen_balance',
  'filler_words',
])

const SKILL_LABELS: Record<string, string> = {
  objection_handling: 'Objection handling',
  question_handling: 'Asking questions',
  clarity: 'Communication clarity',
  professionalism: 'Professional tone',
  empathy: 'Empathy and rapport',
  talk_listen_balance: 'Talk/listen balance',
  filler_words: 'Minimal filler words',
  confidence: 'Confidence',
  goal_achievement: 'Goal achievement',
  rapport_building: 'Rapport building',
}

// ── Helpers ────────────────────────────────────────────────────────

function roundedMean(values: number[]): number {
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function extractScores(attempts: AttemptRow[]): number[] {
  return attempts.map((a) => a.score).filter((s): s is number => s != null)
}

function formatName(trainee: TraineeRow): string {
  const name = [trainee.first_name, trainee.last_name].filter(Boolean).join(' ').trim()
  return name || trainee.email || 'Unknown'
}

function skillLabel(key: string): string {
  return SKILL_LABELS[key] ?? key.replace(/_/g, ' ')
}

/** Check whether a scenario rubric addresses a given weakness key. */
function rubricMatchesGap(rubric: ScenarioRubric | null, gapKey: string): boolean {
  const rubricField = GAP_TO_RUBRIC_FIELD[gapKey]
  if (rubricField && rubric?.[rubricField]) return true
  if (rubric?.conversation_quality && CONVERSATION_QUALITY_GAPS.has(gapKey)) return true
  return false
}

function trendSuffix(trend: WeaknessEntry['trend']): string {
  if (trend === 'declining') return ' (declining)'
  if (trend === 'stable') return ' (not improving)'
  return ''
}

// ── Main entry point ───────────────────────────────────────────────

/** Generate a 1:1 coaching brief for a manager about a specific trainee. */
export async function generateCoachingBrief(
  orgId: string,
  _managerId: string,
  traineeId: string,
): Promise<CoachingBrief> {
  const supabase = createServiceClient()

  const [trainee, weaknesses, strengths, traineeAttempts, teamAttempts, scenarios] =
    await Promise.all([
      fetchTrainee(supabase, orgId, traineeId),
      getWeaknessProfile(orgId, traineeId),
      getTopStrengths(orgId, traineeId, MAX_STRENGTHS),
      fetchTraineeAttempts(supabase, orgId, traineeId),
      fetchTeamAttempts(supabase, orgId),
      fetchActiveScenarios(supabase, orgId),
    ])

  const performanceSummary = buildPerformanceSummary(traineeAttempts, teamAttempts)
  const strengthsToReinforce = buildStrengths(strengths)
  const areasToDiscuss = buildAreasToDiscuss(weaknesses)
  const recommendedAssignments = await buildRecommendedAssignments(
    supabase,
    orgId,
    traineeId,
    weaknesses,
    scenarios,
  )

  const talkingPoints = await generateTalkingPoints(
    trainee,
    performanceSummary,
    areasToDiscuss,
    strengthsToReinforce,
  )

  return {
    traineeId,
    traineeName: formatName(trainee),
    generatedAt: new Date().toISOString(),
    performanceSummary,
    strengthsToReinforce,
    areasToDiscuss,
    talkingPoints,
    recommendedAssignments,
  }
}

// ── Data fetching ──────────────────────────────────────────────────

async function fetchTrainee(
  supabase: SupabaseClient,
  orgId: string,
  traineeId: string,
): Promise<TraineeRow> {
  const { data: member, error: memberError } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('org_id', orgId)
    .eq('user_id', traineeId)
    .single()

  if (memberError || !member) {
    throw new Error('Failed to fetch trainee: user not found in organization')
  }

  const { data, error } = await supabase
    .from('users')
    .select('first_name, last_name, email')
    .eq('clerk_user_id', traineeId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch trainee: ${error.message}`)
  }

  return data as TraineeRow
}

async function fetchTraineeAttempts(
  supabase: SupabaseClient,
  orgId: string,
  traineeId: string,
): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from('scenario_attempts')
    .select('clerk_user_id, score, started_at')
    .eq('org_id', orgId)
    .eq('clerk_user_id', traineeId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch trainee attempts: ${error.message}`)
  }

  return (data ?? []) as AttemptRow[]
}

async function fetchTeamAttempts(
  supabase: SupabaseClient,
  orgId: string,
): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from('scenario_attempts')
    .select('clerk_user_id, score, started_at')
    .eq('org_id', orgId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch team attempts: ${error.message}`)
  }

  return (data ?? []) as AttemptRow[]
}

async function fetchActiveScenarios(
  supabase: SupabaseClient,
  orgId: string,
): Promise<ScenarioRow[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('id, title, difficulty, rubric')
    .eq('status', 'active')
    .or(`visibility.eq.universal,org_id.eq.${orgId}`)

  if (error) {
    throw new Error(`Failed to fetch scenarios: ${error.message}`)
  }

  return (data ?? []) as ScenarioRow[]
}

// ── Performance summary ────────────────────────────────────────────

function buildPerformanceSummary(
  traineeAttempts: AttemptRow[],
  teamAttempts: AttemptRow[],
): PerformanceSummary {
  const traineeScores = extractScores(traineeAttempts)
  const recentScores = traineeScores.slice(0, MAX_RECENT_SCORES)
  const overallScore = traineeScores.length > 0 ? roundedMean(traineeScores) : null
  const trend = computeTrend(traineeScores)

  const teamScores = extractScores(teamAttempts)
  const teamAvgScore = teamScores.length > 0 ? roundedMean(teamScores) : null

  let comparedToTeam: PerformanceSummary['comparedToTeam'] = null
  if (overallScore != null && teamAvgScore != null) {
    if (overallScore > teamAvgScore + COMPARISON_THRESHOLD) comparedToTeam = 'above'
    else if (overallScore < teamAvgScore - COMPARISON_THRESHOLD) comparedToTeam = 'below'
    else comparedToTeam = 'at'
  }

  return {
    overallScore,
    attemptCount: traineeAttempts.length,
    trend,
    recentScores,
    teamAvgScore,
    comparedToTeam,
  }
}

function computeTrend(scores: number[]): PerformanceSummary['trend'] {
  if (scores.length < 4) return 'stable'

  const midPoint = Math.floor(scores.length / 2)
  // Scores are newest-first: first half = recent, second half = older
  const recentAvg = mean(scores.slice(0, midPoint))
  const olderAvg = mean(scores.slice(midPoint))

  if (recentAvg > olderAvg + COMPARISON_THRESHOLD) return 'up'
  if (recentAvg < olderAvg - COMPARISON_THRESHOLD) return 'down'
  return 'stable'
}

// ── Strengths ──────────────────────────────────────────────────────

function buildStrengths(strengths: SkillLevel[]): string[] {
  if (strengths.length === 0) return ['Not enough data yet — assign more practice scenarios']

  return strengths.map((s) => {
    const label = skillLabel(s.key)
    return s.score != null ? `${label} (${s.score}%)` : label
  })
}

// ── Areas to discuss ───────────────────────────────────────────────

function buildAreasToDiscuss(weaknesses: WeaknessEntry[]): string[] {
  if (weaknesses.length === 0) {
    return ['Not enough data yet — assign more practice scenarios']
  }

  return weaknesses.slice(0, MAX_AREAS_TO_DISCUSS).map((w) => {
    const label = skillLabel(w.key)
    const suffix = trendSuffix(w.trend)
    return w.score != null ? `${label} at ${w.score}%${suffix}` : `${label}${suffix}`
  })
}

// ── Recommended assignments ────────────────────────────────────────

async function buildRecommendedAssignments(
  supabase: SupabaseClient,
  orgId: string,
  traineeId: string,
  weaknesses: WeaknessEntry[],
  scenarios: ScenarioRow[],
): Promise<RecommendedAssignment[]> {
  if (weaknesses.length === 0 || scenarios.length === 0) return []

  const recentCutoff = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const recentCounts = await getRecentAttemptCounts(supabase, orgId, traineeId, recentCutoff)
  const overPracticed = new Set(
    recentCounts
      .filter((r) => r.count >= RECENT_ATTEMPT_THRESHOLD)
      .map((r) => r.scenarioId),
  )

  const candidates = scenarios.filter((s) => !overPracticed.has(s.id))
  if (candidates.length === 0) return []

  const scored = candidates.map((scenario) => ({
    scenario,
    score: scoreScenarioForWeaknesses(scenario, weaknesses),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored
    .filter((s) => s.score > 0)
    .slice(0, MAX_RECOMMENDED_ASSIGNMENTS)
    .map(({ scenario }) => ({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      reason: buildAssignmentReason(scenario, weaknesses),
      difficulty: scenario.difficulty,
    }))
}

function scoreScenarioForWeaknesses(
  scenario: ScenarioRow,
  weaknesses: WeaknessEntry[],
): number {
  let score = 0

  for (let i = 0; i < weaknesses.length; i++) {
    const w = weaknesses[i]
    const positionWeight = weaknesses.length - i

    const rubricField = GAP_TO_RUBRIC_FIELD[w.key]
    if (rubricField && scenario.rubric?.[rubricField]) {
      score += 10 * positionWeight
    }

    if (scenario.rubric?.conversation_quality && CONVERSATION_QUALITY_GAPS.has(w.key)) {
      score += 3 * positionWeight
    }
  }

  return score
}

function buildAssignmentReason(
  scenario: ScenarioRow,
  weaknesses: WeaknessEntry[],
): string {
  const matched = weaknesses
    .filter((w) => rubricMatchesGap(scenario.rubric, w.key))
    .map((w) => skillLabel(w.key).toLowerCase())

  if (matched.length > 0) {
    return `Targets weak areas: ${matched.join(', ')}.`
  }
  return 'Addresses current skill gaps.'
}

async function getRecentAttemptCounts(
  supabase: SupabaseClient,
  orgId: string,
  traineeId: string,
  cutoff: string,
): Promise<RecentCountRow[]> {
  const { data, error } = await supabase
    .from('scenario_attempts')
    .select('scenario_id')
    .eq('org_id', orgId)
    .eq('clerk_user_id', traineeId)
    .gte('started_at', cutoff)

  if (error) {
    throw new Error(`Failed to fetch recent attempts: ${error.message}`)
  }

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    counts.set(row.scenario_id, (counts.get(row.scenario_id) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([scenarioId, count]) => ({
    scenarioId,
    count,
  }))
}

// ── Talking points (LLM) ──────────────────────────────────────────

async function generateTalkingPoints(
  trainee: TraineeRow,
  performance: PerformanceSummary,
  areasToDiscuss: string[],
  strengths: string[],
): Promise<string[]> {
  const name = formatName(trainee)

  const performanceCtx = performance.overallScore != null
    ? `Overall score: ${performance.overallScore}%. Trend: ${performance.trend}. Attempts: ${performance.attemptCount}.${performance.comparedToTeam ? ` Compared to team: ${performance.comparedToTeam} average.` : ''}`
    : 'No scored attempts yet.'

  const prompt = `You are a sales coaching expert. Generate 3-5 specific, actionable talking points for a manager's 1:1 meeting with ${name}.

Performance: ${performanceCtx}
Areas needing improvement: ${areasToDiscuss.join('; ')}
Strengths: ${strengths.join('; ')}

Rules:
- Each talking point should be one concise sentence.
- Focus on specific coaching actions, not generic advice.
- If there are declining areas, address those first.
- Include at least one positive reinforcement point.
- Reference specific skills by name (e.g., "objection handling", "rapport building").
- Do not use emojis or bullet points.
- Return each talking point on its own line, nothing else.`

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      maxOutputTokens: 300,
      prompt,
    })

    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  } catch (error) {
    console.error('[manager-agent] Failed to generate talking points:', error)
    return buildFallbackTalkingPoints(areasToDiscuss, strengths)
  }
}

function buildFallbackTalkingPoints(
  areasToDiscuss: string[],
  strengths: string[],
): string[] {
  const points: string[] = []

  for (const area of areasToDiscuss) {
    const label = area.split(' at ')[0].toLowerCase()
    if (label.includes('objection')) {
      points.push('Review objections encountered and practice the feel-felt-found technique.')
    } else if (label.includes('question')) {
      points.push('Practice framing open-ended questions that uncover prospect needs.')
    } else {
      points.push(`Discuss strategies to improve ${label}.`)
    }
  }

  if (strengths.length > 0 && !strengths[0].includes('Not enough data')) {
    points.push(`Reinforce strong performance in ${strengths[0].toLowerCase()}.`)
  }

  return points.length > 0
    ? points
    : ['Review recent call recordings together.', 'Set goals for the next practice session.']
}
