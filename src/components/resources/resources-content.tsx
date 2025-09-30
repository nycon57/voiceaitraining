"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArticleFilters } from './article-filters'
import { getPublishedArticles, getFeaturedArticle, formatReadTime, formatPublishDate } from '@/lib/articles'
import type { Article, ArticleFilters as ArticleFiltersType } from '@/types/article'

export function ResourcesContent() {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ArticleFiltersType>({
    sortBy: 'recent',
    sortOrder: 'desc',
    limit: 12
  })

  useEffect(() => {
    loadArticles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [articles, filters])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const [featured, allArticles] = await Promise.all([
        getFeaturedArticle(),
        getPublishedArticles()
      ])

      setFeaturedArticle(featured)
      // Filter out featured article from the grid
      const gridArticles = featured
        ? allArticles.filter(article => article.id !== featured.id)
        : allArticles
      setArticles(gridArticles)
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...articles]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt?.toLowerCase().includes(searchTerm) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(article =>
        article.tags?.some(tag => filters.tags!.includes(tag))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return filters.sortOrder === 'desc'
            ? b.view_count - a.view_count
            : a.view_count - b.view_count
        case 'reading_time':
          const aTime = a.read_time_minutes || 0
          const bTime = b.read_time_minutes || 0
          return filters.sortOrder === 'desc'
            ? bTime - aTime
            : aTime - bTime
        case 'recent':
        default:
          const aDate = new Date(a.publish_date || a.created_at)
          const bDate = new Date(b.publish_date || b.created_at)
          return filters.sortOrder === 'desc'
            ? bDate.getTime() - aDate.getTime()
            : aDate.getTime() - bDate.getTime()
      }
    })

    // Apply limit
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    setFilteredArticles(filtered)
  }

  const handleFiltersChange = (newFilters: Partial<ArticleFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Get all unique tags from articles for filter options
  const availableTags = Array.from(
    new Set(articles.flatMap(article => article.tags || []))
  ).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <section className="py-32">
      <div className="container">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-medium md:text-6xl font-headline">
            Resources & Insights
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Stay updated with the latest insights, trends, and expert tips to elevate your sales training with AI-powered voice simulation.
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="my-16 grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-16">
              <Link href={`/resources/${featuredArticle.slug}`} className="block">
                {featuredArticle.featured_image_url || featuredArticle.thumbnail_url ? (
                  <Image
                    src={featuredArticle.featured_image_url || featuredArticle.thumbnail_url!}
                    alt={featuredArticle.title}
                    width={600}
                    height={400}
                    className="aspect-video rounded-lg object-cover hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 opacity-20" />
                      <span className="text-sm font-medium text-muted-foreground font-headline">
                        Featured Article
                      </span>
                    </div>
                  </div>
                )}
              </Link>

              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="shrink">
                    Featured
                  </Badge>
                  {featuredArticle.tags && featuredArticle.tags[0] && (
                    <Badge variant="outline" className="shrink">
                      {featuredArticle.tags[0]}
                    </Badge>
                  )}
                </div>

                <Link href={`/resources/${featuredArticle.slug}`}>
                  <h2 className="text-2xl font-semibold text-balance md:max-w-lg lg:text-3xl hover:text-chart-2 transition-colors">
                    {featuredArticle.title}
                  </h2>
                </Link>

                <p className="text-muted-foreground md:max-w-lg">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {featuredArticle.author_name && (
                    <span>{featuredArticle.author_name}</span>
                  )}
                  <span>{formatPublishDate(featuredArticle.publish_date)}</span>
                  <span>{formatReadTime(featuredArticle.read_time_minutes)}</span>
                  {featuredArticle.view_count > 0 && (
                    <span>{featuredArticle.view_count} views</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-12">
            <ArticleFilters
              filters={filters}
              availableTags={availableTags}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Popular Articles */}
          <p className="text-2xl font-medium md:text-3xl font-headline mb-8">Popular Articles</p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="flex flex-col items-start gap-4">
                <Link href={`/resources/${article.slug}`} className="block w-full">
                  {article.thumbnail_url || article.featured_image_url ? (
                    <Image
                      src={article.thumbnail_url || article.featured_image_url!}
                      alt={article.title}
                      width={400}
                      height={300}
                      className="aspect-video rounded-lg object-cover hover:opacity-90 transition-opacity w-full"
                    />
                  ) : (
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 flex items-center justify-center w-full">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 opacity-20" />
                        <span className="text-xs font-medium text-muted-foreground font-headline">
                          {article.title.slice(0, 20)}...
                        </span>
                      </div>
                    </div>
                  )}
                </Link>

                <div className="flex items-center gap-2">
                  {article.tags && article.tags[0] && (
                    <Badge variant="secondary" className="shrink">
                      {article.tags[0]}
                    </Badge>
                  )}
                </div>

                <Link href={`/resources/${article.slug}`}>
                  <h3 className="text-xl font-semibold text-balance md:max-w-md hover:text-chart-2 transition-colors">
                    {article.title}
                  </h3>
                </Link>

                <p className="text-muted-foreground md:max-w-md">
                  {article.excerpt}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {article.author_name && (
                    <span>{article.author_name}</span>
                  )}
                  <span>{formatPublishDate(article.publish_date)}</span>
                  <span>{formatReadTime(article.read_time_minutes)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}