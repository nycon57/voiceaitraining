import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from "@/components/layout/header"
import {
  type ScenarioCardData,
  type TrackCardData,
} from '@/components/training'
import { TrainingHero } from '@/components/training/training-hero'
import { TrainingLibraryClient } from './training-library-client'
import {
  getPublishedScenarios,
  getLatestActiveTracks,
  getScenarioCategories,
  getScenarioIndustries,
} from '@/actions/scenarios'
import { SkeletonCard, SkeletonForm } from '@/components/ui/loading-skeleton'
import { Card } from '@/components/ui/card'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getTrainingLibraryData(page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit

    // Fetch scenarios and tracks in parallel
    const [scenarios, tracks, categories, industries] = await Promise.all([
      getPublishedScenarios({
        sortBy: 'newest',
        limit,
        offset,
      }),
      getLatestActiveTracks(limit),
      getScenarioCategories(),
      getScenarioIndustries(),
    ])

    // Transform scenarios to ScenarioCardData format
    const scenarioCards: ScenarioCardData[] = scenarios.map(scenario => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description || '',
      category: scenario.category || 'General',
      industry: scenario.industry || 'General',
      difficulty: (scenario.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      durationMin: Math.floor((scenario.estimated_duration || 300) / 60),
      durationMax: Math.ceil((scenario.estimated_duration || 300) / 60) + 5,
      thumbnailUrl: undefined, // TODO: Add thumbnail support
      tags: scenario.metadata?.tags as string[] || [],
      averageScore: scenario.avg_score || undefined,
      attemptCount: scenario.attempt_count || 0,
      isEnrolled: false, // Will be set by client if needed
    }))

    // Transform tracks to TrackCardData format
    const trackCards: TrackCardData[] = tracks.map(track => ({
      id: track.id,
      title: track.title,
      description: track.description || '',
      scenarioCount: track.scenario_count || 0,
      totalDurationMin: 60, // Default 1 hour, TODO: Calculate from scenarios
      totalDurationMax: 120, // Default 2 hours
      industry: 'General', // TODO: Add industry to tracks table
      thumbnailUrl: undefined,
      tags: [],
      enrolledCount: 0, // TODO: Add enrolled count from enrollments
      isEnrolled: false,
    }))

    // Format categories and industries for filters
    const categoryOptions = categories.map(cat => ({
      value: cat,
      label: cat,
    }))

    const industryOptions = industries.map(ind => ({
      value: ind,
      label: ind,
    }))

    return {
      scenarios: scenarioCards,
      tracks: trackCards,
      categories: categoryOptions,
      industries: industryOptions,
      totalScenarios: scenarios.length, // In production, get this from a count query
      totalTracks: tracks.length,
    }
  } catch (error) {
    console.error('Failed to get training library data:', error)
    return {
      scenarios: [],
      tracks: [],
      categories: [],
      industries: [],
      totalScenarios: 0,
      totalTracks: 0,
    }
  }
}

export default async function TrainingPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const itemsPerPage = 20

  // Fetch library data
  const libraryData = await getTrainingLibraryData(currentPage, itemsPerPage)

  // Calculate latest additions (scenarios added in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const latestAdditions = libraryData.scenarios.filter(s => {
    // Note: This would need created_at field in scenarios table to work properly
    return true // Placeholder for now
  }).length

  return (
    <>
      <Header />
      <div className="space-y-8 p-4 md:p-6">
        {/* Hero Section with Quick Stats */}
        <Suspense fallback={
          <div className="space-y-4">
            <SkeletonCard lines={2} />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} hasIcon lines={2} />
              ))}
            </div>
          </div>
        }>
          <TrainingHero
            totalScenarios={libraryData.totalScenarios}
            totalTracks={libraryData.totalTracks}
            latestAdditions={latestAdditions}
          />
        </Suspense>

        {/* Browse Library */}
        <section className="space-y-4">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">Browse Library</h2>
            <p className="text-sm text-muted-foreground">
              Filter and explore available training content
            </p>
          </div>

          <Suspense fallback={
            <div className="space-y-4">
              <Card>
                <SkeletonForm fields={5} />
              </Card>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} hasIcon lines={4} />
                ))}
              </div>
            </div>
          }>
            <TrainingLibraryClient
              initialScenarios={libraryData.scenarios}
              initialTracks={libraryData.tracks}
              categories={libraryData.categories}
              industries={libraryData.industries}
              totalScenarios={libraryData.totalScenarios}
              totalTracks={libraryData.totalTracks}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          </Suspense>
        </section>
      </div>
    </>
  )
}