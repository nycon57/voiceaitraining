import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { StatCard, ActivityCard } from '@/components/dashboard/cards'
import type { ActivityItem } from '@/components/dashboard/cards'
import { KPIMetricsChart, PerformanceTrendChart } from '@/components/charts'
import { EmptyState } from '@/components/ui/empty-state'
import { getStatusVariant } from '@/lib/utils/dashboard-utils'
import {
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Calendar,
  FileCheck
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface AdminOverviewProps {
  user: AuthUser
}

// Mock data for initial development
const mockOrgStats = [
  {
    label: "Total Users",
    value: 247,
    icon: Users,
    trend: { direction: 'up' as const, value: '+12', isPositive: true },
    description: "Active users this month"
  },
  {
    label: "Scenarios Created",
    value: 38,
    icon: BookOpen,
    trend: { direction: 'up' as const, value: '+5', isPositive: true },
    description: "Custom scenarios authored"
  },
  {
    label: "Completion Rate",
    value: "87%",
    icon: Target,
    trend: { direction: 'up' as const, value: '+3%', isPositive: true },
    description: "Average assignment completion"
  },
  {
    label: "Average Score",
    value: 82,
    icon: TrendingUp,
    trend: { direction: 'up' as const, value: '+4%', isPositive: true },
    description: "Organization-wide performance"
  }
]

const mockRecentActivity: ActivityItem[] = [
  {
    id: 1,
    title: "New scenario: Healthcare Consultation",
    user: "Sarah Mitchell",
    timestamp: "2 hours ago",
    status: "published"
  },
  {
    id: 2,
    title: "Assigned Loan Officer Track to Sales Team",
    user: "Mike Johnson",
    timestamp: "4 hours ago",
    status: "active"
  },
  {
    id: 3,
    title: "5 new users added to organization",
    user: "System",
    timestamp: "6 hours ago",
    status: "completed"
  }
]

const mockScenarios = [
  {
    id: 1,
    title: "Cold Call Introduction",
    status: "published",
    attempts: 156,
    avgScore: 85,
    lastUpdated: "2025-01-15"
  },
  {
    id: 2,
    title: "Objection Handling",
    status: "draft",
    attempts: 0,
    avgScore: null,
    lastUpdated: "2025-01-20"
  },
  {
    id: 3,
    title: "Loan Application Review",
    status: "published",
    attempts: 89,
    avgScore: 78,
    lastUpdated: "2025-01-18"
  }
]

const mockPendingReviews = [
  {
    id: 1,
    type: "Scenario",
    title: "Insurance Claims Process",
    author: "Lisa Chen",
    submittedDate: "2025-01-19",
    status: "pending_review"
  },
  {
    id: 2,
    type: "Track",
    title: "Advanced Sales Techniques",
    author: "John Doe",
    submittedDate: "2025-01-18",
    status: "pending_review"
  }
]

const mockOrgKPIData = [
  { date: "Week 1", avgScore: 78, activeUsers: 185, completionRate: 82 },
  { date: "Week 2", avgScore: 80, activeUsers: 198, completionRate: 84 },
  { date: "Week 3", avgScore: 81, activeUsers: 215, completionRate: 85 },
  { date: "Week 4", avgScore: 82, activeUsers: 247, completionRate: 87 }
]

const mockOrgPerformanceData = [
  { date: "Week 1", score: 78, label: "Org Average" },
  { date: "Week 2", score: 80, label: "Org Average" },
  { date: "Week 3", score: 81, label: "Org Average" },
  { date: "Week 4", score: 82, label: "Org Average" }
]

export function AdminOverview({ user }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Organization <span className="text-gradient">Dashboard</span>
        </h2>
        <p className="text-muted-foreground">
          Monitor and manage your organization's training platform
        </p>
      </div>

      {/* Stats Grid - 4 column layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockOrgStats.map((stat, index) => {
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

      {/* Main Content Grid - 12 column system */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Activity - 6 columns */}
        <ActivityCard
          title="Recent Activity"
          description="Latest actions in your organization"
          activities={mockRecentActivity}
          className="lg:col-span-6"
        />

        {/* Pending Reviews - 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-headline">Pending Reviews</CardTitle>
              <CardDescription className="text-sm mt-1">
                Content awaiting approval
              </CardDescription>
            </div>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            {mockPendingReviews.length === 0 ? (
              <EmptyState
                icon={FileCheck}
                title="All Caught Up"
                description="No pending reviews at this time"
                animated={false}
              />
            ) : (
              <div className="space-y-3">
                {mockPendingReviews.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.submittedDate}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">by {item.author}</p>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/${item.type.toLowerCase()}s/${item.id}/review`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/scenarios/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Scenario
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/training">
                <BookOpen className="h-4 w-4 mr-2" />
                View Tracks
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/assignments/new">
                <Target className="h-4 w-4 mr-2" />
                New Assignment
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Library - Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Scenario Library</CardTitle>
          <CardDescription>
            Manage and monitor your training scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{scenario.title}</h4>
                    <Badge variant={getStatusVariant(scenario.status)}>
                      {scenario.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {scenario.attempts} attempts
                    </div>
                    {scenario.avgScore && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Avg: {scenario.avgScore}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated: {scenario.lastUpdated}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/training/scenarios/${scenario.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/scenarios/${scenario.id}`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Analytics - Full width */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceTrendChart
          data={mockOrgPerformanceData}
          title="Organization Performance Trend"
          description="Average scores across all users"
          chartType="area"
          showStats
        />

        <KPIMetricsChart
          data={mockOrgKPIData}
          title="Key Performance Indicators"
          description="Multi-metric tracking over time"
          metrics={['avgScore', 'activeUsers', 'completionRate']}
          metricLabels={{
            avgScore: 'Avg Score',
            activeUsers: 'Active Users',
            completionRate: 'Completion %'
          }}
          metricColors={{
            avgScore: 'var(--chart-1)',
            activeUsers: 'var(--chart-2)',
            completionRate: 'var(--chart-3)'
          }}
          height={300}
        />
      </div>

      {/* System Health - Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">System Health</CardTitle>
          <CardDescription>
            Platform status and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Uptime</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice Sessions</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Healthy</span>
                </div>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Usage</span>
                <span className="text-sm font-medium">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}