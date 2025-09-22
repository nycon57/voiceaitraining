'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Target, Clock, Trophy } from 'lucide-react'
import { DashboardMetrics } from '@/lib/analytics'

interface OverviewCardsProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

export function OverviewCards({ metrics, isLoading = false }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Attempts",
      value: metrics.total_attempts.toLocaleString(),
      description: "Training sessions completed",
      icon: Target,
      trend: null
    },
    {
      title: "Active Users",
      value: metrics.active_users.toLocaleString(),
      description: "Users training this period",
      icon: Users,
      trend: null
    },
    {
      title: "Average Score",
      value: `${metrics.average_score}%`,
      description: "Performance across all attempts",
      icon: Trophy,
      trend: metrics.average_score >= 75 ? 'up' : metrics.average_score >= 60 ? 'stable' : 'down'
    },
    {
      title: "Completion Rate",
      value: `${metrics.completion_rate}%`,
      description: "Sessions successfully finished",
      icon: TrendingUp,
      trend: metrics.completion_rate >= 85 ? 'up' : metrics.completion_rate >= 70 ? 'stable' : 'down'
    },
    {
      title: "Total Scenarios",
      value: metrics.total_scenarios.toLocaleString(),
      description: "Available training scenarios",
      icon: Target,
      trend: null
    },
    {
      title: "Training Hours",
      value: `${metrics.total_training_hours}h`,
      description: "Total practice time logged",
      icon: Clock,
      trend: null
    }
  ]

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getTrendColor = (trend: string | null) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        const trendIcon = getTrendIcon(card.trend)

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{card.value}</div>
                {trendIcon}
              </div>
              <p className={`text-xs ${getTrendColor(card.trend)}`}>
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}