'use server'

import { z } from 'zod'

import { generateCoachingBrief, type CoachingBrief } from '@/lib/agents/manager/coaching-brief'
import { withRoleGuard } from '@/lib/auth'

const traineeIdSchema = z.string().min(1, 'traineeId is required')
const BATCH_SIZE = 5

/** Get a coaching brief for a specific trainee. Requires manager or admin role. */
export async function getCoachingBrief(traineeId: string): Promise<CoachingBrief> {
  const validated = traineeIdSchema.parse(traineeId)

  return withRoleGuard(['manager', 'admin'], (user, orgId) =>
    generateCoachingBrief(orgId, user.id, validated),
  )
}

/** Get coaching briefs for all trainees in the org. Requires manager or admin role. */
export async function getTeamBriefs(): Promise<CoachingBrief[]> {
  return withRoleGuard(['manager', 'admin'], async (user, orgId, supabase) => {
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

    const briefs: CoachingBrief[] = []
    for (let i = 0; i < traineeIds.length; i += BATCH_SIZE) {
      const batch = traineeIds.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((id) => generateCoachingBrief(orgId, user.id, id)),
      )
      briefs.push(...results)
    }

    return briefs
  })
}
