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
 * - systemic_gap (3+ reps weak in same skill) → high
 * - at_risk_rep (declining + inactive) → high
 * - engagement_drop (< 50% active) → medium
 * - milestone (top performer) → low
 */
export function generateManagerInsights(analysis: TeamAnalysis): ManagerInsight[] {
  const insights: ManagerInsight[] = []

  addSystemicGapInsights(analysis, insights)
  addAtRiskRepInsights(analysis, insights)
  addEngagementDropInsight(analysis, insights)
  addMilestoneInsights(analysis, insights)

  insights.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  return insights
}

// ── Insight builders ───────────────────────────────────────────────

function addSystemicGapInsights(analysis: TeamAnalysis, insights: ManagerInsight[]): void {
  for (const gap of analysis.systemicGaps) {
    const label = gap.skill.replace(/_/g, ' ')
    insights.push({
      type: 'systemic_gap',
      priority: 'high',
      skill: gap.skill,
      title: `Systemic gap: ${gap.affectedCount} reps struggling with ${label}`,
      message: `${gap.affectedCount} reps struggling with ${label}, averaging ${gap.avgScore}%. Consider team-wide training on this skill.`,
      metadata: {
        skill: gap.skill,
        affectedCount: gap.affectedCount,
        avgScore: gap.avgScore,
      },
    })
  }
}

function addAtRiskRepInsights(analysis: TeamAnalysis, insights: ManagerInsight[]): void {
  for (const rep of analysis.atRiskReps) {
    insights.push({
      type: 'at_risk_rep',
      priority: 'high',
      title: `At-risk rep identified`,
      message: `A rep is at risk: ${rep.reasons.join(', ')}. Intervention recommended.`,
      metadata: {
        userId: rep.userId,
        reasons: rep.reasons,
      },
    })
  }
}

function addEngagementDropInsight(analysis: TeamAnalysis, insights: ManagerInsight[]): void {
  const { teamStats } = analysis
  if (teamStats.totalTrainees === 0) return

  const activeRatio = teamStats.activeTrainees / teamStats.totalTrainees
  if (activeRatio >= ENGAGEMENT_THRESHOLD) return

  const pct = Math.round(activeRatio * 100)
  insights.push({
    type: 'engagement_drop',
    priority: 'medium',
    title: `Low team engagement: ${pct}% active`,
    message: `Only ${teamStats.activeTrainees} of ${teamStats.totalTrainees} trainees (${pct}%) were active in the last 7 days. Consider sending practice reminders.`,
    metadata: {
      activeTrainees: teamStats.activeTrainees,
      totalTrainees: teamStats.totalTrainees,
      activePercent: pct,
    },
  })
}

function addMilestoneInsights(analysis: TeamAnalysis, insights: ManagerInsight[]): void {
  for (const performer of analysis.topPerformers) {
    if (
      performer.avgScore >= MILESTONE_SCORE_THRESHOLD &&
      performer.attemptCount >= MILESTONE_MIN_ATTEMPTS
    ) {
      insights.push({
        type: 'milestone',
        priority: 'low',
        title: `Top performer averaging ${performer.avgScore}%`,
        message: `A team member has an average score of ${performer.avgScore}% across ${performer.attemptCount} attempts. Consider recognizing this achievement.`,
        metadata: {
          userId: performer.userId,
          avgScore: performer.avgScore,
          attemptCount: performer.attemptCount,
        },
      })
    }
  }
}
