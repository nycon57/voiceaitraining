"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { PerformanceTrendChart } from "@/components/charts/performance-trend-chart"

interface UserPerformanceProps {
  totalAttempts: number
  averageScore: number
  bestScore: number
  averageDuration: number
  performanceData: Array<{
    date: Date
    score: number
  }>
}

export function UserPerformance({
  totalAttempts,
  averageScore,
  bestScore,
  averageDuration,
  performanceData,
}: UserPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Your Performance
        </CardTitle>
        <CardDescription>Track your progress on this scenario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Your Attempts</div>
            <div className="font-headline text-2xl font-bold">{totalAttempts}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Average Score</div>
            <div className="font-headline text-2xl font-bold text-chart-1">
              {averageScore}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Best Score</div>
            <div className="font-headline text-2xl font-bold text-chart-2">
              {bestScore}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Avg Duration</div>
            <div className="font-headline text-2xl font-bold">{averageDuration}m</div>
          </div>
        </div>

        {performanceData.length > 0 && (
          <PerformanceTrendChart
            data={performanceData}
            title="Score Trend"
            description="Your last 7 attempts"
            showArea
            className="border-0 shadow-none"
          />
        )}
      </CardContent>
    </Card>
  )
}
