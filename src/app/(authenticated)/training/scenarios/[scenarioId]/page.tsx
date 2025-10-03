import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import {
  getScenario,
  getUserScenarioStats,
  getRelatedScenarios,
  getTracksForScenario,
} from '@/actions/scenarios'
import { getAttempts } from '@/actions/attempts'
import { ScenarioHero } from '@/components/training/scenario-detail/scenario-hero'
import { ScenarioMetrics } from '@/components/training/scenario-detail/scenario-metrics'
import { ScenarioSidebar } from '@/components/training/scenario-detail/scenario-sidebar'
import { RelatedContent } from '@/components/training/scenario-detail/related-content'
import { UserPerformance } from '@/components/training/scenario-detail/user-performance'
import { LearningObjectives } from '@/components/training/scenario-detail/learning-objectives'
import { AttemptHistoryClient } from '@/components/training/scenario-detail/attempt-history-client'
import { SkeletonCard } from '@/components/ui/loading-skeleton'

interface ScenarioPageProps {
  params: Promise<{ scenarioId: string }>
}

export default async function ScenarioSinglePage({ params }: ScenarioPageProps) {
  const { scenarioId } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Fetch scenario data
  let scenario
  try {
    scenario = await getScenario(scenarioId)
  } catch (error) {
    notFound()
  }

  // Fetch related data in parallel
  const [userStats, userAttempts, allAttempts, relatedScenarios, parentTracks] = await Promise.all([
    getUserScenarioStats(scenarioId, user.id).catch(() => null),
    getAttempts({
      scenario_id: scenarioId,
      clerk_user_id: user.id,
      status: 'completed',
      limit: 10,
    }).catch(() => []),
    getAttempts({
      scenario_id: scenarioId,
      clerk_user_id: user.id,
      limit: 50,
    }).catch(() => []),
    getRelatedScenarios(scenarioId, 4).catch(() => []),
    getTracksForScenario(scenarioId).catch(() => []),
  ])

  // Extract stats from userStats or calculate from attempts
  const totalAttempts = userStats?.total_attempts || userAttempts.length
  const averageScore = userStats?.avg_score || 0
  const bestScore = userStats?.best_score || 0
  const averageDuration = userAttempts.length > 0
    ? Math.round(userAttempts.reduce((sum: number, a: any) => sum + (a.duration_seconds || 0), 0) / userAttempts.length / 60)
    : 0

  // Prepare stats for hero component
  const stats = userStats ? {
    total_attempts: userStats.total_attempts,
    avg_score: userStats.avg_score,
    completion_rate: userStats.completion_rate,
  } : null

  // Prepare performance data for chart
  const performanceData = userAttempts
    .slice(0, 7)
    .reverse()
    .map((attempt: any) => ({
      date: new Date(attempt.started_at),
      score: attempt.score || 0,
    }))

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-muted-foreground">
          <a href="/training" className="hover:text-foreground transition-colors">
            Training
          </a>
          <span className="mx-2">/</span>
          <a href="/training" className="hover:text-foreground transition-colors">
            Scenarios
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{scenario.title}</span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<SkeletonCard lines={4} />}>
              <ScenarioHero scenario={scenario} stats={stats} />
            </Suspense>

            {totalAttempts > 0 && (
              <Suspense fallback={<SkeletonCard lines={3} hasIcon />}>
                <UserPerformance
                  totalAttempts={totalAttempts}
                  averageScore={averageScore}
                  bestScore={bestScore}
                  averageDuration={averageDuration}
                  performanceData={performanceData}
                />
              </Suspense>
            )}

            <Suspense fallback={<SkeletonCard lines={4} hasIcon />}>
              <LearningObjectives scenario={scenario} />
            </Suspense>

            <Suspense fallback={<SkeletonCard lines={4} hasIcon />}>
              <ScenarioMetrics scenario={scenario} />
            </Suspense>

            {allAttempts.length > 0 && (
              <Suspense fallback={<SkeletonCard lines={5} hasIcon />}>
                <AttemptHistoryClient attempts={allAttempts} />
              </Suspense>
            )}

            {(parentTracks.length > 0 || relatedScenarios.length > 0) && (
              <Suspense fallback={<SkeletonCard lines={3} />}>
                <RelatedContent
                  parentTracks={parentTracks}
                  relatedScenarios={relatedScenarios.map(s => ({
                    ...s,
                    attempt_count: s.attempt_count || 0,
                  }))}
                />
              </Suspense>
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Suspense fallback={<SkeletonCard lines={3} />}>
                <ScenarioSidebar
                  scenarioId={scenarioId}
                  scenario={scenario}
                  totalAttempts={totalAttempts}
                  userAttempts={userAttempts.slice(0, 5)}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
