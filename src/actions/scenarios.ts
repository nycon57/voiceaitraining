'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
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

  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

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

  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

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
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get scenarios: ${error.message}`)
    }

    return scenarios
  })
}

export async function getScenario(scenarioId: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

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
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

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
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

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
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('id, title, description, difficulty, status, created_at, persona')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get latest scenarios: ${error.message}`)
    }

    return scenarios
  })
}

export async function getLatestActiveTracks(limit: number = 10) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: tracks, error } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        track_scenarios (
          scenario_id
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get latest tracks: ${error.message}`)
    }

    // Transform to include scenario count
    return tracks.map(track => ({
      ...track,
      scenario_count: track.track_scenarios?.length || 0,
      track_scenarios: undefined // Remove the raw join data
    }))
  })
}