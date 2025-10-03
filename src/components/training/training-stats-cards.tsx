"use client"

import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TrainingStatsCardsProps {
  enrollmentStats: {
    enrolledCourses: number
    completed: number
    inProgress: number
    totalHours: number
  }
}

export function TrainingStatsCards({ enrollmentStats }: TrainingStatsCardsProps) {
  const stats = [
    {
      label: "Enrolled Courses",
      value: enrollmentStats.enrolledCourses,
      icon: BookOpen,
      borderColor: "border-l-chart-1",
    },
    {
      label: "Completed",
      value: enrollmentStats.completed,
      icon: CheckCircle,
      borderColor: "border-l-chart-2",
    },
    {
      label: "In Progress",
      value: enrollmentStats.inProgress,
      icon: Clock,
      borderColor: "border-l-chart-3",
    },
    {
      label: "Total Hours",
      value: `${enrollmentStats.totalHours}h`,
      icon: TrendingUp,
      borderColor: "border-l-chart-4",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            animated={false}
            className={cn("border-l-4", stat.borderColor)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}