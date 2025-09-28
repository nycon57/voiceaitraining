import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { VoiceSession } from '../_components/voice-session'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default async function NewSessionPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <VoiceSession user={user} />
      </Suspense>
    </div>
  )
}