import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { getStatusVariant, getProgressColor } from "@/lib/utils/dashboard-utils"
import { cn } from "@/lib/utils"
import { Calendar, Trophy, Target, UserCheck, type LucideIcon } from "lucide-react"
import Link from "next/link"

export interface AssignmentItem {
  id: string | number
  title: string
  type?: 'Scenario' | 'Track'
  status: string
  dueDate?: string
  progress: number
  score?: number | null
  assignedTo?: string
  completedBy?: number
  totalUsers?: number
  description?: string
}

export interface AssignmentCardProps {
  title: string
  description?: string
  assignments: AssignmentItem[]
  className?: string
  maxAssignments?: number
  emptyMessage?: string
  showActions?: boolean
}

export function AssignmentCard({
  title,
  description,
  assignments,
  className,
  maxAssignments = 10,
  emptyMessage = "No assignments found",
  showActions = true
}: AssignmentCardProps) {
  const displayedAssignments = assignments.slice(0, maxAssignments)

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {displayedAssignments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-4">
            {displayedAssignments.map((assignment) => (
              <AssignmentItemCard
                key={assignment.id}
                assignment={assignment}
                showActions={showActions}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Single assignment item card
 */
export function AssignmentItemCard({
  assignment,
  showActions = true,
  className
}: {
  assignment: AssignmentItem
  showActions?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <div className="flex-1">
        {/* Title and Badges */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h4 className="font-medium">{assignment.title}</h4>
          {assignment.type && (
            <Badge variant={assignment.type === 'Track' ? 'default' : 'secondary'}>
              {assignment.type}
            </Badge>
          )}
          <Badge variant={getStatusVariant(assignment.status)}>
            {assignment.status === 'completed' ? 'Completed' :
             assignment.status === 'in_progress' ? 'In Progress' :
             assignment.status === 'overdue' ? 'Overdue' :
             assignment.status === 'assigned' ? 'Assigned' : assignment.status}
          </Badge>
        </div>

        {/* Description */}
        {assignment.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {assignment.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
          {assignment.assignedTo && (
            <div className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {assignment.assignedTo}
            </div>
          )}
          {assignment.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due: {assignment.dueDate}
            </div>
          )}
          {assignment.score !== undefined && assignment.score !== null && (
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Score: {assignment.score}
            </div>
          )}
          {assignment.completedBy !== undefined && assignment.totalUsers !== undefined && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {assignment.completedBy}/{assignment.totalUsers} completed
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{assignment.progress}%</span>
          </div>
          <Progress
            value={assignment.progress}
            className={cn("h-2", getProgressColor(assignment.progress))}
          />
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="ml-4 flex gap-2">
          {assignment.status === 'completed' ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/training/session/new?scenario=${assignment.id}`}>
                Retry
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href={`/training/session/new?${assignment.type === 'Track' ? 'track' : 'scenario'}=${assignment.id}`}>
                {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact assignment list item
 */
export function AssignmentListItem({
  assignment,
  className
}: {
  assignment: AssignmentItem
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{assignment.title}</h4>
          {assignment.type && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {assignment.type}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {assignment.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {assignment.dueDate}
            </span>
          )}
          <span>{assignment.progress}%</span>
        </div>
      </div>
      <Badge variant={getStatusVariant(assignment.status)} className="ml-2 flex-shrink-0">
        {assignment.status}
      </Badge>
    </div>
  )
}