import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { getTrackDetails, getTrackProgress } from '@/actions/tracks'
import { TrackHero } from '@/components/training/track-detail/track-hero'
import { TrackCurriculum } from '@/components/training/track-detail/track-curriculum'
import { TrackSidebar } from '@/components/training/track-detail/track-sidebar'
import { TrackStats } from '@/components/training/track-detail/track-stats'
import { WhatYoullMaster } from '@/components/training/track-detail/what-youll-master'
import { SkeletonCard } from '@/components/ui/loading-skeleton'

interface TrackPageProps {
  params: Promise<{ trackId: string }>
}

export default async function TrackSinglePage({ params }: TrackPageProps) {
  const { trackId } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Fetch track data
  let track
  try {
    track = await getTrackDetails(trackId)
  } catch (error) {
    notFound()
  }

  // Fetch user progress if enrolled
  let progress = null
  if (track.user_enrolled) {
    try {
      progress = await getTrackProgress(trackId, user.id)
    } catch (error) {
      console.error('Failed to fetch track progress:', error)
    }
  }

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
            Tracks
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{track.title}</span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<SkeletonCard lines={4} />}>
              <TrackHero track={track} />
            </Suspense>

            {track.user_enrolled && progress && (
              <Suspense fallback={<SkeletonCard lines={3} hasIcon />}>
                <TrackStats progress={progress} />
              </Suspense>
            )}

            <Suspense fallback={<SkeletonCard lines={6} hasIcon />}>
              <TrackCurriculum track={track} progress={progress} />
            </Suspense>

            <Suspense fallback={<SkeletonCard lines={4} hasIcon />}>
              <WhatYoullMaster scenarios={track.scenarios} />
            </Suspense>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Suspense fallback={<SkeletonCard lines={4} />}>
                <TrackSidebar
                  trackId={trackId}
                  track={track}
                  progress={progress}
                  isEnrolled={track.user_enrolled || false}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
