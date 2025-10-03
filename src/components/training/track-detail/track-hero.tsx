"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, Users, TrendingUp, BookOpen } from "lucide-react"

interface TrackHeroProps {
  track: {
    title: string
    description?: string
    scenario_count: number
    total_duration?: number
    category?: string
    industry?: string
    enrollment_count?: number
    avg_completion_rate?: number
  }
}

export function TrackHero({ track }: TrackHeroProps) {
  const totalHours = track.total_duration
    ? Math.round(track.total_duration / 3600)
    : Math.ceil((track.scenario_count * 300) / 3600)

  return (
    <div className="space-y-6">
      {/* Title and Badges */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Badge variant="default" className="bg-chart-4">
            <Layers className="h-3 w-3 mr-1" />
            TRACK
          </Badge>
          <Badge variant="outline">
            {track.scenario_count} Scenarios
          </Badge>
          {track.category && (
            <Badge variant="outline" className="text-sm">
              {track.category}
            </Badge>
          )}
          {track.industry && (
            <Badge variant="secondary" className="text-sm">
              {track.industry}
            </Badge>
          )}
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-3">
          {track.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {track.description || 'No description available'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-headline text-2xl font-bold">
                  {track.scenario_count}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Scenarios
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-headline text-2xl font-bold">
                  {track.enrollment_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-headline text-2xl font-bold">
                  {track.avg_completion_rate || 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Completion Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
