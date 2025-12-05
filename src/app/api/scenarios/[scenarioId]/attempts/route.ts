import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { AttemptStatus } from '@/types/attempt'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scenarioId } = await params
    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'completed'

    const supabase = await createAdminClient()

    // Check if user is a manager (can see all statuses)
    const isManager = hasRole(user.role, ['manager', 'admin', 'hr'])

    // Build query
    let query = supabase
      .from('scenario_attempts')
      .select('id, score, duration_seconds, started_at, ended_at, kpis, attempt_status')
      .eq('scenario_id', scenarioId)
      .eq('clerk_user_id', user.id)
      .eq('org_id', user.orgId)

    // Apply status filter
    if (statusFilter === 'all') {
      // Only managers can see all statuses
      if (!isManager) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view all attempt statuses' },
          { status: 403 }
        )
      }
      // No status filter - show all
    } else if (['completed', 'cancelled', 'practice', 'technical_issue'].includes(statusFilter)) {
      query = query.eq('attempt_status', statusFilter)
    } else {
      // Default to completed if invalid status provided
      query = query.eq('attempt_status', 'completed')
    }

    const { data: attempts, error } = await query.order('started_at', { ascending: true })

    if (error) {
      console.error('Error fetching attempts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch attempts' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const attemptStats = attempts.map((attempt, index) => ({
      attemptNumber: index + 1,
      score: attempt.score || 0,
      duration: attempt.duration_seconds || 0,
      date: attempt.started_at,
      isBest: false, // Will be set below
      isFirst: index === 0,
      isLatest: index === attempts.length - 1,
    }))

    // Find best score
    const bestScore = Math.max(...attemptStats.map((a) => a.score))
    const bestAttemptIndex = attemptStats.findIndex((a) => a.score === bestScore)
    if (bestAttemptIndex !== -1) {
      attemptStats[bestAttemptIndex].isBest = true
    }

    // Calculate average
    const averageScore =
      attemptStats.reduce((sum, a) => sum + a.score, 0) / attemptStats.length

    return NextResponse.json({
      attempts: attemptStats,
      statistics: {
        totalAttempts: attemptStats.length,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore,
        firstScore: attemptStats[0]?.score || 0,
        latestScore: attemptStats[attemptStats.length - 1]?.score || 0,
        improvement:
          attemptStats.length > 1
            ? attemptStats[attemptStats.length - 1].score - attemptStats[0].score
            : 0,
      },
      filters: {
        statusFilter,
        isManager,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/scenarios/[scenarioId]/attempts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
