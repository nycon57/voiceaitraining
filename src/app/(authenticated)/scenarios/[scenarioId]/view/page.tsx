import { getScenario } from '@/actions/scenarios'
import { getAttempts } from '@/actions/attempts'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Play,
  Clock,
  Users,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle2,
  Star,
  BarChart3,
  MessageSquare,
  Award,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PerformanceTrendChart } from '@/components/charts/performance-trend-chart'

interface ScenarioDetailPageProps {
  params: Promise<{ scenarioId: string }>
}

export default async function ScenarioDetailPage({ params }: ScenarioDetailPageProps) {
  const { scenarioId } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  let scenario
  try {
    scenario = await getScenario(scenarioId)
  } catch (error) {
    notFound()
  }

  // Fetch user's attempts for this scenario
  let userAttempts: Array<{
    id: string
    score: number | null
    started_at: string
    duration_seconds: number | null
    status: string
  }> = []

  try {
    const attempts = await getAttempts({
      scenario_id: scenarioId,
      clerk_user_id: user.id,
      status: 'completed',
      limit: 10
    })
    userAttempts = attempts as typeof userAttempts
  } catch (error) {
    console.error('Failed to fetch attempts:', error)
  }

  // Calculate stats
  const totalAttempts = userAttempts.length
  const averageScore = totalAttempts > 0
    ? Math.round(userAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts)
    : 0
  const bestScore = totalAttempts > 0
    ? Math.max(...userAttempts.map(a => a.score || 0))
    : 0
  const averageDuration = totalAttempts > 0
    ? Math.round(userAttempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / totalAttempts / 60)
    : 0

  // Prepare chart data
  const performanceData = userAttempts
    .slice(0, 7)
    .reverse()
    .map(attempt => ({
      date: new Date(attempt.started_at),
      score: attempt.score || 0
    }))

  // Mock data for global stats (in real app, fetch from aggregated data)
  const globalStats = {
    totalAttempts: 156,
    avgScore: 82,
    completionRate: 94
  }

  // Parse scenario data
  const difficulty = scenario.difficulty || 'medium'
  const description = scenario.description || 'No description available'
  const persona = scenario.persona as { profile?: { name?: string; role?: string } } | null

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/training">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={
                difficulty === 'easy' ? 'secondary' :
                difficulty === 'medium' ? 'default' : 'destructive'
              } className="text-sm">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Target className="h-3 w-3 mr-1" />
                Sales Training
              </Badge>
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-3">
              {scenario.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-headline text-2xl font-bold">{globalStats.totalAttempts}</div>
                    <div className="text-xs text-muted-foreground">Total Attempts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-headline text-2xl font-bold">{globalStats.avgScore}%</div>
                    <div className="text-xs text-muted-foreground">Average Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-headline text-2xl font-bold">{globalStats.completionRate}%</div>
                    <div className="text-xs text-muted-foreground">Completion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Performance */}
          {totalAttempts > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Performance
                </CardTitle>
                <CardDescription>Track your progress on this scenario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-4 mb-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Your Attempts</div>
                    <div className="font-headline text-2xl font-bold">{totalAttempts}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average Score</div>
                    <div className="font-headline text-2xl font-bold text-blue-600">{averageScore}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Best Score</div>
                    <div className="font-headline text-2xl font-bold text-green-600">{bestScore}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Avg Duration</div>
                    <div className="font-headline text-2xl font-bold">{averageDuration}m</div>
                  </div>
                </div>

                {performanceData.length > 0 && (
                  <PerformanceTrendChart
                    data={performanceData}
                    title="Score Trend"
                    description="Your last 7 attempts"
                    showArea
                    className="border-0 shadow-none"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Master the fundamentals</div>
                    <div className="text-sm text-muted-foreground">Build a strong foundation in core techniques</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Handle objections effectively</div>
                    <div className="text-sm text-muted-foreground">Learn to address common concerns with confidence</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Build rapport and trust</div>
                    <div className="text-sm text-muted-foreground">Create meaningful connections with clients</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Close with confidence</div>
                    <div className="text-sm text-muted-foreground">Perfect your closing techniques</div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* KPIs Measured */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>What we measure in this scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2 shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">Talk-Listen Ratio</div>
                    <div className="text-xs text-muted-foreground">Target: 40-60% speaking time</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="rounded-full bg-green-100 dark:bg-green-950 p-2 shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">Required Phrases</div>
                    <div className="text-xs text-muted-foreground">Key terms and compliance language</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-2 shrink-0">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">Objection Handling</div>
                    <div className="text-xs text-muted-foreground">Address concerns effectively</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="rounded-full bg-orange-100 dark:bg-orange-950 p-2 shrink-0">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">Overall Quality</div>
                    <div className="text-xs text-muted-foreground">Professionalism and effectiveness</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Start Training Card */}
          <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="font-headline text-2xl font-bold mb-2">Ready to start?</div>
                  <p className="text-sm text-muted-foreground">
                    Begin your training session and put your skills to the test.
                  </p>
                </div>
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                  <Link href={`/play/${scenarioId}/call`}>
                    <Play className="h-5 w-5 mr-2" />
                    Start Training
                  </Link>
                </Button>
                {totalAttempts > 0 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/attempts?scenario=${scenarioId}`}>
                      <Trophy className="h-4 w-4 mr-2" />
                      View Past Attempts
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Scenario Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-sm text-muted-foreground">15-20 minutes</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Difficulty</div>
                  <div className="text-sm text-muted-foreground capitalize">{difficulty}</div>
                </div>
              </div>
              {persona?.profile && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">You'll speak with</div>
                      <div className="text-sm text-muted-foreground">
                        {persona.profile.name || 'AI Agent'}
                        {persona.profile.role && ` - ${persona.profile.role}`}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Your Attempts History */}
          {totalAttempts > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">Your History</CardTitle>
                <CardDescription>Last {Math.min(5, totalAttempts)} attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAttempts.slice(0, 5).map((attempt) => (
                    <Link
                      key={attempt.id}
                      href={`/attempts/${attempt.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          (attempt.score || 0) >= 90 ? 'bg-green-100 dark:bg-green-950' :
                          (attempt.score || 0) >= 80 ? 'bg-blue-100 dark:bg-blue-950' :
                          (attempt.score || 0) >= 70 ? 'bg-yellow-100 dark:bg-yellow-950' :
                          'bg-red-100 dark:bg-red-950'
                        }`}>
                          <Trophy className={`h-4 w-4 ${
                            (attempt.score || 0) >= 90 ? 'text-green-600' :
                            (attempt.score || 0) >= 80 ? 'text-blue-600' :
                            (attempt.score || 0) >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <div className={`font-bold ${
                            (attempt.score || 0) >= 90 ? 'text-green-600' :
                            (attempt.score || 0) >= 80 ? 'text-blue-600' :
                            (attempt.score || 0) >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {attempt.score || 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(attempt.started_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended For */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Recommended For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Sales Reps</Badge>
                <Badge variant="secondary">Loan Officers</Badge>
                <Badge variant="secondary">Customer Service</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
