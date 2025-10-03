"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ArrowRight, Clock, BarChart3 } from "lucide-react"
import Link from "next/link"

interface TrackCurriculumProps {
  track: {
    scenarios: Array<{
      id: string
      title: string
      description?: string
      difficulty?: string
      order_index: number
      estimated_duration?: number
    }>
  }
  progress?: {
    scenario_progress: Array<{
      scenario_id: string
      attempts_count: number
      best_score: number | null
      is_completed: boolean
    }>
    current_scenario_index: number
  } | null
}

export function TrackCurriculum({ track, progress }: TrackCurriculumProps) {
  const currentIndex = progress?.current_scenario_index ?? -1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Track Curriculum</CardTitle>
        <CardDescription>
          Complete scenarios in order to progress through the track
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {track.scenarios.map((scenario, index) => {
            const scenarioProgress = progress?.scenario_progress?.find(
              (sp) => sp.scenario_id === scenario.id
            )

            const isCompleted = scenarioProgress?.is_completed || false
            const isCurrent = index === currentIndex && !isCompleted
            const isLocked = !progress && index > 0 // Lock all but first if not enrolled
            const attemptCount = scenarioProgress?.attempts_count || 0
            const bestScore = scenarioProgress?.best_score

            const difficultyColor = {
              easy: 'bg-success/10 text-success',
              medium: 'bg-warning/10 text-warning',
              hard: 'bg-destructive/10 text-destructive',
            }[scenario.difficulty || 'medium'] || 'bg-warning/10 text-warning'

            return (
              <div
                key={scenario.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : isCompleted
                      ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                      : 'hover:bg-muted/50'
                }`}
              >
                {/* Status Icon */}
                <div className="shrink-0 mt-1">
                  {isCompleted ? (
                    <div className="rounded-full bg-green-100 dark:bg-green-950 p-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  ) : isCurrent ? (
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-muted p-2">
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Scenario {index + 1}
                        </span>
                        {scenario.difficulty && (
                          <Badge
                            variant="outline"
                            className={difficultyColor}
                            size="sm"
                          >
                            {scenario.difficulty}
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="default" size="sm" className="bg-blue-600">
                            Current
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge
                            variant="default"
                            size="sm"
                            className="bg-green-600"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">{scenario.title}</h4>
                      {scenario.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {scenario.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {scenario.estimated_duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{Math.round(scenario.estimated_duration / 60)} min</span>
                          </div>
                        )}
                        {attemptCount > 0 && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{attemptCount} attempts</span>
                          </div>
                        )}
                        {bestScore !== null && bestScore !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Best: {bestScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isLocked && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/training/scenarios/${scenario.id}`}>
                          View
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Progress bar for current scenario */}
                  {isCurrent && attemptCount > 0 && bestScore !== null && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-semibold">{bestScore}%</span>
                      </div>
                      <Progress value={bestScore} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
