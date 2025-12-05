"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useVapiCall } from "@/hooks/useVapiCall"
import { useCallAnalysis } from "@/hooks/useCallAnalysis"
import { CallSetupScreen } from "@/components/call/CallSetupScreen"
import { LiveCallInterface } from "@/components/call/LiveCallInterface"
import { CallAnalysisScreen } from "@/components/call/CallAnalysisScreen"
import { PostCallStatusModal, type CallCompletionReason } from "@/components/call/PostCallStatusModal"
import { Loader2 } from "lucide-react"

interface Scenario {
  id: string
  title: string
  description?: string
  difficulty?: string
  category?: string
  persona?: {
    profile?: {
      name?: string
      role?: string
      background?: string
      personality?: string[]
      goals?: string[]
      objections?: string[]
    }
  }
}

export default function CallPage() {
  const params = useParams()
  const router = useRouter()
  const scenarioId = params.scenarioId as string

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [attemptHistory, setAttemptHistory] = useState<{
    attempts: Array<{
      attemptNumber: number
      score: number
      duration: number
      date: string
      isBest: boolean
      isFirst: boolean
      isLatest: boolean
    }>
    statistics: {
      totalAttempts: number
      averageScore: number
      bestScore: number
      averageDuration: number
    }
  } | null>(null)

  // Vapi public key from environment
  const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

  // Initialize call hook
  const {
    status,
    transcript,
    kpis,
    isMuted,
    isAgentSpeaking,
    isUserSpeaking,
    volume,
    error,
    attemptId,
    requestMicPermission,
    startCall,
    endCall,
    cancelCall,
    toggleMute,
    setAudioVolume,
  } = useVapiCall({
    scenarioId,
    publicKey: vapiPublicKey,
    onCallEnd: (data) => {
      console.log("Call ended:", data)

      // Check if we should show status modal for short calls (15-60 seconds)
      if (data.duration >= 15 && data.duration < 60) {
        setShowStatusModal(true)
      } else if (attemptId) {
        // For longer calls, trigger analysis immediately
        analyzeCall(data.transcript, data.kpis)
      }
      // Calls < 15s are auto-discarded by the API
    },
    onError: (error) => {
      console.error("Call error:", error)
    },
  })

  // Initialize analysis hook
  const { isAnalyzing, analysis, streamedText, analyzeCall } = useCallAnalysis({
    attemptId: attemptId || "",
    onComplete: async (analysis) => {
      console.log("Analysis complete:", analysis)
      // Fetch attempt history after analysis completes
      if (scenarioId) {
        await loadAttemptHistory()
      }
    },
  })

  // Load attempt history
  const loadAttemptHistory = async () => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/attempts`)
      if (!response.ok) {
        console.error("Failed to load attempt history")
        return
      }
      const data = await response.json()
      setAttemptHistory(data)
    } catch (err) {
      console.error("Error loading attempt history:", err)
    }
  }

  // Load scenario on mount
  useEffect(() => {
    async function loadScenario() {
      try {
        const response = await fetch(`/api/scenarios/${scenarioId}`)
        if (!response.ok) throw new Error("Failed to load scenario")
        const data = await response.json()
        setScenario(data)
      } catch (err) {
        console.error("Error loading scenario:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadScenario()
  }, [scenarioId])

  // Handle mic permission request
  const handleRequestMicPermission = async (): Promise<boolean> => {
    const granted = await requestMicPermission()
    setMicPermissionGranted(granted)
    return granted
  }

  // Handle start call
  const handleStartCall = async (): Promise<boolean> => {
    await startCall()
    return true
  }

  // Handle end call
  const handleEndCall = async () => {
    await endCall()
  }

  // Handle retry - reload the page to reset all state
  const handleRetry = () => {
    window.location.reload()
  }

  // Handle cancel attempt during call
  const handleCancelAttempt = async () => {
    if (!attemptId) return
    await cancelCall()
  }

  // Handle status modal selection for short calls
  const handleStatusSelection = async (reason: CallCompletionReason) => {
    if (!attemptId) return

    // Map CallCompletionReason to AttemptStatus
    const statusMap: Record<CallCompletionReason, string> = {
      complete: "completed",
      practice: "practice",
      technical: "technical_issue",
      cancelled: "cancelled",
    }

    const status = statusMap[reason]

    try {
      // Update attempt status via API
      const response = await fetch(`/api/attempts/${attemptId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update attempt status")
      }

      // Only trigger analysis for completed attempts
      if (reason === "complete") {
        analyzeCall(transcript, kpis)
      } else {
        // For non-completed attempts, just reload to reset
        window.location.reload()
      }
    } catch (err) {
      console.error("Error updating attempt status:", err)
      // Fall back to reload on error
      window.location.reload()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (!scenario) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Scenario not found</h1>
          <p className="text-muted-foreground">
            The scenario you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  // Render appropriate screen based on call status
  if (status === "idle" || status === "requesting_permission") {
    return (
      <CallSetupScreen
        scenario={{
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          difficulty: (scenario.difficulty as 'easy' | 'medium' | 'hard' | undefined) || 'medium',
          persona: {
            name: scenario.persona?.profile?.name || 'Agent',
            role: scenario.persona?.profile?.role || 'Sales Representative',
            image_url: undefined,
            personality: scenario.persona?.profile?.personality,
            background: scenario.persona?.profile?.background,
          },
        }}
        status={status}
        micPermissionGranted={micPermissionGranted}
        onRequestMicPermission={handleRequestMicPermission}
        onStartCall={handleStartCall}
      />
    )
  }

  if (status === "ended") {
    return (
      <CallAnalysisScreen
        scenario={{
          title: scenario.title,
          id: scenario.id,
          persona: {
            name: scenario.persona?.profile?.name,
          },
        }}
        kpis={kpis}
        transcript={transcript}
        analysis={analysis}
        streamedText={streamedText}
        isAnalyzing={isAnalyzing}
        attemptId={attemptId || undefined}
        attemptNumber={attemptHistory?.statistics.totalAttempts || 1}
        previousAttempts={attemptHistory?.attempts || []}
        averageScore={attemptHistory?.statistics.averageScore}
        bestScore={attemptHistory?.statistics.bestScore}
        onRetry={handleRetry}
      />
    )
  }

  // Live call interface
  return (
    <>
      <LiveCallInterface
        scenario={{
          title: scenario.title,
          persona: {
            name: scenario.persona?.profile?.name || 'Agent',
            role: scenario.persona?.profile?.role || 'Sales Representative',
            image_url: undefined,
            difficulty: (scenario.difficulty as 'easy' | 'medium' | 'hard' | undefined) || 'medium',
          },
        }}
        user={{
          name: "You", // TODO: Get from auth context
          avatar: undefined,
        }}
        status={status}
        transcript={transcript}
        kpis={kpis}
        isAgentSpeaking={isAgentSpeaking}
        isUserSpeaking={isUserSpeaking}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={toggleMute}
        onEndCall={handleEndCall}
        onCancelAttempt={handleCancelAttempt}
        onVolumeChange={setAudioVolume}
      />

      {/* Post-call status modal for short calls (15-60s) */}
      <PostCallStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onComplete={handleStatusSelection}
        duration={kpis.duration}
      />
    </>
  )
}
