import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/cards'
import { OpportunityCarousel } from '@/components/dashboard/opportunity-carousel'
import { MyTrainingView } from '@/components/dashboard/my-training-view'
import { PerformanceTrendChart } from '@/components/charts'
import { getRecentAttemptStats, getUserAssignments } from '@/actions/assignments'
import { getLatestActiveScenarios, getLatestActiveTracks } from '@/actions/scenarios'
import { getUserEnrollments } from '@/actions/enrollments'
import {
  Trophy,
  CheckCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import type { AuthUser } from '@/lib/auth'

interface TraineeOverviewProps {
  user: AuthUser
}

export async function TraineeOverview({ user }: TraineeOverviewProps) {
  // Fetch all data in parallel for performance
  const [stats, assignments, enrollments, scenarios, tracks] = await Promise.all([
    getRecentAttemptStats(user.id).catch(() => null),
    getUserAssignments(user.id).catch(() => []),
    getUserEnrollments(user.id).catch(() => []),
    getLatestActiveScenarios(10).catch(() => []),
    getLatestActiveTracks(10).catch(() => [])
  ])

  // Transform stats for StatCard components
  const statsData = [
    {
      label: "Average Score",
      value: stats?.average_score ? Math.round(stats.average_score) : 0,
      icon: Trophy,
      trend: stats?.trend && stats.trend !== 'stable' ? {
        direction: stats.trend as 'up' | 'down',
        value: stats.trend === 'up' ? '+' : '-',
        isPositive: stats.trend === 'up'
      } : undefined,
      description: "Your average performance score"
    },
    {
      label: "Completed Sessions",
      value: stats?.total_completed || 0,
      icon: CheckCircle,
      trend: stats?.recent_attempts?.length ? {
        direction: 'up' as const,
        value: `+${stats.recent_attempts.length}`,
        isPositive: true
      } : undefined,
      description: "Training sessions this month"
    },
    {
      label: "Current Streak",
      value: stats?.current_streak || 0,
      icon: TrendingUp,
      description: "Consecutive days of training"
    },
    {
      label: "Talk/Listen Ratio",
      value: stats?.avg_talk_listen_ratio || "N/A",
      icon: BarChart3,
      description: "Optimal range: 40-45%"
    }
  ]

  // Transform scenarios and tracks for carousel using standardized card formats
  const scenariosForCarousel = scenarios.slice(0, 6).map(s => ({
    id: s.id,
    title: s.title,
    description: s.description || '',
    category: 'General',
    industry: 'General',
    difficulty: (s.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
    durationMin: 5,
    durationMax: 10,
    thumbnailUrl: undefined,
    tags: [],
    averageScore: undefined,
    attemptCount: 0,
    isEnrolled: false,
  }))

  const tracksForCarousel = tracks.slice(0, 4).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    scenarioCount: t.scenario_count || 0,
    totalDurationMin: 60, // Default 1 hour
    totalDurationMax: 120, // Default 2 hours
    industry: 'General',
    thumbnailUrl: undefined,
    tags: [],
    enrolledCount: 0,
    isEnrolled: false,
  }))

  // Count active training (both assigned and self-enrolled)
  const activeTrainingCount = enrollments.filter(e => e.status !== 'completed').length

  // Transform performance data for chart
  const performanceData = stats?.recent_attempts?.map((attempt, index) => ({
    date: new Date(attempt.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: attempt.score || 0,
    label: `Session ${stats.recent_attempts!.length - index}`
  })) || []

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          <span className="text-gradient">Welcome back</span>, {user.name}
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your training progress
        </p>
      </div>

      {/* Quick Performance Stats - 4 column grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const borderColors = [
            'border-l-chart-1',
            'border-l-chart-2',
            'border-l-chart-3',
            'border-l-chart-4'
          ]
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              className={`border-l-4 ${borderColors[index]}`}
            />
          )
        })}
      </div>

      {/* New Opportunities Section */}
      <section className="space-y-4">
        <div>
          <h3 className="font-headline text-2xl font-bold tracking-tight">
            New Training Opportunities
          </h3>
          <p className="text-sm text-muted-foreground">
            Latest scenarios and tracks added to your organization
          </p>
        </div>
        <OpportunityCarousel scenarios={scenariosForCarousel} tracks={tracksForCarousel} />
      </section>

      {/* My Training - Unified view of assignments and self-enrolled training */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-headline text-2xl font-bold tracking-tight">
              My Training
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTrainingCount} active training session{activeTrainingCount !== 1 ? 's' : ''}
              {assignments.length > 0 && ` • ${assignments.length} assigned`}
            </p>
          </div>
        </div>

        <MyTrainingView
          enrollments={enrollments}
          assignments={assignments}
          maxItems={6}
        />
      </section>

      {/* Recent Performance Chart - Optional sidebar */}
      {performanceData.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Recent Performance</CardTitle>
              <CardDescription>
                Your last {performanceData.length} training sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart
                data={performanceData}
                title=""
                description=""
              />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}