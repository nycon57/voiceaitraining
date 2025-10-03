"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, MessageSquare, CheckCircle2, TrendingUp, Star } from "lucide-react"

interface ScenarioMetricsProps {
  scenario: {
    rubric?: any
  }
}

export function ScenarioMetrics({ scenario }: ScenarioMetricsProps) {
  // Extract KPI metrics from rubric
  const metrics = [
    {
      icon: MessageSquare,
      title: 'Talk-Listen Ratio',
      description: 'Target: 40-60% speaking time',
      color: 'blue',
    },
    {
      icon: CheckCircle2,
      title: 'Required Phrases',
      description: 'Key terms and compliance language',
      color: 'green',
    },
    {
      icon: TrendingUp,
      title: 'Objection Handling',
      description: 'Address concerns effectively',
      color: 'purple',
    },
    {
      icon: Star,
      title: 'Overall Quality',
      description: 'Professionalism and effectiveness',
      color: 'orange',
    },
  ]

  // If rubric has specific metrics, use those
  if (scenario.rubric) {
    const rubricMetrics = []

    if (scenario.rubric.required_phrases) {
      rubricMetrics.push({
        icon: CheckCircle2,
        title: 'Required Phrases',
        description: `${scenario.rubric.required_phrases.phrases?.length || 0} phrases to use`,
        color: 'green',
      })
    }

    if (scenario.rubric.open_questions) {
      rubricMetrics.push({
        icon: MessageSquare,
        title: 'Open Questions',
        description: `Minimum ${scenario.rubric.open_questions.minimum_count || 3} questions`,
        color: 'blue',
      })
    }

    if (scenario.rubric.objections_handled) {
      rubricMetrics.push({
        icon: TrendingUp,
        title: 'Objections',
        description: `Handle ${scenario.rubric.objections_handled.objection_types?.length || 0} types`,
        color: 'purple',
      })
    }

    if (rubricMetrics.length > 0) {
      // Use rubric metrics if available
      while (rubricMetrics.length < 4 && metrics.length > rubricMetrics.length) {
        rubricMetrics.push(metrics[rubricMetrics.length])
      }
      return <MetricsGrid metrics={rubricMetrics} />
    }
  }

  return <MetricsGrid metrics={metrics} />
}

function MetricsGrid({
  metrics,
}: {
  metrics: Array<{
    icon: any
    title: string
    description: string
    color: string
  }>
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-950',
      text: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-950',
      text: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950',
      text: 'text-orange-600',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Target className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>What we measure in this scenario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric, index) => {
            const colors = colorClasses[metric.color as keyof typeof colorClasses] || colorClasses.blue
            const Icon = metric.icon

            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`rounded-full ${colors.bg} p-2 shrink-0`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                <div>
                  <div className="font-medium text-sm mb-1">{metric.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {metric.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
