import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SessionReview } from '../../_components/session-review'

interface SessionReviewPageProps {
  params: {
    sessionId: string
  }
}

export default async function SessionReviewPage({ params }: SessionReviewPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <SessionReview sessionId={params.sessionId} user={user} />
    </div>
  )
}