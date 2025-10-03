import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from "@/components/layout/header"
import {
  TrainingStatsCards,
  MyCourses,
  type CourseEnrollment,
} from '@/components/training'
import { ActivityHistoryTable, type ActivityHistoryRow } from '@/components/training/activity-history-table'
import { getUserEnrollments } from '@/actions/enrollments'
import { getUserActivityHistory, getUserAttemptStats } from '@/actions/attempts'
import { SkeletonCard, SkeletonTable } from '@/components/ui/loading-skeleton'

async function getEnrollmentStats(userId: string) {
  try {
    const enrollments = await getUserEnrollments(userId)

    const enrolledCourses = enrollments.length
    const completed = enrollments.filter(e => e.status === 'completed').length
    const inProgress = enrollments.filter(e => e.status === 'active' && e.progress > 0).length

    // Calculate total hours from all enrollments
    // For now, estimate 30 minutes per scenario, 2 hours per track
    let totalHours = 0
    for (const enrollment of enrollments) {
      if (enrollment.type === 'scenario') {
        totalHours += 0.5 // 30 minutes per scenario
      } else if (enrollment.type === 'track') {
        totalHours += 2 // 2 hours per track
      }
    }

    return {
      enrolledCourses,
      completed,
      inProgress,
      totalHours: Math.round(totalHours),
    }
  } catch (error) {
    console.error('Failed to get enrollment stats:', error)
    return {
      enrolledCourses: 0,
      completed: 0,
      inProgress: 0,
      totalHours: 0,
    }
  }
}

async function getMyCourses(userId: string): Promise<CourseEnrollment[]> {
  try {
    const enrollments = await getUserEnrollments(userId)

    return enrollments
      .filter(e => e.status === 'active') // Only show active enrollments
      .map(enrollment => ({
        id: enrollment.id,
        type: enrollment.type,
        title: enrollment.type === 'scenario'
          ? enrollment.scenario?.title || 'Untitled Scenario'
          : enrollment.track?.title || 'Untitled Track',
        thumbnailUrl: undefined, // TODO: Add thumbnail support
        progress: enrollment.progress,
        href: enrollment.type === 'scenario'
          ? `/play/${enrollment.scenario_id}`
          : `/tracks/${enrollment.track_id}`,
      }))
  } catch (error) {
    console.error('Failed to get my courses:', error)
    return []
  }
}

async function getActivityHistory(userId: string): Promise<ActivityHistoryRow[]> {
  try {
    const activities = await getUserActivityHistory(userId)
    return activities
  } catch (error) {
    console.error('Failed to get activity history:', error)
    return []
  }
}

export default async function TrainingHistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch all data in parallel
  const [enrollmentStats, myCourses, activityHistory] = await Promise.all([
    getEnrollmentStats(user.id),
    getMyCourses(user.id),
    getActivityHistory(user.id),
  ])

  return (
    <>
      <Header />
      <div className="space-y-8 p-4 md:p-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            <span className="text-gradient">Training History</span>
          </h1>
          <p className="text-muted-foreground">
            Track your progress and review your training activity
          </p>
        </div>

        {/* Stats Cards */}
        <Suspense fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} hasIcon lines={2} />
            ))}
          </div>
        }>
          <TrainingStatsCards enrollmentStats={enrollmentStats} />
        </Suspense>

        {/* Active Courses Carousel */}
        {myCourses.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight">Active Courses</h2>
              <p className="text-sm text-muted-foreground">
                Continue your enrolled scenarios and tracks
              </p>
            </div>
            <Suspense fallback={
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[300px]">
                    <SkeletonCard hasIcon lines={3} />
                  </div>
                ))}
              </div>
            }>
              <MyCourses enrollments={myCourses} />
            </Suspense>
          </section>
        )}

        {/* Activity History Table */}
        <section className="space-y-4">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">All Activity</h2>
            <p className="text-sm text-muted-foreground">
              Complete history of your training sessions
            </p>
          </div>
          <Suspense fallback={<SkeletonTable rows={5} columns={7} />}>
            <ActivityHistoryTable activities={activityHistory} />
          </Suspense>
        </section>
      </div>
    </>
  )
}
