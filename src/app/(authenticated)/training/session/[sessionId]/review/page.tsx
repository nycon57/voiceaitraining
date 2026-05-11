import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Session Review | SpeakStride',
}

import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SessionReview } from '../../_components/session-review'

interface SessionReviewPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function SessionReviewPage({ params }: SessionReviewPageProps) {
  const [{ sessionId }, user] = await Promise.all([
    params,
    getCurrentUser(),
  ])

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <SessionReview sessionId={sessionId} user={user} />
    </div>
  )
}
