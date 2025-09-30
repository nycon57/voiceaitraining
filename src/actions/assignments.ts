'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createAssignmentSchema = z.object({
  assignee_user_id: z.string(),
  type: z.enum(['scenario', 'track']),
  scenario_id: z.string().uuid().optional(),
  track_id: z.string().uuid().optional(),
  due_at: z.string().optional(),
  required: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (data) => {
    if (data.type === 'scenario') return !!data.scenario_id
    if (data.type === 'track') return !!data.track_id
    return false
  },
  {
    message: 'scenario_id required when type is "scenario", track_id required when type is "track"',
  }
)

const updateAssignmentSchema = z.object({
  due_at: z.string().optional(),
  required: z.boolean().optional(),
  completed_at: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function createAssignment(data: z.infer<typeof createAssignmentSchema>) {
  const validatedData = createAssignmentSchema.parse(data)

  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    // Verify the assignee user exists in the org
    const { data: assignee, error: assigneeError } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('org_id', orgId)
      .eq('user_id', validatedData.assignee_user_id)
      .single()

    if (assigneeError || !assignee) {
      throw new Error('Assignee user not found in organization')
    }

    // Verify the scenario or track exists
    if (validatedData.type === 'scenario' && validatedData.scenario_id) {
      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .select('id, status')
        .eq('id', validatedData.scenario_id)
        .eq('org_id', orgId)
        .single()

      if (scenarioError || !scenario) {
        throw new Error('Scenario not found')
      }

      if (scenario.status !== 'active') {
        throw new Error('Cannot assign inactive scenario')
      }
    }

    if (validatedData.type === 'track' && validatedData.track_id) {
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('id, status')
        .eq('id', validatedData.track_id)
        .eq('org_id', orgId)
        .single()

      if (trackError || !track) {
        throw new Error('Track not found')
      }

      if (track.status !== 'active') {
        throw new Error('Cannot assign inactive track')
      }
    }

    // Create the assignment
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        ...validatedData,
        org_id: orgId,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create assignment: ${error.message}`)
    }

    // TODO: Trigger webhook for assignment created
    // Webhook function triggerAssignmentCreated needs to be implemented in src/lib/webhooks.ts
    // try {
    //   const { triggerAssignmentCreated } = await import('@/lib/webhooks')
    //
    //   const { data: org } = await supabase
    //     .from('orgs')
    //     .select('name')
    //     .eq('id', orgId)
    //     .single()
    //
    //   const { data: userData } = await supabase
    //     .from('users')
    //     .select('id, first_name, last_name, email, role')
    //     .eq('clerk_user_id', validatedData.assignee_user_id)
    //     .single()
    //
    //   if (userData) {
    //     const webhookUser = {
    //       id: userData.id,
    //       name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
    //       email: userData.email,
    //       role: userData.role as 'trainee' | 'manager' | 'admin' | 'hr',
    //     }
    //
    //     await triggerAssignmentCreated(
    //       orgId,
    //       org?.name || 'Unknown Organization',
    //       webhookUser,
    //       assignment
    //     )
    //   }
    // } catch (webhookError) {
    //   console.error('Failed to trigger assignment webhook:', webhookError)
    //   // Don't fail the assignment creation if webhook fails
    // }

    revalidatePath('/assignments', 'page')
    revalidatePath('/dashboard', 'page')
    return assignment
  })
}

export async function updateAssignment(
  assignmentId: string,
  data: z.infer<typeof updateAssignmentSchema>
) {
  const validatedData = updateAssignmentSchema.parse(data)

  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    const { data: assignment, error } = await supabase
      .from('assignments')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update assignment: ${error.message}`)
    }

    revalidatePath('/assignments', 'page')
    revalidatePath('/dashboard', 'page')
    return assignment
  })
}

export async function deleteAssignment(assignmentId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to delete assignment: ${error.message}`)
    }

    revalidatePath('/assignments', 'page')
    revalidatePath('/dashboard', 'page')
    return { success: true }
  })
}

export async function getUserAssignments(userId?: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()
    const targetUserId = userId || user.id

    // Check permission to view other user's assignments
    if (targetUserId !== user.id && !['admin', 'manager', 'hr'].includes(user.role || '')) {
      throw new Error('Permission denied')
    }

    // Get assignments with full details including attempts stats
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        scenarios(
          id,
          title,
          description,
          difficulty,
          status
        ),
        tracks(
          id,
          title,
          description,
          status
        )
      `)
      .eq('org_id', orgId)
      .eq('assignee_user_id', targetUserId)
      .order('due_at', { ascending: true, nullsFirst: false })

    if (error) {
      throw new Error(`Failed to get assignments: ${error.message}`)
    }

    // Enrich assignments with attempt statistics
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        let attemptsCount = 0
        let bestScore: number | null = null
        let progress = 0
        let totalScenarios = 1

        if (assignment.type === 'scenario' && assignment.scenario_id) {
          // Get attempts for this scenario assignment
          const { data: attempts } = await supabase
            .from('scenario_attempts')
            .select('score, status')
            .eq('org_id', orgId)
            .eq('user_id', targetUserId)
            .eq('scenario_id', assignment.scenario_id)
            .eq('status', 'completed')

          attemptsCount = attempts?.length || 0
          bestScore = attempts?.reduce(
            (max, attempt) => Math.max(max, attempt.score || 0),
            0
          ) || null

          progress = attemptsCount > 0 ? 100 : 0
        } else if (assignment.type === 'track' && assignment.track_id) {
          // Get track scenarios count
          const { data: trackScenarios } = await supabase
            .from('track_scenarios')
            .select('scenario_id')
            .eq('track_id', assignment.track_id)

          totalScenarios = trackScenarios?.length || 0

          if (trackScenarios && trackScenarios.length > 0) {
            const scenarioIds = trackScenarios.map((ts) => ts.scenario_id)

            // Get attempts for all scenarios in track
            const { data: attempts } = await supabase
              .from('scenario_attempts')
              .select('scenario_id, score, status')
              .eq('org_id', orgId)
              .eq('user_id', targetUserId)
              .in('scenario_id', scenarioIds)
              .eq('status', 'completed')

            attemptsCount = attempts?.length || 0

            // Calculate unique scenarios completed
            const uniqueScenarios = new Set(
              attempts?.map((a) => a.scenario_id) || []
            )
            const scenariosCompleted = uniqueScenarios.size

            // Calculate progress as percentage of scenarios completed
            progress = totalScenarios > 0
              ? Math.round((scenariosCompleted / totalScenarios) * 100)
              : 0

            // Get best average score across track scenarios
            if (attempts && attempts.length > 0) {
              const avgScore = attempts.reduce(
                (sum, attempt) => sum + (attempt.score || 0),
                0
              ) / attempts.length
              bestScore = Math.round(avgScore)
            }
          }
        }

        // Determine if assignment is completed
        const isCompleted = assignment.type === 'scenario'
          ? attemptsCount > 0 && (bestScore || 0) >= 70
          : progress >= 100

        // Determine if assignment is overdue
        const isOverdue = assignment.due_at
          ? new Date(assignment.due_at) < new Date() && !isCompleted
          : false

        return {
          ...assignment,
          attempts_count: attemptsCount,
          best_score: bestScore,
          progress,
          total_scenarios: totalScenarios,
          is_completed: isCompleted,
          is_overdue: isOverdue,
        }
      })
    )

    return enrichedAssignments
  })
}

export async function getAssignment(assignmentId: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: assignment, error } = await supabase
      .from('assignments')
      .select(`
        *,
        scenarios(
          id,
          title,
          description,
          difficulty,
          status,
          persona,
          ai_prompt
        ),
        tracks(
          id,
          title,
          description,
          status
        )
      `)
      .eq('id', assignmentId)
      .eq('org_id', orgId)
      .single()

    if (error) {
      throw new Error(`Failed to get assignment: ${error.message}`)
    }

    // Check access permissions
    const canView =
      assignment.assignee_user_id === user.id ||
      user.role === 'admin' ||
      user.role === 'manager' ||
      user.role === 'hr'

    if (!canView) {
      throw new Error('Permission denied to view this assignment')
    }

    return assignment
  })
}

export async function getRecentAttemptStats(userId?: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()
    const targetUserId = userId || user.id

    // Check permission to view other user's stats
    if (targetUserId !== user.id && !['admin', 'manager', 'hr'].includes(user.role || '')) {
      throw new Error('Permission denied')
    }

    // Get all completed attempts for the user
    const { data: attempts, error } = await supabase
      .from('scenario_attempts')
      .select('id, score, kpis, duration_seconds, started_at, status')
      .eq('org_id', orgId)
      .eq('user_id', targetUserId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get attempt stats: ${error.message}`)
    }

    // Calculate total completed attempts
    const totalCompleted = attempts.length

    // Calculate average score
    const averageScore = totalCompleted > 0
      ? Math.round(
          (attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalCompleted) * 100
        ) / 100
      : 0

    // Calculate current streak (consecutive days with at least one attempt)
    let currentStreak = 0
    if (attempts.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const attemptDates = attempts
        .map((a) => {
          const date = new Date(a.started_at)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })
        .filter((date, index, self) => self.indexOf(date) === index) // unique dates
        .sort((a, b) => b - a) // descending order

      let checkDate = today.getTime()
      for (const attemptDate of attemptDates) {
        if (attemptDate === checkDate) {
          currentStreak++
          checkDate -= 24 * 60 * 60 * 1000 // move back one day
        } else if (attemptDate < checkDate) {
          break // streak broken
        }
      }
    }

    // Calculate average talk/listen ratio from KPIs
    let totalTalkRatio = 0
    let talkListenCount = 0

    attempts.forEach((attempt) => {
      if (attempt.kpis && typeof attempt.kpis === 'object') {
        const kpis = attempt.kpis as Record<string, unknown>
        const globalKPIs = kpis.global as Record<string, unknown> | undefined

        if (globalKPIs?.talk_listen_ratio) {
          const ratio = globalKPIs.talk_listen_ratio as string
          // Parse "45:55" format to get talk percentage
          const [talk] = ratio.split(':').map(Number)
          if (!isNaN(talk)) {
            totalTalkRatio += talk
            talkListenCount++
          }
        }
      }
    })

    const avgTalkListenRatio = talkListenCount > 0
      ? Math.round(totalTalkRatio / talkListenCount)
      : 50

    // Get recent 5 attempts for performance trend
    const recentAttempts = attempts.slice(0, 5).map((attempt) => ({
      id: attempt.id,
      score: attempt.score || 0,
      started_at: attempt.started_at,
      duration_seconds: attempt.duration_seconds || 0,
    }))

    // Calculate trend (comparing first half vs second half of recent attempts)
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (recentAttempts.length >= 4) {
      const midPoint = Math.floor(recentAttempts.length / 2)
      const firstHalf = recentAttempts.slice(0, midPoint)
      const secondHalf = recentAttempts.slice(midPoint)

      const firstHalfAvg = firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length

      if (secondHalfAvg > firstHalfAvg + 5) {
        trend = 'up'
      } else if (secondHalfAvg < firstHalfAvg - 5) {
        trend = 'down'
      }
    }

    return {
      total_completed: totalCompleted,
      average_score: averageScore,
      current_streak: currentStreak,
      avg_talk_listen_ratio: avgTalkListenRatio,
      recent_attempts: recentAttempts,
      trend,
    }
  })
}

export async function getTeamAssignments(filters?: {
  team_id?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
  limit?: number
  offset?: number
}) {
  return withRoleGuard(['admin', 'manager', 'hr'], async (user, orgId) => {
    const supabase = await createClient()

    // Get all team members if team_id is specified
    let teamMemberIds: string[] | undefined

    if (filters?.team_id) {
      const { data: teamMembers } = await supabase
        .from('org_members')
        .select('user_id')
        .eq('org_id', orgId)
        .eq('team_id', filters.team_id)

      teamMemberIds = teamMembers?.map((m) => m.user_id)
    }

    let query = supabase
      .from('assignments')
      .select(`
        *,
        scenarios(id, title, difficulty),
        tracks(id, title)
      `)
      .eq('org_id', orgId)

    if (teamMemberIds) {
      query = query.in('assignee_user_id', teamMemberIds)
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

    query = query.order('due_at', { ascending: true, nullsFirst: false })

    const { data: assignments, error } = await query

    if (error) {
      throw new Error(`Failed to get team assignments: ${error.message}`)
    }

    // Apply status filter if specified
    if (filters?.status) {
      const now = new Date()
      return assignments.filter((assignment) => {
        const dueDate = assignment.due_at ? new Date(assignment.due_at) : null
        const isCompleted = !!assignment.completed_at

        switch (filters.status) {
          case 'completed':
            return isCompleted
          case 'overdue':
            return !isCompleted && dueDate && dueDate < now
          case 'in_progress':
            return !isCompleted && dueDate && dueDate >= now
          case 'pending':
            return !isCompleted && !dueDate
          default:
            return true
        }
      })
    }

    return assignments
  })
}

export async function completeAssignment(assignmentId: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Verify user owns this assignment
    const { data: existingAssignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, assignee_user_id, type, scenario_id, track_id')
      .eq('id', assignmentId)
      .eq('org_id', orgId)
      .single()

    if (assignmentError || !existingAssignment) {
      throw new Error('Assignment not found')
    }

    if (existingAssignment.assignee_user_id !== user.id) {
      throw new Error('Permission denied')
    }

    // Mark as completed
    const { data: assignment, error } = await supabase
      .from('assignments')
      .update({
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to complete assignment: ${error.message}`)
    }

    revalidatePath('/assignments', 'page')
    revalidatePath('/dashboard', 'page')
    return assignment
  })
}