import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mic,
  Play,
  BookOpen,
  Target,
  Clock,
  Trophy,
  Zap,
  Users,
  Star,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Flame
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

interface TrainingHubProps {
  user: AuthUser
}

// Mock data for initial development
const mockQuickStart = [
  {
    id: 1,
    title: "Quick Practice Session",
    description: "Jump into a random scenario for immediate practice",
    type: "quick_practice",
    difficulty: "mixed",
    duration: "5-10 min",
    icon: Zap,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Continue Last Session",
    description: "Resume your previous training session",
    type: "continue",
    difficulty: "medium",
    duration: "15 min",
    icon: Play,
    color: "bg-green-500"
  }
]

const mockScenarios = [
  {
    id: 1,
    title: "Cold Call Introduction",
    description: "Master the art of opening conversations with prospects",
    difficulty: "beginner",
    duration: "10-15 min",
    completions: 156,
    avgScore: 85,
    tags: ["Communication", "First Impression"],
    industry: "General"
  },
  {
    id: 2,
    title: "Objection Handling",
    description: "Learn to address common customer concerns effectively",
    difficulty: "intermediate",
    duration: "15-20 min",
    completions: 89,
    avgScore: 78,
    tags: ["Persuasion", "Problem Solving"],
    industry: "General"
  },
  {
    id: 3,
    title: "Loan Application Process",
    description: "Guide customers through loan applications smoothly",
    difficulty: "advanced",
    duration: "20-25 min",
    completions: 45,
    avgScore: 82,
    tags: ["Finance", "Compliance"],
    industry: "Banking"
  },
  {
    id: 4,
    title: "Insurance Claims Review",
    description: "Handle insurance claims with empathy and efficiency",
    difficulty: "intermediate",
    duration: "15-20 min",
    completions: 67,
    avgScore: 79,
    tags: ["Empathy", "Process"],
    industry: "Insurance"
  }
]

const mockTracks = [
  {
    id: 1,
    title: "Sales Fundamentals",
    description: "Complete foundation in sales communication",
    scenarios: 8,
    duration: "2-3 hours",
    progress: 75,
    difficulty: "beginner",
    participants: 234
  },
  {
    id: 2,
    title: "Loan Officer Certification",
    description: "Industry-specific training for loan officers",
    scenarios: 12,
    duration: "4-5 hours",
    progress: 25,
    difficulty: "intermediate",
    participants: 89
  },
  {
    id: 3,
    title: "Advanced Objection Handling",
    description: "Master complex objection scenarios",
    scenarios: 6,
    duration: "2 hours",
    progress: 0,
    difficulty: "advanced",
    participants: 45
  }
]

const mockAssignments = [
  {
    id: 1,
    title: "Cold Call Introduction",
    type: "Scenario",
    assignedBy: "Sarah Manager",
    dueDate: "2025-01-25",
    status: "in_progress",
    progress: 60
  },
  {
    id: 2,
    title: "Q1 Sales Training Track",
    type: "Track",
    assignedBy: "Mike Director",
    dueDate: "2025-02-15",
    status: "assigned",
    progress: 0
  }
]

export function TrainingHub({ user }: TrainingHubProps) {
  // Mock stats for hero section - in real app, fetch from API
  const userStats = {
    sessionsThisWeek: 7,
    avgScore: 84,
    currentStreak: 3,
    lastSession: "Objection Handling",
    lastSessionProgress: 75
  }

  // Mock featured scenarios for carousel
  const featuredScenarios = [
    {
      id: 1,
      title: "Master Cold Calling",
      description: "Perfect your introduction technique with our most popular scenario",
      badge: "Most Popular",
      image: "🎯",
      difficulty: "beginner"
    },
    {
      id: 2,
      title: "Closing Techniques",
      description: "Learn advanced closing strategies that top performers use",
      badge: "Expert Pick",
      image: "🏆",
      difficulty: "advanced"
    },
    {
      id: 3,
      title: "Loan Application Mastery",
      description: "Industry-specific training for loan officers",
      badge: "New",
      image: "💼",
      difficulty: "intermediate"
    }
  ]

  // Mock achievements
  const recentAchievements = [
    { id: 1, name: "First Steps", description: "Complete your first scenario", icon: "🎯" },
    { id: 2, name: "Week Warrior", description: "7 day streak", icon: "🔥" },
    { id: 3, name: "High Performer", description: "Score above 80%", icon: "⭐" }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-none bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="font-headline text-3xl font-bold tracking-tight mb-2">
                Welcome back, {user.name || 'Trainee'}!
              </h2>
              <p className="text-muted-foreground text-lg">
                Ready to level up your skills? Pick up where you left off or try something new.
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" asChild>
              <Link href="/training/session/new?type=quick_practice">
                <Zap className="h-5 w-5 mr-2" />
                Start Quick Practice
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 mt-6 grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border bg-white/80 dark:bg-background/80 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Calendar className="h-4 w-4" />
                This Week
              </div>
              <div className="font-headline text-2xl font-bold">{userStats.sessionsThisWeek}</div>
              <div className="text-xs text-muted-foreground">sessions</div>
            </div>
            <div className="rounded-lg border bg-white/80 dark:bg-background/80 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Trophy className="h-4 w-4" />
                Avg Score
              </div>
              <div className="font-headline text-2xl font-bold text-blue-600">{userStats.avgScore}%</div>
              <div className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +5% from last week
              </div>
            </div>
            <div className="rounded-lg border bg-white/80 dark:bg-background/80 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Flame className="h-4 w-4" />
                Current Streak
              </div>
              <div className="font-headline text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
            <div className="rounded-lg border bg-white/80 dark:bg-background/80 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Award className="h-4 w-4" />
                Achievements
              </div>
              <div className="font-headline text-2xl font-bold">{recentAchievements.length}</div>
              <div className="text-xs text-muted-foreground">unlocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Learning Section */}
      {userStats.lastSession && (
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Continue Learning</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Pick up where you left off: <span className="font-medium text-foreground">{userStats.lastSession}</span>
                </p>
                <div className="flex items-center gap-3">
                  <Progress value={userStats.lastSessionProgress} className="h-2 flex-1 max-w-[200px]" />
                  <span className="text-sm text-muted-foreground">{userStats.lastSessionProgress}% complete</span>
                </div>
              </div>
              <Button variant="outline" size="lg" asChild>
                <Link href="/training/session/continue">
                  Resume
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Scenarios Carousel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Featured Scenarios</CardTitle>
              <CardDescription>Top picks selected just for you</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              Curated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {featuredScenarios.map((scenario) => (
                <CarouselItem key={scenario.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-2 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-3">{scenario.image}</div>
                      <Badge className="mb-3" variant="secondary">{scenario.badge}</Badge>
                      <h4 className="font-semibold text-lg mb-2">{scenario.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          scenario.difficulty === 'beginner' ? 'secondary' :
                          scenario.difficulty === 'intermediate' ? 'default' : 'destructive'
                        }>
                          {scenario.difficulty}
                        </Badge>
                        <Button size="sm" asChild>
                          <Link href={`/training/session/new?scenario=${scenario.id}`}>
                            Start
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>Keep up the great work!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="group relative flex items-center gap-3 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 min-w-[200px] hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockQuickStart.map((option) => (
          <Card key={option.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${option.color} rounded-lg p-3`}>
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{option.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">{option.duration}</span>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/training/session/new?type=${option.type}`}>
                    Start
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Attempts Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Recent Training Sessions</CardTitle>
              <CardDescription>Your last 5 training attempts</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/attempts">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { id: 1, scenario: "Cold Call Introduction", score: 87, date: "2 hours ago", status: "completed" },
              { id: 2, scenario: "Objection Handling", score: 92, date: "Yesterday", status: "completed" },
              { id: 3, scenario: "Loan Application Process", score: 78, date: "2 days ago", status: "completed" },
              { id: 4, scenario: "Insurance Claims Review", score: 85, date: "3 days ago", status: "completed" },
              { id: 5, scenario: "Cold Call Introduction", score: 81, date: "4 days ago", status: "completed" }
            ].map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`rounded-full p-2 ${
                    attempt.score >= 90 ? 'bg-green-100 dark:bg-green-950' :
                    attempt.score >= 80 ? 'bg-blue-100 dark:bg-blue-950' :
                    attempt.score >= 70 ? 'bg-yellow-100 dark:bg-yellow-950' :
                    'bg-red-100 dark:bg-red-950'
                  }`}>
                    <Trophy className={`h-4 w-4 ${
                      attempt.score >= 90 ? 'text-green-600' :
                      attempt.score >= 80 ? 'text-blue-600' :
                      attempt.score >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{attempt.scenario}</div>
                    <div className="text-sm text-muted-foreground">{attempt.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      attempt.score >= 90 ? 'text-green-600' :
                      attempt.score >= 80 ? 'text-blue-600' :
                      attempt.score >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {attempt.score}%
                    </div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/attempts/${attempt.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Training Content */}
      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="tracks" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Training Tracks
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Assignments
          </TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Scenarios</CardTitle>
              <CardDescription>
                Practice specific skills with targeted scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockScenarios.map((scenario) => (
                  <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {scenario.description}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          scenario.difficulty === 'beginner' ? 'secondary' :
                          scenario.difficulty === 'intermediate' ? 'default' : 'destructive'
                        }>
                          {scenario.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scenario.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {scenario.completions} attempts
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {scenario.avgScore}% avg
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {scenario.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          {scenario.industry}
                        </Badge>
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/training/session/new?scenario=${scenario.id}`}>
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            Start Training
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tracks Tab */}
        <TabsContent value="tracks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Tracks</CardTitle>
              <CardDescription>
                Structured learning paths with multiple scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTracks.map((track) => (
                  <Card key={track.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{track.title}</h3>
                            <Badge variant={
                              track.difficulty === 'beginner' ? 'secondary' :
                              track.difficulty === 'intermediate' ? 'default' : 'destructive'
                            }>
                              {track.difficulty}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground mb-3">{track.description}</p>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {track.scenarios} scenarios
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {track.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {track.participants} participants
                            </div>
                          </div>

                          {track.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{track.progress}%</span>
                              </div>
                              <Progress value={track.progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          <Button asChild>
                            <Link href={`/training/track/${track.id}`}>
                              <div className="flex items-center gap-2">
                                {track.progress > 0 ? 'Continue' : 'Start Track'}
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assignments</CardTitle>
              <CardDescription>
                Training assigned by your manager or organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{assignment.title}</h3>
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

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>Assigned by: {assignment.assignedBy}</span>
                            <span>Due: {assignment.dueDate}</span>
                          </div>

                          {assignment.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{assignment.progress}%</span>
                              </div>
                              <Progress value={assignment.progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          <Button asChild>
                            <Link href={`/training/session/new?${assignment.type === 'Track' ? 'track' : 'scenario'}=${assignment.id}`}>
                              <div className="flex items-center gap-2">
                                {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                    <p className="text-muted-foreground">
                      Your manager hasn't assigned any training yet. Try exploring scenarios or tracks above.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}