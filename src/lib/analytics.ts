import { withOrgGuard } from '@/lib/auth'

export interface DashboardMetrics {
  total_attempts: number
  active_users: number
  average_score: number
  completion_rate: number
  total_scenarios: number
  total_training_hours: number
}

export interface PerformanceTrend {
  date: string
  average_score: number
  attempt_count: number
  completion_rate: number
}

export interface ScenarioInsight {
  scenario_id: string
  scenario_title: string
  attempt_count: number
  average_score: number
  average_duration: number
  completion_rate: number
  difficulty: string
}

export interface UserPerformance {
  user_id: string
  user_name: string
  user_email: string
  role: string
  total_attempts: number
  average_score: number
  improvement_trend: number
  last_attempt_date: string
  total_training_hours: number
}

export interface TeamMetrics {
  team_average_score: number
  team_completion_rate: number
  top_performers: Array<{
    user_id: string
    user_name: string
    average_score: number
  }>
  improvement_areas: Array<{
    kpi_name: string
    average_score: number
    improvement_needed: boolean
  }>
}

export async function getDashboardMetrics(timeFrame: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DashboardMetrics> {
  return withOrgGuard(async (user, orgId, supabase) => {

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (timeFrame) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Get total attempts in time frame
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('scenario_attempts')
      .select('duration_seconds, score, status')
      .eq('org_id', orgId)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    if (attemptsError) {
      throw new Error(`Failed to get attempts data: ${attemptsError.message}`)
    }

    // Get active users count
    const { data: activeUsersData, error: activeUsersError } = await supabase
      .from('scenario_attempts')
      .select('user_id')
      .eq('org_id', orgId)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    if (activeUsersError) {
      throw new Error(`Failed to get active users data: ${activeUsersError.message}`)
    }

    // Get total scenarios count
    const { data: scenariosData, error: scenariosError } = await supabase
      .from('scenarios')
      .select('id')
      .eq('org_id', orgId)
      .eq('status', 'active')

    if (scenariosError) {
      throw new Error(`Failed to get scenarios data: ${scenariosError.message}`)
    }

    const attempts = attemptsData || []
    const completedAttempts = attempts.filter(a => a.status === 'completed')
    const uniqueUsers = new Set((activeUsersData || []).map(u => u.user_id))

    const totalDuration = attempts.reduce((sum, attempt) => sum + (attempt.duration_seconds || 0), 0)
    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
      : 0

    return {
      total_attempts: attempts.length,
      active_users: uniqueUsers.size,
      average_score: Math.round(averageScore * 100) / 100,
      completion_rate: attempts.length > 0 ? Math.round((completedAttempts.length / attempts.length) * 100) : 0,
      total_scenarios: (scenariosData || []).length,
      total_training_hours: Math.round(totalDuration / 3600 * 100) / 100
    }
  })
}

export async function getPerformanceTrends(timeFrame: 'week' | 'month' | 'quarter' = 'month'): Promise<PerformanceTrend[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    const endDate = new Date()
    const startDate = new Date()

    switch (timeFrame) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setDate(endDate.getDate() - 30)
        break
      case 'quarter':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    const { data, error } = await supabase
      .from('scenario_attempts')
      .select('started_at, score, status')
      .eq('org_id', orgId)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get performance trends: ${error.message}`)
    }

    // Group by day
    const dailyData: Record<string, { scores: number[], total: number, completed: number }> = {}

    ;(data || []).forEach(attempt => {
      const date = new Date(attempt.started_at).toISOString().split('T')[0]

      if (!dailyData[date]) {
        dailyData[date] = { scores: [], total: 0, completed: 0 }
      }

      dailyData[date].total++
      if (attempt.status === 'completed') {
        dailyData[date].completed++
        if (attempt.score !== null) {
          dailyData[date].scores.push(attempt.score)
        }
      }
    })

    return Object.entries(dailyData).map(([date, stats]) => ({
      date,
      average_score: stats.scores.length > 0
        ? Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length * 100) / 100
        : 0,
      attempt_count: stats.total,
      completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    })).sort((a, b) => a.date.localeCompare(b.date))
  })
}

export async function getScenarioInsights(): Promise<ScenarioInsight[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    const { data, error } = await supabase
      .from('scenario_attempts')
      .select(`
        scenario_id,
        score,
        status,
        duration_seconds,
        scenarios!inner(title, difficulty)
      `)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to get scenario insights: ${error.message}`)
    }

    const scenarioStats: Record<string, {
      title: string
      difficulty: string
      attempts: number
      completed: number
      scores: number[]
      durations: number[]
    }> = {}

    ;(data || []).forEach(attempt => {
      const scenarioId = attempt.scenario_id

      if (!scenarioStats[scenarioId]) {
        scenarioStats[scenarioId] = {
          title: attempt.scenarios.title,
          difficulty: attempt.scenarios.difficulty || 'medium',
          attempts: 0,
          completed: 0,
          scores: [],
          durations: []
        }
      }

      scenarioStats[scenarioId].attempts++

      if (attempt.status === 'completed') {
        scenarioStats[scenarioId].completed++
        if (attempt.score !== null) {
          scenarioStats[scenarioId].scores.push(attempt.score)
        }
        if (attempt.duration_seconds !== null) {
          scenarioStats[scenarioId].durations.push(attempt.duration_seconds)
        }
      }
    })

    return Object.entries(scenarioStats).map(([scenarioId, stats]) => ({
      scenario_id: scenarioId,
      scenario_title: stats.title,
      attempt_count: stats.attempts,
      average_score: stats.scores.length > 0
        ? Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length * 100) / 100
        : 0,
      average_duration: stats.durations.length > 0
        ? Math.round(stats.durations.reduce((sum, duration) => sum + duration, 0) / stats.durations.length)
        : 0,
      completion_rate: stats.attempts > 0 ? Math.round((stats.completed / stats.attempts) * 100) : 0,
      difficulty: stats.difficulty
    })).sort((a, b) => b.attempt_count - a.attempt_count)
  })
}

export async function getUserPerformanceData(): Promise<UserPerformance[]> {
  return withOrgGuard(async (user, orgId, supabase) => {

    // Get org members with their attempt data
    const { data, error } = await supabase
      .from('org_members')
      .select(`
        user_id,
        role,
        users!inner(
          name,
          email
        )
      `)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to get user performance data: ${error.message}`)
    }

    const userPerformance: UserPerformance[] = []

    for (const member of data || []) {
      // Get attempts for this user
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('scenario_attempts')
        .select('score, started_at, duration_seconds, status')
        .eq('org_id', orgId)
        .eq('user_id', member.user_id)
        .eq('status', 'completed')
        .order('started_at', { ascending: true })

      if (attemptsError) {
        console.error(`Failed to get attempts for user ${member.user_id}:`, attemptsError)
        continue
      }

      const attempts = attemptsData || []
      const scores = attempts.filter(a => a.score !== null).map(a => a.score!)
      const totalDuration = attempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0)

      // Calculate improvement trend (last 5 vs first 5 attempts)
      let improvementTrend = 0
      if (scores.length >= 10) {
        const firstFive = scores.slice(0, 5)
        const lastFive = scores.slice(-5)
        const firstAvg = firstFive.reduce((sum, score) => sum + score, 0) / firstFive.length
        const lastAvg = lastFive.reduce((sum, score) => sum + score, 0) / lastFive.length
        improvementTrend = Math.round((lastAvg - firstAvg) * 100) / 100
      }

      userPerformance.push({
        user_id: member.user_id,
        user_name: member.users.name || 'Unknown',
        user_email: member.users.email || '',
        role: member.role,
        total_attempts: attempts.length,
        average_score: scores.length > 0
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100
          : 0,
        improvement_trend: improvementTrend,
        last_attempt_date: attempts.length > 0 ? attempts[attempts.length - 1].started_at : '',
        total_training_hours: Math.round(totalDuration / 3600 * 100) / 100
      })
    }

    return userPerformance.sort((a, b) => b.average_score - a.average_score)
  })
}

export async function getTeamMetrics(): Promise<TeamMetrics> {
  return withOrgGuard(async (user, orgId, supabase) => {

    // Get all completed attempts with user info
    const { data, error } = await supabase
      .from('scenario_attempts')
      .select(`
        user_id,
        score,
        status,
        kpis,
        org_members!inner(
          users!inner(name)
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'completed')

    if (error) {
      throw new Error(`Failed to get team metrics: ${error.message}`)
    }

    const attempts = data || []
    const scores = attempts.filter(a => a.score !== null).map(a => a.score!)
    const totalAttempts = attempts.length
    const completedAttempts = attempts.filter(a => a.status === 'completed').length

    // Calculate team averages
    const teamAverageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100
      : 0

    const teamCompletionRate = totalAttempts > 0
      ? Math.round((completedAttempts / totalAttempts) * 100)
      : 0

    // Get top performers
    const userScores: Record<string, { name: string, scores: number[] }> = {}

    attempts.forEach(attempt => {
      const userId = attempt.user_id
      const userName = attempt.org_members?.users?.name || 'Unknown'

      if (!userScores[userId]) {
        userScores[userId] = { name: userName, scores: [] }
      }

      if (attempt.score !== null) {
        userScores[userId].scores.push(attempt.score)
      }
    })

    const topPerformers = Object.entries(userScores)
      .map(([userId, data]) => ({
        user_id: userId,
        user_name: data.name,
        average_score: data.scores.length > 0
          ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length * 100) / 100
          : 0
      }))
      .filter(performer => performer.average_score > 0)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 5)

    // Analyze improvement areas from KPIs
    const kpiAggregates: Record<string, number[]> = {}

    attempts.forEach(attempt => {
      if (attempt.kpis?.global) {
        const globalKPIs = attempt.kpis.global

        // Extract key KPI scores
        if (globalKPIs.talk_listen_ratio?.user_percentage) {
          if (!kpiAggregates['talk_listen_ratio']) kpiAggregates['talk_listen_ratio'] = []
          // Score talk/listen ratio (60-70% is optimal)
          const ratio = globalKPIs.talk_listen_ratio.user_percentage
          const score = ratio >= 60 && ratio <= 70 ? 100 : ratio >= 50 && ratio <= 80 ? 80 : 60
          kpiAggregates['talk_listen_ratio'].push(score)
        }

        if (globalKPIs.filler_words?.rate_per_minute !== undefined) {
          if (!kpiAggregates['filler_words']) kpiAggregates['filler_words'] = []
          // Score filler words (lower is better)
          const rate = globalKPIs.filler_words.rate_per_minute
          const score = rate <= 2 ? 100 : rate <= 4 ? 80 : rate <= 6 ? 60 : 40
          kpiAggregates['filler_words'].push(score)
        }

        if (globalKPIs.speaking_pace?.words_per_minute) {
          if (!kpiAggregates['speaking_pace']) kpiAggregates['speaking_pace'] = []
          // Score speaking pace (140-160 WPM is optimal)
          const wpm = globalKPIs.speaking_pace.words_per_minute
          const score = wpm >= 140 && wpm <= 160 ? 100 : wpm >= 120 && wpm <= 180 ? 80 : 60
          kpiAggregates['speaking_pace'].push(score)
        }
      }
    })

    const improvementAreas = Object.entries(kpiAggregates).map(([kpiName, scores]) => {
      const averageScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0

      return {
        kpi_name: kpiName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        average_score: Math.round(averageScore),
        improvement_needed: averageScore < 70
      }
    }).sort((a, b) => a.average_score - b.average_score)

    return {
      team_average_score: teamAverageScore,
      team_completion_rate: teamCompletionRate,
      top_performers: topPerformers,
      improvement_areas: improvementAreas
    }
  })
}