"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Clock,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AttemptStats {
  attemptNumber: number
  score: number
  duration: number
  date: string
  isBest: boolean
  isFirst: boolean
  isLatest: boolean
}

interface AttemptComparisonProps {
  currentAttempt: AttemptStats
  previousAttempts?: AttemptStats[]
  averageScore?: number
  bestScore?: number
  className?: string
}

export function AttemptComparison({
  currentAttempt,
  previousAttempts = [],
  averageScore,
  bestScore,
  className,
}: AttemptComparisonProps) {
  const hasHistory = previousAttempts.length > 0
  const lastAttempt = previousAttempts[previousAttempts.length - 1]

  // Calculate improvement
  const improvement = hasHistory
    ? currentAttempt.score - (lastAttempt?.score || 0)
    : 0

  const improvementPercent = hasHistory && lastAttempt
    ? ((improvement / lastAttempt.score) * 100).toFixed(1)
    : "0"

  const getTrendIcon = () => {
    if (!hasHistory) return null
    if (improvement > 5) return <TrendingUp className="h-4 w-4 text-success" />
    if (improvement < -5) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (!hasHistory) return "text-muted-foreground"
    if (improvement > 0) return "text-success"
    if (improvement < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attempt counter */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Attempt Number</p>
            <p className="text-2xl font-bold">
              #{currentAttempt.attemptNumber}
            </p>
          </div>
          {currentAttempt.isBest && (
            <Badge variant="outline" className="border-success/50 text-success">
              <Trophy className="h-3 w-3 mr-1" />
              Best Score!
            </Badge>
          )}
        </div>

        {/* Improvement indicator */}
        {hasHistory && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                vs. Last Attempt
              </p>
              <div className={cn("flex items-center gap-1.5", getTrendColor())}>
                {getTrendIcon()}
                <span className="font-semibold">
                  {improvement > 0 && "+"}
                  {improvement.toFixed(1)} pts
                </span>
                {improvement !== 0 && (
                  <span className="text-xs">
                    ({improvement > 0 && "+"}
                    {improvementPercent}%)
                  </span>
                )}
              </div>
            </div>
            <Progress
              value={Math.abs(improvement) * 10}
              className="h-2"
              variant={
                improvement > 0
                  ? "success"
                  : improvement < 0
                    ? "destructive"
                    : "default"
              }
            />
          </div>
        )}

        {/* Stats comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Average score */}
          {averageScore !== undefined && hasHistory && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Your Average
              </p>
              <p className="text-lg font-bold">{averageScore.toFixed(1)}%</p>
            </div>
          )}

          {/* Best score */}
          {bestScore !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Personal Best
              </p>
              <p className="text-lg font-bold text-success">{bestScore}%</p>
            </div>
          )}

          {/* Attempts count */}
          {hasHistory && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Total Attempts
              </p>
              <p className="text-lg font-bold">{currentAttempt.attemptNumber}</p>
            </div>
          )}
        </div>

        {/* Recent history mini chart */}
        {previousAttempts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Scores</p>
            <div className="flex items-end justify-between gap-1 h-20">
              {[...previousAttempts.slice(-5), currentAttempt].map((attempt, index, arr) => {
                const isLast = index === arr.length - 1
                const height = (attempt.score / 100) * 100
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t transition-all",
                        isLast
                          ? "bg-primary"
                          : "bg-muted hover:bg-muted-foreground/20"
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {attempt.score}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* First attempt message */}
        {!hasHistory && (
          <div className="rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This is your first attempt! Keep practicing to see your progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
