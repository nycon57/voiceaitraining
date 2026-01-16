'use server'

import { assertHuman } from '@/lib/botid'
import { withOrgGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

/**
 * Schema for enrollment creation
 * Validates that either scenarioId or trackId is provided based on type
 */
const enrollSchema = z.object({
  type: z.enum(['scenario', 'track']),
  scenarioId: z.string().uuid().optional(),
  trackId: z.string().uuid().optional(),
}).refine(
  (data) => {
    if (data.type === 'scenario') return !!data.scenarioId
    if (data.type === 'track') return !!data.trackId
    return false
  },
  { message: 'scenarioId required for scenario type, trackId required for track type' }
)

export type EnrollInput = z.infer<typeof enrollSchema>

/**
 * Interface for enriched enrollment data
 */
export interface EnrichedEnrollment {
  id: string
  org_id: string
  clerk_user_id: string
  type: 'scenario' | 'track'
  scenario_id?: string
  track_id?: string
  status: 'active' | 'completed' | 'paused'
  progress: number
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
  scenario?: {
    id: string
    title: string
    description?: string
    difficulty?: string
    status: string
  }
  track?: {
    id: string
    title: string
    description?: string
    status: string
    scenario_count?: number
  }
  attempts_count?: number
  best_score?: number
}

/**
 * Helper to compute enrollment status from database fields
 */
function computeEnrollmentStatus(completedAt: string | null, progressPercentage: number): 'active' | 'completed' | 'paused' {
  if (completedAt) return 'completed'
  if (progressPercentage > 0) return 'active'
  return 'active' // Default to active for new enrollments
}

/**
 * Enrolls the current user in a scenario or track
 *
 * @param data - Enrollment data containing type and scenario/track ID
 * @returns The created enrollment with enriched data
 * @throws Error if enrollment validation fails or duplicate exists
 */
export async function enrollUser(data: EnrollInput) {
  await assertHuman()

  const validatedData = enrollSchema.parse(data)

  return withOrgGuard(async (user, orgId, supabase) => {

    // Verify that scenario or track exists and is active
    if (validatedData.type === 'scenario' && validatedData.scenarioId) {
      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .select('id, status')
        .eq('id', validatedData.scenarioId)
        .eq('org_id', orgId)
        .single()

      if (scenarioError || !scenario) {
        throw new Error('Scenario not found')
      }

      if (scenario.status !== 'active') {
        throw new Error('Cannot enroll in inactive scenario')
      }

      // Check for duplicate enrollment
      const { data: existingEnrollment } = await supabase
        .from('user_enrollments')
        .select('id, completed_at')
        .eq('org_id', orgId)
        .eq('clerk_user_id', user.id)
        .eq('scenario_id', validatedData.scenarioId)
        .is('completed_at', null) // Not completed
        .maybeSingle()

      if (existingEnrollment) {
        throw new Error('Already enrolled in this scenario')
      }
    }

    if (validatedData.type === 'track' && validatedData.trackId) {
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('id, status')
        .eq('id', validatedData.trackId)
        .eq('org_id', orgId)
        .single()

      if (trackError || !track) {
        throw new Error('Track not found')
      }

      if (track.status !== 'active') {
        throw new Error('Cannot enroll in inactive track')
      }

      // Check for duplicate enrollment
      const { data: existingEnrollment } = await supabase
        .from('user_enrollments')
        .select('id, completed_at')
        .eq('org_id', orgId)
        .eq('clerk_user_id', user.id)
        .eq('track_id', validatedData.trackId)
        .is('completed_at', null) // Not completed
        .maybeSingle()

      if (existingEnrollment) {
        throw new Error('Already enrolled in this track')
      }
    }

    // Create the enrollment
    const { data: enrollment, error } = await supabase
      .from('user_enrollments')
      .insert({
        org_id: orgId,
        clerk_user_id: user.id,
        type: validatedData.type,
        scenario_id: validatedData.scenarioId,
        track_id: validatedData.trackId,
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create enrollment: ${error.message}`)
    }

    // Fetch enriched enrollment data
    const enrichedEnrollment = await getEnrollmentDetails(enrollment.id)

    revalidatePath('/training')
    revalidatePath('/dashboard')

    return enrichedEnrollment
  })
}

/**
 * Unenrolls a user from a scenario or track
 *
 * @param enrollmentId - The ID of the enrollment to remove
 * @returns Success status
 * @throws Error if enrollment not found or permission denied
 */
export async function unenrollUser(enrollmentId: string) {
  await assertHuman()

  return withOrgGuard(async (user, orgId, supabase) => {

    // Verify user owns this enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('user_enrollments')
      .select('id, clerk_user_id, completed_at')
      .eq('id', enrollmentId)
      .eq('org_id', orgId)
      .single()

    if (enrollmentError || !enrollment) {
      throw new Error('Enrollment not found')
    }

    if (enrollment.clerk_user_id !== user.id) {
      throw new Error('Permission denied')
    }

    // Delete the enrollment (or update status to 'cancelled')
    const { error } = await supabase
      .from('user_enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to unenroll: ${error.message}`)
    }

    revalidatePath('/training')
    revalidatePath('/dashboard')

    return { success: true }
  })
}

/**
 * Gets all enrollments for a user
 *
 * @param userId - Optional user ID to fetch enrollments for (defaults to current user)
 * @returns Array of enriched enrollments with attempt statistics
 * @throws Error if permission denied (non-admin viewing other user's enrollments)
 */
export async function getUserEnrollments(userId?: string): Promise<EnrichedEnrollment[]> {
  return withOrgGuard(async (user, orgId, supabase) => {
    const targetUserId = userId || user.id

    console.log('[DEBUG] getUserEnrollments - Query parameters:', {
      currentUser: user.id,
      currentUserRole: user.role,
      targetUserId,
      orgId,
    })

    // Check permission to view other user's enrollments
    if (targetUserId !== user.id && !['admin', 'manager', 'hr'].includes(user.role || '')) {
      console.error('[DEBUG] getUserEnrollments - Permission denied for user:', user.id)
      throw new Error('Permission denied')
    }

    console.log('[DEBUG] getUserEnrollments - Executing Supabase query:', {
      table: 'user_enrollments',
      filters: {
        org_id: orgId,
        clerk_user_id: targetUserId,
      },
    })

    // Get enrollments with related data
    const { data: enrollments, error } = await supabase
      .from('user_enrollments')
      .select(`
        *,
        scenarios (
          id,
          title,
          description,
          difficulty,
          status
        ),
        tracks (
          id,
          title,
          description,
          status
        )
      `)
      .eq('org_id', orgId)
      .eq('clerk_user_id', targetUserId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('[DEBUG] getUserEnrollments - Query failed with error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      })
      throw new Error(`Failed to get enrollments: ${error.message}`)
    }

    console.log('[DEBUG] getUserEnrollments - Query succeeded, found', enrollments?.length || 0, 'enrollments')

    // Enrich with attempt statistics
    const enrichedEnrollments: EnrichedEnrollment[] = await Promise.all(
      enrollments.map(async (enrollment) => {
        let attemptsCount = 0
        let bestScore: number | null = null
        let scenarioCount = 1

        if (enrollment.type === 'scenario' && enrollment.scenario_id) {
          // Get attempts for this scenario
          const { data: attempts } = await supabase
            .from('scenario_attempts')
            .select('score, status')
            .eq('org_id', orgId)
            .eq('clerk_user_id', targetUserId)
            .eq('scenario_id', enrollment.scenario_id)
            .eq('status', 'completed')

          attemptsCount = attempts?.length || 0
          bestScore = attempts?.reduce(
            (max, attempt) => Math.max(max, attempt.score || 0),
            0
          ) || null
        } else if (enrollment.type === 'track' && enrollment.track_id) {
          // Get track scenarios
          const { data: trackScenarios } = await supabase
            .from('track_scenarios')
            .select('scenario_id')
            .eq('track_id', enrollment.track_id)
            .order('order_index', { ascending: true })

          scenarioCount = trackScenarios?.length || 0

          if (trackScenarios && trackScenarios.length > 0) {
            const scenarioIds = trackScenarios.map((ts) => ts.scenario_id)

            // Get attempts for all scenarios in track
            const { data: attempts } = await supabase
              .from('scenario_attempts')
              .select('scenario_id, score, status')
              .eq('org_id', orgId)
              .eq('clerk_user_id', targetUserId)
              .in('scenario_id', scenarioIds)
              .eq('status', 'completed')

            attemptsCount = attempts?.length || 0

            // Get best average score
            if (attempts && attempts.length > 0) {
              const avgScore = attempts.reduce(
                (sum, attempt) => sum + (attempt.score || 0),
                0
              ) / attempts.length
              bestScore = Math.round(avgScore)
            }
          }
        }

        return {
          ...enrollment,
          // Map database fields to interface
          status: computeEnrollmentStatus(enrollment.completed_at, enrollment.progress_percentage || 0),
          progress: enrollment.progress_percentage || 0,
          started_at: enrollment.enrolled_at,
          // Add enriched data
          attempts_count: attemptsCount,
          best_score: bestScore,
          track: enrollment.tracks ? {
            ...enrollment.tracks,
            scenario_count: scenarioCount,
          } : undefined,
          tracks: undefined, // Remove raw join data
        } as EnrichedEnrollment
      })
    )

    return enrichedEnrollments
  })
}

/**
 * Updates enrollment progress percentage
 *
 * @param enrollmentId - The ID of the enrollment to update
 * @param progress - Progress percentage (0-100)
 * @returns Updated enrollment
 * @throws Error if enrollment not found or permission denied
 */
export async function updateEnrollmentProgress(enrollmentId: string, progress: number) {
  await assertHuman()

  return withOrgGuard(async (user, orgId, supabase) => {

    // Validate progress value
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100')
    }

    // Verify user owns this enrollment
    const { data: existingEnrollment } = await supabase
      .from('user_enrollments')
      .select('clerk_user_id')
      .eq('id', enrollmentId)
      .eq('org_id', orgId)
      .single()

    if (!existingEnrollment) {
      throw new Error('Enrollment not found')
    }

    if (existingEnrollment.clerk_user_id !== user.id) {
      throw new Error('Permission denied')
    }

    // Update progress
    const { data: enrollment, error } = await supabase
      .from('user_enrollments')
      .update({
        progress_percentage: progress,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`)
    }

    revalidatePath('/training')
    return enrollment
  })
}

/**
 * Marks an enrollment as completed
 *
 * @param enrollmentId - The ID of the enrollment to complete
 * @returns Updated enrollment
 * @throws Error if enrollment not found or permission denied
 */
export async function markEnrollmentComplete(enrollmentId: string) {
  await assertHuman()

  return withOrgGuard(async (user, orgId, supabase) => {

    // Verify user owns this enrollment
    const { data: existingEnrollment } = await supabase
      .from('user_enrollments')
      .select('clerk_user_id, completed_at')
      .eq('id', enrollmentId)
      .eq('org_id', orgId)
      .single()

    if (!existingEnrollment) {
      throw new Error('Enrollment not found')
    }

    if (existingEnrollment.clerk_user_id !== user.id) {
      throw new Error('Permission denied')
    }

    if (existingEnrollment.completed_at) {
      throw new Error('Enrollment already completed')
    }

    // Mark as completed
    const { data: enrollment, error } = await supabase
      .from('user_enrollments')
      .update({
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to mark enrollment complete: ${error.message}`)
    }

    revalidatePath('/training')
    revalidatePath('/dashboard')

    return enrollment
  })
}

/**
 * Gets detailed enrollment information including related data
 *
 * @param enrollmentId - The ID of the enrollment
 * @returns Enriched enrollment data
 * @throws Error if enrollment not found
 */
async function getEnrollmentDetails(enrollmentId: string): Promise<EnrichedEnrollment> {
  const supabase = await createClient()

  const { data: enrollment, error } = await supabase
    .from('user_enrollments')
    .select(`
      *,
      scenarios (
        id,
        title,
        description,
        difficulty,
        status
      ),
      tracks (
        id,
        title,
        description,
        status
      )
    `)
    .eq('id', enrollmentId)
    .single()

  if (error || !enrollment) {
    throw new Error('Enrollment not found')
  }

  // Get scenario count for tracks
  let scenarioCount = 1
  if (enrollment.type === 'track' && enrollment.track_id) {
    const { data: trackScenarios } = await supabase
      .from('track_scenarios')
      .select('scenario_id')
      .eq('track_id', enrollment.track_id)

    scenarioCount = trackScenarios?.length || 0
  }

  return {
    ...enrollment,
    // Map database fields to interface
    status: computeEnrollmentStatus(enrollment.completed_at, enrollment.progress_percentage || 0),
    progress: enrollment.progress_percentage || 0,
    started_at: enrollment.enrolled_at,
    track: enrollment.tracks ? {
      ...enrollment.tracks,
      scenario_count: scenarioCount,
    } : undefined,
    tracks: undefined,
  } as EnrichedEnrollment
}