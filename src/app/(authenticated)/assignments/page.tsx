"use client"

import { useState, useMemo } from 'react'
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PerformanceTrendChart } from '@/components/charts/performance-trend-chart'
import {
  Target,
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Search,
  SortAsc,
  Calendar,
  Trophy,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue'
type AssignmentType = 'scenario' | 'track'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

interface Assignment {
  id: string
  title: string
  description: string
  type: AssignmentType
  status: AssignmentStatus
  progress: number
  dueDate: Date
  score: number | null
  difficulty: Difficulty
  estimatedTime?: string
}

// Mock data
const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Cold Call Mastery',
    description: 'Learn effective cold calling techniques for mortgage lending',
    type: 'scenario',
    status: 'in_progress',
    progress: 60,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    score: null,
    difficulty: 'intermediate',
    estimatedTime: '15 min'
  },
  {
    id: '2',
    title: 'Objection Handling Track',
    description: 'Complete series on handling common objections',
    type: 'track',
    status: 'not_started',
    progress: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    score: null,
    difficulty: 'advanced',
    estimatedTime: '45 min'
  },
  {
    id: '3',
    title: 'First-Time Buyer Consultation',
    description: 'Practice consultative selling with first-time home buyers',
    type: 'scenario',
    status: 'completed',
    progress: 100,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    score: 87,
    difficulty: 'beginner',
    estimatedTime: '20 min'
  },
  {
    id: '4',
    title: 'Rate Shopping Scenarios',
    description: 'Handle customers comparing rates with competitors',
    type: 'scenario',
    status: 'overdue',
    progress: 45,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    score: null,
    difficulty: 'intermediate',
    estimatedTime: '12 min'
  },
  {
    id: '5',
    title: 'Refinancing Fundamentals',
    description: 'Master the art of refinancing conversations',
    type: 'scenario',
    status: 'completed',
    progress: 100,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    score: 92,
    difficulty: 'intermediate',
    estimatedTime: '18 min'
  },
  {
    id: '6',
    title: 'Advanced Negotiations Track',
    description: 'Learn negotiation tactics for complex loan scenarios',
    type: 'track',
    status: 'in_progress',
    progress: 30,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    score: null,
    difficulty: 'advanced',
    estimatedTime: '60 min'
  },
  {
    id: '7',
    title: 'Building Rapport & Trust',
    description: 'Develop skills to build lasting client relationships',
    type: 'scenario',
    status: 'completed',
    progress: 100,
    dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    score: 95,
    difficulty: 'beginner',
    estimatedTime: '10 min'
  },
  {
    id: '8',
    title: 'Compliance & Documentation',
    description: 'Navigate compliance questions with confidence',
    type: 'scenario',
    status: 'not_started',
    progress: 0,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    score: null,
    difficulty: 'intermediate',
    estimatedTime: '25 min'
  }
]

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'name' | 'status'>('dueDate')
  const [filterTab, setFilterTab] = useState<'all' | AssignmentStatus>('all')

  // Calculate statistics
  const stats = useMemo(() => {
    const total = mockAssignments.length
    const completed = mockAssignments.filter(a => a.status === 'completed').length
    const inProgress = mockAssignments.filter(a => a.status === 'in_progress').length
    const overdue = mockAssignments.filter(a => a.status === 'overdue').length
    const completionRate = Math.round((completed / total) * 100)

    return { total, completed, inProgress, overdue, completionRate }
  }, [])

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = mockAssignments

    // Apply tab filter
    if (filterTab !== 'all') {
      filtered = filtered.filter(a => a.status === filterTab)
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime()
        case 'name':
          return a.title.localeCompare(b.title)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'priority':
          // Priority: overdue > in_progress > not_started > completed
          const priorityOrder: Record<AssignmentStatus, number> = {
            overdue: 0,
            in_progress: 1,
            not_started: 2,
            completed: 3
          }
          return priorityOrder[a.status] - priorityOrder[b.status]
        default:
          return 0
      }
    })
  }, [filterTab, searchQuery, sortBy])

  // Chart data for completion trend
  const completionTrendData = [
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 72 },
    { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), score: 78 },
    { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), score: 75 },
    { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 82 },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), score: 87 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), score: 92 },
    { date: new Date(), score: 95 },
  ]

  return (
    <>
      <Header />
      <div className="space-y-6 p-4">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Track and complete your training assignments
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card animated={false}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="font-headline text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card animated={false}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-success/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-headline text-2xl font-bold">{stats.completed}</p>
                    <p className="text-sm text-success">({stats.completionRate}%)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card animated={false}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-warning/10 p-3">
                  <PlayCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="font-headline text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card animated={false}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="font-headline text-2xl font-bold text-destructive">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as typeof filterTab)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="not_started">Not Started</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={filterTab} className="mt-6">
            {/* Assignment Cards Grid */}
            {filteredAssignments.length === 0 ? (
              <Card animated={false}>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-headline text-xl font-semibold mb-2">No assignments found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No assignments match the selected filter'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceTrendChart
            data={completionTrendData}
            title="Average Score Trend"
            description="Your performance on completed assignments"
            showArea={true}
          />

          <Card animated={false}>
            <CardHeader>
              <CardTitle className="font-headline">Assignments by Status</CardTitle>
              <CardDescription>Distribution of your current assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold">{stats.completed} ({stats.completionRate}%)</span>
                  </div>
                  <Progress value={stats.completionRate} variant="success" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold">{stats.inProgress} ({Math.round((stats.inProgress / stats.total) * 100)}%)</span>
                  </div>
                  <Progress value={(stats.inProgress / stats.total) * 100} variant="warning" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className="font-semibold">{stats.overdue} ({Math.round((stats.overdue / stats.total) * 100)}%)</span>
                  </div>
                  <Progress value={(stats.overdue / stats.total) * 100} variant="destructive" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-xs">Avg Score</span>
                  </div>
                  <p className="font-headline text-2xl font-bold">89</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">On Track</span>
                  </div>
                  <p className="font-headline text-2xl font-bold">{stats.total - stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const daysUntilDue = Math.ceil((assignment.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntilDue <= 3 && daysUntilDue > 0 && assignment.status !== 'completed'
  const isFeatured = assignment.status === 'overdue'

  const statusConfig: Record<AssignmentStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline'; icon: any }> = {
    not_started: { label: 'Not Started', variant: 'outline', icon: Target },
    in_progress: { label: 'In Progress', variant: 'warning', icon: PlayCircle },
    completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
    overdue: { label: 'Overdue', variant: 'destructive', icon: AlertCircle }
  }

  const difficultyConfig: Record<Difficulty, { label: string; variant: 'default' | 'warning' | 'destructive' }> = {
    beginner: { label: 'Beginner', variant: 'default' },
    intermediate: { label: 'Intermediate', variant: 'warning' },
    advanced: { label: 'Advanced', variant: 'destructive' }
  }

  const typeConfig: Record<AssignmentType, { icon: any; color: string }> = {
    scenario: { icon: BookOpen, color: 'text-chart-1' },
    track: { icon: Trophy, color: 'text-chart-2' }
  }

  const status = statusConfig[assignment.status]
  const difficulty = difficultyConfig[assignment.difficulty]
  const type = typeConfig[assignment.type]
  const StatusIcon = status.icon
  const TypeIcon = type.icon

  return (
    <Card variant={isFeatured ? 'featured' : 'default'} animated={true}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <TypeIcon className={cn('h-4 w-4', type.color)} />
            <Badge variant="outline" size="sm">
              {assignment.type === 'scenario' ? 'Scenario' : 'Track'}
            </Badge>
          </div>
          <Badge variant={status.variant} size="sm">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        <CardTitle className="font-headline text-lg mt-2">{assignment.title}</CardTitle>
        <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          {assignment.progress > 0 && assignment.status !== 'completed' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{assignment.progress}%</span>
              </div>
              <Progress value={assignment.progress} variant={assignment.status === 'overdue' ? 'destructive' : 'default'} />
            </div>
          )}

          {/* Score for completed */}
          {assignment.score !== null && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span className="font-headline text-2xl font-bold">{assignment.score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={difficulty.variant} size="sm">
              {difficulty.label}
            </Badge>
            {assignment.estimatedTime && (
              <Badge variant="muted" size="sm">
                <Clock className="h-3 w-3" />
                {assignment.estimatedTime}
              </Badge>
            )}
          </div>

          {/* Due Date */}
          <div className={cn(
            "flex items-center gap-2 text-sm rounded-lg border p-2",
            assignment.status === 'overdue' && "bg-destructive/10 border-destructive/20",
            isUrgent && "bg-warning/10 border-warning/20"
          )}>
            <Calendar className={cn(
              "h-4 w-4",
              assignment.status === 'overdue' && "text-destructive",
              isUrgent && "text-warning"
            )} />
            <span className={cn(
              "text-muted-foreground",
              assignment.status === 'overdue' && "text-destructive font-medium",
              isUrgent && "text-warning font-medium"
            )}>
              {assignment.status === 'overdue'
                ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                : assignment.status === 'completed'
                ? `Completed ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} ago`
                : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
              }
            </span>
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            variant={assignment.status === 'completed' ? 'outline' : 'default'}
            size="sm"
          >
            {assignment.status === 'completed' ? 'Review' : assignment.status === 'in_progress' ? 'Continue' : 'Start'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}