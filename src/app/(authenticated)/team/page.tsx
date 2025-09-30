import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { TeamActivityChart } from '@/components/charts/team-activity-chart'
import {
  Users,
  TrendingUp,
  Activity,
  Award,
  Search,
  UserPlus,
  Mail,
  MoreVertical,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for team members
const mockTeamMembers = [
  {
    id: '1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'trainee' as const,
    avatar: null,
    avgScore: 87,
    totalSessions: 24,
    lastActive: '2 hours ago',
    status: 'active' as const,
    weeklyTrend: [75, 80, 82, 85, 87]
  },
  {
    id: '2',
    name: 'Jordan Chen',
    email: 'jordan@example.com',
    role: 'trainee' as const,
    avatar: null,
    avgScore: 92,
    totalSessions: 31,
    lastActive: '1 hour ago',
    status: 'active' as const,
    weeklyTrend: [88, 89, 90, 91, 92]
  },
  {
    id: '3',
    name: 'Morgan Taylor',
    email: 'morgan@example.com',
    role: 'manager' as const,
    avatar: null,
    avgScore: 78,
    totalSessions: 12,
    lastActive: '5 hours ago',
    status: 'active' as const,
    weeklyTrend: [72, 75, 76, 77, 78]
  },
  {
    id: '4',
    name: 'Casey Williams',
    email: 'casey@example.com',
    role: 'trainee' as const,
    avatar: null,
    avgScore: 85,
    totalSessions: 28,
    lastActive: '3 hours ago',
    status: 'active' as const,
    weeklyTrend: [80, 82, 83, 84, 85]
  },
  {
    id: '5',
    name: 'Riley Johnson',
    email: 'riley@example.com',
    role: 'trainee' as const,
    avatar: null,
    avgScore: 81,
    totalSessions: 19,
    lastActive: '1 day ago',
    status: 'inactive' as const,
    weeklyTrend: [78, 79, 80, 80, 81]
  },
  {
    id: '6',
    name: 'Avery Martinez',
    email: 'avery@example.com',
    role: 'trainee' as const,
    avatar: null,
    avgScore: 89,
    totalSessions: 26,
    lastActive: '4 hours ago',
    status: 'active' as const,
    weeklyTrend: [84, 86, 87, 88, 89]
  },
  {
    id: '7',
    name: 'Jamie Davis',
    email: 'jamie@example.com',
    role: 'hr' as const,
    avatar: null,
    avgScore: 73,
    totalSessions: 8,
    lastActive: '2 days ago',
    status: 'inactive' as const,
    weeklyTrend: [70, 71, 72, 72, 73]
  },
  {
    id: '8',
    name: 'Drew Anderson',
    email: 'drew@example.com',
    role: 'trainee' as const,
    avatar: null,
    avgScore: 94,
    totalSessions: 35,
    lastActive: '30 minutes ago',
    status: 'active' as const,
    weeklyTrend: [90, 91, 92, 93, 94]
  },
]

// Mock team activity data for chart
const mockTeamActivity = mockTeamMembers.map(member => ({
  label: member.name.split(' ')[0],
  value: member.totalSessions,
  category: member.status
}))

// Mock activity feed
const mockActivityFeed = [
  {
    id: '1',
    type: 'completion',
    user: 'Drew Anderson',
    action: 'completed',
    target: 'Advanced Objection Handling',
    score: 94,
    time: '30 minutes ago'
  },
  {
    id: '2',
    type: 'achievement',
    user: 'Jordan Chen',
    action: 'earned',
    target: 'Perfect Score Badge',
    time: '1 hour ago'
  },
  {
    id: '3',
    type: 'completion',
    user: 'Alex Rivera',
    action: 'completed',
    target: 'Rate Discussion Basics',
    score: 87,
    time: '2 hours ago'
  },
  {
    id: '4',
    type: 'milestone',
    user: 'Avery Martinez',
    action: 'reached',
    target: '25 Sessions Milestone',
    time: '4 hours ago'
  },
  {
    id: '5',
    type: 'new_member',
    user: 'Drew Anderson',
    action: 'joined',
    target: 'the team',
    time: '2 days ago'
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'manager':
      return 'default'
    case 'hr':
      return 'info'
    case 'trainee':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getStatusColor(status: string) {
  return status === 'active' ? 'text-success' : 'text-muted-foreground'
}

export default async function TeamPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Trainees see limited view
  const isTrainee = user.role === 'trainee'

  // Calculate stats
  const totalMembers = mockTeamMembers.length
  const avgTeamScore = Math.round(
    mockTeamMembers.reduce((sum, m) => sum + m.avgScore, 0) / totalMembers
  )
  const activeThisWeek = mockTeamMembers.filter(m =>
    m.lastActive.includes('hour') || m.lastActive.includes('minute')
  ).length
  const topPerformer = mockTeamMembers.reduce((top, member) =>
    member.avgScore > top.avgScore ? member : top
  )

  return (
    <>
      <Header />
      <div className="space-y-6 p-4 md:p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            {isTrainee
              ? 'View your team members and their performance'
              : 'Manage your team members and track their progress'
            }
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card animated={false} className="border-l-4 border-l-chart-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Members</CardDescription>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{totalMembers}</CardTitle>
            </CardHeader>
          </Card>

          <Card animated={false} className="border-l-4 border-l-chart-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Average Team Score</CardDescription>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{avgTeamScore}%</CardTitle>
            </CardHeader>
          </Card>

          <Card animated={false} className="border-l-4 border-l-chart-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active This Week</CardDescription>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{activeThisWeek}</CardTitle>
            </CardHeader>
          </Card>

          <Card animated={false} className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Top Performer</CardDescription>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg font-headline truncate">
                {topPerformer.name.split(' ')[0]}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{topPerformer.avgScore}% avg</p>
            </CardHeader>
          </Card>
        </div>

        {/* Toolbar */}
        {!isTrainee && (
          <Card animated={false}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      className="pl-9"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="trainee">Trainees</SelectItem>
                      <SelectItem value="manager">Managers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="performance">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Team Members Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-headline text-xl font-semibold">Team Members</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {mockTeamMembers.map(member => (
                <Card
                  key={member.id}
                  animated={false}
                  className="group hover:border-primary/50 transition-colors duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar size="lg">
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback isHeadline>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                          member.status === 'active' ? 'bg-success' : 'bg-muted'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{member.name}</h3>
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </p>
                          </div>
                          <Badge
                            variant={getRoleBadgeVariant(member.role)}
                            size="sm"
                          >
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Performance Mini Chart */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-semibold">{member.avgScore}%</span>
                      </div>
                      <div className="flex items-end gap-1 h-12">
                        {member.weeklyTrend.map((score, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-chart-1 to-chart-2 rounded-t-sm opacity-70 group-hover:opacity-100 transition-opacity"
                            style={{ height: `${(score / 100) * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground">Sessions</div>
                        <div className="font-semibold">{member.totalSessions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last Active
                        </div>
                        <div className="text-sm font-medium">{member.lastActive}</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {!isTrainee && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Assign
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Feed Sidebar */}
          <div className="space-y-4">
            <h2 className="font-headline text-xl font-semibold">Recent Activity</h2>

            <Card animated={false}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {mockActivityFeed.map(activity => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'completion' && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {activity.type === 'achievement' && (
                          <Award className="h-5 w-5 text-warning" />
                        )}
                        {activity.type === 'milestone' && (
                          <TrendingUp className="h-5 w-5 text-info" />
                        )}
                        {activity.type === 'new_member' && (
                          <UserPlus className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        {activity.score && (
                          <Badge variant="success" size="sm" className="mt-1">
                            {activity.score}%
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Overview Chart */}
        <TeamActivityChart
          data={mockTeamActivity}
          title="Team Performance Overview"
          description="Compare session activity across team members"
          colorByCategory
          horizontal
        />
      </div>
    </>
  )
}