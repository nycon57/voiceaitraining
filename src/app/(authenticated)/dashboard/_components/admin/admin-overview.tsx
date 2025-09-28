import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
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
  Clock,
  CheckCircle,
  Calendar
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
    trend: "+12",
    description: "Active users this month"
  },
  {
    label: "Scenarios Created",
    value: 38,
    icon: BookOpen,
    trend: "+5",
    description: "Custom scenarios authored"
  },
  {
    label: "Completion Rate",
    value: 87,
    icon: Target,
    trend: "+3%",
    description: "Average assignment completion"
  },
  {
    label: "Average Score",
    value: 82,
    icon: TrendingUp,
    trend: "+4%",
    description: "Organization-wide performance"
  }
]

const mockRecentActivity = [
  {
    id: 1,
    type: "scenario_created",
    title: "New scenario: Healthcare Consultation",
    user: "Sarah Mitchell",
    timestamp: "2 hours ago",
    status: "published"
  },
  {
    id: 2,
    type: "assignment_created",
    title: "Assigned Loan Officer Track to Sales Team",
    user: "Mike Johnson",
    timestamp: "4 hours ago",
    status: "active"
  },
  {
    id: 3,
    type: "user_added",
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

export function AdminOverview({ user }: AdminOverviewProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-12">

      {/* Org Stats Cards */}
      {mockOrgStats.map((stat) => (
        <Card key={stat.label} className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.trend} • {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Quick Actions */}
      <Card className="col-span-3 md:col-span-3 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href="/scenarios/new">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Scenario
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/tracks/new">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Create Track
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/assignments/new">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                New Assignment
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>by {activity.user}</span>
                    <span>•</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
                <Badge variant={
                  activity.status === 'published' ? 'default' :
                  activity.status === 'active' ? 'secondary' : 'outline'
                }>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      <Card className="col-span-3 md:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Pending Reviews</CardTitle>
            <CardDescription className="text-sm">
              Content awaiting approval
            </CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
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
                <p className="text-xs text-muted-foreground">by {item.author}</p>
                <Button size="sm" className="w-full mt-2" asChild>
                  <Link href={`/${item.type.toLowerCase()}s/${item.id}/review`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Library Management */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-9">
        <CardHeader>
          <CardTitle>Scenario Library</CardTitle>
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
                    <Badge variant={scenario.status === 'published' ? 'default' : 'secondary'}>
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
                    <Link href={`/scenarios/${scenario.id}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/scenarios/${scenario.id}/edit`}>
                      <Settings className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="col-span-3 md:col-span-3">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Platform status and metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">API Uptime</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">99.9%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Voice Sessions</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Healthy</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Storage Usage</span>
            <span className="text-sm font-medium">68%</span>
          </div>
          <Progress value={68} className="h-2" />
        </CardContent>
      </Card>

    </div>
  )
}