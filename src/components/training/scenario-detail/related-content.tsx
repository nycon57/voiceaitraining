"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layers, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RelatedContentProps {
  parentTracks: Array<{
    id: string
    title: string
    description?: string
    scenario_count: number
    enrollment_count: number
    order_index: number
  }>
  relatedScenarios: Array<{
    id: string
    title: string
    description?: string
    difficulty?: string
    category?: string
    attempt_count: number
  }>
}

export function RelatedContent({ parentTracks, relatedScenarios }: RelatedContentProps) {
  return (
    <div className="space-y-6">
      {/* Parent Tracks */}
      {parentTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Part of These Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parentTracks.map((track) => (
                <Link
                  key={track.id}
                  href={`/training/tracks/${track.id}`}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="rounded-lg bg-chart-4/10 p-2">
                      <Layers className="h-5 w-5 text-chart-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {track.title}
                      </div>
                      {track.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {track.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" size="sm">
                          {track.scenario_count} scenarios
                        </Badge>
                        <span>•</span>
                        <span>Scenario {track.order_index + 1}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Scenarios */}
      {relatedScenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Related Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedScenarios.map((scenario) => {
                const difficultyColor = {
                  easy: 'bg-success/10 text-success',
                  medium: 'bg-warning/10 text-warning',
                  hard: 'bg-destructive/10 text-destructive',
                }[scenario.difficulty || 'medium'] || 'bg-warning/10 text-warning'

                return (
                  <Link
                    key={scenario.id}
                    href={`/training/scenarios/${scenario.id}`}
                    className="flex flex-col p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {scenario.difficulty && (
                          <Badge variant="outline" className={difficultyColor} size="sm">
                            {scenario.difficulty}
                          </Badge>
                        )}
                        {scenario.category && (
                          <Badge variant="outline" size="sm">
                            {scenario.category}
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {scenario.title}
                      </div>
                      {scenario.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {scenario.description}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          {scenario.attempt_count} attempts
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          View
                          <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
