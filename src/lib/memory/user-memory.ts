import { createClient } from '@supabase/supabase-js'

// Types

export type MemoryType =
  | 'weakness_profile'
  | 'skill_level'
  | 'learning_trajectory'
  | 'coaching_note'
  | 'practice_pattern'

export type Trend = 'improving' | 'declining' | 'stable' | 'new'

export interface WeaknessEntry {
  id: string
  key: string
  value: Record<string, unknown>
  score: number | null
  trend: Trend | null
  lastEvidenceAt: string | null
  evidenceCount: number
  updatedAt: string
}

export interface SkillLevel {
  id: string
  key: string
  value: Record<string, unknown>
  score: number | null
  trend: Trend | null
  lastEvidenceAt: string | null
  evidenceCount: number
  updatedAt: string
}

export interface TrajectoryPoint {
  id: string
  key: string
  value: Record<string, unknown>
  score: number | null
  trend: Trend | null
  lastEvidenceAt: string | null
  evidenceCount: number
  updatedAt: string
}

export interface UpsertMemoryParams {
  orgId: string
  userId: string
  memoryType: MemoryType
  key: string
  value: Record<string, unknown>
  score?: number | null
  trend?: Trend | null
  lastEvidenceAt?: string | null
  evidenceCount?: number
}

/** Row shape returned by Supabase for the user_memory table. */
interface UserMemoryRow {
  id: string
  org_id: string
  user_id: string
  memory_type: string
  key: string
  value: Record<string, unknown>
  score: number | null
  trend: string | null
  last_evidence_at: string | null
  evidence_count: number
  created_at: string
  updated_at: string
}

/**
 * Service-role Supabase client for use outside Next.js request context
 * (e.g. Inngest background jobs where cookies() is unavailable).
 */
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Functions

function toEntry(row: UserMemoryRow): WeaknessEntry {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    score: row.score,
    trend: row.trend as Trend | null,
    lastEvidenceAt: row.last_evidence_at,
    evidenceCount: row.evidence_count,
    updatedAt: row.updated_at,
  }
}

/**
 * Insert or update a user memory entry. On conflict (same org, user, type, key),
 * updates value, score, trend, last_evidence_at, and evidence_count.
 */
export async function upsertMemory(params: UpsertMemoryParams): Promise<string> {
  const { data, error } = await createServiceClient()
    .from('user_memory')
    .upsert(
      {
        org_id: params.orgId,
        user_id: params.userId,
        memory_type: params.memoryType,
        key: params.key,
        value: params.value,
        score: params.score ?? null,
        trend: params.trend ?? null,
        last_evidence_at: params.lastEvidenceAt ?? null,
        evidence_count: params.evidenceCount ?? 1,
      },
      { onConflict: 'org_id,user_id,memory_type,key' },
    )
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to upsert user memory: ${error.message}`)
  }

  return data.id
}

/** Returns all weakness_profile entries for a user, sorted by score ascending (worst first). */
export async function getWeaknessProfile(orgId: string, userId: string): Promise<WeaknessEntry[]> {
  const { data, error } = await createServiceClient()
    .from('user_memory')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('memory_type', 'weakness_profile')
    .order('score', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch weakness profile: ${error.message}`)
  }

  return (data as UserMemoryRow[]).map(toEntry)
}

/** Returns all skill_level entries for a user. */
export async function getSkillLevels(orgId: string, userId: string): Promise<SkillLevel[]> {
  const { data, error } = await createServiceClient()
    .from('user_memory')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('memory_type', 'skill_level')
    .order('score', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch skill levels: ${error.message}`)
  }

  return (data as UserMemoryRow[]).map(toEntry)
}

/** Returns the N weaknesses with the lowest scores (worst first). */
export async function getTopWeaknesses(
  orgId: string,
  userId: string,
  limit = 5,
): Promise<WeaknessEntry[]> {
  const { data, error } = await createServiceClient()
    .from('user_memory')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('memory_type', 'weakness_profile')
    .order('score', { ascending: true, nullsFirst: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch top weaknesses: ${error.message}`)
  }

  return (data as UserMemoryRow[]).map(toEntry)
}

/** Returns the N skills with the highest scores (best first). */
export async function getTopStrengths(
  orgId: string,
  userId: string,
  limit = 5,
): Promise<SkillLevel[]> {
  const { data, error } = await createServiceClient()
    .from('user_memory')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('memory_type', 'skill_level')
    .order('score', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch top strengths: ${error.message}`)
  }

  return (data as UserMemoryRow[]).map(toEntry)
}
