/**
 * Call Attempt Cancellation - Usage Examples
 *
 * This file contains complete examples showing how to use the new
 * call cancellation components in various scenarios.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  LiveCallInterface,
  PostCallStatusModal,
  type CallCompletionReason,
} from "@/components/call"
import type { CallStatus, TranscriptMessage, CallKPIs } from "@/hooks/useVapiCall"

// ============================================================================
// Example 1: Basic Integration with Cancel Button
// ============================================================================

export function BasicCallPageExample() {
  const router = useRouter()
  const [attemptId, setAttemptId] = useState<string>()

  // Mock data - replace with actual hook
  const mockData = {
    scenario: {
      title: "Cold Call to Prospect",
      persona: {
        name: "John Smith",
        role: "Homeowner",
        image_url: "/avatars/john.jpg",
        difficulty: "medium" as const,
      },
    },
    user: {
      name: "Jane Doe",
      avatar: "/avatars/jane.jpg",
    },
    status: "active" as CallStatus,
    transcript: [] as TranscriptMessage[],
    kpis: {
      duration: 45,
      userTalkTime: 22,
      agentTalkTime: 23,
      talkListenRatio: "50:50",
      fillerWords: 2,
      questionsAsked: 3,
      interruptions: 0,
    } as CallKPIs,
    isMuted: false,
    isAgentSpeaking: false,
    isUserSpeaking: false,
    volume: 0.8,
  }

  const handleCancelAttempt = async () => {
    if (!attemptId) return

    try {
      // Delete the attempt
      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete attempt")

      // Redirect back to scenario
      router.push(`/scenarios/${mockData.scenario.title}`)
    } catch (error) {
      console.error("Failed to cancel attempt:", error)
      // Show error toast
    }
  }

  return (
    <LiveCallInterface
      {...mockData}
      onToggleMute={() => {}}
      onEndCall={() => {}}
      onCancelAttempt={handleCancelAttempt}
      onVolumeChange={() => {}}
    />
  )
}

// ============================================================================
// Example 2: Short Call with Post-Call Status Modal
// ============================================================================

export function ShortCallHandlingExample() {
  const router = useRouter()
  const [attemptId, setAttemptId] = useState<string>()
  const [showPostCallModal, setShowPostCallModal] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Handle when call ends
  const handleCallEnded = async () => {
    // Check call duration
    if (callDuration >= 15 && callDuration <= 60) {
      // Short call - show status modal
      setShowPostCallModal(true)
    } else if (callDuration > 60) {
      // Normal call - proceed to analysis
      router.push(`/attempts/${attemptId}`)
    } else {
      // Very short call (< 15 seconds) - auto-cancel
      await handleCancelAttempt()
    }
  }

  const handleCancelAttempt = async () => {
    if (!attemptId) return

    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "DELETE",
      })
      router.push(`/scenarios/scenario-id`)
    } catch (error) {
      console.error("Failed to cancel attempt:", error)
    }
  }

  const handlePostCallComplete = async (reason: CallCompletionReason) => {
    if (!attemptId) return

    if (reason === "cancelled") {
      await handleCancelAttempt()
      return
    }

    try {
      // Update attempt with status
      await fetch(`/api/attempts/${attemptId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completion_reason: reason,
          is_practice: reason === "practice",
          has_technical_issue: reason === "technical",
        }),
      })

      // Proceed to analysis
      router.push(`/attempts/${attemptId}`)
    } catch (error) {
      console.error("Failed to update attempt:", error)
    }
  }

  return (
    <>
      {/* Call interface with cancel support */}
      <div>Call interface here...</div>

      {/* Post-call status modal for short calls */}
      <PostCallStatusModal
        open={showPostCallModal}
        onOpenChange={setShowPostCallModal}
        onComplete={handlePostCallComplete}
        duration={callDuration}
      />
    </>
  )
}

// ============================================================================
// Example 3: Complete Implementation with All Features
// ============================================================================

interface CompleteCallPageProps {
  scenarioId: string
  userId: string
}

export function CompleteCallPageExample({
  scenarioId,
  userId,
}: CompleteCallPageProps) {
  const router = useRouter()

  // State
  const [attemptId, setAttemptId] = useState<string>()
  const [showPostCallModal, setShowPostCallModal] = useState(false)

  // Mock call data - replace with useVapiCall hook
  const callData = {
    status: "active" as CallStatus,
    transcript: [] as TranscriptMessage[],
    kpis: {
      duration: 35,
      userTalkTime: 16,
      agentTalkTime: 19,
      talkListenRatio: "45:55",
      fillerWords: 3,
      questionsAsked: 2,
      interruptions: 1,
    } as CallKPIs,
    isMuted: false,
    isAgentSpeaking: false,
    isUserSpeaking: true,
    volume: 0.8,
  }

  // Call lifecycle handlers
  const handleCallStarted = (newAttemptId: string) => {
    setAttemptId(newAttemptId)
  }

  const handleCallEnded = () => {
    const { duration } = callData.kpis

    // Route based on call duration
    if (duration < 15) {
      // Too short - auto-cancel with confirmation
      handleCancelAttempt()
    } else if (duration >= 15 && duration <= 60) {
      // Short call - ask user what to do
      setShowPostCallModal(true)
    } else {
      // Normal length - proceed to analysis
      proceedToAnalysis()
    }
  }

  const handleCancelAttempt = async () => {
    if (!attemptId) return

    try {
      // End the call if still active
      if (callData.status === "active") {
        // Call your end call function
      }

      // Delete the attempt record
      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attempt")
      }

      // Track cancellation in analytics
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("attempt_cancelled", {
          attemptId,
          scenarioId,
          duration: callData.kpis.duration,
        })
      }

      // Redirect back
      router.push(`/scenarios/${scenarioId}`)
    } catch (error) {
      console.error("Failed to cancel attempt:", error)
      // Show error notification
    }
  }

  const handlePostCallComplete = async (reason: CallCompletionReason) => {
    if (!attemptId) return

    // Handle cancellation
    if (reason === "cancelled") {
      await handleCancelAttempt()
      return
    }

    try {
      // Update attempt metadata
      await fetch(`/api/attempts/${attemptId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completion_reason: reason,
          is_practice: reason === "practice",
          has_technical_issue: reason === "technical",
          ...(reason === "technical" && {
            technical_notes: "Flagged by user during short call modal",
          }),
        }),
      })

      // Track in analytics
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("attempt_classified", {
          attemptId,
          scenarioId,
          reason,
          duration: callData.kpis.duration,
        })
      }

      // Notify manager if technical issue
      if (reason === "technical") {
        await fetch(`/api/webhooks/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "attempt.technical_issue",
            attemptId,
            userId,
            scenarioId,
          }),
        })
      }

      // Proceed to analysis
      proceedToAnalysis()
    } catch (error) {
      console.error("Failed to update attempt status:", error)
      // Still proceed to analysis even if update fails
      proceedToAnalysis()
    }
  }

  const proceedToAnalysis = () => {
    if (!attemptId) return
    router.push(`/attempts/${attemptId}`)
  }

  // Mock scenario data
  const scenario = {
    title: "Cold Call to Prospect",
    persona: {
      name: "John Smith",
      role: "Homeowner",
      image_url: "/avatars/john.jpg",
      difficulty: "medium" as const,
    },
  }

  const user = {
    name: "Jane Doe",
    avatar: "/avatars/jane.jpg",
  }

  return (
    <>
      <LiveCallInterface
        scenario={scenario}
        user={user}
        status={callData.status}
        transcript={callData.transcript}
        kpis={callData.kpis}
        isMuted={callData.isMuted}
        isAgentSpeaking={callData.isAgentSpeaking}
        isUserSpeaking={callData.isUserSpeaking}
        volume={callData.volume}
        onToggleMute={() => {}}
        onEndCall={handleCallEnded}
        onCancelAttempt={handleCancelAttempt}
        onVolumeChange={() => {}}
      />

      <PostCallStatusModal
        open={showPostCallModal}
        onOpenChange={setShowPostCallModal}
        onComplete={handlePostCallComplete}
        duration={callData.kpis.duration}
      />
    </>
  )
}

// ============================================================================
// Example 4: API Route Handlers
// ============================================================================

/**
 * DELETE /api/attempts/[attemptId]/route.ts
 */
export async function DELETE_AttemptExample(
  request: Request,
  { params }: { params: { attemptId: string } }
) {
  // This is pseudocode - adapt to your actual implementation
  /*
  const supabase = createClient()
  const { attemptId } = params

  // Verify user has permission
  const { data: attempt } = await supabase
    .from('scenario_attempts')
    .select('user_id, org_id')
    .eq('id', attemptId)
    .single()

  // Soft delete or hard delete
  const { error } = await supabase
    .from('scenario_attempts')
    .delete()
    .eq('id', attemptId)

  if (error) {
    return Response.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return Response.json({ success: true })
  */
}

/**
 * PATCH /api/attempts/[attemptId]/status/route.ts
 */
export async function PATCH_AttemptStatusExample(
  request: Request,
  { params }: { params: { attemptId: string } }
) {
  // This is pseudocode
  /*
  const supabase = createClient()
  const body = await request.json()

  const { error } = await supabase
    .from('scenario_attempts')
    .update({
      completion_reason: body.completion_reason,
      is_practice: body.is_practice,
      has_technical_issue: body.has_technical_issue,
      technical_notes: body.technical_notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.attemptId)

  if (error) {
    return Response.json({ error: 'Failed to update' }, { status: 500 })
  }

  return Response.json({ success: true })
  */
}
