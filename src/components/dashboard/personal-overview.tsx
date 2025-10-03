/**
 * Personal Dashboard Overview
 *
 * Dashboard for individual users (personal orgs)
 * Focuses on personal progress, skill development, and individual goals
 * Hides team features like leaderboards, assignments, and team management
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/cards'
import { OpportunityCarousel } from '@/components/dashboard/opportunity-carousel'
import { PerformanceTrendChart } from '@/components/charts'
import { MyTrainingView } from '@/components/dashboard/my-training-view'
import { getRecentAttemptStats } from '@/actions/attempts'
import { getLatestActiveScenarios } from '@/actions/scenarios'
import { getUserEnrollments } from '@/actions/enrollments'
import {
  Trophy,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Target,
  Calendar,
  Award
} from 'lucide-react'
import type { AuthUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPlanLimits, getPlanConfig } from '@/lib/plans'

interface PersonalOverviewProps {
  user: AuthUser
}

export async function PersonalOverview({ user }: PersonalOverviewProps) {
  // Fetch data for personal dashboard
  const [stats, scenarios, enrollments] = await Promise.all([
    getRecentAttemptStats(user.id).catch(() => null),
    getLatestActiveScenarios(12).catch(() => []),
    getUserEnrollments(user.id).catch(() => [])
  ])

  // Get plan info
  const planConfig = user.plan ? getPlanConfig(user.plan) : null
  const planLimits = user.plan ? getPlanLimits(user.plan) : null

  // Transform stats for StatCard components
  const statsData = [
    {
      label: "Average Score",
      value: stats?.average_score ? Math.round(stats.average_score) : 0,
      icon: Trophy,
      trend: stats?.performance_trend ? {
        direction: stats.performance_trend === 'up' ? 'up' as const :
                   stats.performance_trend === 'down' ? 'down' as const : undefined,
        value: stats.performance_trend === 'up' ? '+12%' :
               stats.performance_trend === 'down' ? '-5%' : '0%',
        isPositive: stats.performance_trend !== 'down'
      } : undefined,
      description: "Your average performance score"
    },
    {
      label: "Sessions This Month",
      value: stats?.total_completed || 0,
      icon: Calendar,
      suffix: planLimits ? ` / ${planLimits.max_sessions_per_month}` : undefined,
      trend: stats?.recent_attempts ? {
        direction: 'up' as const,
        value: `+${stats.recent_attempts}`,
        isPositive: true
      } : undefined,
      description: planLimits ? `${planLimits.max_sessions_per_month} sessions available per month` : undefined
    },
    {
      label: "Current Streak",
      value: stats?.current_streak || 0,
      icon: TrendingUp,
      suffix: " days",
      description: "Consecutive days of training"
    },
    {
      label: "Custom Scenarios",
      value: stats?.scenarios_created || 0,
      icon: Award,
      suffix: planLimits ? ` / ${planLimits.max_scenarios}` : undefined,
      description: planLimits ? `${planLimits.max_scenarios} scenarios available` : undefined
    }
  ]

  // Transform scenarios for carousel using ScenarioCardData format
  const scenariosForCarousel = scenarios.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description || '',
    category: s.category || 'General',
    industry: s.industry || 'General',
    difficulty: (s.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
    durationMin: Math.floor((s.estimated_duration || 300) / 60),
    durationMax: Math.ceil((s.estimated_duration || 300) / 60) + 5,
    thumbnailUrl: s.image_url,
    tags: s.metadata?.tags as string[] || [],
    averageScore: s.avg_score,
    attemptCount: s.attempt_count || 0,
    isEnrolled: false,
  }))

  // Transform performance data for chart
  const performanceData = stats?.recent_performance?.map((attempt, index) => ({
    date: new Date(attempt.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: attempt.score || 0,
    label: `Session ${stats.recent_performance!.length - index}`
  })) || []

  // Calculate usage percentage for sessions
  const sessionsUsagePercent = planLimits && planLimits.max_sessions_per_month > 0
    ? Math.round(((stats?.total_completed || 0) / planLimits.max_sessions_per_month) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            <span className="text-gradient">Welcome back</span>, {user.name}
          </h2>
          <p className="text-muted-foreground">
            Track your progress and sharpen your skills
          </p>
        </div>

        {/* Plan Badge */}
        {planConfig && (
          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{planConfig.name} Plan</span>
            </div>
            {user.plan === 'individual_free' && (
              <Button asChild size="sm" variant="outline">
                <Link href="/billing">Upgrade Plan</Link>
              </Button>
            )}
          </div>
        )}
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
              suffix={stat.suffix}
              headlineTitle={false}
              className={`border-l-4 ${borderColors[index]}`}
            />
          )
        })}
      </div>

      {/* Usage Alert for Free Plan */}
      {user.plan === 'individual_free' && sessionsUsagePercent >= 80 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Target className="h-5 w-5" />
              You're running low on sessions
            </CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-200">
              You've used {stats?.total_completed || 0} of {planLimits?.max_sessions_per_month} sessions this month.
              Upgrade to Pro for 100 sessions per month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/billing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Performance Chart */}
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
                showStats={false}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* My Training */}
      {enrollments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-headline text-2xl font-bold tracking-tight">
                My Training
              </h3>
              <p className="text-sm text-muted-foreground">
                {enrollments.filter(e => e.status !== 'completed').length} active training session{enrollments.filter(e => e.status !== 'completed').length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/training">View All</Link>
            </Button>
          </div>

          <MyTrainingView
            enrollments={enrollments}
            maxItems={6}
          />
        </section>
      )}

      {/* Available Scenarios Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-headline text-2xl font-bold tracking-tight">
              {enrollments.length > 0 ? 'More Training Available' : 'Available Scenarios'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Practice with real-world sales scenarios
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/training">Browse All</Link>
          </Button>
        </div>
        <OpportunityCarousel scenarios={scenariosForCarousel} />
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="font-headline text-2xl font-bold tracking-tight">
          Quick Actions
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="group hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Trophy className="h-5 w-5" />
                Start Training
              </CardTitle>
              <CardDescription>
                Practice with a scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/training">Start Session</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart3 className="h-5 w-5" />
                View Analytics
              </CardTitle>
              <CardDescription>
                See your detailed stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          {planLimits?.ai_generation && (
            <Card className="group hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Award className="h-5 w-5" />
                  Create Scenario
                </CardTitle>
                <CardDescription>
                  Build a custom scenario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/scenarios/new">Create New</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Upgrade CTA for Free Users */}
      {user.plan === 'individual_free' && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Ready to take your training to the next level?
            </CardTitle>
            <CardDescription>
              Upgrade to Pro and get 100 sessions per month, AI scenario generation, and advanced analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/billing">Upgrade to Pro</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View All Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}