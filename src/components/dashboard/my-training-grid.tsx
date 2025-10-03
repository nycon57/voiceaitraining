/**
 * My Training Grid
 *
 * Unified display for all user training (both assigned and self-enrolled)
 * Shows progress, assignment status, and due dates in a consistent format
 */

import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { EnrichedEnrollment } from '@/actions/enrollments'
import { ScenarioCard, TrackCard, type ScenarioCardData, type TrackCardData } from '@/components/training'

interface Assignment {
  id: string
  type: 'scenario' | 'track'
  scenario_id?: string
  track_id?: string
  due_at?: string
  required?: boolean
  assigned_by?: {
    name?: string
    email?: string
  }
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

interface EnrichedScenarioCardData extends ScenarioCardData {
  progress: number
  lastAccessed?: string
  assignment?: {
    id: string
    dueAt?: string
    required: boolean
    assignedBy?: string
    isOverdue: boolean
  }
}

interface EnrichedTrackCardData extends TrackCardData {
  progress: number
  lastAccessed?: string
  assignment?: {
    id: string
    dueAt?: string
    required: boolean
    assignedBy?: string
    isOverdue: boolean
  }
}

interface MyTrainingGridProps {
  enrollments: EnrichedEnrollment[]
  assignments?: Assignment[]
  showCompleted?: boolean
  maxItems?: number
}

function transformEnrollmentsToCardData(
  enrollments: EnrichedEnrollment[],
  assignments: Assignment[] = []
): { scenarios: EnrichedScenarioCardData[]; tracks: EnrichedTrackCardData[] } {
  // Create a map of assignments by scenario/track ID for quick lookup
  const assignmentMap = new Map<string, Assignment>()
  assignments.forEach(assignment => {
    const key = assignment.scenario_id || assignment.track_id
    if (key) {
      assignmentMap.set(key, assignment)
    }
  })

  const scenarios: EnrichedScenarioCardData[] = []
  const tracks: EnrichedTrackCardData[] = []

  enrollments.forEach(enrollment => {
    const itemId = enrollment.scenario_id || enrollment.track_id || ''
    const assignment = assignmentMap.get(itemId)

    const assignmentInfo = assignment ? {
      id: assignment.id,
      dueAt: assignment.due_at,
      required: assignment.required || false,
      assignedBy: assignment.assigned_by?.name || assignment.assigned_by?.email,
      isOverdue: assignment.status === 'overdue' || (
        assignment.due_at ? new Date(assignment.due_at) < new Date() : false
      )
    } : undefined

    if (enrollment.type === 'scenario' && enrollment.scenario) {
      scenarios.push({
        id: enrollment.scenario.id,
        title: enrollment.scenario.title,
        description: enrollment.scenario.description || '',
        category: enrollment.scenario.category || 'General',
        industry: enrollment.scenario.industry || 'General',
        difficulty: (enrollment.scenario.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        durationMin: Math.floor((enrollment.scenario.estimated_duration || 300) / 60),
        durationMax: Math.ceil((enrollment.scenario.estimated_duration || 300) / 60) + 5,
        thumbnailUrl: enrollment.scenario.image_url,
        tags: enrollment.scenario.metadata?.tags as string[] || [],
        averageScore: enrollment.scenario.avg_score,
        attemptCount: enrollment.scenario.attempt_count || 0,
        isEnrolled: true,
        progress: enrollment.progress,
        lastAccessed: enrollment.last_accessed_at || enrollment.enrolled_at,
        assignment: assignmentInfo,
      })
    } else if (enrollment.type === 'track' && enrollment.track) {
      tracks.push({
        id: enrollment.track.id,
        title: enrollment.track.title,
        description: enrollment.track.description || '',
        scenarioCount: enrollment.track.scenario_count || 0,
        totalDurationMin: 60,
        totalDurationMax: 120,
        industry: 'General',
        thumbnailUrl: enrollment.track.image_url,
        tags: [],
        enrolledCount: 0,
        isEnrolled: true,
        progress: enrollment.progress,
        lastAccessed: enrollment.last_accessed_at || enrollment.enrolled_at,
        assignment: assignmentInfo,
      })
    }
  })

  return { scenarios, tracks }
}

export function MyTrainingGrid({
  enrollments,
  assignments = [],
  showCompleted = false,
  maxItems
}: MyTrainingGridProps) {
  // Transform enrollments to card data format
  let { scenarios, tracks } = transformEnrollmentsToCardData(enrollments, assignments)

  // Filter out completed if needed
  if (!showCompleted) {
    scenarios = scenarios.filter(s => s.progress < 100)
    tracks = tracks.filter(t => t.progress < 100)
  }

  // Combine and sort: overdue first, then by due date, then by last accessed
  const allItems = [
    ...scenarios.map(s => ({ ...s, type: 'scenario' as const })),
    ...tracks.map(t => ({ ...t, type: 'track' as const })),
  ].sort((a, b) => {
    // Overdue items first
    if (a.assignment?.isOverdue && !b.assignment?.isOverdue) return -1
    if (!a.assignment?.isOverdue && b.assignment?.isOverdue) return 1

    // Then by due date
    if (a.assignment?.dueAt && b.assignment?.dueAt) {
      return new Date(a.assignment.dueAt).getTime() - new Date(b.assignment.dueAt).getTime()
    }
    if (a.assignment?.dueAt) return -1
    if (b.assignment?.dueAt) return 1

    // Finally by last accessed
    if (a.lastAccessed && b.lastAccessed) {
      return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    }
    return 0
  })

  // Limit items if specified
  const limitedItems = maxItems ? allItems.slice(0, maxItems) : allItems

  if (limitedItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            No active training sessions yet.
            <br />
            Browse the training library to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {limitedItems.map((item) => (
        item.type === 'scenario' ? (
          <ScenarioCard
            key={item.id}
            scenario={item}
            showProgress={true}
            progress={item.progress}
            assignment={item.assignment}
          />
        ) : (
          <TrackCard
            key={item.id}
            track={item}
            showProgress={true}
            progress={item.progress}
            assignment={item.assignment}
          />
        )
      ))}
    </div>
  )
}
