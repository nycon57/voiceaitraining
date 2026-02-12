-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table for agent semantic memory
CREATE TABLE memory_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id),
  user_id text NOT NULL,
  content_type text NOT NULL,
  content text NOT NULL,
  embedding vector(1536) NOT NULL,
  source_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE memory_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_embeddings"
  ON memory_embeddings
  FOR SELECT
  USING (org_id = current_setting('jwt.claims.org_id', true)::uuid);

-- IVFFlat index for cosine similarity search
-- lists=100 is a starting point; tune after data volume grows (sqrt of row count)
CREATE INDEX idx_memory_embeddings_cosine
  ON memory_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Composite index for filtered queries by org, user, and content type
CREATE INDEX idx_memory_embeddings_org_user_type
  ON memory_embeddings (org_id, user_id, content_type);

-- Similarity search function for use via supabase.rpc()
CREATE OR REPLACE FUNCTION match_memory_embeddings(
  query_embedding vector(1536),
  match_org_id uuid,
  match_user_id text DEFAULT NULL,
  match_content_type text DEFAULT NULL,
  match_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  content_type text,
  similarity float,
  source_id text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.id,
    me.content,
    me.content_type,
    (1 - (me.embedding <=> query_embedding))::float AS similarity,
    me.source_id,
    me.metadata
  FROM memory_embeddings me
  WHERE me.org_id = match_org_id
    AND (match_user_id IS NULL OR me.user_id = match_user_id)
    AND (match_content_type IS NULL OR me.content_type = match_content_type)
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;
