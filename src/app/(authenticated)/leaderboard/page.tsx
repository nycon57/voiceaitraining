"use client"

import { useState, useMemo } from 'react'
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PerformanceTrendChart } from '@/components/charts/performance-trend-chart'
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Users,
  Target,
  Flame,
  Crown,
  Star,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  score: number
  attempts: number
  trend: number
  achievements: number
  isCurrentUser?: boolean
  streak?: number
  role?: string
}

type TimeFilter = 'weekly' | 'monthly' | 'allTime'
type ScopeFilter = 'global' | 'myTeam'

// Mock current user
const CURRENT_USER_ID = 'user-15'

// Mock data
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'user-1', name: 'Sarah Chen', score: 94, attempts: 45, trend: 3, achievements: 8, streak: 12, role: 'Senior Trainee' },
  { rank: 2, userId: 'user-2', name: 'Mike Johnson', score: 91, attempts: 38, trend: 1, achievements: 6, streak: 8, role: 'Trainee' },
  { rank: 3, userId: 'user-3', name: 'Emily Rodriguez', score: 89, attempts: 42, trend: 5, achievements: 7, streak: 15, role: 'Trainee' },
  { rank: 4, userId: 'user-4', name: 'David Kim', score: 87, attempts: 35, trend: -1, achievements: 5, streak: 3, role: 'Trainee' },
  { rank: 5, userId: 'user-5', name: 'Jennifer Adams', score: 86, attempts: 40, trend: 2, achievements: 6, streak: 7, role: 'Senior Trainee' },
  { rank: 6, userId: 'user-6', name: 'Robert Martinez', score: 85, attempts: 33, trend: 0, achievements: 4, streak: 2, role: 'Trainee' },
  { rank: 7, userId: 'user-7', name: 'Lisa Thompson', score: 84, attempts: 37, trend: 4, achievements: 5, streak: 5, role: 'Trainee' },
  { rank: 8, userId: 'user-8', name: 'James Wilson', score: 83, attempts: 31, trend: -2, achievements: 4, streak: 1, role: 'Trainee' },
  { rank: 9, userId: 'user-9', name: 'Amanda Brown', score: 82, attempts: 36, trend: 1, achievements: 5, streak: 4, role: 'Trainee' },
  { rank: 10, userId: 'user-10', name: 'Chris Davis', score: 81, attempts: 29, trend: 3, achievements: 4, streak: 6, role: 'Trainee' },
  { rank: 11, userId: 'user-11', name: 'Michelle Lee', score: 80, attempts: 34, trend: 0, achievements: 4, streak: 2, role: 'Trainee' },
  { rank: 12, userId: 'user-12', name: 'Kevin Garcia', score: 79, attempts: 28, trend: 2, achievements: 3, streak: 3, role: 'Trainee' },
  { rank: 13, userId: 'user-13', name: 'Rachel Moore', score: 78, attempts: 32, trend: -1, achievements: 3, streak: 1, role: 'Trainee' },
  { rank: 14, userId: 'user-14', name: 'Daniel White', score: 78, attempts: 27, trend: 4, achievements: 4, streak: 8, role: 'Trainee' },
  { rank: 15, userId: CURRENT_USER_ID, name: 'Alex Turner', score: 77, attempts: 25, trend: 5, achievements: 3, isCurrentUser: true, streak: 9, role: 'Trainee' },
  { rank: 16, userId: 'user-16', name: 'Nicole Harris', score: 76, attempts: 30, trend: 1, achievements: 3, streak: 4, role: 'Trainee' },
  { rank: 17, userId: 'user-17', name: 'Brian Clark', score: 75, attempts: 26, trend: 0, achievements: 2, streak: 2, role: 'Trainee' },
  { rank: 18, userId: 'user-18', name: 'Jessica Lopez', score: 74, attempts: 24, trend: -3, achievements: 2, streak: 1, role: 'Trainee' },
  { rank: 19, userId: 'user-19', name: 'Matthew Hall', score: 73, attempts: 23, trend: 2, achievements: 3, streak: 3, role: 'Trainee' },
  { rank: 20, userId: 'user-20', name: 'Lauren Young', score: 72, attempts: 22, trend: 1, achievements: 2, streak: 2, role: 'Trainee' },
  { rank: 21, userId: 'user-21', name: 'Andrew King', score: 71, attempts: 21, trend: -1, achievements: 2, streak: 1, role: 'Trainee' },
  { rank: 22, userId: 'user-22', name: 'Stephanie Wright', score: 70, attempts: 20, trend: 3, achievements: 2, streak: 5, role: 'Trainee' },
  { rank: 23, userId: 'user-23', name: 'Ryan Scott', score: 69, attempts: 19, trend: 0, achievements: 1, streak: 1, role: 'Trainee' },
  { rank: 24, userId: 'user-24', name: 'Megan Green', score: 68, attempts: 18, trend: 2, achievements: 2, streak: 3, role: 'Trainee' },
  { rank: 25, userId: 'user-25', name: 'Tyler Baker', score: 67, attempts: 17, trend: -2, achievements: 1, streak: 0, role: 'Trainee' },
]

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('global')

  const currentUser = useMemo(() => {
    return mockLeaderboard.find(entry => entry.isCurrentUser) || mockLeaderboard[14]
  }, [])

  // Calculate global stats
  const stats = useMemo(() => {
    const totalParticipants = mockLeaderboard.length
    const avgScore = Math.round(mockLeaderboard.reduce((sum, e) => sum + e.score, 0) / totalParticipants)
    const topScore = mockLeaderboard[0].score
    const mostImproved = [...mockLeaderboard].sort((a, b) => b.trend - a.trend)[0]

    return { totalParticipants, avgScore, topScore, mostImproved }
  }, [])

  // Get rank color class
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-warning'
    if (rank <= 3) return 'text-muted-foreground'
    if (rank <= 10) return 'text-primary'
    return 'text-muted-foreground'
  }

  // Mock user progress data
  const userProgressData = [
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 68 },
    { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), score: 70 },
    { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), score: 71 },
    { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 73 },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), score: 75 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), score: 76 },
    { date: new Date(), score: 77 },
  ]

  return (
    <>
      <Header />
      <div className="space-y-6 p-4">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you stack up against your peers
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <TabsList>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={scopeFilter} onValueChange={(v) => setScopeFilter(v as ScopeFilter)}>
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="myTeam">My Team</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* My Rank Card - Sticky */}
        <Card variant="featured" animated={false} className="sticky top-4 z-10">
          <CardContent className="py-6">
            <div className="grid gap-6 md:grid-cols-[auto_1fr_auto]">
              {/* Rank Display */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 p-1">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                      <div className="text-center">
                        <div className="font-headline text-3xl font-bold text-primary">#{currentUser.rank}</div>
                      </div>
                    </div>
                  </div>
                  {currentUser.trend > 0 && (
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex flex-col justify-center gap-2">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback isHeadline>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-headline text-xl font-bold">{currentUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentUser.streak && currentUser.streak > 0 && (
                    <Badge variant="warning" size="sm">
                      <Flame className="h-3 w-3" />
                      {currentUser.streak} day streak
                    </Badge>
                  )}
                  <Badge variant="success" size="sm">
                    <Star className="h-3 w-3" />
                    {currentUser.achievements} achievements
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1 md:gap-3">
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-headline text-2xl font-bold">{currentUser.score}</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Attempts</p>
                  <p className="font-headline text-2xl font-bold">{currentUser.attempts}</p>
                </div>
                <div className="col-span-2 rounded-lg border bg-muted/50 p-3 text-center md:col-span-1">
                  <p className="text-xs text-muted-foreground">Rank Change</p>
                  <div className="flex items-center justify-center gap-1">
                    {currentUser.trend > 0 && <TrendingUp className="h-4 w-4 text-success" />}
                    {currentUser.trend < 0 && <TrendingDown className="h-4 w-4 text-destructive" />}
                    {currentUser.trend === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                    <p className={cn(
                      "font-headline text-xl font-bold",
                      currentUser.trend > 0 && "text-success",
                      currentUser.trend < 0 && "text-destructive"
                    )}>
                      {currentUser.trend > 0 ? '+' : ''}{currentUser.trend}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        <Card animated={false}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              Top Performers
            </CardTitle>
            <CardDescription>The best of the best this {timeFilter === 'weekly' ? 'week' : timeFilter === 'monthly' ? 'month' : 'year'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* 2nd Place */}
              <div className="order-2 md:order-1">
                <PodiumCard entry={mockLeaderboard[1]} position={2} />
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2">
                <PodiumCard entry={mockLeaderboard[0]} position={1} />
              </div>

              {/* 3rd Place */}
              <div className="order-3">
                <PodiumCard entry={mockLeaderboard[2]} position={3} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rankings Table */}
        <Card animated={false}>
          <CardHeader>
            <CardTitle className="font-headline">Full Rankings</CardTitle>
            <CardDescription>Complete leaderboard standings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table animated={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Attempts</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Trend</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Achievements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeaderboard.slice(3).map((entry) => (
                  <TableRow
                    key={entry.userId}
                    className={cn(
                      entry.isCurrentUser && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <TableCell>
                      <span className={cn(
                        "font-headline text-lg font-bold",
                        getRankColor(entry.rank)
                      )}>
                        #{entry.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="default">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <Badge variant="brand" size="sm">You</Badge>
                            )}
                          </div>
                          {entry.streak && entry.streak >= 7 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Flame className="h-3 w-3 text-warning" />
                              {entry.streak} day streak
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-headline text-lg font-bold">{entry.score}</span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <span className="text-muted-foreground">{entry.attempts}</span>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {entry.trend > 0 && <TrendingUp className="h-4 w-4 text-success" />}
                        {entry.trend < 0 && <TrendingDown className="h-4 w-4 text-destructive" />}
                        {entry.trend === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                        <span className={cn(
                          "font-semibold",
                          entry.trend > 0 && "text-success",
                          entry.trend < 0 && "text-destructive",
                          entry.trend === 0 && "text-muted-foreground"
                        )}>
                          {entry.trend > 0 ? '+' : ''}{entry.trend}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <Badge variant="muted" size="sm">
                        <Award className="h-3 w-3" />
                        {entry.achievements}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts and Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Progress Chart */}
          <PerformanceTrendChart
            data={userProgressData}
            title="Your Score Progression"
            description="Track your improvement over time"
            showArea={true}
          />

          {/* Stats Panel */}
          <Card animated={false}>
            <CardHeader>
              <CardTitle className="font-headline">Leaderboard Stats</CardTitle>
              <CardDescription>Competition overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Participants</span>
                    </div>
                    <p className="font-headline text-3xl font-bold">{stats.totalParticipants}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">Avg Score</span>
                    </div>
                    <p className="font-headline text-3xl font-bold">{stats.avgScore}</p>
                  </div>
                </div>

                <div className="rounded-lg border bg-gradient-to-br from-warning/10 to-warning/5 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span className="text-sm font-semibold">Top Score This {timeFilter === 'weekly' ? 'Week' : timeFilter === 'monthly' ? 'Month' : 'Year'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline text-4xl font-bold text-warning">{stats.topScore}</p>
                      <p className="text-sm text-muted-foreground mt-1">{mockLeaderboard[0].name}</p>
                    </div>
                    <Crown className="h-12 w-12 text-warning/30" />
                  </div>
                </div>

                <div className="rounded-lg border bg-gradient-to-br from-success/10 to-success/5 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Sparkles className="h-4 w-4 text-success" />
                    <span className="text-sm font-semibold">Most Improved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stats.mostImproved.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-lg font-bold text-success">+{stats.mostImproved.trend}</span>
                      </div>
                    </div>
                    <Avatar size="xl">
                      <AvatarImage src={stats.mostImproved.avatar} />
                      <AvatarFallback isHeadline>
                        {stats.mostImproved.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Keep practicing to climb the ranks and earn more achievements!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const medalConfig = {
    1: { icon: Trophy, color: 'text-warning', bg: 'bg-warning/10', size: 'scale-110', label: '1st Place' },
    2: { icon: Medal, color: 'text-muted-foreground', bg: 'bg-muted/50', size: 'scale-100', label: '2nd Place' },
    3: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10', size: 'scale-100', label: '3rd Place' }
  }

  const config = medalConfig[position]
  const MedalIcon = config.icon

  return (
    <Card
      variant={position === 1 ? 'featured' : 'default'}
      animated={true}
      className={cn(
        "relative overflow-hidden",
        position === 1 && config.size
      )}
    >
      <CardContent className="pt-6 text-center">
        {/* Medal/Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div className={cn("rounded-full p-4", config.bg)}>
            <MedalIcon className={cn("h-8 w-8", config.color)} />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <Avatar size={position === 1 ? "2xl" : "xl"} animated={true}>
            <AvatarImage src={entry.avatar} />
            <AvatarFallback isHeadline>
              {entry.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h3 className={cn(
          "font-headline font-bold mb-1",
          position === 1 ? "text-xl" : "text-lg"
        )}>
          {entry.name}
        </h3>

        <p className="text-xs text-muted-foreground mb-3">{entry.role}</p>

        {/* Score */}
        <div className="rounded-lg border bg-muted/50 p-3 mb-3">
          <p className="text-xs text-muted-foreground mb-1">Score</p>
          <p className={cn(
            "font-headline font-bold",
            position === 1 ? "text-4xl" : "text-3xl"
          )}>
            {entry.score}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="muted" size="sm">
            {entry.attempts} attempts
          </Badge>
          {entry.achievements > 0 && (
            <Badge variant="success" size="sm">
              <Award className="h-3 w-3" />
              {entry.achievements}
            </Badge>
          )}
          {entry.trend > 0 && (
            <Badge variant="success" size="sm">
              <TrendingUp className="h-3 w-3" />
              +{entry.trend}
            </Badge>
          )}
        </div>

        {/* Position Badge */}
        <Badge
          variant={position === 1 ? "brand" : "outline"}
          className="mt-4"
        >
          {config.label}
        </Badge>
      </CardContent>
    </Card>
  )
}