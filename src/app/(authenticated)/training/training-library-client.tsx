"use client"

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  TrainingFilters,
  ScenarioCard,
  TrackCard,
  EmptyLibraryState,
  type TrainingFiltersState,
  type ScenarioCardData,
  type TrackCardData,
} from '@/components/training'
import { enrollUser } from '@/actions/enrollments'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface TrainingLibraryClientProps {
  initialScenarios: ScenarioCardData[]
  initialTracks: TrackCardData[]
  categories: Array<{ value: string; label: string }>
  industries: Array<{ value: string; label: string }>
  totalScenarios: number
  totalTracks: number
  currentPage: number
  itemsPerPage: number
}

export function TrainingLibraryClient({
  initialScenarios,
  initialTracks,
  categories,
  industries,
  totalScenarios,
  totalTracks,
  currentPage,
  itemsPerPage,
}: TrainingLibraryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)

  // Get initial tab from URL or default to 'all'
  const initialTab = searchParams?.get('tab') || 'all'

  // Calculate total items and pages based on active tab
  const [activeTab, setActiveTab] = useState(initialTab)
  const totalItems = activeTab === 'scenarios' ? totalScenarios :
                     activeTab === 'tracks' ? totalTracks :
                     totalScenarios + totalTracks
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Filter content based on search and filters
  const [filteredScenarios, setFilteredScenarios] = useState(initialScenarios)
  const [filteredTracks, setFilteredTracks] = useState(initialTracks)

  const handleFilterChange = useCallback((filters: TrainingFiltersState) => {
    // Filter scenarios
    let scenarios = initialScenarios
    let tracks = initialTracks

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      scenarios = scenarios.filter(s =>
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      )
      tracks = tracks.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (filters.category !== 'all') {
      scenarios = scenarios.filter(s => s.category === filters.category)
    }

    // Apply industry filter
    if (filters.industry !== 'all') {
      scenarios = scenarios.filter(s => s.industry === filters.industry)
      tracks = tracks.filter(t => t.industry === filters.industry)
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      scenarios = scenarios.filter(s => s.difficulty === filters.difficulty)
    }

    // Apply sorting
    switch (filters.sort) {
      case 'az':
        scenarios.sort((a, b) => a.title.localeCompare(b.title))
        tracks.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'popular':
        scenarios.sort((a, b) => b.attemptCount - a.attemptCount)
        tracks.sort((a, b) => b.enrolledCount - a.enrolledCount)
        break
      case 'duration':
        scenarios.sort((a, b) => a.durationMin - b.durationMin)
        tracks.sort((a, b) => a.totalDurationMin - b.totalDurationMin)
        break
      case 'newest':
      default:
        // Already sorted by newest from server
        break
    }

    setFilteredScenarios(scenarios)
    setFilteredTracks(tracks)
  }, [initialScenarios, initialTracks])

  const handleEnroll = async (id: string, type: 'scenario' | 'track') => {
    setIsEnrolling(id)
    try {
      await enrollUser({
        type,
        scenarioId: type === 'scenario' ? id : undefined,
        trackId: type === 'track' ? id : undefined,
      })
      toast.success(`Successfully enrolled in ${type}!`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll')
    } finally {
      setIsEnrolling(null)
    }
  }

  const handleContinue = (id: string, type: 'scenario' | 'track') => {
    router.push(`/play/${id}`)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update URL with new tab
    const params = new URLSearchParams(searchParams?.toString())
    params.set('tab', value)
    params.set('page', '1') // Reset to first page when changing tabs
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`, { scroll: true })
  }

  const clearFilters = () => {
    setFilteredScenarios(initialScenarios)
    setFilteredTracks(initialTracks)
  }

  const hasResults = filteredScenarios.length > 0 || filteredTracks.length > 0

  return (
    <>
      {/* Filters */}
      <Card animated={false}>
        <CardContent className="pt-6">
          <TrainingFilters
            onFilterChange={handleFilterChange}
            categories={categories}
            industries={industries}
          />
        </CardContent>
      </Card>

      {/* Tabs and Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {filteredScenarios.length + filteredTracks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="scenarios">
              Scenarios
              <Badge variant="secondary" className="ml-2">
                {filteredScenarios.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tracks">
              Tracks
              <Badge variant="secondary" className="ml-2">
                {filteredTracks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments
            </TabsTrigger>
          </TabsList>

          {/* Result count */}
          <p className="text-sm text-muted-foreground">
            {activeTab === 'all' && `${filteredScenarios.length + filteredTracks.length} items`}
            {activeTab === 'scenarios' && `${filteredScenarios.length} scenarios`}
            {activeTab === 'tracks' && `${filteredTracks.length} tracks`}
          </p>
        </div>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-4">
          {hasResults ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onEnroll={(id) => handleEnroll(id, 'scenario')}
                    onContinue={(id) => handleContinue(id, 'scenario')}
                  />
                ))}
                {filteredTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onEnroll={(id) => handleEnroll(id, 'track')}
                    onContinue={(id) => handleContinue(id, 'track')}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <EmptyLibraryState
              onClearFilters={clearFilters}
              searchQuery={searchParams?.get('search') || undefined}
            />
          )}
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          {filteredScenarios.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onEnroll={(id) => handleEnroll(id, 'scenario')}
                  onContinue={(id) => handleContinue(id, 'scenario')}
                />
              ))}
            </div>
          ) : (
            <EmptyLibraryState
              onClearFilters={clearFilters}
              searchQuery={searchParams?.get('search') || undefined}
            />
          )}
        </TabsContent>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-4">
          {filteredTracks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onEnroll={(id) => handleEnroll(id, 'track')}
                  onContinue={(id) => handleContinue(id, 'track')}
                />
              ))}
            </div>
          ) : (
            <EmptyLibraryState
              onClearFilters={clearFilters}
              searchQuery={searchParams?.get('search') || undefined}
            />
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card animated={false}>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Assignments feature coming soon. Your manager will be able to assign specific training to you.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}