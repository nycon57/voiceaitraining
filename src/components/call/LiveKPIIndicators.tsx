"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  TrendingUp,
  HelpCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CallKPIs } from "@/hooks/useVapiCall"

interface LiveKPIIndicatorsProps {
  kpis: CallKPIs
  compact?: boolean
  className?: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function getTalkListenPercentages(ratio: string): {
  user: number
  agent: number
} {
  const [user, agent] = ratio.split(":").map((n) => parseInt(n) || 0)
  return { user, agent }
}

function getTalkListenQuality(userPercent: number): {
  status: "good" | "warning" | "poor"
  message: string
} {
  // Ideal is 40-50% user talk time (based on research cited in PRD)
  if (userPercent >= 40 && userPercent <= 50) {
    return { status: "good", message: "Excellent balance" }
  } else if (userPercent >= 35 && userPercent <= 55) {
    return { status: "warning", message: "Good balance" }
  } else if (userPercent > 65) {
    return { status: "poor", message: "Talking too much" }
  } else if (userPercent < 30) {
    return { status: "poor", message: "Listen more actively" }
  }
  return { status: "warning", message: "Keep practicing" }
}

export function LiveKPIIndicators({
  kpis,
  compact = false,
  className,
}: LiveKPIIndicatorsProps) {
  const talkListenPercent = getTalkListenPercentages(kpis.talkListenRatio)
  const talkQuality = getTalkListenQuality(talkListenPercent.user)

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">
            {formatDuration(kpis.duration)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">{kpis.talkListenRatio}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="font-medium">{kpis.questionsAsked}</span>
        </div>
        {kpis.fillerWords > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-medium">{kpis.fillerWords}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 grid-cols-2", className)}>
      {/* Duration */}
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-chart-1/10 p-2.5 flex-shrink-0">
              <Clock className="h-4 w-4 text-chart-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Duration
              </p>
              <p className="text-2xl font-mono font-bold">
                {formatDuration(kpis.duration)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talk/Listen Ratio */}
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-chart-2/10 p-2.5 flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-chart-2" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Talk Ratio
                </p>
                <p className="text-2xl font-mono font-bold">
                  {kpis.talkListenRatio}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Progress
                value={talkListenPercent.user}
                size="sm"
                variant={
                  talkQuality.status === "good"
                    ? "success"
                    : talkQuality.status === "warning"
                      ? "warning"
                      : "destructive"
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>You: {talkListenPercent.user}%</span>
                <span>Agent: {talkListenPercent.agent}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Asked */}
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-chart-3/10 p-2.5 flex-shrink-0">
              <HelpCircle className="h-4 w-4 text-chart-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Questions
              </p>
              <p className="text-2xl font-bold">{kpis.questionsAsked}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filler Words */}
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-chart-4/10 p-2.5 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-chart-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Filler Words
              </p>
              <p className="text-2xl font-bold">{kpis.fillerWords}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
