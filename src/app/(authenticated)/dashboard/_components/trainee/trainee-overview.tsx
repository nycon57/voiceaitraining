import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Mic,
  Target,
  Trophy,
  TrendingUp,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface TraineeOverviewProps {
  user: AuthUser
}

// Mock data for initial development
const mockStats = [
  {
    label: "Average Score",
    value: 85,
    icon: Trophy,
    trend: "+12%",
    description: "Your average performance score"
  },
  {
    label: "Completed Sessions",
    value: 24,
    icon: CheckCircle,
    trend: "+4",
    description: "Training sessions this month"
  },
  {
    label: "Current Streak",
    value: 7,
    icon: TrendingUp,
    trend: "days",
    description: "Consecutive days of training"
  },
  {
    label: "Talk/Listen Ratio",
    value: 43,
    icon: BarChart3,
    trend: "43:57",
    description: "Optimal range: 40-45%"
  }
]

const mockAssignments = [
  {
    id: 1,
    title: "Cold Call Introduction",
    type: "Scenario",
    status: "completed",
    dueDate: "2025-01-15",
    score: 88,
    progress: 100
  },
  {
    id: 2,
    title: "Objection Handling",
    type: "Scenario",
    status: "in_progress",
    dueDate: "2025-01-20",
    score: null,
    progress: 60
  },
  {
    id: 3,
    title: "Loan Officer Track 1",
    type: "Track",
    status: "assigned",
    dueDate: "2025-01-25",
    score: null,
    progress: 0
  }
]

export function TraineeOverview({ user }: TraineeOverviewProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">

      {/* Stats Cards */}
      {mockStats.map((stat) => (
        <Card key={stat.label} className="col-span-3 lg:col-span-2">
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
      <Card className="col-span-3 md:col-span-3 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href="/training">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Start Training
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/training/quick-practice">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Quick Practice
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Active Assignments */}
      <Card className="col-span-3 md:col-span-6">
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
          <CardDescription>
            Your current training assignments and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{assignment.title}</h4>
                    <Badge variant={assignment.type === 'Track' ? 'default' : 'secondary'}>
                      {assignment.type}
                    </Badge>
                    <Badge variant={
                      assignment.status === 'completed' ? 'default' :
                      assignment.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {assignment.status === 'completed' ? 'Completed' :
                       assignment.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {assignment.dueDate}
                    </div>
                    {assignment.score && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Score: {assignment.score}
                      </div>
                    )}
                  </div>

                  <Progress value={assignment.progress} className="h-2" />
                </div>

                <div className="ml-4">
                  {assignment.status === 'completed' ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/training/session/new?scenario=${assignment.id}`}>
                        Retry
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href={`/training/session/new?${assignment.type === 'Track' ? 'track' : 'scenario'}=${assignment.id}`}>
                        {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Performance */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>
            Your last 5 training sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { scenario: "Cold Call Intro", score: 88, date: "Jan 15" },
              { scenario: "Product Demo", score: 92, date: "Jan 14" },
              { scenario: "Price Negotiation", score: 79, date: "Jan 13" },
              { scenario: "Follow-up Call", score: 85, date: "Jan 12" },
              { scenario: "Closing Techniques", score: 91, date: "Jan 11" }
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{session.scenario}</p>
                  <p className="text-xs text-muted-foreground">{session.date}</p>
                </div>
                <Badge variant={session.score >= 85 ? 'default' : 'secondary'}>
                  {session.score}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}