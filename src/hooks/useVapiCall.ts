"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Vapi from "@vapi-ai/web"

export interface TranscriptMessage {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: number
  isFinal: boolean
}

export interface CallKPIs {
  duration: number
  userTalkTime: number
  agentTalkTime: number
  talkListenRatio: string
  fillerWords: number
  questionsAsked: number
  interruptions: number
}

export type CallStatus =
  | "idle"
  | "requesting_permission"
  | "connecting"
  | "connected"
  | "active"
  | "ending"
  | "ended"
  | "error"

interface UseVapiCallOptions {
  scenarioId: string
  publicKey?: string // Vapi public key
  onCallEnd?: (data: {
    duration: number
    transcript: TranscriptMessage[]
    recordingUrl?: string
    kpis: CallKPIs
  }) => void
  onError?: (error: Error) => void
}

export function useVapiCall({ scenarioId, publicKey, onCallEnd, onError }: UseVapiCallOptions) {
  const [status, setStatus] = useState<CallStatus>("idle")
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [kpis, setKpis] = useState<CallKPIs>({
    duration: 0,
    userTalkTime: 0,
    agentTalkTime: 0,
    talkListenRatio: "0:0",
    fillerWords: 0,
    questionsAsked: 0,
    interruptions: 0,
  })
  const [isMuted, setIsMuted] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [error, setError] = useState<string | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  const callStartTime = useRef<number>(0)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const vapiRef = useRef<Vapi | null>(null)

  // Initialize Vapi instance
  useEffect(() => {
    if (publicKey && !vapiRef.current) {
      vapiRef.current = new Vapi(publicKey)
    }
  }, [publicKey])

  // Request microphone permissions
  const requestMicPermission = useCallback(async (skipStatusReset = false) => {
    try {
      setStatus("requesting_permission")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream after checking permission
      stream.getTracks().forEach(track => track.stop())
      // Only reset to idle if not being called from startCall
      if (!skipStatusReset) {
        setStatus("idle")
      }
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Microphone permission denied")
      setError(error.message)
      setStatus("error")
      onError?.(error)
      return false
    }
  }, [onError])

  // Start call
  const startCall = useCallback(async () => {
    try {
      setStatus("connecting")
      setTranscript([])
      setKpis({
        duration: 0,
        userTalkTime: 0,
        agentTalkTime: 0,
        talkListenRatio: "0:0",
        fillerWords: 0,
        questionsAsked: 0,
        interruptions: 0,
      })

      if (!vapiRef.current) {
        throw new Error("Vapi not initialized. Please provide a public key.")
      }

      // Request mic permission if not already granted (skip status reset to keep "connecting")
      const hasPermission = await requestMicPermission(true)
      if (!hasPermission) return

      // Ensure we're still in connecting state after permission check
      setStatus("connecting")

      // Call backend to create attempt and get Vapi config
      const response = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      })

      if (!response.ok) {
        throw new Error("Failed to start call")
      }

      const data = await response.json()
      setAttemptId(data.attemptId)

      // Log configuration for debugging
      console.log('Starting call with base agent:', data.scenario?.baseAgent)
      console.log('Assistant ID:', data.assistantId)

      // Set up Vapi event listeners
      vapiRef.current.on("call-start", async () => {
        setStatus("connected")
        callStartTime.current = Date.now()

        // Start duration counter
        durationInterval.current = setInterval(() => {
          setKpis((prev) => ({
            ...prev,
            duration: Math.floor((Date.now() - callStartTime.current) / 1000),
          }))
        }, 1000)

        setStatus("active")

        // Get the Vapi call ID and save it to the attempt
        if (vapiRef.current && attemptId) {
          const callId = (vapiRef.current as any).call?.id
          if (callId) {
            try {
              await fetch("/api/calls/update-vapi-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attemptId, vapiCallId: callId }),
              })
            } catch (err) {
              console.error("Failed to save Vapi call ID:", err)
            }
          }
        }
      })

      vapiRef.current.on("speech-start", () => {
        setIsAgentSpeaking(true)
      })

      vapiRef.current.on("speech-end", () => {
        setIsAgentSpeaking(false)
      })

      vapiRef.current.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          addTranscriptMessage(
            message.role === "assistant" ? "assistant" : "user",
            message.transcript,
            true
          )
        }
      })

      vapiRef.current.on("call-end", () => {
        setStatus("ended")
        if (durationInterval.current) {
          clearInterval(durationInterval.current)
          durationInterval.current = null
        }
      })

      vapiRef.current.on("error", (error: any) => {
        console.error("[useVapiCall] Vapi error object:", error)
        console.error("[useVapiCall] Vapi error type:", typeof error)
        console.error("[useVapiCall] Vapi error keys:", Object.keys(error || {}))
        console.error("[useVapiCall] Vapi error stringified:", JSON.stringify(error, null, 2))
        const err = new Error(error.message || error.error || JSON.stringify(error) || "Call failed")
        setError(err.message)
        setStatus("error")
        onError?.(err)
      })

      // Start the Vapi call with base assistant + transient overrides
      // Note: vapi.start() takes TWO arguments: (assistantId, assistantOverrides)
      if (data.assistantOverrides) {
        // Use transient overrides for scenario-specific customization
        console.log('[useVapiCall] Starting call with assistantId:', data.assistantId)
        console.log('[useVapiCall] Transient overrides:', data.assistantOverrides)
        await vapiRef.current.start(data.assistantId, data.assistantOverrides)
      } else {
        // Fallback: use assistant ID only (backward compatibility)
        console.log('[useVapiCall] Starting call with assistant ID only:', data.assistantId || data.assistant)
        await vapiRef.current.start(data.assistantId || data.assistant)
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start call")
      setError(error.message)
      setStatus("error")
      onError?.(error)
    }
  }, [scenarioId, requestMicPermission, onError])

  // End call
  const endCall = useCallback(async (status?: 'completed' | 'cancelled' | 'practice' | 'technical_issue') => {
    try {
      setStatus("ending")

      // Stop Vapi call
      if (vapiRef.current) {
        vapiRef.current.stop()
      }

      // Stop duration counter
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
        durationInterval.current = null
      }

      // Call backend to save attempt
      if (attemptId) {
        const response = await fetch("/api/calls/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            transcript,
            duration: kpis.duration,
            status, // Optional status override
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save call data")
        }

        const data = await response.json()

        onCallEnd?.({
          duration: kpis.duration,
          transcript,
          recordingUrl: data.recordingUrl,
          kpis,
        })
      }

      setStatus("ended")
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to end call")
      setError(error.message)
      setStatus("error")
      onError?.(error)
    }
  }, [attemptId, transcript, kpis, onCallEnd, onError])

  // Cancel call (end with cancelled status)
  const cancelCall = useCallback(async () => {
    await endCall('cancelled')
  }, [endCall])

  // Add transcript message
  const addTranscriptMessage = useCallback((role: "user" | "assistant", text: string, isFinal = true) => {
    const message: TranscriptMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      text,
      timestamp: Date.now() - callStartTime.current,
      isFinal,
    }

    setTranscript((prev) => [...prev, message])

    // Update KPIs
    if (isFinal) {
      const words = text.split(" ")
      const duration = words.length * 0.3 // Rough estimate: 200 WPM

      setKpis((prev) => {
        const newUserTime = role === "user" ? prev.userTalkTime + duration : prev.userTalkTime
        const newAgentTime = role === "assistant" ? prev.agentTalkTime + duration : prev.agentTalkTime
        const total = newUserTime + newAgentTime

        // Count filler words
        let fillerCount = prev.fillerWords
        if (role === "user") {
          const fillers = text.match(/\b(um|uh|like|you know|basically|actually)\b/gi) || []
          fillerCount += fillers.length
        }

        // Count questions
        let questionCount = prev.questionsAsked
        if (role === "user" && text.includes("?")) {
          questionCount++
        }

        return {
          ...prev,
          userTalkTime: newUserTime,
          agentTalkTime: newAgentTime,
          talkListenRatio:
            total > 0
              ? `${Math.round((newUserTime / total) * 100)}:${Math.round((newAgentTime / total) * 100)}`
              : "0:0",
          fillerWords: fillerCount,
          questionsAsked: questionCount,
        }
      })
    }

    // Set speaking indicators
    if (role === "assistant") {
      setIsAgentSpeaking(true)
      setTimeout(() => setIsAgentSpeaking(false), text.length * 50) // Rough timing
    } else {
      setIsUserSpeaking(true)
      setTimeout(() => setIsUserSpeaking(false), text.length * 50)
    }
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const newMutedState = !isMuted
      vapiRef.current.setMuted(newMutedState)
      setIsMuted(newMutedState)
    }
  }, [isMuted])

  // Set audio volume
  const setAudioVolume = useCallback((vol: number) => {
    setVolume(Math.max(0, Math.min(1, vol)))
    // In production, this would adjust the Vapi audio output volume
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  return {
    // State
    status,
    transcript,
    kpis,
    isMuted,
    isAgentSpeaking,
    isUserSpeaking,
    volume,
    error,
    attemptId,

    // Actions
    requestMicPermission,
    startCall,
    endCall,
    cancelCall,
    toggleMute,
    setAudioVolume,
    addTranscriptMessage, // Exposed for testing/simulation
  }
}
