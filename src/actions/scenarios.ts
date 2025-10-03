'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ScenarioPersona, ScenarioRubric, ScenarioBranching } from '@/types/scenario'

const createScenarioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  ai_prompt: z.string().optional(),
  persona: z.any().optional(), // Will be validated as ScenarioPersona
  rubric: z.any().optional(), // Will be validated as ScenarioRubric
  branching: z.any().optional(), // Will be validated as ScenarioBranching
})

const updateScenarioSchema = createScenarioSchema.partial()

export async function createScenario(formData: FormData) {
  const data = createScenarioSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    difficulty: formData.get('difficulty'),
    ai_prompt: formData.get('ai_prompt'),
    persona: formData.get('persona') ? JSON.parse(formData.get('persona') as string) : undefined,
    rubric: formData.get('rubric') ? JSON.parse(formData.get('rubric') as string) : undefined,
    branching: formData.get('branching') ? JSON.parse(formData.get('branching') as string) : undefined,
  })

  return withRoleGuard(['admin', 'manager'], async (user, orgId, supabase) => {
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert({
        ...data,
        org_id: orgId,
        created_by: user.id,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create scenario: ${error.message}`)
    }

    revalidatePath('/scenarios', 'page')
    return scenario
  })
}

export async function updateScenario(scenarioId: string, formData: FormData) {
  const data = updateScenarioSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    difficulty: formData.get('difficulty'),
    ai_prompt: formData.get('ai_prompt'),
    persona: formData.get('persona') ? JSON.parse(formData.get('persona') as string) : undefined,
    rubric: formData.get('rubric') ? JSON.parse(formData.get('rubric') as string) : undefined,
    branching: formData.get('branching') ? JSON.parse(formData.get('branching') as string) : undefined,
  })

  return withRoleGuard(['admin', 'manager'], async (user, orgId, supabase) => {
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update scenario: ${error.message}`)
    }

    revalidatePath('/scenarios', 'page')
    revalidatePath(`/scenarios/${scenarioId}`, 'page')
    return scenario
  })
}

export async function getScenarios() {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('*')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get scenarios: ${error.message}`)
    }

    return scenarios
  })
}

export async function getScenario(scenarioId: string) {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .single()

    if (error) {
      throw new Error(`Failed to get scenario: ${error.message}`)
    }

    return scenario
  })
}

export async function publishScenario(scenarioId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId, supabase) => {

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to publish scenario: ${error.message}`)
    }

    revalidatePath('/scenarios', 'page')
    revalidatePath(`/scenarios/${scenarioId}`, 'page')
    return scenario
  })
}

export async function archiveScenario(scenarioId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId, supabase) => {

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to archive scenario: ${error.message}`)
    }

    revalidatePath('/scenarios', 'page')
    revalidatePath(`/scenarios/${scenarioId}`, 'page')
    return scenario
  })
}

export async function getLatestActiveScenarios(limit: number = 10) {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('id, title, description, difficulty, status, created_at, persona, visibility')
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get latest scenarios: ${error.message}`)
    }

    return scenarios
  })
}

export async function getLatestActiveTracks(limit: number = 10) {
  return withOrgGuard(async (user, orgId, supabase) => {

    console.log('[DEBUG] getLatestActiveTracks - Query parameters:', {
      orgId,
      userId: user.id,
      limit,
    })

    const { data: tracks, error } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        visibility,
        track_scenarios (
          scenario_id
        )
      `)
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[DEBUG] getLatestActiveTracks - Query failed with error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      })
      throw new Error(`Failed to get latest tracks: ${error.message}`)
    }

    console.log('[DEBUG] getLatestActiveTracks - Query succeeded, found', tracks?.length || 0, 'tracks')

    // Transform to include scenario count
    return tracks.map(track => ({
      ...track,
      scenario_count: track.track_scenarios?.length || 0,
      track_scenarios: undefined // Remove the raw join data
    }))
  })
}

/**
 * Filters for scenario queries
 */
export interface ScenarioFilters {
  category?: string
  industry?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  search?: string
  featured?: boolean
  sortBy?: 'newest' | 'popular' | 'title' | 'duration'
  limit?: number
  offset?: number
}

/**
 * Enriched scenario with statistics
 */
export interface EnrichedScenario {
  id: string
  org_id: string
  title: string
  description?: string
  difficulty?: string
  status: string
  persona?: any
  ai_prompt?: string
  branching?: any
  rubric?: any
  category?: string
  industry?: string
  featured?: boolean
  metadata?: Record<string, unknown>
  created_by?: string
  created_at: string
  updated_at: string
  attempt_count?: number
  avg_score?: number
  completion_rate?: number
  estimated_duration?: number
  user_best_score?: number
  user_attempt_count?: number
}

/**
 * Gets published scenarios with advanced filtering and sorting
 *
 * @param filters - Optional filters for category, industry, difficulty, search, featured, sort, pagination
 * @returns Array of enriched scenarios with statistics
 */
export async function getPublishedScenarios(filters?: ScenarioFilters): Promise<EnrichedScenario[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    console.log('[DEBUG] getPublishedScenarios - Query parameters:', {
      orgId,
      userId: user.id,
      filters,
    })

    // Start building query - include universal scenarios and org scenarios
    let query = supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.industry) {
      query = query.eq('industry', filters.industry)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.search) {
      // Full-text search on title and description
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'title':
        query = query.order('title', { ascending: true })
        break
      case 'popular':
        // Note: This would require a join with attempts table for accurate sorting
        // For now, default to created_at
        query = query.order('created_at', { ascending: false })
        break
      case 'duration':
        // Sort by estimated duration from metadata
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      )
    }

    console.log('[DEBUG] getPublishedScenarios - Executing query')

    const { data: scenarios, error } = await query

    if (error) {
      console.error('[DEBUG] getPublishedScenarios - Query failed with error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      })
      throw new Error(`Failed to get scenarios: ${error.message}`)
    }

    console.log('[DEBUG] getPublishedScenarios - Query succeeded, found', scenarios?.length || 0, 'scenarios')

    // Enrich with statistics
    const enrichedScenarios: EnrichedScenario[] = await Promise.all(
      scenarios.map(async (scenario) => {
        // Get overall attempt statistics
        const { data: attempts, count: attemptCount } = await supabase
          .from('scenario_attempts')
          .select('score, status', { count: 'exact' })
          .eq('org_id', orgId)
          .eq('scenario_id', scenario.id)
          .eq('status', 'completed')

        // Calculate average score
        const avgScore = attempts && attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
          : null

        // Calculate completion rate (completed attempts / total attempts)
        const { count: totalAttempts } = await supabase
          .from('scenario_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('scenario_id', scenario.id)

        const completionRate = totalAttempts && totalAttempts > 0 && attemptCount
          ? Math.round((attemptCount / totalAttempts) * 100)
          : null

        // Get user-specific statistics
        const { data: userAttempts } = await supabase
          .from('scenario_attempts')
          .select('score, status')
          .eq('org_id', orgId)
          .eq('scenario_id', scenario.id)
          .eq('clerk_user_id', user.id)
          .eq('status', 'completed')

        const userBestScore = userAttempts && userAttempts.length > 0
          ? Math.max(...userAttempts.map((a) => a.score || 0))
          : null

        const userAttemptCount = userAttempts?.length || 0

        return {
          ...scenario,
          attempt_count: attemptCount || 0,
          avg_score: avgScore,
          completion_rate: completionRate,
          estimated_duration: scenario.metadata?.estimated_duration || 300,
          user_best_score: userBestScore,
          user_attempt_count: userAttemptCount,
        }
      })
    )

    // Apply popularity sorting if requested (after enrichment)
    if (filters?.sortBy === 'popular') {
      enrichedScenarios.sort((a, b) => (b.attempt_count || 0) - (a.attempt_count || 0))
    }

    // Apply duration sorting if requested (after enrichment)
    if (filters?.sortBy === 'duration') {
      enrichedScenarios.sort((a, b) => (a.estimated_duration || 0) - (b.estimated_duration || 0))
    }

    return enrichedScenarios
  })
}

/**
 * Gets statistics for a specific scenario
 *
 * @param scenarioId - The ID of the scenario
 * @returns Detailed scenario statistics
 * @throws Error if scenario not found
 */
export async function getScenarioStats(scenarioId: string) {
  return withOrgGuard(async (user, orgId, supabase) => {

    // Verify scenario exists
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id, title, status')
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .single()

    if (scenarioError || !scenario) {
      throw new Error('Scenario not found')
    }

    // Get all completed attempts
    const { data: attempts, count: completedCount } = await supabase
      .from('scenario_attempts')
      .select('score, duration_seconds, started_at, kpis', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('scenario_id', scenarioId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })

    // Get total attempt count (including incomplete)
    const { count: totalAttempts } = await supabase
      .from('scenario_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('scenario_id', scenarioId)

    // Calculate statistics
    const avgScore = attempts && attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
      : 0

    const avgDuration = attempts && attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / attempts.length)
      : 0

    const completionRate = totalAttempts && totalAttempts > 0 && completedCount
      ? Math.round((completedCount / totalAttempts) * 100)
      : 0

    // Get unique users who attempted
    const { count: uniqueUsers } = await supabase
      .from('scenario_attempts')
      .select('clerk_user_id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('scenario_id', scenarioId)

    // Calculate score distribution
    const scoreRanges = {
      excellent: 0, // 90-100
      good: 0,      // 70-89
      fair: 0,      // 50-69
      poor: 0,      // 0-49
    }

    attempts?.forEach((attempt) => {
      const score = attempt.score || 0
      if (score >= 90) scoreRanges.excellent++
      else if (score >= 70) scoreRanges.good++
      else if (score >= 50) scoreRanges.fair++
      else scoreRanges.poor++
    })

    // Calculate average KPIs
    let avgTalkListenRatio = 50
    let avgFillerWords = 0
    let kpiCount = 0

    attempts?.forEach((attempt) => {
      if (attempt.kpis && typeof attempt.kpis === 'object') {
        const kpis = attempt.kpis as Record<string, unknown>
        const globalKPIs = kpis.global as Record<string, unknown> | undefined

        if (globalKPIs) {
          // Parse talk:listen ratio
          if (globalKPIs.talk_listen_ratio) {
            const ratio = globalKPIs.talk_listen_ratio as string
            const [talk] = ratio.split(':').map(Number)
            if (!isNaN(talk)) {
              avgTalkListenRatio += talk
              kpiCount++
            }
          }

          // Parse filler words
          if (typeof globalKPIs.filler_words === 'number') {
            avgFillerWords += globalKPIs.filler_words
          }
        }
      }
    })

    if (kpiCount > 0) {
      avgTalkListenRatio = Math.round(avgTalkListenRatio / kpiCount)
    }

    if (attempts && attempts.length > 0) {
      avgFillerWords = Math.round(avgFillerWords / attempts.length)
    }

    // Get recent attempts for trend
    const recentAttempts = (attempts || []).slice(0, 10).map((a) => ({
      score: a.score || 0,
      duration_seconds: a.duration_seconds || 0,
      started_at: a.started_at,
    }))

    return {
      scenario_id: scenarioId,
      scenario_title: scenario.title,
      total_attempts: totalAttempts || 0,
      completed_attempts: completedCount || 0,
      completion_rate: completionRate,
      unique_users: uniqueUsers || 0,
      avg_score: avgScore,
      avg_duration_seconds: avgDuration,
      score_distribution: scoreRanges,
      avg_kpis: {
        talk_listen_ratio: avgTalkListenRatio,
        filler_words: avgFillerWords,
      },
      recent_attempts: recentAttempts,
    }
  })
}

/**
 * Gets scenario categories available in the organization
 *
 * @returns Array of unique categories
 */
export async function getScenarioCategories(): Promise<string[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('category')
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`)
    }

    const categories = [...new Set(scenarios.map((s) => s.category).filter(Boolean))] as string[]
    return categories.sort()
  })
}

/**
 * Gets scenario industries available in the organization
 *
 * @returns Array of unique industries
 */
export async function getScenarioIndustries(): Promise<string[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('industry')
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)
      .not('industry', 'is', null)

    if (error) {
      throw new Error(`Failed to get industries: ${error.message}`)
    }

    const industries = [...new Set(scenarios.map((s) => s.industry).filter(Boolean))] as string[]
    return industries.sort()
  })
}

/**
 * Gets related scenarios based on category and industry
 *
 * @param scenarioId - The ID of the current scenario
 * @param limit - Maximum number of related scenarios to return
 * @returns Array of related scenarios
 */
export async function getRelatedScenarios(scenarioId: string, limit: number = 4): Promise<EnrichedScenario[]> {
  return withOrgGuard(async (user, orgId, supabase) => {
    // Get the current scenario
    const { data: currentScenario, error: currentError } = await supabase
      .from('scenarios')
      .select('category, industry')
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .single()

    if (currentError || !currentScenario) {
      return []
    }

    // Find scenarios with matching category or industry
    let query = supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${orgId}`)
      .neq('id', scenarioId) // Exclude the current scenario
      .limit(limit)

    // Prioritize same category and industry
    if (currentScenario.category && currentScenario.industry) {
      query = query.or(`category.eq.${currentScenario.category},industry.eq.${currentScenario.industry}`)
    } else if (currentScenario.category) {
      query = query.eq('category', currentScenario.category)
    } else if (currentScenario.industry) {
      query = query.eq('industry', currentScenario.industry)
    }

    const { data: scenarios, error } = await query

    if (error) {
      console.error('Failed to get related scenarios:', error)
      return []
    }

    // Enrich with basic stats
    const enrichedScenarios: EnrichedScenario[] = await Promise.all(
      (scenarios || []).map(async (scenario) => {
        const { count: attemptCount } = await supabase
          .from('scenario_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('scenario_id', scenario.id)
          .eq('status', 'completed')

        return {
          ...scenario,
          attempt_count: attemptCount || 0,
          avg_score: undefined,
          completion_rate: undefined,
          estimated_duration: scenario.metadata?.estimated_duration || 300,
          user_best_score: undefined,
          user_attempt_count: 0,
        }
      })
    )

    return enrichedScenarios
  })
}

/**
 * Gets tracks that contain a specific scenario
 *
 * @param scenarioId - The ID of the scenario
 * @returns Array of tracks containing this scenario
 */
export async function getTracksForScenario(scenarioId: string) {
  return withOrgGuard(async (user, orgId, supabase) => {
    const { data: trackScenarios, error } = await supabase
      .from('track_scenarios')
      .select(`
        track_id,
        position,
        tracks!inner (
          id,
          title,
          description,
          status,
          category,
          industry,
          created_at,
          updated_at,
          org_id
        )
      `)
      .eq('scenario_id', scenarioId)
      .eq('tracks.status', 'active')
      .eq('tracks.org_id', orgId)

    if (error) {
      console.error('Failed to get tracks for scenario:', error)
      return []
    }

    // Transform and enrich tracks
    const tracks = await Promise.all(
      (trackScenarios || []).map(async (ts: any) => {
        const track = ts.tracks

        // Get scenario count for this track
        const { count: scenarioCount } = await supabase
          .from('track_scenarios')
          .select('*', { count: 'exact', head: true })
          .eq('track_id', track.id)

        // Get enrollment count
        const { count: enrollmentCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('track_id', track.id)

        return {
          id: track.id,
          title: track.title,
          description: track.description,
          status: track.status,
          category: track.category,
          industry: track.industry,
          created_at: track.created_at,
          updated_at: track.updated_at,
          scenario_count: scenarioCount || 0,
          enrollment_count: enrollmentCount || 0,
          order_index: ts.position,
        }
      })
    )

    return tracks
  })
}

/**
 * Gets user-specific statistics for a scenario
 *
 * @param scenarioId - The ID of the scenario
 * @param clerkUserId - Optional user ID (defaults to current user)
 * @returns User-specific scenario statistics
 * @throws Error if scenario not found or permission denied
 */
export async function getUserScenarioStats(scenarioId: string, clerkUserId?: string) {
  return withOrgGuard(async (user, orgId, supabase) => {
    const targetClerkUserId = clerkUserId || user.id

    // Check permission to view other user's stats
    if (targetClerkUserId !== user.id && !['admin', 'manager', 'hr'].includes(user.role || '')) {
      throw new Error('Permission denied')
    }

    // Verify scenario exists
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id, title')
      .eq('id', scenarioId)
      .eq('org_id', orgId)
      .single()

    if (scenarioError || !scenario) {
      throw new Error('Scenario not found')
    }

    // Get user's completed attempts
    const { data: completedAttempts, count: completedCount } = await supabase
      .from('scenario_attempts')
      .select('score, duration_seconds, started_at', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('scenario_id', scenarioId)
      .eq('clerk_user_id', targetClerkUserId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })

    // Get total attempt count (including incomplete)
    const { count: totalAttempts } = await supabase
      .from('scenario_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('scenario_id', scenarioId)
      .eq('clerk_user_id', targetClerkUserId)

    // Calculate statistics
    const avgScore = completedAttempts && completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
      : 0

    const bestScore = completedAttempts && completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((a) => a.score || 0))
      : 0

    const completionRate = totalAttempts && totalAttempts > 0 && completedCount
      ? Math.round((completedCount / totalAttempts) * 100)
      : 0

    const lastAttemptAt = completedAttempts && completedAttempts.length > 0
      ? completedAttempts[0].started_at
      : null

    return {
      scenario_id: scenarioId,
      scenario_title: scenario.title,
      total_attempts: totalAttempts || 0,
      completed_attempts: completedCount || 0,
      avg_score: avgScore,
      best_score: bestScore,
      completion_rate: completionRate,
      last_attempt_at: lastAttemptAt,
    }
  })
}