import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import {
  Briefcase,
  Clock,
  Target,
  Users as UsersIcon,
  CheckCircle2,
  Lock,
  Circle,
  ChevronRight,
  Star,
  TrendingUp,
  BookOpen,
  Award,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for tracks
const mockTracks = [
  {
    id: '1',
    title: 'Loan Officer Fundamentals',
    description: 'Master the basics of loan origination and customer service. Build a strong foundation in mortgage lending.',
    difficulty: 'beginner' as const,
    scenarioCount: 6,
    estimatedDuration: '2 weeks',
    enrolled: true,
    progress: 50,
    completions: 823,
    rating: 4.8,
    featured: true,
    industry: 'loan-officers',
    prerequisites: [],
    scenarios: [
      { id: '1', title: 'Introduction Call', status: 'completed' as const, estimatedMinutes: 15 },
      { id: '2', title: 'Document Collection', status: 'completed' as const, estimatedMinutes: 20 },
      { id: '3', title: 'Rate Discussion', status: 'current' as const, estimatedMinutes: 25 },
      { id: '4', title: 'Objection Handling', status: 'locked' as const, estimatedMinutes: 30 },
      { id: '5', title: 'Closing Preparation', status: 'locked' as const, estimatedMinutes: 20 },
      { id: '6', title: 'Final Review', status: 'locked' as const, estimatedMinutes: 25 },
    ]
  },
  {
    id: '2',
    title: 'Advanced Sales Techniques',
    description: 'Take your sales skills to the next level with advanced negotiation and closing strategies.',
    difficulty: 'advanced' as const,
    scenarioCount: 8,
    estimatedDuration: '3 weeks',
    enrolled: false,
    progress: 0,
    completions: 342,
    rating: 4.9,
    featured: true,
    industry: 'sales',
    prerequisites: ['1'],
    scenarios: [
      { id: '7', title: 'Complex Negotiation', status: 'locked' as const, estimatedMinutes: 35 },
      { id: '8', title: 'Multi-Stakeholder Calls', status: 'locked' as const, estimatedMinutes: 40 },
      { id: '9', title: 'Handling Difficult Clients', status: 'locked' as const, estimatedMinutes: 30 },
      { id: '10', title: 'Upselling Strategies', status: 'locked' as const, estimatedMinutes: 25 },
      { id: '11', title: 'Contract Negotiation', status: 'locked' as const, estimatedMinutes: 45 },
      { id: '12', title: 'Closing Under Pressure', status: 'locked' as const, estimatedMinutes: 30 },
      { id: '13', title: 'Post-Sale Follow-up', status: 'locked' as const, estimatedMinutes: 20 },
      { id: '14', title: 'Referral Generation', status: 'locked' as const, estimatedMinutes: 25 },
    ]
  },
  {
    id: '3',
    title: 'Customer Service Excellence',
    description: 'Deliver exceptional customer experiences through effective communication and problem-solving.',
    difficulty: 'intermediate' as const,
    scenarioCount: 5,
    estimatedDuration: '10 days',
    enrolled: true,
    progress: 20,
    completions: 654,
    rating: 4.7,
    featured: false,
    industry: 'sales',
    prerequisites: [],
    scenarios: [
      { id: '15', title: 'Active Listening', status: 'completed' as const, estimatedMinutes: 20 },
      { id: '16', title: 'Empathy Building', status: 'locked' as const, estimatedMinutes: 25 },
      { id: '17', title: 'Complaint Resolution', status: 'locked' as const, estimatedMinutes: 30 },
      { id: '18', title: 'De-escalation Tactics', status: 'locked' as const, estimatedMinutes: 35 },
      { id: '19', title: 'Service Recovery', status: 'locked' as const, estimatedMinutes: 25 },
    ]
  },
  {
    id: '4',
    title: 'Mortgage Pre-Approval Process',
    description: 'Navigate the pre-approval process with confidence and guide clients effectively.',
    difficulty: 'intermediate' as const,
    scenarioCount: 7,
    estimatedDuration: '2.5 weeks',
    enrolled: false,
    progress: 0,
    completions: 521,
    rating: 4.6,
    featured: false,
    industry: 'loan-officers',
    prerequisites: ['1'],
    scenarios: [
      { id: '20', title: 'Initial Qualification', status: 'locked' as const, estimatedMinutes: 20 },
      { id: '21', title: 'Credit Analysis', status: 'locked' as const, estimatedMinutes: 30 },
      { id: '22', title: 'Income Verification', status: 'locked' as const, estimatedMinutes: 25 },
      { id: '23', title: 'Debt-to-Income Ratio', status: 'locked' as const, estimatedMinutes: 30 },
      { id: '24', title: 'Asset Documentation', status: 'locked' as const, estimatedMinutes: 25 },
      { id: '25', title: 'Pre-Approval Letter', status: 'locked' as const, estimatedMinutes: 20 },
      { id: '26', title: 'Rate Lock Strategy', status: 'locked' as const, estimatedMinutes: 30 },
    ]
  },
]

function getDifficultyBadgeVariant(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return 'success'
    case 'intermediate':
      return 'warning'
    case 'advanced':
      return 'destructive'
    default:
      return 'default'
  }
}

function getScenarioIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case 'current':
      return <Circle className="h-5 w-5 text-primary fill-primary" />
    case 'locked':
      return <Lock className="h-5 w-5 text-muted-foreground" />
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />
  }
}

export default async function TracksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Calculate stats
  const totalTracks = mockTracks.length
  const enrolledTracks = mockTracks.filter(t => t.enrolled).length
  const completedTracks = mockTracks.filter(t => t.enrolled && t.progress === 100).length
  const avgCompletionTime = '2.1 weeks'

  return (
    <>
      <Header />
      <div className="space-y-6 p-4 md:p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Training Tracks</h1>
          <p className="text-muted-foreground">
            Browse structured learning paths and track your progress through comprehensive training curricula
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card animated={false} className="border-l-4 border-l-chart-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Tracks</CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{totalTracks}</CardTitle>
            </CardHeader>
          </Card>

          <Card animated={false} className="border-l-4 border-l-chart-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Enrolled</CardDescription>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{enrolledTracks}</CardTitle>
            </CardHeader>
          </Card>

          <Card animated={false} className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Completed</CardDescription>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">{completedTracks}</CardTitle>
            </CardHeader>
          </Card>

          <Card animated={false} className="border-l-4 border-l-info">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Avg Completion</CardDescription>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg font-headline">{avgCompletionTime}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All Tracks</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="loan-officers">Loan Officers</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Featured Tracks */}
            {mockTracks.filter(t => t.featured).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <h2 className="font-headline text-xl font-semibold">Featured Tracks</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {mockTracks.filter(t => t.featured).map(track => (
                    <TrackCard key={track.id} track={track} featured />
                  ))}
                </div>
              </div>
            )}

            {/* All Tracks */}
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-semibold">All Training Tracks</h2>

              <div className="grid gap-6 lg:grid-cols-2">
                {mockTracks.filter(t => !t.featured).map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {mockTracks.filter(t => t.enrolled && t.progress > 0 && t.progress < 100).map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {mockTracks.filter(t => t.enrolled && t.progress === 100).map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {mockTracks.filter(t => t.rating >= 4.7).map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="loan-officers" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {mockTracks.filter(t => t.industry === 'loan-officers').map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {mockTracks.filter(t => t.industry === 'sales').map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

interface TrackCardProps {
  track: typeof mockTracks[0]
  featured?: boolean
}

function TrackCard({ track, featured = false }: TrackCardProps) {
  const totalMinutes = track.scenarios.reduce((sum, s) => sum + s.estimatedMinutes, 0)
  const completedScenarios = track.scenarios.filter(s => s.status === 'completed').length

  return (
    <Card
      animated={false}
      variant={featured ? 'featured' : 'default'}
      className="group hover:shadow-lg transition-all duration-200"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={getDifficultyBadgeVariant(track.difficulty)}
                size="sm"
              >
                {track.difficulty}
              </Badge>
              {featured && (
                <Badge variant="brand" size="sm">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {track.prerequisites.length > 0 && (
                <Badge variant="outline" size="sm">
                  Prerequisites
                </Badge>
              )}
            </div>
            <CardTitle className="font-headline text-xl mb-2">
              {track.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {track.description}
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
              <Briefcase className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">{track.scenarioCount}</span>
              <span className="text-xs text-muted-foreground">scenarios</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar (if enrolled) */}
        {track.enrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{track.progress}%</span>
            </div>
            <Progress value={track.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedScenarios} of {track.scenarioCount} scenarios completed
            </p>
          </div>
        )}

        {/* Track Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{track.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4" />
            <span>{track.completions} completions</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span>{track.rating}</span>
          </div>
        </div>

        {/* Scenario Preview (first 3) */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium text-muted-foreground">Learning Path:</p>
          <div className="space-y-1">
            {track.scenarios.slice(0, 3).map((scenario, idx) => (
              <div key={scenario.id} className="flex items-center gap-2 text-sm">
                {getScenarioIcon(scenario.status)}
                <span className={cn(
                  "flex-1 truncate",
                  scenario.status === 'completed' && "line-through text-muted-foreground"
                )}>
                  {idx + 1}. {scenario.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {scenario.estimatedMinutes}m
                </span>
              </div>
            ))}
            {track.scenarios.length > 3 && (
              <p className="text-xs text-muted-foreground pl-7">
                +{track.scenarios.length - 3} more scenarios
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {track.enrolled ? (
            <Button className="flex-1" size="lg">
              {track.progress === 0 ? 'Start Track' : 'Continue'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="flex-1" size="lg" variant="default">
              Enroll Now
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg">
                View Details
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={getDifficultyBadgeVariant(track.difficulty)}
                    size="sm"
                  >
                    {track.difficulty}
                  </Badge>
                  {featured && (
                    <Badge variant="brand" size="sm">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <SheetTitle className="font-headline text-2xl">
                  {track.title}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {track.description}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Track Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card animated={false}>
                    <CardHeader className="pb-3">
                      <CardDescription>Duration</CardDescription>
                      <CardTitle className="text-xl font-headline">
                        {track.estimatedDuration}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        ~{totalMinutes} minutes total
                      </p>
                    </CardHeader>
                  </Card>

                  <Card animated={false}>
                    <CardHeader className="pb-3">
                      <CardDescription>Rating</CardDescription>
                      <CardTitle className="text-xl font-headline flex items-center gap-1">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        {track.rating}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {track.completions} reviews
                      </p>
                    </CardHeader>
                  </Card>
                </div>

                {/* Progress */}
                {track.enrolled && (
                  <Card animated={false}>
                    <CardHeader>
                      <CardTitle className="font-headline">Your Progress</CardTitle>
                      <div className="space-y-2 mt-4">
                        <Progress value={track.progress} className="h-3" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {completedScenarios} of {track.scenarioCount} completed
                          </span>
                          <span className="font-semibold">{track.progress}%</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                {/* Prerequisites */}
                {track.prerequisites.length > 0 && (
                  <Card animated={false}>
                    <CardHeader>
                      <CardTitle className="font-headline text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Prerequisites Required
                      </CardTitle>
                      <CardDescription>
                        Complete these tracks first before enrolling
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {/* Full Scenario List */}
                <div className="space-y-3">
                  <h3 className="font-headline text-lg font-semibold">
                    Complete Learning Path
                  </h3>

                  <div className="space-y-2">
                    {track.scenarios.map((scenario, idx) => (
                      <div key={scenario.id}>
                        <Card
                          animated={false}
                          className={cn(
                            "relative",
                            scenario.status === 'current' && "border-primary shadow-md"
                          )}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getScenarioIcon(scenario.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className={cn(
                                      "font-medium",
                                      scenario.status === 'completed' && "line-through text-muted-foreground"
                                    )}>
                                      {idx + 1}. {scenario.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {scenario.estimatedMinutes} min
                                      </span>
                                      {scenario.status === 'completed' && (
                                        <Badge variant="success" size="sm">
                                          Completed
                                        </Badge>
                                      )}
                                      {scenario.status === 'current' && (
                                        <Badge variant="default" size="sm">
                                          Current
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {scenario.status !== 'locked' && (
                                    <Button size="sm" variant="ghost">
                                      Start
                                      <ChevronRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Connection Line */}
                        {idx < track.scenarios.length - 1 && (
                          <div className="flex justify-center">
                            <Separator orientation="vertical" className="h-4 w-0.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enroll Button */}
                {!track.enrolled && (
                  <Button className="w-full" size="lg">
                    Enroll in This Track
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  )
}
