'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { z } from 'zod'

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0),
})

export async function getAgentActivityForUser(
  userId: string,
  limit = 50,
  offset = 0,
) {
  const { limit: validLimit, offset: validOffset } = paginationSchema.parse({ limit, offset })

  return withOrgGuard(async (_user, orgId, supabase) => {
    const { data, error } = await supabase
      .from('agent_activity_log')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(validOffset, validOffset + validLimit - 1)

    if (error) {
      throw new Error(`Failed to fetch agent activity for user: ${error.message}`)
    }

    return data
  })
}

export async function getAgentActivityForOrg(limit = 50, offset = 0) {
  const { limit: validLimit, offset: validOffset } = paginationSchema.parse({ limit, offset })

  return withRoleGuard(['manager', 'admin'], async (_user, orgId, supabase) => {
    const { data, error } = await supabase
      .from('agent_activity_log')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(validOffset, validOffset + validLimit - 1)

    if (error) {
      throw new Error(`Failed to fetch agent activity for org: ${error.message}`)
    }

    return data
  })
}
