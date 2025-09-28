export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  tags: string[] | null
  author_name: string | null
  author_avatar_url: string | null
  featured_image_url: string | null
  thumbnail_url: string | null
  is_featured: boolean
  is_published: boolean
  publish_date: string | null
  view_count: number
  read_time_minutes: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface ArticleView {
  id: string
  article_id: string
  viewed_at: string
  viewer_ip: string | null
}

export interface ArticleWithAnalytics extends Article {
  total_views?: number
  unique_viewers?: number
  recent_views?: number
}

export interface PopularArticle {
  id: string
  title: string
  slug: string
  view_count: number
  recent_views: number
  popularity_score: number
}

export interface ArticleSearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  thumbnail_url: string | null
  tags: string[] | null
  publish_date: string | null
  relevance_rank: number
}

export interface ArticleFilters {
  search?: string
  tags?: string[]
  sortBy?: 'recent' | 'popular' | 'reading_time'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ArticleCardProps {
  article: Article
  showExcerpt?: boolean
  showAuthor?: boolean
  showReadTime?: boolean
  className?: string
}

export interface FeaturedArticleProps {
  article: Article
  className?: string
}

export interface RecommendedArticlesProps {
  currentArticleId: string
  currentArticleTags?: string[]
  limit?: number
}

export type ArticleSortOption = {
  value: 'recent' | 'popular' | 'reading_time'
  label: string
  description: string
}