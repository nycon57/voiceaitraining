"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AgentPersonaCard } from "./AgentPersonaCard"
import {
  Mic,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  ListChecks,
  Flame,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CallStatus } from "@/hooks/useVapiCall"

interface CallSetupScreenProps {
  scenario: {
    id: string
    title: string
    description?: string
    difficulty?: "easy" | "medium" | "hard"
    persona: {
      name: string
      role: string
      image_url?: string
      personality?: string[]
      background?: string
    }
    goals?: string[]
    learning_objectives?: string[]
  }
  status: CallStatus
  micPermissionGranted: boolean
  onRequestMicPermission: () => Promise<boolean>
  onStartCall: () => void
  onStartWarmup?: () => void
}

export function CallSetupScreen({
  scenario,
  status,
  micPermissionGranted,
  onRequestMicPermission,
  onStartCall,
  onStartWarmup,
}: CallSetupScreenProps) {
  const [isCheckingMic, setIsCheckingMic] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [isStartingCall, setIsStartingCall] = useState(false)

  const handleMicCheck = async () => {
    setIsCheckingMic(true)
    setMicError(null)

    try {
      const granted = await onRequestMicPermission()
      if (!granted) {
        setMicError("Microphone permission denied. Please allow access to continue.")
      }
    } catch (error) {
      setMicError("Failed to access microphone. Please check your browser settings.")
    } finally {
      setIsCheckingMic(false)
    }
  }

  // Auto-check mic permission on mount
  useEffect(() => {
    if (!micPermissionGranted && status === "idle") {
      handleMicCheck()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset starting state when status changes from idle
  useEffect(() => {
    if (status !== "idle" && isStartingCall) {
      // Call has transitioned, we can reset the local loading state
      setIsStartingCall(false)
    }
  }, [status, isStartingCall])

  const handleStartCall = async () => {
    setIsStartingCall(true)
    onStartCall()
  }

  const isConnecting = status === "connecting" || status === "requesting_permission" || isStartingCall
  const canStartCall = micPermissionGranted && status === "idle" && !isStartingCall

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {scenario.title}
        </h1>
        {scenario.description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {scenario.description}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Agent Persona */}
        <div className="space-y-6">
          <AgentPersonaCard
            persona={{
              ...scenario.persona,
              difficulty: scenario.difficulty,
            }}
            showDetails={true}
          />

          {/* Microphone Check */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Microphone Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {isCheckingMic ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : micPermissionGranted ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : micError ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {isCheckingMic
                        ? "Checking microphone..."
                        : micPermissionGranted
                          ? "Microphone ready"
                          : micError
                            ? "Microphone access denied"
                            : "Microphone permission required"}
                    </p>
                    {micError && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {micError}
                      </p>
                    )}
                  </div>
                </div>
                {!micPermissionGranted && !isCheckingMic && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMicCheck}
                  >
                    Allow Access
                  </Button>
                )}
              </div>

              {!micPermissionGranted && micError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-destructive">
                        {micError}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-medium">How to fix this:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Click the <strong>Allow Access</strong> button above</li>
                          <li>When your browser prompts you, click <strong>Allow</strong></li>
                          <li>If you don't see a prompt, check your browser's address bar for a microphone icon</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleMicCheck}
                    className="w-full"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}

              {!micPermissionGranted && !micError && (
                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-medium">Why we need microphone access:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Record your voice during the training call</li>
                    <li>Provide real-time transcription</li>
                    <li>Analyze your performance and give feedback</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scenario Details & Actions */}
        <div className="space-y-6">
          {/* Goals */}
          {scenario.goals && scenario.goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Call Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scenario.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-muted-foreground">{goal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Learning Objectives */}
          {scenario.learning_objectives && scenario.learning_objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  What You'll Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scenario.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-6 space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartCall}
                disabled={!canStartCall || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Training Call
                  </>
                )}
              </Button>

              {onStartWarmup && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onStartWarmup}
                  disabled={!canStartCall}
                >
                  <Flame className="mr-2 h-4 w-4" />
                  Quick Warmup (2 min)
                </Button>
              )}

              {!micPermissionGranted && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  Please allow microphone access to begin
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2.5">
                  <p className="font-semibold text-foreground">Pro Tips</p>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/90">
                    <li>Use headphones for the best experience</li>
                    <li>Find a quiet environment</li>
                    <li>Speak naturally, as you would on a real call</li>
                    <li>Take your time - there's no rush</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
