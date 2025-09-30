"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, User, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatReadTime, formatPublishDate } from '@/lib/articles'
import type { ArticleCardProps } from '@/types/article'

export function ArticleCard({
  article,
  showExcerpt = true,
  showAuthor = true,
  showReadTime = true,
  className
}: ArticleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("h-full", className)}
    >
      <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card via-card to-card/90">
        <Link href={`/resources/${article.slug}`} className="block h-full">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            {article.thumbnail_url || article.featured_image_url ? (
              <Image
                src={article.thumbnail_url || article.featured_image_url!}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 opacity-20" />
                  <span className="text-sm font-medium text-muted-foreground font-headline">
                    {article.title.slice(0, 20)}...
                  </span>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Tags Overlay */}
            {article.tags && article.tags.length > 0 && (
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm text-chart-2 border-chart-2/30/20"
                >
                  {article.tags[0]}
                </Badge>
              </div>
            )}

            {/* View Count */}
            {article.view_count > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs">
                <Eye className="w-3 h-3" />
                <span>{article.view_count}</span>
              </div>
            )}
          </div>

          <CardHeader className="pb-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-headline leading-tight line-clamp-2 group-hover:text-chart-2 transition-colors duration-200">
                {article.title}
              </h3>

              {showExcerpt && article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {showAuthor && article.author_name && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{article.author_name}</span>
                  </div>
                )}

                {showReadTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatReadTime(article.read_time_minutes)}</span>
                  </div>
                )}
              </div>

              <span className="shrink-0">
                {formatPublishDate(article.publish_date)}
              </span>
            </div>

            {/* Additional Tags */}
            {article.tags && article.tags.length > 1 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {article.tags.slice(1, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-border/40 hover:border-chart-2/50 hover:text-chart-2 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs border-border/40">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          {/* Hover Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5" />
          </div>
        </Link>
      </Card>
    </motion.div>
  )
}