import { createServiceClient } from '@/lib/memory/supabase'

// ── Types ──────────────────────────────────────────────────────────

export interface TeamStats {
  totalTrainees: number
  activeTrainees: number
  avgScore: number | null
  totalCompletedAttempts: number
}

export interface SystemicGap {
  skill: string
  affectedCount: number
  avgScore: number
}

export interface AtRiskRep {
  userId: string
  reasons: string[]
}

export interface TopPerformer {
  userId: string
  avgScore: number
  attemptCount: number
}

export interface TeamAnalysis {
  teamStats: TeamStats
  systemicGaps: SystemicGap[]
  atRiskReps: AtRiskRep[]
  topPerformers: TopPerformer[]
  recommendations: string[]
}

// ── Internal row types ─────────────────────────────────────────────

interface WeaknessProfileRow {
  user_id: string
  key: string
  score: number | null
  trend: string | null
}

interface AttemptRow {
  clerk_user_id: string
  score: number | null
  started_at: string
}

// ── Constants ──────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24
const INACTIVITY_DAYS = 7
const SYSTEMIC_THRESHOLD = 3
const WEAKNESS_SCORE_THRESHOLD = 60
const TOP_PERFORMER_LIMIT = 5

// ── Empty analysis (no trainees) ───────────────────────────────────

function emptyAnalysis(): TeamAnalysis {
  return {
    teamStats: {
      totalTrainees: 0,
      activeTrainees: 0,
      avgScore: null,
      totalCompletedAttempts: 0,
    },
    systemicGaps: [],
    atRiskReps: [],
    topPerformers: [],
    recommendations: [],
  }
}

// ── Main entry point ───────────────────────────────────────────────

/**
 * Analyze team performance for an entire org.
 * Returns systemic gaps, at-risk reps, top performers, and recommendations.
 */
export async function analyzeTeamPerformance(orgId: string): Promise<TeamAnalysis> {
  const supabase = createServiceClient()

  // 1. Get trainee members
  const { data: membersData, error: membersError } = await supabase
    .from('org_members')
    .select('user_id, role')
    .eq('org_id', orgId)
    .eq('role', 'trainee')

  if (membersError) {
    throw new Error(`Failed to fetch org members: ${membersError.message}`)
  }

  const traineeIds = (membersData ?? []).map(
    (m: { user_id: string }) => m.user_id,
  )

  if (traineeIds.length === 0) return emptyAnalysis()

  // 2. Fetch weakness profiles and completed attempts in parallel
  const [weaknessProfiles, attempts] = await Promise.all([
    fetchWeaknessProfiles(orgId, traineeIds),
    fetchCompletedAttempts(orgId, traineeIds),
  ])

  // 3. Compute analysis
  const systemicGaps = findSystemicGaps(weaknessProfiles)
  const atRiskReps = findAtRiskReps(traineeIds, weaknessProfiles, attempts)
  const topPerformers = findTopPerformers(attempts)
  const teamStats = computeTeamStats(traineeIds, attempts)
  const recommendations = generateRecommendations(systemicGaps, atRiskReps, teamStats)

  return { teamStats, systemicGaps, atRiskReps, topPerformers, recommendations }
}

// ── Data fetching ──────────────────────────────────────────────────

async function fetchWeaknessProfiles(
  orgId: string,
  traineeIds: string[],
): Promise<WeaknessProfileRow[]> {
  const { data, error } = await createServiceClient()
    .from('user_memory')
    .select('user_id, key, score, trend')
    .eq('org_id', orgId)
    .eq('memory_type', 'weakness_profile')
    .in('user_id', traineeIds)

  if (error) {
    throw new Error(`Failed to fetch weakness profiles: ${error.message}`)
  }

  return (data ?? []) as WeaknessProfileRow[]
}

async function fetchCompletedAttempts(
  orgId: string,
  traineeIds: string[],
): Promise<AttemptRow[]> {
  const { data, error } = await createServiceClient()
    .from('scenario_attempts')
    .select('clerk_user_id, score, started_at')
    .eq('org_id', orgId)
    .eq('status', 'completed')
    .in('clerk_user_id', traineeIds)
    .order('started_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch completed attempts: ${error.message}`)
  }

  return (data ?? []) as AttemptRow[]
}

// ── Systemic gaps ──────────────────────────────────────────────────

/**
 * A systemic gap exists when 3+ reps share the same weakness
 * (same weakness_profile key with score < 60).
 */
function findSystemicGaps(profiles: WeaknessProfileRow[]): SystemicGap[] {
  const weakUsersBySkill = new Map<string, Set<string>>()
  const scoresBySkill = new Map<string, number[]>()

  for (const p of profiles) {
    if (p.score == null || p.score >= WEAKNESS_SCORE_THRESHOLD) continue

    const users = weakUsersBySkill.get(p.key) ?? new Set<string>()
    users.add(p.user_id)
    weakUsersBySkill.set(p.key, users)

    const scores = scoresBySkill.get(p.key) ?? []
    scores.push(p.score)
    scoresBySkill.set(p.key, scores)
  }

  const gaps: SystemicGap[] = []

  for (const [skill, users] of weakUsersBySkill) {
    if (users.size >= SYSTEMIC_THRESHOLD) {
      const scores = scoresBySkill.get(skill)!
      const avgScore = Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length,
      )
      gaps.push({ skill, affectedCount: users.size, avgScore })
    }
  }

  return gaps.sort((a, b) => b.affectedCount - a.affectedCount)
}

// ── At-risk reps ───────────────────────────────────────────────────

/**
 * At-risk = declining scores OR inactive 7+ days (or no attempts at all).
 */
function findAtRiskReps(
  traineeIds: string[],
  profiles: WeaknessProfileRow[],
  attempts: AttemptRow[],
): AtRiskRep[] {
  const now = new Date()

  // Group weakness profiles by user
  const profilesByUser = new Map<string, WeaknessProfileRow[]>()
  for (const p of profiles) {
    const list = profilesByUser.get(p.user_id) ?? []
    list.push(p)
    profilesByUser.set(p.user_id, list)
  }

  // Most recent attempt per user (attempts are already newest-first)
  const lastAttemptByUser = new Map<string, Date>()
  for (const a of attempts) {
    if (!lastAttemptByUser.has(a.clerk_user_id)) {
      lastAttemptByUser.set(a.clerk_user_id, new Date(a.started_at))
    }
  }

  const atRisk: AtRiskRep[] = []

  for (const userId of traineeIds) {
    const reasons: string[] = []

    // Declining scores: majority of weakness dimensions trending down
    const userProfiles = profilesByUser.get(userId) ?? []
    if (userProfiles.length > 0) {
      const decliningCount = userProfiles.filter(
        (p) => p.trend === 'declining',
      ).length
      if (decliningCount > 0 && decliningCount >= userProfiles.length / 2) {
        reasons.push('declining scores')
      }
    }

    // Inactivity: 7+ days since last attempt or no attempts ever
    const lastAttempt = lastAttemptByUser.get(userId)
    if (!lastAttempt) {
      reasons.push('no completed attempts')
    } else {
      const daysSince = Math.floor(
        (now.getTime() - lastAttempt.getTime()) / MS_PER_DAY,
      )
      if (daysSince >= INACTIVITY_DAYS) {
        reasons.push(`inactive for ${daysSince} days`)
      }
    }

    if (reasons.length > 0) {
      atRisk.push({ userId, reasons })
    }
  }

  return atRisk
}

// ── Top performers ─────────────────────────────────────────────────

function findTopPerformers(attempts: AttemptRow[]): TopPerformer[] {
  const scoresByUser = new Map<string, number[]>()

  for (const a of attempts) {
    if (a.score == null) continue
    const scores = scoresByUser.get(a.clerk_user_id) ?? []
    scores.push(a.score)
    scoresByUser.set(a.clerk_user_id, scores)
  }

  const performers: TopPerformer[] = []

  for (const [userId, scores] of scoresByUser) {
    const avgScore = Math.round(
      scores.reduce((sum, s) => sum + s, 0) / scores.length,
    )
    performers.push({ userId, avgScore, attemptCount: scores.length })
  }

  return performers
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, TOP_PERFORMER_LIMIT)
}

// ── Team stats ─────────────────────────────────────────────────────

function computeTeamStats(
  traineeIds: string[],
  attempts: AttemptRow[],
): TeamStats {
  const now = new Date()
  const activeThreshold = now.getTime() - INACTIVITY_DAYS * MS_PER_DAY

  // Track active users and collect all scores
  const activeUsers = new Set<string>()
  const allScores: number[] = []

  for (const a of attempts) {
    if (a.score != null) allScores.push(a.score)
    if (new Date(a.started_at).getTime() >= activeThreshold) {
      activeUsers.add(a.clerk_user_id)
    }
  }

  return {
    totalTrainees: traineeIds.length,
    activeTrainees: activeUsers.size,
    avgScore:
      allScores.length > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
        : null,
    totalCompletedAttempts: attempts.length,
  }
}

// ── Recommendations ────────────────────────────────────────────────

function generateRecommendations(
  gaps: SystemicGap[],
  atRisk: AtRiskRep[],
  stats: TeamStats,
): string[] {
  const recs: string[] = []

  for (const gap of gaps) {
    const label = gap.skill.replace(/_/g, ' ')
    recs.push(
      `Team-wide training needed for ${label} — ${gap.affectedCount} reps averaging ${gap.avgScore}%.`,
    )
  }

  const inactiveCount = atRisk.filter((r) =>
    r.reasons.some((reason) => reason.includes('inactive') || reason.includes('no completed')),
  ).length
  if (inactiveCount > 0) {
    recs.push(
      `${inactiveCount} rep${inactiveCount > 1 ? 's' : ''} inactive for 7+ days — consider outreach or reassignment.`,
    )
  }

  const decliningCount = atRisk.filter((r) =>
    r.reasons.includes('declining scores'),
  ).length
  if (decliningCount > 0) {
    recs.push(
      `${decliningCount} rep${decliningCount > 1 ? 's have' : ' has'} declining scores — review coaching plans.`,
    )
  }

  if (stats.totalTrainees > 0 && stats.activeTrainees / stats.totalTrainees < 0.5) {
    recs.push(
      `Low engagement: only ${stats.activeTrainees} of ${stats.totalTrainees} trainees active in the last 7 days.`,
    )
  }

  return recs
}
