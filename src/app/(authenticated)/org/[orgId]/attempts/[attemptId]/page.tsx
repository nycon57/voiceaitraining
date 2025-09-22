import { getAttempt } from '@/actions/attempts'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  MessageSquare,
  Clock,
  Target,
  User,
  Volume2,
  FileText,
  BarChart3,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface AttemptResultsPageProps {
  params: Promise<{ orgId: string; attemptId: string }>
}

export default async function AttemptResultsPage({ params }: AttemptResultsPageProps) {
  const { orgId, attemptId } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  let attempt
  try {
    attempt = await getAttempt(attemptId)
  } catch (error) {
    notFound()
  }

  const transcript = attempt.transcript_json ? JSON.parse(attempt.transcript_json) : []
  const kpis = attempt.kpis || { global: {}, scenario: {} }
  const feedback = attempt.feedback_json || {}
  const scoreBreakdown = attempt.score_breakdown || {}

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/org/${orgId}/scenarios`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scenarios
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Results</h1>
          <p className="text-muted-foreground">
            Performance analysis for {attempt.scenarios?.title}
          </p>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Overall Performance Score
              </CardTitle>
              <CardDescription>
                {attempt.scenarios?.title} • {formatDuration(attempt.duration_seconds || 0)}
              </CardDescription>
            </div>
            <Badge className={getScoreBadgeColor(attempt.score || 0)}>
              {Math.round(attempt.score || 0)}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress
              value={attempt.score || 0}
              className="h-3"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">
                  {formatDuration(attempt.duration_seconds || 0)}
                </div>
              </div>
              <div>
                <div className="font-medium">Character</div>
                <div className="text-muted-foreground">
                  {attempt.scenarios?.persona?.profile?.name || 'AI Agent'}
                </div>
              </div>
              <div>
                <div className="font-medium">Difficulty</div>
                <div className="text-muted-foreground capitalize">
                  {attempt.scenarios?.difficulty || 'Medium'}
                </div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div className="text-green-600 font-medium">
                  Completed
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Feedback
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance KPIs
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Score Breakdown
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {feedback.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{feedback.summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.strengths && feedback.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.strengths.map((strength: any, index: number) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3">
                        <div className="font-medium text-sm">{strength.area}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {strength.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {feedback.improvements && feedback.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-orange-700">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.improvements.map((improvement: any, index: number) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-3">
                        <div className="font-medium text-sm">{improvement.area}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {improvement.description}
                        </div>
                        <div className="text-sm text-blue-600 mt-1 font-medium">
                          💡 {improvement.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {feedback.next_steps && feedback.next_steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feedback.next_steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-sm">{step}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Global KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication Metrics</CardTitle>
                <CardDescription>Core conversation analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {kpis.global.talk_listen_ratio && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Talk/Listen Ratio</span>
                    <span className="text-sm">{kpis.global.talk_listen_ratio.formatted}</span>
                  </div>
                )}

                {kpis.global.filler_words && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Filler Words</span>
                    <span className="text-sm">{kpis.global.filler_words.count} ({kpis.global.filler_words.rate_per_minute}/min)</span>
                  </div>
                )}

                {kpis.global.speaking_pace && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Speaking Pace</span>
                    <span className="text-sm">{kpis.global.speaking_pace.words_per_minute} WPM</span>
                  </div>
                )}

                {kpis.global.response_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Response Time</span>
                    <span className="text-sm">{Math.round(kpis.global.response_time.average_ms / 1000)}s</span>
                  </div>
                )}

                {kpis.global.sentiment_score && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sentiment Score</span>
                    <span className="text-sm">{Math.round(kpis.global.sentiment_score.user_sentiment * 100)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scenario KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scenario Performance</CardTitle>
                <CardDescription>Goal and technique analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {kpis.scenario.required_phrases && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Required Phrases</span>
                    <span className="text-sm">
                      {kpis.scenario.required_phrases.mentioned}/{kpis.scenario.required_phrases.total}
                      ({kpis.scenario.required_phrases.percentage}%)
                    </span>
                  </div>
                )}

                {kpis.scenario.open_questions && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Open Questions</span>
                    <span className="text-sm">{kpis.scenario.open_questions.count}</span>
                  </div>
                )}

                {kpis.scenario.objection_handling && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Objection Handling</span>
                    <span className="text-sm">{kpis.scenario.objection_handling.success_rate}%</span>
                  </div>
                )}

                {kpis.scenario.goal_achievement && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Primary Goal</span>
                    <span className="text-sm">
                      {kpis.scenario.goal_achievement.primary_goal_achieved ? '✅ Achieved' : '❌ Not Achieved'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Score Breakdown</CardTitle>
              <CardDescription>How your final score was calculated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scoreBreakdown).map(([key, data]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {key.replace(/[_]/g, ' ').replace('global ', '').replace('scenario ', '')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Weight: {data.weight}% • Score: {Math.round(data.score * 100)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {Math.round(data.score * data.max_points * 100) / 100}/{data.max_points}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation Transcript</CardTitle>
              <CardDescription>Complete record of your training session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transcript.map((entry: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      entry.role === 'user'
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      {entry.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                      <span className="font-medium capitalize">
                        {entry.role === 'user' ? 'You' : attempt.scenarios?.persona?.profile?.name || 'AI Agent'}
                      </span>
                      {entry.timestamp && (
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed">{entry.content}</div>
                  </div>
                ))}

                {transcript.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No transcript available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Button asChild>
              <Link href={`/org/${orgId}/play/${attempt.scenario_id}`}>
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/org/${orgId}/scenarios`}>
                Browse Scenarios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}