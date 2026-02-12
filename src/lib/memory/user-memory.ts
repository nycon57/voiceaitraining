import { createServiceClient } from './supabase'

// Types

export type MemoryType =
  | 'weakness_profile'
  | 'skill_level'
  | 'learning_trajectory'
  | 'coaching_note'
  | 'practice_pattern'

export type Trend = 'improving' | 'declining' | 'stable' | 'new'

export interface MemoryEntry {
  id: string
  key: string
  value: Record<string, unknown>
  score: number | null
  trend: Trend | null
  lastEvidenceAt: string | null
  evidenceCount: number
  updatedAt: string
}

export type WeaknessEntry = MemoryEntry
export type SkillLevel = MemoryEntry
export type TrajectoryPoint = MemoryEntry

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

// Functions

function toEntry(row: UserMemoryRow): MemoryEntry {
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

/** Insert or update a user memory entry. */
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

async function queryMemories(
  orgId: string,
  userId: string,
  memoryType: MemoryType,
  options?: { ascending?: boolean; limit?: number },
): Promise<MemoryEntry[]> {
  let query = createServiceClient()
    .from('user_memory')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('memory_type', memoryType)
    .order('score', { ascending: options?.ascending ?? true, nullsFirst: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch ${memoryType} memories: ${error.message}`)
  }

  return (data as UserMemoryRow[]).map(toEntry)
}

/** Returns all weakness_profile entries for a user (worst first). */
export async function getWeaknessProfile(orgId: string, userId: string): Promise<WeaknessEntry[]> {
  return queryMemories(orgId, userId, 'weakness_profile')
}

/** Returns all skill_level entries for a user (worst first). */
export async function getSkillLevels(orgId: string, userId: string): Promise<SkillLevel[]> {
  return queryMemories(orgId, userId, 'skill_level')
}

/** Returns the N weakest skills (worst first). */
export async function getTopWeaknesses(
  orgId: string,
  userId: string,
  limit = 5,
): Promise<WeaknessEntry[]> {
  return queryMemories(orgId, userId, 'weakness_profile', { limit })
}

/** Returns the N strongest skills (best first). */
export async function getTopStrengths(
  orgId: string,
  userId: string,
  limit = 5,
): Promise<SkillLevel[]> {
  return queryMemories(orgId, userId, 'skill_level', { ascending: false, limit })
}
