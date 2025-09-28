import { Suspense } from 'react'
import { Metadata } from 'next'
import { ResourcesContent } from '@/components/resources/resources-content'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'Resources & Insights | SpeakStride',
  description: 'Discover expert insights, industry trends, and practical tips to elevate your sales training with AI-powered voice simulation.',
  openGraph: {
    title: 'Resources & Insights | SpeakStride',
    description: 'Discover expert insights, industry trends, and practical tips to elevate your sales training with AI-powered voice simulation.',
    type: 'website',
  },
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ResourcesContent />
    </Suspense>
  )
}