import { createClient } from '@supabase/supabase-js'
import { embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type ContentType =
  | 'transcript_segment'
  | 'feedback_summary'
  | 'weakness_note'
  | 'coaching_insight'

export interface StoreEmbeddingParams {
  orgId: string
  userId: string
  contentType: ContentType
  content: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

export interface SimilarResult {
  id: string
  content: string
  contentType: ContentType
  similarity: number
  sourceId: string | null
  metadata: Record<string, unknown> | null
}

/** Generate a 1536-dimensional embedding using OpenAI text-embedding-3-small. */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding
}

/**
 * Generate an embedding for the given content and store it in one call.
 *
 * Uses the bare supabase-js client with the service-role key so it can be
 * called from background jobs (Inngest) where Next.js cookie context is
 * unavailable.
 */
export async function storeEmbedding(params: StoreEmbeddingParams): Promise<string> {
  const embedding = await generateEmbedding(params.content)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase
    .from('memory_embeddings')
    .insert({
      org_id: params.orgId,
      user_id: params.userId,
      content_type: params.contentType,
      content: params.content,
      embedding: JSON.stringify(embedding),
      source_id: params.sourceId ?? null,
      metadata: params.metadata ?? null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to store embedding: ${error.message}`)
  }

  return data.id
}

/** Vector similarity search scoped by org, with optional user and content type filters. */
export async function searchSimilar(params: {
  orgId: string
  userId?: string
  query: string
  contentType?: ContentType
  limit?: number
}): Promise<SimilarResult[]> {
  const queryEmbedding = await generateEmbedding(params.query)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase.rpc('match_memory_embeddings', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_org_id: params.orgId,
    match_user_id: params.userId ?? null,
    match_content_type: params.contentType ?? null,
    match_limit: params.limit ?? 10,
  })

  if (error) {
    throw new Error(`Failed to search embeddings: ${error.message}`)
  }

  return (data ?? []).map((row: {
    id: string
    content: string
    content_type: string
    similarity: number
    source_id: string | null
    metadata: Record<string, unknown> | null
  }) => ({
    id: row.id,
    content: row.content,
    contentType: row.content_type as ContentType,
    similarity: row.similarity,
    sourceId: row.source_id,
    metadata: row.metadata,
  }))
}
