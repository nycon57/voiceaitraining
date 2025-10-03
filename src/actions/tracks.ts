'use server'

import { withOrgGuard } from '@/lib/auth'
import { z } from 'zod'

/**
 * Filters for track queries
 */
export interface TrackFilters {
  category?: string
  industry?: string
  search?: string
  featured?: boolean
  sortBy?: 'newest' | 'popular' | 'title' | 'duration'
  limit?: number
  offset?: number
}

/**
 * Track with enriched data
 */
export interface EnrichedTrack {
  id: string
  org_id: string
  title: string
  description?: string
  status: string
  category?: string
  industry?: string
  featured?: boolean
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  scenario_count: number
  total_duration?: number
  enrollment_count?: number
  avg_completion_rate?: number
  user_enrolled?: boolean
  user_progress?: number
}

/**
 * Track with full scenario details
 */
export interface TrackWithScenarios extends EnrichedTrack {
  scenarios: Array<{
    id: string
    title: string
    description?: string
    difficulty?: string
    status: string
    order_index: number
    estimated_duration?: number
  }>
}

/**
 * Track progress for a user
 */
export interface TrackProgress {
  track_id: string
  track_title: string
  total_scenarios: number
  completed_scenarios: number
  progress_percentage: number
  current_scenario_index: number
  is_completed: boolean
  started_at?: string
  completed_at?: string
  scenario_progress: Array<{
    scenario_id: string
    scenario_title: string
    order_index: number
    attempts_count: number
    best_score: number | null
    is_completed: boolean
    last_attempt_at?: string
  }>
}

/**
 * Gets published tracks with optional filtering and sorting
 *
 * @param filters - Optional filters for category, industry, search, featured, sort, pagination
 * @returns Array of enriched tracks
 */
export async function getPublishedTracks(filters?: TrackFilters): Promise<EnrichedTrack[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    // Start building query
    let query = supabase
      .from('tracks')
      .select(`
        *,
        track_scenarios!inner (
          scenario_id,
          position,
          scenarios (
            id,
            difficulty,
            status
          )
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'active')

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.industry) {
      query = query.eq('industry', filters.industry)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.search) {
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
        // Note: This would require a join with enrollments table for accurate sorting
        // For now, default to created_at
        query = query.order('created_at', { ascending: false })
        break
      case 'duration':
        // Sort by scenario count as proxy for duration
        // Note: Actual duration would require aggregation
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

    const { data: tracks, error } = await query

    if (error) {
      throw new Error(`Failed to get tracks: ${error.message}`)
    }

    // Get user enrollments for these tracks
    const trackIds = tracks.map((t) => t.id)
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('track_id, progress, status')
      .eq('org_id', orgId)
      .eq('clerk_user_id', user.id)
      .in('track_id', trackIds)
      .eq('status', 'active')

    const enrollmentMap = new Map(
      enrollments?.map((e) => [e.track_id, e]) || []
    )

    // Transform and enrich tracks
    const enrichedTracks: EnrichedTrack[] = await Promise.all(
      tracks.map(async (track) => {
        const scenarioCount = track.track_scenarios?.length || 0
        const enrollment = enrollmentMap.get(track.id)

        // Get enrollment count for popularity
        const { count: enrollmentCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('track_id', track.id)

        // Calculate average completion rate
        const { data: completedEnrollments, count: totalEnrollments } = await supabase
          .from('enrollments')
          .select('status', { count: 'exact' })
          .eq('org_id', orgId)
          .eq('track_id', track.id)

        const completedCount = completedEnrollments?.filter((e) => e.status === 'completed').length || 0
        const avgCompletionRate = totalEnrollments && totalEnrollments > 0
          ? Math.round((completedCount / totalEnrollments) * 100)
          : 0

        return {
          id: track.id,
          org_id: track.org_id,
          title: track.title,
          description: track.description,
          status: track.status,
          category: track.category,
          industry: track.industry,
          featured: track.featured,
          metadata: track.metadata,
          created_at: track.created_at,
          updated_at: track.updated_at,
          scenario_count: scenarioCount,
          enrollment_count: enrollmentCount || 0,
          avg_completion_rate: avgCompletionRate,
          user_enrolled: !!enrollment,
          user_progress: enrollment?.progress || 0,
        }
      })
    )

    // Apply popularity sorting if requested (after enrichment)
    if (filters?.sortBy === 'popular') {
      enrichedTracks.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
    }

    return enrichedTracks
  })
}

/**
 * Gets detailed information about a specific track
 *
 * @param trackId - The ID of the track
 * @returns Track with full scenario details
 * @throws Error if track not found
 */
export async function getTrackDetails(trackId: string): Promise<TrackWithScenarios> {
  return withOrgGuard(async (user, orgId, supabase) => {

    // Get track with scenarios
    const { data: track, error } = await supabase
      .from('tracks')
      .select(`
        *,
        track_scenarios (
          scenario_id,
          position,
          scenarios (
            id,
            title,
            description,
            difficulty,
            status,
            estimated_duration
          )
        )
      `)
      .eq('id', trackId)
      .eq('org_id', orgId)
      .single()

    if (error || !track) {
      throw new Error('Track not found')
    }

    // Check if user is enrolled
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('track_id, progress, status')
      .eq('org_id', orgId)
      .eq('clerk_user_id', user.id)
      .eq('track_id', trackId)
      .eq('status', 'active')
      .maybeSingle()

    // Get enrollment statistics
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('track_id', trackId)

    // Calculate completion rate
    const { data: enrollments, count: totalEnrollments } = await supabase
      .from('enrollments')
      .select('status', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('track_id', trackId)

    const completedCount = enrollments?.filter((e) => e.status === 'completed').length || 0
    const avgCompletionRate = totalEnrollments && totalEnrollments > 0
      ? Math.round((completedCount / totalEnrollments) * 100)
      : 0

    // Transform scenarios with proper typing
    const scenarios = (track.track_scenarios || [])
      .map((ts: any) => ({
        id: ts.scenarios.id,
        title: ts.scenarios.title,
        description: ts.scenarios.description,
        difficulty: ts.scenarios.difficulty,
        status: ts.scenarios.status,
        order_index: ts.position,
        estimated_duration: ts.scenarios.estimated_duration,
      }))
      .sort((a: any, b: any) => a.order_index - b.order_index)

    // Calculate total duration
    const totalDuration = scenarios.reduce(
      (sum: number, s: { estimated_duration?: number }) => sum + (s.estimated_duration || 300),
      0
    )

    return {
      id: track.id,
      org_id: track.org_id,
      title: track.title,
      description: track.description,
      status: track.status,
      category: track.category,
      industry: track.industry,
      featured: track.featured,
      metadata: track.metadata,
      created_at: track.created_at,
      updated_at: track.updated_at,
      scenario_count: scenarios.length,
      total_duration: totalDuration,
      enrollment_count: enrollmentCount || 0,
      avg_completion_rate: avgCompletionRate,
      user_enrolled: !!enrollment,
      user_progress: enrollment?.progress || 0,
      scenarios,
    }
  })
}

/**
 * Gets user progress for a specific track
 *
 * @param trackId - The ID of the track
 * @param userId - Optional user ID (defaults to current user)
 * @returns Detailed track progress with scenario completion status
 * @throws Error if track not found or permission denied
 */
export async function getTrackProgress(trackId: string, userId?: string): Promise<TrackProgress> {
  return withOrgGuard(async (user, orgId, supabase) => {
    const targetUserId = userId || user.id

    // Check permission to view other user's progress
    if (targetUserId !== user.id && !['admin', 'manager', 'hr'].includes(user.role || '')) {
      throw new Error('Permission denied')
    }

    // Get track with scenarios
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        track_scenarios!inner (
          scenario_id,
          position,
          scenarios (
            id,
            title
          )
        )
      `)
      .eq('id', trackId)
      .eq('org_id', orgId)
      .single()

    if (trackError || !track) {
      throw new Error('Track not found')
    }

    // Get enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('started_at, completed_at, status')
      .eq('org_id', orgId)
      .eq('clerk_user_id', targetUserId)
      .eq('track_id', trackId)
      .maybeSingle()

    // Get all scenarios in order
    const trackScenarios = (track.track_scenarios || [])
      .map((ts: any) => ({
        scenario_id: ts.scenario_id,
        scenario_title: ts.scenarios.title,
        order_index: ts.position,
      }))
      .sort((a, b) => a.order_index - b.order_index)

    const scenarioIds = trackScenarios.map((ts) => ts.scenario_id)

    // Get attempts for all scenarios in track
    const { data: attempts } = await supabase
      .from('scenario_attempts')
      .select('scenario_id, score, status, started_at')
      .eq('org_id', orgId)
      .eq('clerk_user_id', targetUserId)
      .in('scenario_id', scenarioIds)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })

    // Build scenario progress map
    const scenarioProgressMap = new Map<string, {
      attempts_count: number
      best_score: number | null
      last_attempt_at: string | undefined
    }>()

    attempts?.forEach((attempt) => {
      const existing = scenarioProgressMap.get(attempt.scenario_id)
      if (!existing) {
        scenarioProgressMap.set(attempt.scenario_id, {
          attempts_count: 1,
          best_score: attempt.score || 0,
          last_attempt_at: attempt.started_at,
        })
      } else {
        existing.attempts_count++
        existing.best_score = Math.max(existing.best_score || 0, attempt.score || 0)
        // Keep most recent attempt date
        if (!existing.last_attempt_at || attempt.started_at > existing.last_attempt_at) {
          existing.last_attempt_at = attempt.started_at
        }
      }
    })

    // Build scenario progress array
    const scenarioProgress = trackScenarios.map((ts) => {
      const progress = scenarioProgressMap.get(ts.scenario_id)
      return {
        scenario_id: ts.scenario_id,
        scenario_title: ts.scenario_title,
        order_index: ts.order_index,
        attempts_count: progress?.attempts_count || 0,
        best_score: progress?.best_score || null,
        is_completed: (progress?.attempts_count || 0) > 0 && (progress?.best_score || 0) >= 70,
        last_attempt_at: progress?.last_attempt_at,
      }
    })

    // Calculate overall progress
    const completedScenarios = scenarioProgress.filter((sp) => sp.is_completed).length
    const totalScenarios = scenarioProgress.length
    const progressPercentage = totalScenarios > 0
      ? Math.round((completedScenarios / totalScenarios) * 100)
      : 0

    // Find current scenario index (first incomplete scenario)
    const currentScenarioIndex = scenarioProgress.findIndex((sp) => !sp.is_completed)

    return {
      track_id: trackId,
      track_title: track.title,
      total_scenarios: totalScenarios,
      completed_scenarios: completedScenarios,
      progress_percentage: progressPercentage,
      current_scenario_index: currentScenarioIndex === -1 ? totalScenarios - 1 : currentScenarioIndex,
      is_completed: completedScenarios === totalScenarios && totalScenarios > 0,
      started_at: enrollment?.started_at,
      completed_at: enrollment?.completed_at,
      scenario_progress: scenarioProgress,
    }
  })
}

/**
 * Gets track categories available in the organization
 *
 * @returns Array of unique categories
 */
export async function getTrackCategories(): Promise<string[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('category')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`)
    }

    const categories = [...new Set(tracks.map((t) => t.category).filter(Boolean))] as string[]
    return categories.sort()
  })
}

/**
 * Gets track industries available in the organization
 *
 * @returns Array of unique industries
 */
export async function getTrackIndustries(): Promise<string[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('industry')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .not('industry', 'is', null)

    if (error) {
      throw new Error(`Failed to get industries: ${error.message}`)
    }

    const industries = [...new Set(tracks.map((t) => t.industry).filter(Boolean))] as string[]
    return industries.sort()
  })
}