"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EmptyStateList } from "@/components/ui/empty-state"
import { BookOpen, ArrowRight } from "lucide-react"

export interface CourseEnrollment {
  id: string
  type: "scenario" | "track"
  title: string
  thumbnailUrl?: string
  progress: number
  href: string
}

export interface MyCoursesProps {
  enrollments: CourseEnrollment[]
  onContinue?: (enrollmentId: string) => void
}

export function MyCourses({ enrollments, onContinue }: MyCoursesProps) {
  if (enrollments.length === 0) {
    return (
      <Card animated={false}>
        <CardContent className="pt-6">
          <EmptyStateList
            icon={BookOpen}
            title="No enrolled courses"
            description="Browse the training library below to enroll in scenarios and tracks."
            animated={false}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {enrollments.map((enrollment) => (
        <Card
          key={enrollment.id}
          animated={false}
          className="group hover:border-primary/50 transition-all duration-200 hover:shadow-md"
        >
          <CardHeader className="pb-3 space-y-3">
            {/* Thumbnail */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20">
              {enrollment.thumbnailUrl ? (
                <img
                  src={enrollment.thumbnailUrl}
                  alt={enrollment.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {enrollment.type.toUpperCase()}
              </Badge>
            </div>

            {/* Title */}
            <CardTitle className="text-base line-clamp-2">{enrollment.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>

            {/* Continue Button */}
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                window.location.href = enrollment.href
              }}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}