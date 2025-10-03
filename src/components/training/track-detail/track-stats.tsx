"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, CheckCircle2, Target } from "lucide-react"

interface TrackStatsProps {
  progress: {
    progress_percentage: number
    completed_scenarios: number
    total_scenarios: number
    is_completed: boolean
  }
}

export function TrackStats({ progress }: TrackStatsProps) {
  return (
    <Card className="border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Track Progress
        </CardTitle>
        <CardDescription>Track your advancement through this learning path</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-2xl font-bold">
                {progress.progress_percentage}%
              </span>
            </div>
            <Progress value={progress.progress_percentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress.completed_scenarios} of {progress.total_scenarios} scenarios
                completed
              </span>
              {progress.is_completed && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete!
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {progress.completed_scenarios}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Remaining</div>
              <div className="text-2xl font-bold text-blue-600">
                {progress.total_scenarios - progress.completed_scenarios}
              </div>
            </div>
          </div>

          {!progress.is_completed && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-sm">
              <Target className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-blue-900 dark:text-blue-100">
                Keep going! You're making great progress through this track.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
