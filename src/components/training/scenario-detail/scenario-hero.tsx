"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Trophy, CheckCircle2, Mic } from "lucide-react"

interface ScenarioHeroProps {
  scenario: {
    title: string
    description?: string
    difficulty?: string
    category?: string
    industry?: string
    image_url?: string
  }
  stats: {
    total_attempts: number
    avg_score: number
    completion_rate: number
  } | null
}

export function ScenarioHero({ scenario, stats }: ScenarioHeroProps) {
  const difficulty = scenario.difficulty || 'medium'

  const difficultyColor = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-destructive/10 text-destructive',
  }[difficulty] || 'bg-warning/10 text-warning'

  return (
    <div className="space-y-6">
      {/* Scenario Image */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
        {scenario.image_url ? (
          <Image
            src={scenario.image_url}
            alt={scenario.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Mic className="h-16 w-16 text-primary/60" />
          </div>
        )}
      </div>

      {/* Title and Badges */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Badge variant="outline" className={difficultyColor}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
          {scenario.category && (
            <Badge variant="outline" className="text-sm">
              <Target className="h-3 w-3 mr-1" />
              {scenario.category}
            </Badge>
          )}
          {scenario.industry && (
            <Badge variant="secondary" className="text-sm">
              {scenario.industry}
            </Badge>
          )}
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-3">
          {scenario.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {scenario.description || 'No description available'}
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-chart-1/10 dark:bg-chart-1/20 p-3">
                  <Users className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold">
                    {stats.total_attempts}
                  </div>
                  <div className="text-xs text-muted-foreground">Your Attempts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-chart-2/10 dark:bg-chart-2/20 p-3">
                  <Trophy className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold">
                    {stats.avg_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Your Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-chart-3/10 dark:bg-chart-3/20 p-3">
                  <CheckCircle2 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold">
                    {stats.completion_rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your Completion
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
