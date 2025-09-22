'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  plan: z.enum(['starter', 'growth', 'enterprise']).default('starter'),
})

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  plan: z.enum(['starter', 'growth', 'enterprise']).optional(),
  metadata: z.record(z.any()).optional(),
})

export async function createOrganization(formData: FormData) {
  const data = createOrgSchema.parse({
    name: formData.get('name'),
    plan: formData.get('plan'),
  })

  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('orgs')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create organization: ${error.message}`)
  }

  return org
}

export async function updateOrganization(formData: FormData) {
  const data = updateOrgSchema.parse({
    name: formData.get('name'),
    plan: formData.get('plan'),
    metadata: formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined,
  })

  return withRoleGuard(['admin'], async (user, orgId) => {
    const supabase = await createClient()

    const { data: org, error } = await supabase
      .from('orgs')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`)
    }

    revalidatePath('/org/[orgId]/settings', 'page')
    return org
  })
}

export async function getOrganization() {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: org, error } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', orgId)
      .single()

    if (error) {
      throw new Error(`Failed to get organization: ${error.message}`)
    }

    return org
  })
}

export async function getOrganizationMembers() {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: members, error } = await supabase
      .from('org_members')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get organization members: ${error.message}`)
    }

    return members
  })
}