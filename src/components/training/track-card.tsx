"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Users,
  ArrowRight,
  Layers,
  Calendar,
  UserCheck,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TrackCardData {
  id: string
  title: string
  description: string
  scenarioCount: number
  totalDurationMin: number
  totalDurationMax: number
  industry: string
  thumbnailUrl?: string
  tags: string[]
  enrolledCount: number
  isEnrolled?: boolean
  progress?: number
}

interface AssignmentInfo {
  id: string
  dueAt?: string
  required: boolean
  assignedBy?: string
  isOverdue: boolean
}

export interface TrackCardProps {
  track: TrackCardData
  enrollment?: {
    progress: number
  }
  onEnroll?: (trackId: string) => void
  onContinue?: (trackId: string) => void
  showProgress?: boolean
  progress?: number
  assignment?: AssignmentInfo
}

export function TrackCard({ track, enrollment, onEnroll, onContinue, showProgress: showProgressProp = false, progress: progressProp, assignment }: TrackCardProps) {
  const isEnrolled = track.isEnrolled || enrollment !== undefined
  const showProgress = showProgressProp || isEnrolled
  const progress = progressProp ?? enrollment?.progress ?? track.progress ?? 0

  // Calculate hour range from minutes
  const hoursMin = Math.floor(track.totalDurationMin / 60)
  const hoursMax = Math.ceil(track.totalDurationMax / 60)

  return (
    <Card
      animated={false}
      className={cn(
        "group hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        assignment?.isOverdue && "border-destructive/50 bg-destructive/5"
      )}
    >
      <CardHeader className="pb-3 space-y-3">
        {/* Thumbnail */}
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-chart-3/20 via-chart-4/20 to-chart-1/20">
          {track.thumbnailUrl ? (
            <img
              src={track.thumbnailUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Layers className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Type and Scenario Count Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" size="sm" className="bg-chart-4">
            TRACK
          </Badge>
          <Badge variant="outline" size="sm">
            {track.scenarioCount} Scenarios
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{track.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {track.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {hoursMin === hoursMax
                ? `${hoursMin}h`
                : `${hoursMin}-${hoursMax}h`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{track.enrolledCount} enrolled</span>
          </div>
        </div>

        {/* Industry */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm">
            {track.industry}
          </Badge>
        </div>

        {/* Tags */}
        {track.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {track.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {track.tags.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{track.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Assignment Info */}
        {assignment && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
            <UserCheck className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">
                Assigned{assignment.assignedBy ? ` by ${assignment.assignedBy}` : ''}
              </div>
              {assignment.dueAt && (
                <div className={cn(
                  "text-xs mt-0.5 flex items-center gap-1",
                  assignment.isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                )}>
                  {assignment.isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Calendar className="h-3 w-3" />
                  Due {new Date(assignment.dueAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: new Date(assignment.dueAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                  })}
                  {assignment.isOverdue && ' (Overdue)'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Indicator (if enrolled) */}
        {showProgress && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}% complete</span>
            </div>
            <Progress
              value={progress}
              className={cn(
                "h-2",
                assignment?.isOverdue && progress < 100 && "bg-destructive/20"
              )}
            />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t">
          <Button
            className="w-full"
            variant={assignment?.isOverdue ? 'destructive' : 'default'}
            onClick={() => {
              if (showProgress && isEnrolled) {
                window.location.href = `/training/tracks/${track.id}`
              } else {
                window.location.href = `/training/tracks/${track.id}`
              }
            }}
          >
            {showProgress && isEnrolled
              ? (progress === 0 ? 'Start Track' : 'Continue Track')
              : 'View Details'
            }
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}