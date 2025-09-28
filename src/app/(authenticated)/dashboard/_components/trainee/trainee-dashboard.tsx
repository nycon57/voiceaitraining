import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Mic, Target, Trophy, Calendar, TrendingUp, Play, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface TraineeDashboardProps {
  user: AuthUser
}

// Mock data for initial development
const mockAssignments = [
  {
    id: 1,
    title: "Cold Call Introduction",
    type: "Scenario",
    status: "Completed",
    target: 85,
    score: 88,
    dueDate: "2025-01-15",
    progress: 100
  },
  {
    id: 2,
    title: "Objection Handling",
    type: "Scenario",
    status: "In Progress",
    target: 80,
    score: null,
    dueDate: "2025-01-20",
    progress: 60
  },
  {
    id: 3,
    title: "Loan Officer Track 1",
    type: "Track",
    status: "Assigned",
    target: 75,
    score: null,
    dueDate: "2025-01-25",
    progress: 0
  }
]

const mockMetrics = {
  averageScore: 85,
  completedSessions: 12,
  currentStreak: 5,
  talkListenRatio: 45,
  improvementRate: 12
}

export function TraineeDashboard({ user }: TraineeDashboardProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">

        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your sales training journey?
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/training">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Start Training
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/training/quick-practice">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Quick Practice
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                +{mockMetrics.improvementRate}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.completedSessions}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Talk/Listen Ratio</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.talkListenRatio}%</div>
              <p className="text-xs text-muted-foreground">
                Target: 40-45%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Active Assignments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
                <CardDescription>
                  Your current training assignments and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <Badge variant={assignment.type === 'Track' ? 'default' : 'secondary'}>
                            {assignment.type}
                          </Badge>
                          <Badge variant={
                            assignment.status === 'Completed' ? 'default' :
                            assignment.status === 'In Progress' ? 'secondary' : 'outline'
                          }>
                            {assignment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Due: {assignment.dueDate}</span>
                          <span>Target: {assignment.target}</span>
                          {assignment.score && <span>Score: {assignment.score}</span>}
                        </div>
                        <Progress value={assignment.progress} className="mt-2" />
                      </div>
                      <div className="ml-4">
                        {assignment.status !== 'Completed' ? (
                          <Button size="sm" asChild>
                            <Link href={`/training/session/new?${assignment.type === 'Track' ? 'track' : 'scenario'}=${assignment.id}`}>
                              {assignment.status === 'In Progress' ? 'Continue' : 'Start'}
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/training/session/new?scenario=${assignment.id}`}>
                              Retry
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Performance chart coming soon...
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/training">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      New Training Session
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/leaderboard">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/reports">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      My Progress
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Training Sessions</CardTitle>
            <CardDescription>
              Your latest practice sessions and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={assignment.status === 'Completed' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                    {assignment.score && (
                      <span className="text-sm font-medium">{assignment.score}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}