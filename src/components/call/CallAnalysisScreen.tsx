"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { StreamedFeedback } from "./StreamedFeedback"
import { LiveKPIIndicators } from "./LiveKPIIndicators"
import { TranscriptViewer } from "./TranscriptViewer"
import { RecordingPlayer } from "./RecordingPlayer"
import { AttemptComparison } from "./AttemptComparison"
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Target,
  Play,
  Download,
  TrendingUp,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TranscriptMessage, CallKPIs } from "@/hooks/useVapiCall"
import type { CallAnalysis } from "@/hooks/useCallAnalysis"

interface CallAnalysisScreenProps {
  scenario: {
    title: string
    id: string
    persona?: {
      name?: string
    }
  }
  kpis: CallKPIs
  transcript: TranscriptMessage[]
  analysis: CallAnalysis | null
  streamedText: string
  isAnalyzing: boolean
  attemptId?: string
  recordingUrl?: string
  attemptNumber?: number
  previousAttempts?: Array<{
    attemptNumber: number
    score: number
    duration: number
    date: string
    isBest: boolean
    isFirst: boolean
    isLatest: boolean
  }>
  averageScore?: number
  bestScore?: number
  onRetry: () => void
  onNextScenario?: () => void
  onViewTranscript?: () => void
  onDownloadReport?: () => void
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-success"
  if (score >= 70) return "text-warning"
  return "text-destructive"
}

function getScoreBadge(score: number): {
  label: string
  variant: string
} {
  if (score >= 90)
    return { label: "Excellent", variant: "border-success/50 text-success" }
  if (score >= 80) return { label: "Great", variant: "border-success/50 text-success" }
  if (score >= 70) return { label: "Good", variant: "border-warning/50 text-warning" }
  if (score >= 60) return { label: "Fair", variant: "border-warning/50 text-warning" }
  return { label: "Needs Work", variant: "border-destructive/50 text-destructive" }
}

export function CallAnalysisScreen({
  scenario,
  kpis,
  transcript,
  analysis,
  streamedText,
  isAnalyzing,
  attemptId,
  recordingUrl,
  attemptNumber = 1,
  previousAttempts = [],
  averageScore,
  bestScore,
  onRetry,
  onNextScenario,
  onViewTranscript,
  onDownloadReport,
}: CallAnalysisScreenProps) {
  const scoreBadge = analysis ? getScoreBadge(analysis.score) : null
  const currentAttemptStats = analysis
    ? {
        attemptNumber,
        score: analysis.score,
        duration: kpis.duration,
        date: new Date().toISOString(),
        isBest: analysis.score === (bestScore || analysis.score),
        isFirst: attemptNumber === 1,
        isLatest: true,
      }
    : null

  // Export handlers
  const handleDownloadTranscript = async () => {
    if (!attemptId) return

    try {
      const response = await fetch(`/api/attempts/${attemptId}/export?type=transcript`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcript-${attemptId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download transcript:', error)
    }
  }

  const handleDownloadReport = async () => {
    if (!attemptId) return

    try {
      const response = await fetch(`/api/attempts/${attemptId}/export?type=full`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `training-report-${attemptId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  // Start animation when component mounts
  useEffect(() => {
    // Add any entry animations here
  }, [])

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2 animate-in zoom-in duration-500">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Training Complete!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{scenario.title}</p>
        </div>
      </div>

      {/* Score Card */}
      {analysis && (
        <Card className="border-2 border-primary/30 mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
            <CardContent className="p-8 sm:p-10">
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Your Performance Score
                  </p>
                  <div
                    className={cn(
                      "font-headline text-7xl sm:text-8xl font-bold animate-in zoom-in duration-500",
                      "drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]",
                      getScoreColor(analysis.score)
                    )}
                  >
                    {analysis.score}
                    <span className="text-4xl text-muted-foreground/50 dark:text-muted-foreground/60">/100</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-3">
                    <Progress
                      value={analysis.score}
                      className="w-full max-w-lg h-3"
                      variant={
                        analysis.score >= 85
                          ? "success"
                          : analysis.score >= 70
                            ? "warning"
                            : "destructive"
                      }
                    />
                  </div>
                  {scoreBadge && (
                    <Badge
                      variant="outline"
                      className={cn("text-base py-1.5 px-4 mt-3", scoreBadge.variant)}
                    >
                      <TrendingUp className="h-4 w-4 mr-1.5" />
                      {scoreBadge.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Score Breakdown */}
      {analysis && analysis.scoreBreakdown && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {analysis.scoreBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground font-mono">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
                <Progress
                  value={item.percentage}
                  size="sm"
                  variant={
                    item.percentage >= 85
                      ? "success"
                      : item.percentage >= 70
                        ? "warning"
                        : "destructive"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Key Moments */}
        {analysis && analysis.keyMoments && analysis.keyMoments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Moments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.keyMoments.map((moment, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {moment.type === "objection" && (
                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-destructive text-xs font-bold">!</span>
                      </div>
                    )}
                    {moment.type === "commitment" && (
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                    )}
                    {moment.type === "question" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">?</span>
                      </div>
                    )}
                    {moment.type === "error" && (
                      <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <span className="text-warning text-xs font-bold">⚠</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(moment.timestamp / 1000)}s
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {moment.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {moment.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveKPIIndicators kpis={kpis} compact={false} />
          </CardContent>
        </Card>
      </div>

      {/* AI Feedback */}
      <StreamedFeedback
        streamedText={streamedText}
        isStreaming={isAnalyzing}
        feedbackSections={analysis?.feedback}
      />

      {/* Next Steps */}
      {analysis && analysis.nextSteps && analysis.nextSteps.length > 0 && (
        <Card className="bg-primary/5 border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className="mt-0.5 flex-shrink-0 border-primary/50 text-primary"
                  >
                    {index + 1}
                  </Badge>
                  <span className="text-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Transcript and Recording */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Transcript Viewer */}
        {transcript && transcript.length > 0 && (
          <TranscriptViewer
            transcript={transcript}
            personaName={scenario.persona?.name || "Agent"}
          />
        )}

        {/* Recording Player */}
        {attemptId && (
          <RecordingPlayer attemptId={attemptId} />
        )}
      </div>

      <Separator className="my-8" />

      {/* Export Actions */}
      {attemptId && (
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-primary" />
              Export Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={handleDownloadTranscript}
              variant="outline"
              className="border-primary/30 hover:bg-primary/5"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Transcript (PDF)
            </Button>

            <Button
              onClick={handleDownloadReport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Full Report (PDF)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Primary Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          onClick={onRetry}
          variant="outline"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Try This Scenario Again
        </Button>

        {onNextScenario && (
          <Button
            onClick={onNextScenario}
            className="bg-primary hover:bg-primary/90"
          >
            Continue to Next Scenario
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
