"use client"

import { useState, useCallback } from "react"
import type { TranscriptMessage, CallKPIs } from "./useVapiCall"

export interface FeedbackSection {
  title: string
  content: string
  type: "strength" | "improvement" | "neutral"
}

export interface CallAnalysis {
  score: number
  scoreBreakdown: {
    category: string
    score: number
    maxScore: number
    percentage: number
  }[]
  feedback: FeedbackSection[]
  keyMoments: {
    timestamp: number
    type: "objection" | "commitment" | "question" | "error"
    description: string
  }[]
  nextSteps: string[]
}

interface UseCallAnalysisOptions {
  attemptId: string | null
  onComplete?: (analysis: CallAnalysis) => void
}

export function useCallAnalysis({ attemptId, onComplete }: UseCallAnalysisOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null)
  const [streamedText, setStreamedText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const analyzeCall = useCallback(
    async (transcript: TranscriptMessage[], kpis: CallKPIs) => {
      if (!attemptId) {
        setError("No attempt ID available")
        return
      }

      try {
        setIsAnalyzing(true)
        setError(null)
        setStreamedText("")

        // Call the streaming analysis endpoint
        const response = await fetch("/api/calls/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            transcript,
            kpis,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to analyze call")
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        // Handle streaming response
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Split by newlines to handle SSE format
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)

              if (data === "[DONE]") {
                // Stream complete
                continue
              }

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === "text_delta") {
                  // Streamed feedback text
                  setStreamedText((prev) => prev + parsed.content)
                } else if (parsed.type === "analysis_complete") {
                  // Final analysis object
                  const finalAnalysis: CallAnalysis = parsed.analysis
                  setAnalysis(finalAnalysis)
                  onComplete?.(finalAnalysis)
                }
              } catch (e) {
                console.error("Failed to parse stream chunk:", e)
              }
            }
          }
        }

        setIsAnalyzing(false)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Analysis failed")
        setError(error.message)
        setIsAnalyzing(false)
      }
    },
    [attemptId, onComplete]
  )

  const resetAnalysis = useCallback(() => {
    setAnalysis(null)
    setStreamedText("")
    setError(null)
    setIsAnalyzing(false)
  }, [])

  return {
    isAnalyzing,
    analysis,
    streamedText,
    error,
    analyzeCall,
    resetAnalysis,
  }
}
