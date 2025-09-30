import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, incrementArticleView } from '@/lib/articles'
import { ArticleContent } from '@/components/resources/article-content'
import { RecommendedArticles } from '@/components/resources/recommended-articles'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { headers } from 'next/headers'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

async function getArticle(slug: string) {
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Track the view
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const viewerIP = forwarded ? forwarded.split(',')[0] : realIP

  await incrementArticleView(article.id, viewerIP || undefined)

  return article
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const article = await getArticleBySlug(resolvedParams.slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.meta_title || `${article.title} | SpeakStride Resources`,
    description: article.meta_description || article.excerpt || 'Expert insights and practical tips for AI-powered sales training.',
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      type: 'article',
      publishedTime: article.publish_date || article.created_at,
      authors: article.author_name ? [article.author_name] : undefined,
      tags: article.tags || undefined,
      images: article.featured_image_url ? [
        {
          url: article.featured_image_url,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      images: article.featured_image_url ? [article.featured_image_url] : undefined,
    },
    keywords: article.tags?.join(', '),
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params
  const article = await getArticle(resolvedParams.slug)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ArticleContent article={article} />

      <div className="border-t border-border/40 mt-16">
        <div className="container px-4 sm:px-6 md:px-8 py-16">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <RecommendedArticles
              currentArticleId={article.id}
              currentArticleTags={article.tags || undefined}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}