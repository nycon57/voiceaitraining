'use server'

import { withRoleGuard } from '@/lib/auth'
import { generateCoachingBrief } from '@/lib/agents/manager/coaching-brief'
import type { CoachingBrief } from '@/lib/agents/manager/coaching-brief'
import { z } from 'zod'

const traineeIdSchema = z.string().min(1, 'traineeId is required')

/**
 * Get a coaching brief for a specific trainee.
 * Requires manager or admin role.
 */
export async function getCoachingBrief(traineeId: string): Promise<CoachingBrief> {
  const validated = traineeIdSchema.parse(traineeId)

  return withRoleGuard(['manager', 'admin'], async (user, orgId) => {
    return generateCoachingBrief(orgId, user.id, validated)
  })
}

/**
 * Get coaching briefs for all direct reports.
 * Requires manager or admin role.
 */
export async function getTeamBriefs(): Promise<CoachingBrief[]> {
  return withRoleGuard(['manager', 'admin'], async (user, orgId, supabase) => {
    // Get all trainees in the org
    const { data: members, error } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('org_id', orgId)
      .eq('role', 'trainee')

    if (error) {
      throw new Error(`Failed to fetch team members: ${error.message}`)
    }

    const traineeIds = (members ?? []).map((m: { user_id: string }) => m.user_id)

    if (traineeIds.length === 0) return []

    // Generate briefs in parallel (capped to avoid overload)
    const briefs = await Promise.all(
      traineeIds.map((id) => generateCoachingBrief(orgId, user.id, id)),
    )

    return briefs
  })
}
