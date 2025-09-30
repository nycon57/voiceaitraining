"use client"

import { motion } from 'framer-motion'
import { ArticleCard } from './article-card'
import type { Article } from '@/types/article'

interface ArticleGridProps {
  articles: Article[]
  className?: string
}

export function ArticleGrid({ articles, className }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 opacity-20" />
          </div>
          <h3 className="text-xl font-semibold font-headline mb-2">No articles found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new content.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <ArticleCard
              article={article}
              showExcerpt={true}
              showAuthor={true}
              showReadTime={true}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}