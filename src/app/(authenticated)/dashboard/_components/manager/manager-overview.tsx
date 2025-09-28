import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Users,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  UserCheck,
  Plus,
  Eye
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
    trend: "+2",
    description: "Active team members"
  },
  {
    label: "Team Avg Score",
    value: 84,
    icon: Trophy,
    trend: "+6%",
    description: "This month's performance"
  },
  {
    label: "Assignments Due",
    value: 8,
    icon: Clock,
    trend: "this week",
    description: "Pending deadlines"
  },
  {
    label: "Completion Rate",
    value: 91,
    icon: CheckCircle,
    trend: "+5%",
    description: "Assignment completion"
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
    status: "active"
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

export function ManagerOverview({ user }: ManagerOverviewProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-12">

      {/* Team Stats Cards */}
      {mockTeamStats.map((stat) => (
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
            <Link href="/assignments/new">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/team">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                View Team
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/reports">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Team Reports
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Active Assignments */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-9">
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
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
                    <Badge variant={
                      assignment.status === 'overdue' ? 'destructive' :
                      assignment.status === 'in_progress' ? 'default' : 'secondary'
                    }>
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
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-8">
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
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
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
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
                    <div className="font-medium">{member.avgScore}</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{member.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{member.assignmentsCompleted}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <Badge variant={
                    member.status === 'excellent' ? 'default' :
                    member.status === 'active' ? 'secondary' : 'destructive'
                  }>
                    {member.status === 'excellent' ? 'Excellent' :
                     member.status === 'active' ? 'Active' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card className="col-span-3 md:col-span-3 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Alerts</CardTitle>
            <CardDescription className="text-sm">
              Items requiring attention
            </CardDescription>
          </div>
          <AlertTriangle className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Overdue Assignment</span>
            </div>
            <p className="text-xs text-muted-foreground">
              6 team members have overdue assignments
            </p>
            <Button size="sm" variant="outline" className="w-full mt-2">
              Review Now
            </Button>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Performance Drop</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mike Chen's scores have declined 15% this week
            </p>
            <Button size="sm" variant="outline" className="w-full mt-2">
              Check Progress
            </Button>
          </div>

          <div className="p-3 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Top Performer</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Lisa Rodriguez achieved a 94% average this month
            </p>
            <Button size="sm" variant="outline" className="w-full mt-2">
              Recognize
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}