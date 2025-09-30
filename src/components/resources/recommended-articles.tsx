"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ArticleCard } from './article-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getArticlesByTags, getRecentArticles } from '@/lib/articles'
import type { Article, RecommendedArticlesProps } from '@/types/article'

export function RecommendedArticles({
  currentArticleId,
  currentArticleTags,
  limit = 3,
}: RecommendedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationType, setRecommendationType] = useState<'tags' | 'recent'>('recent')

  useEffect(() => {
    loadRecommendedArticles()
  }, [currentArticleId, currentArticleTags, limit])

  const loadRecommendedArticles = async () => {
    try {
      setLoading(true)
      let recommendedArticles: Article[] = []

      // First, try to get articles with matching tags
      if (currentArticleTags && currentArticleTags.length > 0) {
        recommendedArticles = await getArticlesByTags(
          currentArticleTags,
          currentArticleId,
          limit
        )

        if (recommendedArticles.length > 0) {
          setRecommendationType('tags')
        }
      }

      // If no tag-based recommendations found, get recent articles
      if (recommendedArticles.length === 0) {
        recommendedArticles = await getRecentArticles(currentArticleId, limit)
        setRecommendationType('recent')
      }

      setArticles(recommendedArticles)
    } catch (error) {
      console.error('Error loading recommended articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (articles.length === 0) {
    return null
  }

  const getRecommendationTitle = () => {
    if (recommendationType === 'tags' && currentArticleTags) {
      return `More articles about ${currentArticleTags.slice(0, 2).join(' & ')}`
    }
    return 'Latest articles you might enjoy'
  }

  const getRecommendationDescription = () => {
    if (recommendationType === 'tags') {
      return 'Discover more insights on similar topics'
    }
    return 'Stay up to date with our latest insights and expert tips'
  }

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10">
            <Sparkles className="w-5 h-5 text-chart-2" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold font-headline">
            Recommended Reading
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {getRecommendationTitle()}
          </h3>
          <p className="text-muted-foreground">
            {getRecommendationDescription()}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.1,
              ease: "easeOut"
            }}
          >
            <ArticleCard
              article={article}
              showExcerpt={true}
              showAuthor={false}
              showReadTime={true}
            />
          </motion.div>
        ))}
      </div>

      {/* Recommendation Logic Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>
            {recommendationType === 'tags'
              ? `Recommended based on shared tags: ${currentArticleTags?.slice(0, 2).join(', ')}`
              : 'Showing latest articles'
            }
          </span>
        </div>
      </motion.div>
    </section>
  )
}