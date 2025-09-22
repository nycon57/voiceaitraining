'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react'
import { TeamMetrics } from '@/lib/analytics'

interface TeamPerformanceProps {
  metrics: TeamMetrics
  isLoading?: boolean
}

export function TeamPerformance({ metrics, isLoading = false }: TeamPerformanceProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </CardTitle>
          <CardDescription>Overall team performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Average Score</span>
            <div className="flex items-center space-x-2">
              <span className={`font-bold ${getScoreColor(metrics.team_average_score)}`}>
                {metrics.team_average_score}%
              </span>
              <Progress value={metrics.team_average_score} className="w-16 h-2" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{metrics.team_completion_rate}%</span>
              <Progress value={metrics.team_completion_rate} className="w-16 h-2" />
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance Status</span>
              <Badge className={getScoreBadgeColor(metrics.team_average_score)}>
                {metrics.team_average_score >= 80 ? 'Excellent' :
                 metrics.team_average_score >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>Highest scoring team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.top_performers.slice(0, 5).map((performer, index) => (
              <div key={performer.user_id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  {index + 1}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {performer.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{performer.user_name}</div>
                  <div className="text-xs text-muted-foreground">{performer.average_score}% avg</div>
                </div>
                <Badge className={getScoreBadgeColor(performer.average_score)} variant="secondary">
                  {performer.average_score}%
                </Badge>
              </div>
            ))}

            {metrics.top_performers.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Focus Areas
          </CardTitle>
          <CardDescription>Areas needing team attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.improvement_areas.slice(0, 5).map((area, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{area.kpi_name}</span>
                  <div className="flex items-center space-x-2">
                    {area.improvement_needed ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${getScoreColor(area.average_score)}`}>
                      {area.average_score}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={area.average_score}
                  className="h-2"
                />
                {area.improvement_needed && (
                  <p className="text-xs text-red-600">
                    Needs improvement - below 70% threshold
                  </p>
                )}
              </div>
            ))}

            {metrics.improvement_areas.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Great job! No major areas needing focus.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}