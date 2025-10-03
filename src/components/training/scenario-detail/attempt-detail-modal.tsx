"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  PlayCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
} from "lucide-react"
import { getAttempt } from "@/actions/attempts"

interface AttemptDetailModalProps {
  attemptId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttemptDetailModal({ attemptId, open, onOpenChange }: AttemptDetailModalProps) {
  const [attempt, setAttempt] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (attemptId && open) {
      setLoading(true)
      getAttempt(attemptId)
        .then((data) => setAttempt(data))
        .catch((error) => console.error('Failed to load attempt:', error))
        .finally(() => setLoading(false))
    } else {
      setAttempt(null)
    }
  }, [attemptId, open])

  if (!attemptId) return null

  const transcript = attempt?.transcript_json ? JSON.parse(attempt.transcript_json) : null
  const feedback = attempt?.feedback_json || null
  const kpis = attempt?.kpis || null
  const scoreBreakdown = attempt?.score_breakdown || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Attempt Details</DialogTitle>
          <DialogDescription>
            {attempt && new Date(attempt.started_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="transcript">
                <FileText className="h-4 w-4 mr-2" />
                Transcript
              </TabsTrigger>
              <TabsTrigger value="audio">
                <PlayCircle className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="kpis">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                KPIs
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <Lightbulb className="h-4 w-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>

            {/* Transcript Tab */}
            <TabsContent value="transcript" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  {transcript?.messages ? (
                    <div className="space-y-3">
                      {transcript.messages.map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary/10 ml-8'
                              : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {msg.role === 'user' ? 'You' : 'Agent'}
                            {msg.timestamp && ` · ${msg.timestamp}`}
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No transcript available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Call Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  {attempt?.recording_url ? (
                    <audio controls className="w-full">
                      <source src={attempt.recording_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recording available</p>
                  )}
                  {attempt?.duration_seconds && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Duration: {Math.floor(attempt.duration_seconds / 60)}:
                      {(attempt.duration_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Talk/Listen Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-1">
                      {kpis?.global?.talk_listen_ratio || '50:50'}
                    </div>
                    <Progress
                      value={parseInt(kpis?.global?.talk_listen_ratio?.split(':')[0] || '50')}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Filler Words</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-2">
                      {kpis?.global?.filler_words || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Count of um, uh, like, etc.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Speaking Pace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-3">
                      {kpis?.global?.speaking_pace || 0} wpm
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Words per minute
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {attempt?.score || 0}%
                    </div>
                    <Progress value={attempt?.score || 0} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* KPIs Tab */}
            <TabsContent value="kpis" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scoreBreakdown && Object.entries(scoreBreakdown).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        {value.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-chart-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{value.score || 0}%</span>
                        <Badge variant={value.passed ? 'default' : 'destructive'} size="sm">
                          {value.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!scoreBreakdown || Object.keys(scoreBreakdown).length === 0) && (
                    <p className="text-sm text-muted-foreground">No KPI data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">AI-Generated Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback?.summary && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{feedback.summary}</p>
                    </div>
                  )}

                  {feedback?.strengths && feedback.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {feedback.strengths.map((strength: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            <span className="font-medium">{strength.area}:</span>{' '}
                            <span className="text-muted-foreground">{strength.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback?.improvements && feedback.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-warning" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-3">
                        {feedback.improvements.map((improvement: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            <div className="font-medium">{improvement.area}</div>
                            <div className="text-muted-foreground">{improvement.description}</div>
                            {improvement.suggestion && (
                              <div className="mt-1 text-xs text-primary">
                                💡 {improvement.suggestion}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback?.next_steps && feedback.next_steps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Next Steps</h4>
                      <ul className="space-y-1">
                        {feedback.next_steps.map((step: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!feedback && (
                    <p className="text-sm text-muted-foreground">No feedback available for this attempt</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
