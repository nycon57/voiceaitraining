"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Target, Users, Trophy } from "lucide-react"
import Link from "next/link"

interface ScenarioSidebarProps {
  scenarioId: string
  scenario: {
    difficulty?: string
    persona?: any
    metadata?: Record<string, unknown>
  }
  totalAttempts: number
  userAttempts: Array<{
    id: string
    score: number | null
    started_at: string
  }>
}

export function ScenarioSidebar({
  scenarioId,
  scenario,
  totalAttempts,
  userAttempts,
}: ScenarioSidebarProps) {
  const estimatedDuration = scenario.metadata?.estimated_duration
    ? Math.round((scenario.metadata.estimated_duration as number) / 60)
    : 15

  return (
    <div className="space-y-4">
      {/* Start Training CTA */}
      <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <div className="font-headline text-2xl font-bold mb-2">
                Ready to start?
              </div>
              <p className="text-sm text-muted-foreground">
                Begin your training session and put your skills to the test.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              asChild
            >
              <Link href={`/play/${scenarioId}`}>
                <Play className="h-5 w-5 mr-2" />
                Start Training
              </Link>
            </Button>
            {totalAttempts > 0 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/training/history?scenario=${scenarioId}`}>
                  <Trophy className="h-4 w-4 mr-2" />
                  View Past Attempts
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Details */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Scenario Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Duration</div>
              <div className="text-sm text-muted-foreground">
                {estimatedDuration}-{estimatedDuration + 5} minutes
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Difficulty</div>
              <div className="text-sm text-muted-foreground capitalize">
                {scenario.difficulty || 'medium'}
              </div>
            </div>
          </div>
          {scenario.persona?.profile && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">You'll speak with</div>
                  <div className="text-sm text-muted-foreground">
                    {scenario.persona.profile.name || 'AI Agent'}
                    {scenario.persona.profile.role &&
                      ` - ${scenario.persona.profile.role}`}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      {totalAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Your History</CardTitle>
            <CardDescription>
              Last {Math.min(5, totalAttempts)} attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAttempts.map((attempt) => {
                const score = attempt.score || 0
                const scoreColor =
                  score >= 90
                    ? 'green'
                    : score >= 80
                      ? 'blue'
                      : score >= 70
                        ? 'yellow'
                        : 'red'

                const bgColor = {
                  green: 'bg-green-100 dark:bg-green-950',
                  blue: 'bg-blue-100 dark:bg-blue-950',
                  yellow: 'bg-yellow-100 dark:bg-yellow-950',
                  red: 'bg-red-100 dark:bg-red-950',
                }[scoreColor]

                const textColor = {
                  green: 'text-green-600',
                  blue: 'text-blue-600',
                  yellow: 'text-yellow-600',
                  red: 'text-red-600',
                }[scoreColor]

                return (
                  <Link
                    key={attempt.id}
                    href={`/attempts/${attempt.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${bgColor}`}>
                        <Trophy className={`h-4 w-4 ${textColor}`} />
                      </div>
                      <div>
                        <div className={`font-bold ${textColor}`}>{score}%</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(attempt.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Recommended For</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Sales Reps</Badge>
            <Badge variant="secondary">Loan Officers</Badge>
            <Badge variant="secondary">Customer Service</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
