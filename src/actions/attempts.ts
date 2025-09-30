'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createAttemptSchema = z.object({
  scenario_id: z.string().uuid(),
  assignment_id: z.string().uuid().optional(),
  user_id: z.string(),
  org_id: z.string().uuid(),
})

const updateAttemptSchema = z.object({
  ended_at: z.string().optional(),
  duration_seconds: z.number().optional(),
  vapi_call_id: z.string().optional(),
  recording_url: z.string().optional(),
  recording_path: z.string().optional(),
  transcript_text: z.string().optional(),
  transcript_json: z.string().optional(),
  transcript_path: z.string().optional(),
  score: z.number().optional(),
  score_breakdown: z.record(z.string(), z.unknown()).optional(),
  kpis: z.record(z.string(), z.unknown()).optional(),
  feedback_text: z.string().optional(),
  feedback_json: z.record(z.string(), z.unknown()).optional(),
  manager_comments: z.string().optional(),
  status: z.enum(['in_progress', 'completed', 'failed']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function createAttempt(data: z.infer<typeof createAttemptSchema>) {
  const validatedData = createAttemptSchema.parse(data)

  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Verify the scenario exists and user has access
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id, status')
      .eq('id', validatedData.scenario_id)
      .eq('org_id', orgId)
      .single()

    if (scenarioError || !scenario) {
      throw new Error('Scenario not found or access denied')
    }

    if (scenario.status !== 'active') {
      throw new Error('Scenario is not active')
    }

    // Create the attempt
    const { data: attempt, error } = await supabase
      .from('scenario_attempts')
      .insert({
        ...validatedData,
        org_id: orgId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create attempt: ${error.message}`)
    }

    revalidatePath('/attempts', 'page')
    return attempt
  })
}

export async function updateAttempt(
  attemptId: string,
  data: z.infer<typeof updateAttemptSchema>
) {
  const validatedData = updateAttemptSchema.parse(data)

  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Verify the attempt exists and user has access
    const { data: existingAttempt, error: attemptError } = await supabase
      .from('scenario_attempts')
      .select('id, user_id, org_id')
      .eq('id', attemptId)
      .eq('org_id', orgId)
      .single()

    if (attemptError || !existingAttempt) {
      throw new Error('Attempt not found or access denied')
    }

    // Check if user can update this attempt
    const canUpdate = existingAttempt.user_id === user.id ||
                     user.role === 'admin' ||
                     user.role === 'manager'

    if (!canUpdate) {
      throw new Error('Permission denied to update this attempt')
    }

    // Update the attempt
    const { data: attempt, error } = await supabase
      .from('scenario_attempts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update attempt: ${error.message}`)
    }

    revalidatePath('/attempts', 'page')
    revalidatePath(`/attempts/${attemptId}`, 'page')
    return attempt
  })
}

export async function scoreAttempt(attemptId: string) {
  const { calculateGlobalKPIs, calculateScenarioKPIs, calculateOverallScore, generateAIFeedback } = await import('@/lib/ai/scoring')

  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Get the attempt with scenario data
    const { data: attempt, error: attemptError } = await supabase
      .from('scenario_attempts')
      .select(`
        *,
        scenarios!inner(
          id, title, description, persona, ai_prompt,
          scoring_rubric, difficulty
        )
      `)
      .eq('id', attemptId)
      .eq('org_id', orgId)
      .single()

    if (attemptError || !attempt) {
      throw new Error('Attempt not found or access denied')
    }

    if (attempt.status !== 'completed' || !attempt.transcript_json) {
      throw new Error('Attempt is not ready for scoring')
    }

    try {
      // Parse transcript
      const transcript = JSON.parse(attempt.transcript_json)
      const duration = attempt.duration_seconds ?? 0

      // Calculate KPIs
      const globalKPIs = calculateGlobalKPIs(transcript, duration)

      const scenarioConfig = {
        required_phrases: attempt.scenarios.scoring_rubric?.required_phrases ?? [],
        objection_keywords: attempt.scenarios.scoring_rubric?.objection_keywords ?? [],
        primary_goal: attempt.scenarios.scoring_rubric?.primary_goal,
        secondary_goals: attempt.scenarios.scoring_rubric?.secondary_goals ?? []
      }

      const scenarioKPIs = calculateScenarioKPIs(transcript, scenarioConfig)

      // Calculate score
      const rubric = {
        global_weights: attempt.scenarios.scoring_rubric?.global_weights ?? {
          talk_listen_ratio: 15,
          filler_words: 10,
          interruptions: 10,
          speaking_pace: 10,
          sentiment: 10,
          response_time: 5
        },
        scenario_weights: attempt.scenarios.scoring_rubric?.scenario_weights ?? {
          required_phrases: 15,
          objection_handling: 10,
          open_questions: 10,
          goal_achievement: 25
        },
        max_score: 100
      }

      const scoreResult = calculateOverallScore(globalKPIs, scenarioKPIs, rubric)

      // Generate AI feedback
      const feedback = await generateAIFeedback(
        transcript,
        globalKPIs,
        scenarioKPIs,
        attempt.scenarios,
        scoreResult.total_score
      )

      // Update attempt with scoring results
      const { data: updatedAttempt, error: updateError } = await supabase
        .from('scenario_attempts')
        .update({
          score: scoreResult.total_score,
          score_breakdown: scoreResult.breakdown,
          kpis: {
            global: globalKPIs,
            scenario: scenarioKPIs
          },
          feedback_json: feedback,
          feedback_text: `${feedback.summary}\n\nStrengths:\n${feedback.strengths.map(s => `• ${s.area}: ${s.description}`).join('\n')}\n\nAreas for Improvement:\n${feedback.improvements.map(i => `• ${i.area}: ${i.description} - ${i.suggestion}`).join('\n')}\n\nNext Steps:\n${feedback.next_steps.map(step => `• ${step}`).join('\n')}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', attemptId)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to save scoring results: ${updateError.message}`)
      }

      // Trigger webhooks for scoring events
      try {
        const { triggerScenarioCompleted, triggerAttemptScoredLow, triggerAttemptScoredHigh } = await import('@/lib/webhooks')

        // Get org and user data for webhooks
        const { data: org } = await supabase
          .from('orgs')
          .select('name')
          .eq('id', orgId)
          .single()

        const { data: userData } = await supabase
          .from('org_members')
          .select(`
            users!inner(id, name, email)
          `)
          .eq('org_id', orgId)
          .eq('user_id', updatedAttempt.user_id)
          .single()

        const users = userData?.users as unknown as { id: string; name: string; email: string } | undefined
        const webhookUser = users ? {
          id: users.id,
          name: users.name,
          email: users.email,
          role: 'trainee' as const // Default role for webhook payload
        } : null

        // Trigger scenario completed webhook
        if (webhookUser) {
          await triggerScenarioCompleted(
            orgId,
            org?.name || 'Unknown Organization',
            webhookUser,
            attempt.scenarios,
            updatedAttempt
          )

          // Trigger score-specific webhooks
          if (scoreResult.total_score < 60) {
            await triggerAttemptScoredLow(
              orgId,
              org?.name || 'Unknown Organization',
              webhookUser,
              attempt.scenarios,
              updatedAttempt
            )
          } else if (scoreResult.total_score >= 80) {
            await triggerAttemptScoredHigh(
              orgId,
              org?.name || 'Unknown Organization',
              webhookUser,
              attempt.scenarios,
              updatedAttempt
            )
          }
        }
      } catch (webhookError) {
        console.error('Failed to trigger webhooks:', webhookError)
        // Don't fail the scoring process if webhooks fail
      }

      revalidatePath(`/attempts/${attemptId}`, 'page')
      return updatedAttempt
    } catch (error) {
      console.error('Scoring error:', error)
      throw new Error(`Failed to score attempt: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
}

export async function getAttempts(filters?: {
  user_id?: string
  scenario_id?: string
  status?: string
  limit?: number
  offset?: number
}) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    let query = supabase
      .from('scenario_attempts')
      .select(`
        *,
        scenarios!inner(id, title, difficulty),
        assignments(id, due_at)
      `)
      .eq('org_id', orgId)

    // Apply filters
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters?.scenario_id) {
      query = query.eq('scenario_id', filters.scenario_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // Role-based access control
    if (user.role === 'trainee') {
      query = query.eq('user_id', user.id)
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    query = query.order('started_at', { ascending: false })

    const { data: attempts, error } = await query

    if (error) {
      throw new Error(`Failed to get attempts: ${error.message}`)
    }

    return attempts
  })
}

export async function getAttempt(attemptId: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: attempt, error } = await supabase
      .from('scenario_attempts')
      .select(`
        *,
        scenarios!inner(id, title, description, persona, difficulty),
        assignments(id, due_at, created_by)
      `)
      .eq('id', attemptId)
      .eq('org_id', orgId)
      .single()

    if (error) {
      throw new Error(`Failed to get attempt: ${error.message}`)
    }

    // Check access permissions
    const canView = attempt.user_id === user.id ||
                   user.role === 'admin' ||
                   user.role === 'manager' ||
                   user.role === 'hr'

    if (!canView) {
      throw new Error('Permission denied to view this attempt')
    }

    return attempt
  })
}

export async function deleteAttempt(attemptId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('scenario_attempts')
      .delete()
      .eq('id', attemptId)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to delete attempt: ${error.message}`)
    }

    revalidatePath('/attempts', 'page')
    return { success: true }
  })
}

export async function addManagerComment(attemptId: string, comment: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    const { data: attempt, error } = await supabase
      .from('scenario_attempts')
      .update({
        manager_comments: comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`)
    }

    revalidatePath(`/attempts/${attemptId}`, 'page')
    return attempt
  })
}

// Get user's attempt statistics
export async function getUserAttemptStats(userId?: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()
    const targetUserId = userId || user.id

    // Check permission to view other user's stats
    if (targetUserId !== user.id && !['admin', 'manager', 'hr'].includes(user.role || '')) {
      throw new Error('Permission denied')
    }

    const { data: stats, error } = await supabase
      .from('scenario_attempts')
      .select('score, status, duration_seconds, started_at')
      .eq('org_id', orgId)
      .eq('user_id', targetUserId)
      .eq('status', 'completed')

    if (error) {
      throw new Error(`Failed to get user stats: ${error.message}`)
    }

    // Calculate statistics
    const completed = stats.length
    const averageScore = completed > 0 ?
      stats.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completed : 0
    const totalDuration = stats.reduce((sum, attempt) => sum + (attempt.duration_seconds || 0), 0)

    // Get recent performance trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAttempts = stats.filter(attempt =>
      new Date(attempt.started_at) >= thirtyDaysAgo
    )

    return {
      total_completed: completed,
      average_score: Math.round(averageScore * 100) / 100,
      total_duration_minutes: Math.round(totalDuration / 60),
      recent_attempts: recentAttempts.length,
      recent_average_score: recentAttempts.length > 0 ?
        Math.round((recentAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / recentAttempts.length) * 100) / 100 : 0
    }
  })
}