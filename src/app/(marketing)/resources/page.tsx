import { Metadata } from 'next'
import { ResourcesContent } from '@/components/resources/resources-content'
import { getPublishedArticles, getFeaturedArticle } from '@/lib/articles'

export const metadata: Metadata = {
  title: 'Resources & Insights | SpeakStride',
  description: 'Discover expert insights, industry trends, and practical tips to elevate your sales training with AI-powered voice simulation.',
  openGraph: {
    title: 'Resources & Insights | SpeakStride',
    description: 'Discover expert insights, industry trends, and practical tips to elevate your sales training with AI-powered voice simulation.',
    type: 'website',
  },
}

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300

export default async function ResourcesPage() {
  // Fetch data on the server
  const [featuredArticle, allArticles] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles()
  ])

  // Filter out featured article from grid
  const articles = featuredArticle
    ? allArticles.filter(article => article.id !== featuredArticle.id)
    : allArticles

  return (
    <ResourcesContent
      initialFeatured={featuredArticle}
      initialArticles={articles}
    />
  )
}