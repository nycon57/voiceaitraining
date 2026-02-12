import type { TeamAnalysis } from './team-analyzer'

// ── Types ──────────────────────────────────────────────────────────

export type InsightType = 'systemic_gap' | 'at_risk_rep' | 'engagement_drop' | 'milestone'
export type InsightPriority = 'high' | 'medium' | 'low'

export interface ManagerInsight {
  type: InsightType
  priority: InsightPriority
  title: string
  message: string
  skill?: string
  metadata: Record<string, unknown>
}

// ── Constants ──────────────────────────────────────────────────────

const ENGAGEMENT_THRESHOLD = 0.5
const MILESTONE_SCORE_THRESHOLD = 90
const MILESTONE_MIN_ATTEMPTS = 5

const PRIORITY_ORDER: Record<InsightPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

// ── Main entry point ───────────────────────────────────────────────

/**
 * Convert a TeamAnalysis into prioritized, actionable insights for managers.
 *
 * Priority rules:
 * - systemic_gap (3+ reps weak in same skill) -> high
 * - at_risk_rep (declining + inactive) -> high
 * - engagement_drop (< 50% active) -> medium
 * - milestone (top performer) -> low
 */
export function generateManagerInsights(analysis: TeamAnalysis): ManagerInsight[] {
  const insights: ManagerInsight[] = [
    ...buildSystemicGapInsights(analysis),
    ...buildAtRiskRepInsights(analysis),
    ...buildEngagementDropInsights(analysis),
    ...buildMilestoneInsights(analysis),
  ]

  insights.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  return insights
}

// ── Insight builders ───────────────────────────────────────────────

function buildSystemicGapInsights(analysis: TeamAnalysis): ManagerInsight[] {
  return analysis.systemicGaps.map((gap) => {
    const label = gap.skill.replace(/_/g, ' ')
    return {
      type: 'systemic_gap',
      priority: 'high',
      skill: gap.skill,
      title: `Systemic gap in ${label}: ${gap.affectedCount} reps affected`,
      message: `${gap.affectedCount} reps are struggling with ${label}, averaging ${gap.avgScore}%. Consider scheduling team-wide training.`,
      metadata: {
        skill: gap.skill,
        affectedCount: gap.affectedCount,
        avgScore: gap.avgScore,
      },
    }
  })
}

function buildAtRiskRepInsights(analysis: TeamAnalysis): ManagerInsight[] {
  return analysis.atRiskReps.map((rep) => ({
    type: 'at_risk_rep',
    priority: 'high',
    title: `At-risk rep identified`,
    message: `Rep flagged as at risk: ${rep.reasons.join(', ')}. Consider scheduling a 1:1.`,
    metadata: {
      userId: rep.userId,
      reasons: rep.reasons,
    },
  }))
}

function buildEngagementDropInsights(analysis: TeamAnalysis): ManagerInsight[] {
  const { teamStats } = analysis
  if (teamStats.totalTrainees === 0) return []

  const activeRatio = teamStats.activeTrainees / teamStats.totalTrainees
  if (activeRatio >= ENGAGEMENT_THRESHOLD) return []

  const pct = Math.round(activeRatio * 100)
  return [
    {
      type: 'engagement_drop',
      priority: 'medium',
      title: `Low team engagement: ${pct}% active`,
      message: `Only ${teamStats.activeTrainees} of ${teamStats.totalTrainees} trainees (${pct}%) practiced in the last 7 days. Consider sending reminders.`,
      metadata: {
        activeTrainees: teamStats.activeTrainees,
        totalTrainees: teamStats.totalTrainees,
        activePercent: pct,
      },
    },
  ]
}

function buildMilestoneInsights(analysis: TeamAnalysis): ManagerInsight[] {
  return analysis.topPerformers
    .filter(
      (p) =>
        p.avgScore >= MILESTONE_SCORE_THRESHOLD &&
        p.attemptCount >= MILESTONE_MIN_ATTEMPTS,
    )
    .map((performer) => ({
      type: 'milestone',
      priority: 'low',
      title: `Top performer averaging ${performer.avgScore}%`,
      message: `A rep is averaging ${performer.avgScore}% across ${performer.attemptCount} attempts. Consider recognizing their achievement.`,
      metadata: {
        userId: performer.userId,
        avgScore: performer.avgScore,
        attemptCount: performer.attemptCount,
      },
    }))
}
