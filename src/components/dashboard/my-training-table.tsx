/**
 * My Training Table
 *
 * Table view for user training (both assigned and self-enrolled)
 * Shows progress, assignment status, and due dates in a compact format
 */

"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Calendar, UserCheck, AlertCircle, Mic, BookOpen } from 'lucide-react'
import type { EnrichedEnrollment } from '@/actions/enrollments'

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

interface TrainingItem {
  id: string
  title: string
  description?: string
  type: 'scenario' | 'track'
  progress: number
  status: 'active' | 'completed' | 'not_started'
  difficulty?: 'easy' | 'medium' | 'hard'
  scenarioCount?: number
  scenarioId?: string
  trackId?: string
  lastAccessed?: string
  imageUrl?: string
  assignment?: {
    id: string
    dueAt?: string
    required: boolean
    assignedBy?: string
    isOverdue: boolean
  }
}

interface MyTrainingTableProps {
  enrollments: EnrichedEnrollment[]
  assignments?: Assignment[]
  showCompleted?: boolean
  maxItems?: number
}

function combineTrainingData(
  enrollments: EnrichedEnrollment[],
  assignments: Assignment[] = []
): TrainingItem[] {
  const assignmentMap = new Map<string, Assignment>()
  assignments.forEach(assignment => {
    const key = assignment.scenario_id || assignment.track_id
    if (key) {
      assignmentMap.set(key, assignment)
    }
  })

  const items: TrainingItem[] = enrollments.map(enrollment => {
    const itemId = enrollment.scenario_id || enrollment.track_id || ''
    const assignment = assignmentMap.get(itemId)

    let status: 'active' | 'completed' | 'not_started' = 'active'
    if (enrollment.status === 'completed') status = 'completed'
    else if (enrollment.progress === 0) status = 'not_started'

    return {
      id: enrollment.id,
      title: enrollment.scenario?.title || enrollment.track?.title || 'Untitled',
      description: enrollment.scenario?.description || enrollment.track?.description,
      type: enrollment.type,
      progress: enrollment.progress,
      status,
      difficulty: enrollment.scenario?.difficulty as 'easy' | 'medium' | 'hard' | undefined,
      scenarioCount: enrollment.track?.scenario_count,
      scenarioId: enrollment.scenario_id,
      trackId: enrollment.track_id,
      lastAccessed: enrollment.started_at,
      imageUrl: undefined,
      assignment: assignment ? {
        id: assignment.id,
        dueAt: assignment.due_at,
        required: assignment.required || false,
        assignedBy: assignment.assigned_by?.name || assignment.assigned_by?.email,
        isOverdue: assignment.status === 'overdue' || (
          assignment.due_at ? new Date(assignment.due_at) < new Date() : false
        )
      } : undefined
    }
  })

  return items
}

export function MyTrainingTable({
  enrollments,
  assignments = [],
  showCompleted = false,
  maxItems
}: MyTrainingTableProps) {
  let trainingItems = combineTrainingData(enrollments, assignments)

  if (!showCompleted) {
    trainingItems = trainingItems.filter(item => item.status !== 'completed')
  }

  trainingItems.sort((a, b) => {
    if (a.assignment?.isOverdue && !b.assignment?.isOverdue) return -1
    if (!a.assignment?.isOverdue && b.assignment?.isOverdue) return 1

    if (a.assignment?.dueAt && b.assignment?.dueAt) {
      return new Date(a.assignment.dueAt).getTime() - new Date(b.assignment.dueAt).getTime()
    }
    if (a.assignment?.dueAt) return -1
    if (b.assignment?.dueAt) return 1

    if (a.lastAccessed && b.lastAccessed) {
      return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    }
    return 0
  })

  if (maxItems) {
    trainingItems = trainingItems.slice(0, maxItems)
  }

  if (trainingItems.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 flex flex-col items-center justify-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Mic className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          No active training sessions yet.
          <br />
          Browse the training library to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[120px]">Difficulty</TableHead>
            <TableHead className="w-[180px]">Progress</TableHead>
            <TableHead className="w-[200px]">Assignment</TableHead>
            <TableHead className="w-[140px]">Due Date</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainingItems.map((item) => {
            const href = item.type === 'scenario'
              ? `/play/${item.scenarioId}`
              : `/training?track=${item.trackId}`

            return (
              <TableRow
                key={item.id}
                className={item.assignment?.isOverdue ? 'bg-destructive/5' : ''}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    {item.type === 'scenario' ? (
                      <Mic className="h-4 w-4 text-primary" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.scenarioCount && (
                      <span className="text-xs text-muted-foreground">
                        {item.scenarioCount} scenarios
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {item.difficulty && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.difficulty === 'easy' ? 'border-green-500/50 text-green-700 dark:text-green-400' :
                        item.difficulty === 'medium' ? 'border-amber-500/50 text-amber-700 dark:text-amber-400' :
                        'border-red-500/50 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {item.difficulty}
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={item.progress}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs font-medium w-10 text-right">
                      {item.progress}%
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {item.assignment ? (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {item.assignment.assignedBy || 'Assigned'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Self-enrolled</span>
                  )}
                </TableCell>

                <TableCell>
                  {item.assignment?.dueAt ? (
                    <div className={`flex items-center gap-1.5 text-xs ${
                      item.assignment.isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                    }`}>
                      {item.assignment.isOverdue && <AlertCircle className="h-3 w-3" />}
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(item.assignment.dueAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    asChild
                    size="sm"
                    variant={item.assignment?.isOverdue ? 'destructive' : 'default'}
                  >
                    <Link href={href}>
                      {item.progress === 0 ? 'Start' : 'Continue'}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
