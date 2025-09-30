"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, User, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatReadTime, formatPublishDate } from '@/lib/articles'
import type { Article } from '@/types/article'

interface FeaturedArticleProps {
  article: Article
  className?: string
}

export function FeaturedArticle({ article, className }: FeaturedArticleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("relative", className)}
    >
      <Card className="group relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5" />

        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[500px]">
            {/* Content Section */}
            <div className="flex flex-col justify-center p-8 lg:p-12 space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 border-chart-2/30/20 text-chart-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  {article.tags && article.tags.length > 0 && (
                    <Badge variant="outline" className="border-border/40">
                      {article.tags[0]}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-headline tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                    {article.title}
                  </span>
                </h1>

                {article.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {article.author_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{article.author_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatReadTime(article.read_time_minutes)}</span>
                  </div>

                  <span>{formatPublishDate(article.publish_date)}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild size="lg" className="group/btn">
                  <Link href={`/resources/${article.slug}`}>
                    <div className="flex items-center">
                      Read Full Article
                      <motion.span
                        className="ml-2 group-hover/btn:translate-x-0.5 transition-transform"
                        initial={{ x: 0 }}
                        whileHover={{ x: 2 }}
                      >
                        →
                      </motion.span>
                    </div>
                  </Link>
                </Button>
              </div>

              {/* View Count */}
              <div className="text-xs text-muted-foreground/70">
                {article.view_count > 0 && (
                  <span>{article.view_count.toLocaleString()} views</span>
                )}
              </div>
            </div>

            {/* Image Section */}
            <div className="relative overflow-hidden lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 z-10" />

              {article.featured_image_url ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-full min-h-[300px] lg:min-h-full"
                >
                  <Image
                    src={article.featured_image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px] lg:min-h-full bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 opacity-20" />
                    <h3 className="text-xl font-semibold text-muted-foreground font-headline">
                      {article.title}
                    </h3>
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
            </div>
          </div>
        </CardContent>

        {/* Hover Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5" />
        </div>
      </Card>
    </motion.div>
  )
}