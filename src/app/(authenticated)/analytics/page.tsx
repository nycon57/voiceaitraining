import { getCurrentUser } from '@/lib/auth'
import { getDashboardMetrics, getPerformanceTrends, getScenarioInsights, getTeamMetrics } from '@/lib/analytics'
import { OverviewCards } from '@/components/analytics/overview-cards'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { ScenarioInsightsTable } from '@/components/analytics/scenario-insights-table'
import { TeamPerformance } from '@/components/analytics/team-performance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, Target, Download, RefreshCw } from 'lucide-react'
import { redirect } from 'next/navigation'

interface AnalyticsPageProps {
  searchParams: Promise<{ timeFrame?: 'week' | 'month' | 'quarter' | 'year' }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { timeFrame = 'month' } = await searchParams

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Check if user has access to analytics
  const hasAnalyticsAccess = ['admin', 'manager', 'hr'].includes(user.role || '')
  if (!hasAnalyticsAccess) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-headline text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground text-center">
              Analytics access is limited to managers, HR, and administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch analytics data
  const [dashboardMetrics, performanceTrends, scenarioInsights, teamMetrics] = await Promise.all([
    getDashboardMetrics(timeFrame).catch(error => {
      console.error('Failed to load dashboard metrics:', error)
      return {
        total_attempts: 0,
        active_users: 0,
        average_score: 0,
        completion_rate: 0,
        total_scenarios: 0,
        total_training_hours: 0
      }
    }),
    getPerformanceTrends(timeFrame === 'year' ? 'quarter' : timeFrame).catch(error => {
      console.error('Failed to load performance trends:', error)
      return []
    }),
    getScenarioInsights().catch(error => {
      console.error('Failed to load scenario insights:', error)
      return []
    }),
    getTeamMetrics().catch(error => {
      console.error('Failed to load team metrics:', error)
      return {
        team_average_score: 0,
        team_completion_rate: 0,
        top_performers: [],
        improvement_areas: []
      }
    })
  ])

  const getTimeFrameLabel = (tf: string) => {
    switch (tf) {
      case 'week': return 'Last 7 Days'
      case 'month': return 'Last 30 Days'
      case 'quarter': return 'Last 90 Days'
      case 'year': return 'Last Year'
      default: return 'Last 30 Days'
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Performance insights and training metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {getTimeFrameLabel(timeFrame)}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Frame Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Time Period:</span>
        <div className="flex gap-1">
          {[
            { value: 'week', label: '7 Days' },
            { value: 'month', label: '30 Days' },
            { value: 'quarter', label: '90 Days' },
            { value: 'year', label: '1 Year' }
          ].map((period) => (
            <Button
              key={period.value}
              variant={timeFrame === period.value ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <a href={`/analytics?timeFrame=${period.value}`}>
                {period.label}
              </a>
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards metrics={dashboardMetrics} />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <PerformanceChart data={performanceTrends} />
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Recent performance highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Team Performance</span>
                    <Badge className={
                      teamMetrics.team_average_score >= 80 ? 'bg-green-100 text-green-800' :
                      teamMetrics.team_average_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {teamMetrics.team_average_score >= 80 ? 'Excellent' :
                       teamMetrics.team_average_score >= 60 ? 'Good' : 'Needs Focus'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Team average score: {teamMetrics.team_average_score}%
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Training Activity</span>
                    <Badge variant="outline">
                      {dashboardMetrics.total_attempts} attempts
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardMetrics.active_users} active users in {getTimeFrameLabel(timeFrame).toLowerCase()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Challenging</span>
                    <Badge variant="outline">
                      {scenarioInsights.length > 0 ?
                        scenarioInsights.sort((a, b) => a.average_score - b.average_score)[0]?.scenario_title?.substring(0, 20) + '...' :
                        'No data'
                      }
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scenario with lowest average score
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Top Performer</span>
                    <Badge variant="outline">
                      {teamMetrics.top_performers.length > 0 ?
                        teamMetrics.top_performers[0].user_name :
                        'No data'
                      }
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {teamMetrics.top_performers.length > 0 ?
                      `${teamMetrics.top_performers[0].average_score}% average score` :
                      'No performance data available'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceChart data={performanceTrends} />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioInsightsTable data={scenarioInsights} />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamPerformance metrics={teamMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}