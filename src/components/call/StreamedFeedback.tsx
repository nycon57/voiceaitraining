"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle, TrendingUp, Lightbulb, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface FeedbackSection {
  title: string
  content: string
  type: "strength" | "improvement" | "neutral"
}

interface StreamedFeedbackProps {
  streamedText: string
  isStreaming: boolean
  feedbackSections?: FeedbackSection[]
  className?: string
}

export function StreamedFeedback({
  streamedText,
  isStreaming,
  feedbackSections,
  className,
}: StreamedFeedbackProps) {
  const [displayedText, setDisplayedText] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)

  // Simulate streaming effect for immediate visual feedback
  useEffect(() => {
    if (streamedText) {
      setDisplayedText(streamedText)

      // Auto-scroll to bottom
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight
      }
    }
  }, [streamedText])

  const renderIcon = (type: FeedbackSection["type"]) => {
    switch (type) {
      case "strength":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "improvement":
        return <TrendingUp className="h-5 w-5 text-warning" />
      case "neutral":
        return <Lightbulb className="h-5 w-5 text-primary" />
    }
  }

  const renderBadgeVariant = (type: FeedbackSection["type"]) => {
    switch (type) {
      case "strength":
        return "border-success/50 text-success"
      case "improvement":
        return "border-warning/50 text-warning"
      case "neutral":
        return "border-primary/50 text-primary"
    }
  }

  return (
    <Card className={cn("overflow-hidden mb-8", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isStreaming && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Coaching Feedback
        </CardTitle>
      </CardHeader>
      <CardContent
        ref={contentRef}
        className="max-h-[32rem] overflow-y-auto space-y-4"
      >
        {/* Streaming Raw Text (while AI is generating) */}
        {isStreaming && displayedText && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="animate-in fade-in duration-500">
              <ReactMarkdown>{displayedText}</ReactMarkdown>
              <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {/* Structured Feedback Sections (after streaming completes) */}
        {!isStreaming && feedbackSections && feedbackSections.length > 0 && (
          <div className="space-y-5">
            {feedbackSections.map((section, index) => (
              <div
                key={index}
                className="space-y-2.5 p-4 rounded-lg border bg-card/50 animate-in slide-in-from-bottom-2 fade-in hover:bg-card/80 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {renderIcon(section.type)}
                  <h4 className="font-semibold text-sm">{section.title}</h4>
                  <Badge
                    variant="outline"
                    className={cn("text-xs ml-auto", renderBadgeVariant(section.type))}
                  >
                    {section.type === "strength"
                      ? "Strength"
                      : section.type === "improvement"
                        ? "Area to Improve"
                        : "Insight"}
                  </Badge>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/80 leading-relaxed">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isStreaming && !displayedText && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isStreaming &&
         (!feedbackSections || feedbackSections.length === 0) &&
         !displayedText && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No feedback available yet</p>
            <p className="text-xs mt-1">Analysis will appear here once complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
