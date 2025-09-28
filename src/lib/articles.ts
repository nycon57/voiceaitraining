import { createClient } from '@/lib/supabase/client'
import type { Article, ArticleSearchResult, PopularArticle } from '@/types/article'

const supabase = createClient()

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  const query = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false })

  if (limit) {
    query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('publish_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching featured article:', error)
    return null
  }

  return data
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return null
  }

  return data
}

export async function searchArticles(
  searchQuery: string,
  limit: number = 20
): Promise<ArticleSearchResult[]> {
  const { data, error } = await supabase.rpc('search_articles', {
    search_query: searchQuery,
    limit: limit
  })

  if (error) {
    console.error('Error searching articles:', error)
    return []
  }

  return data || []
}

export async function getPopularArticles(
  limit: number = 10,
  daysBack: number = 30
): Promise<PopularArticle[]> {
  const { data, error } = await supabase.rpc('get_popular_articles', {
    limit: limit,
    days_back: daysBack
  })

  if (error) {
    console.error('Error fetching popular articles:', error)
    return []
  }

  return data || []
}

export async function getArticlesByTags(
  tags: string[],
  excludeId?: string,
  limit: number = 5
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .overlaps('tags', tags)
    .order('publish_date', { ascending: false })
    .limit(limit)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching articles by tags:', error)
    return []
  }

  return data || []
}

export async function getRecentArticles(
  excludeId?: string,
  limit: number = 5
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false })
    .limit(limit)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching recent articles:', error)
    return []
  }

  return data || []
}

export async function incrementArticleView(
  articleId: string,
  viewerIp?: string
): Promise<void> {
  try {
    // First try the database function approach
    const { error: rpcError } = await supabase.rpc('increment_article_view_count', {
      article_id_param: articleId,
      viewer_ip_param: viewerIp || null
    })

    if (!rpcError) {
      return // Success
    }

    // If RPC fails, fall back to direct table update
    console.warn('RPC function failed, falling back to direct update:', rpcError)

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        view_count: supabase.sql`view_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)

    if (updateError) {
      console.error('Error incrementing article view (fallback):', updateError)
    }
  } catch (error) {
    // Silently fail - view counting shouldn't break the page
    console.warn('View tracking unavailable:', error)
  }
}

export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('tags')
    .eq('is_published', true)

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  const allTags = data
    .flatMap(article => article.tags || [])
    .filter((tag, index, array) => array.indexOf(tag) === index)
    .sort()

  return allTags
}

export function formatReadTime(minutes: number | null): string {
  if (!minutes) return 'Quick read'
  if (minutes < 1) return '< 1 min read'
  return `${minutes} min read`
}

export function formatPublishDate(date: string | null): string {
  if (!date) return ''

  const publishDate = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`

  return publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}