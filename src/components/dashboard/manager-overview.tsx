import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatCard } from '@/components/dashboard/cards'
import { TeamActivityChart } from '@/components/charts'
import { getStatusVariant, generateAvatarFallback, getAlertColors } from '@/lib/utils/dashboard-utils'
import {
  Users,
  Target,
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  UserCheck,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface ManagerOverviewProps {
  user: AuthUser
}

// Mock data for initial development
const mockTeamStats = [
  {
    label: "Team Members",
    value: 24,
    icon: Users,
    trend: { direction: 'up' as const, value: '+2', isPositive: true },
    description: "Active team members"
  },
  {
    label: "Team Avg Score",
    value: 84,
    icon: Trophy,
    trend: { direction: 'up' as const, value: '+6%', isPositive: true },
    description: "This month's performance"
  },
  {
    label: "Assignments Due",
    value: 8,
    icon: Clock,
    description: "Pending deadlines this week"
  },
  {
    label: "Completion Rate",
    value: "91%",
    icon: CheckCircle,
    trend: { direction: 'up' as const, value: '+5%', isPositive: true },
    description: "Assignment completion"
  }
]

const mockActiveAssignments = [
  {
    id: 1,
    title: "Cold Call Mastery Track",
    assignedTo: "Entire Team",
    dueDate: "2025-01-25",
    progress: 68,
    completedBy: 16,
    totalUsers: 24,
    status: "in_progress"
  },
  {
    id: 2,
    title: "Objection Handling Scenario",
    assignedTo: "New Hires",
    dueDate: "2025-01-22",
    progress: 45,
    completedBy: 3,
    totalUsers: 6,
    status: "overdue"
  },
  {
    id: 3,
    title: "Product Demo Training",
    assignedTo: "Senior Team",
    dueDate: "2025-01-30",
    progress: 25,
    completedBy: 2,
    totalUsers: 8,
    status: "scheduled"
  }
]

const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Sales Rep",
    lastActive: "2 hours ago",
    currentStreak: 12,
    avgScore: 89,
    assignmentsCompleted: 15,
    status: "excellent"
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Sales Rep",
    lastActive: "1 day ago",
    currentStreak: 3,
    avgScore: 76,
    assignmentsCompleted: 8,
    status: "needs_attention"
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    role: "Senior Sales Rep",
    lastActive: "30 minutes ago",
    currentStreak: 18,
    avgScore: 94,
    assignmentsCompleted: 22,
    status: "excellent"
  },
  {
    id: 4,
    name: "David Park",
    role: "Sales Rep",
    lastActive: "4 hours ago",
    currentStreak: 7,
    avgScore: 82,
    assignmentsCompleted: 12,
    status: "active"
  }
]

const mockTeamActivityData = [
  { label: "Sarah J.", value: 15, category: "completed" as const },
  { label: "Lisa R.", value: 22, category: "completed" as const },
  { label: "David P.", value: 12, category: "completed" as const },
  { label: "Mike C.", value: 8, category: "completed" as const },
]

const mockAlerts = [
  {
    id: 1,
    type: 'warning' as const,
    title: "Overdue Assignment",
    description: "6 team members have overdue assignments",
    action: "Review Now",
    icon: AlertTriangle
  },
  {
    id: 2,
    type: 'info' as const,
    title: "Performance Drop",
    description: "Mike Chen's scores have declined 15% this week",
    action: "Check Progress",
    icon: TrendingUp
  },
  {
    id: 3,
    type: 'success' as const,
    title: "Top Performer",
    description: "Lisa Rodriguez achieved a 94% average this month",
    action: "Recognize",
    icon: Trophy
  }
]

export function ManagerOverview({ user }: ManagerOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Team <span className="text-gradient">Management</span>
        </h2>
        <p className="text-muted-foreground">
          Overview of your team's performance and progress
        </p>
      </div>

      {/* Stats Grid - 4 column layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockTeamStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Main Content Grid - 12 column system */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Active Assignments - 8 columns */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="font-headline">Active Assignments</CardTitle>
            <CardDescription>
              Track your team's assignment progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActiveAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <Badge variant={getStatusVariant(assignment.status)}>
                        {assignment.status === 'overdue' ? 'Overdue' :
                         assignment.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {assignment.assignedTo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {assignment.dueDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {assignment.completedBy}/{assignment.totalUsers} completed
                      </div>
                    </div>

                    <Progress value={assignment.progress} className="h-2" />
                  </div>

                  <div className="ml-4">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/assignments/${assignment.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - 4 columns */}
        <div className="space-y-6 lg:col-span-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/assignments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/team">
                  <Users className="h-4 w-4 mr-2" />
                  View Team
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Team Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-headline">Alerts</CardTitle>
                <CardDescription className="text-sm">
                  Items requiring attention
                </CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${getAlertColors(alert.type)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <alert.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Activity Chart - Full width */}
      <TeamActivityChart
        data={mockTeamActivityData}
        title="Team Activity Overview"
        description="Completed assignments by team member"
        orientation="horizontal"
        showValues
      />

      {/* Team Performance - Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Team Performance</CardTitle>
          <CardDescription>
            Individual team member progress and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {generateAvatarFallback(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last active: {member.lastActive}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{member.avgScore}</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{member.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{member.assignmentsCompleted}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <Badge
                    variant={getStatusVariant(member.status)}
                    className={
                      member.status === 'excellent' ? 'bg-success text-success-foreground' :
                      member.status === 'needs_attention' ? 'bg-destructive text-destructive-foreground' :
                      ''
                    }
                  >
                    {member.status === 'excellent' ? 'Excellent' :
                     member.status === 'active' ? 'Active' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}