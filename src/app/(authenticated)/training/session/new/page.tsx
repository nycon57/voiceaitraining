import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Training Session | SpeakStride',
}

import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { VoiceSession } from '../_components/voice-session'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface NewSessionPageProps {
  searchParams: Promise<{ scenario?: string; track?: string; type?: string }>
}

export default async function NewSessionPage({ searchParams }: NewSessionPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <VoiceSession
          user={user}
          scenarioId={params.scenario}
          trackId={params.track}
          type={params.type}
        />
      </Suspense>
    </div>
  )
}
