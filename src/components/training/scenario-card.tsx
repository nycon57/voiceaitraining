"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  BarChart3,
  Briefcase,
  Users,
  ArrowRight,
  BookOpen,
  Calendar,
  UserCheck,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ScenarioCardData {
  id: string
  title: string
  description: string
  category: string
  industry: string
  difficulty: "easy" | "medium" | "hard"
  durationMin: number
  durationMax: number
  thumbnailUrl?: string
  tags: string[]
  averageScore?: number
  attemptCount: number
  isEnrolled?: boolean
}

interface AssignmentInfo {
  id: string
  dueAt?: string
  required: boolean
  assignedBy?: string
  isOverdue: boolean
}

export interface ScenarioCardProps {
  scenario: ScenarioCardData
  onEnroll?: (scenarioId: string) => void
  onContinue?: (scenarioId: string) => void
  showProgress?: boolean
  progress?: number
  assignment?: AssignmentInfo
}

const difficultyConfig = {
  easy: {
    label: "Easy",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  medium: {
    label: "Medium",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  hard: {
    label: "Hard",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function ScenarioCard({ scenario, onEnroll, onContinue, showProgress = false, progress = 0, assignment }: ScenarioCardProps) {
  const difficultyInfo = difficultyConfig[scenario.difficulty]

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
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20">
          {scenario.thumbnailUrl ? (
            <img
              src={scenario.thumbnailUrl}
              alt={scenario.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Type and Category Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" size="sm">
            SCENARIO
          </Badge>
          <Badge variant="outline" size="sm">
            {scenario.category}
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{scenario.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {scenario.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {scenario.durationMin}-{scenario.durationMax} min
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-1.5",
                difficultyInfo.color
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">{difficultyInfo.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="truncate">{scenario.industry}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{scenario.attemptCount} attempts</span>
          </div>
        </div>

        {/* Tags */}
        {scenario.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {scenario.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {scenario.tags.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{scenario.tags.length - 3}
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

        {/* Progress Bar (if enrolled) */}
        {showProgress && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}%</span>
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

        {/* Average Score Indicator (only show if not showing progress) */}
        {!showProgress && scenario.averageScore !== undefined && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Score</span>
              <span className="font-semibold">{scenario.averageScore}%</span>
            </div>
            <Progress value={scenario.averageScore} className="h-2" />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t">
          <Button
            className="w-full"
            variant={assignment?.isOverdue ? 'destructive' : 'default'}
            onClick={() => {
              if (showProgress && scenario.isEnrolled) {
                window.location.href = `/play/${scenario.id}/call`
              } else {
                window.location.href = `/training/scenarios/${scenario.id}`
              }
            }}
          >
            {showProgress && scenario.isEnrolled
              ? (progress === 0 ? 'Start Training' : 'Continue Training')
              : 'View Details'
            }
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}