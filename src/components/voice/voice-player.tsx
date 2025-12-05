"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { vapiManager } from '@/lib/vapi'
import { getScenarioAssistant } from '@/lib/vapi-agents'
import { createAttempt, updateAttempt, scoreAttempt } from '@/actions/attempts'

interface VoicePlayerProps {
  scenario: {
    id: string
    title: string
    description?: string
    persona: any
    ai_prompt: string
    estimated_duration?: number
  }
  orgId: string
  userId: string
  assignmentId?: string
  onCallComplete?: (attemptId: string) => void
}

type CallState = 'idle' | 'connecting' | 'connected' | 'ended' | 'error'

export function VoicePlayer({
  scenario,
  orgId,
  userId,
  assignmentId,
  onCallComplete
}: VoicePlayerProps) {
  const [callState, setCallState] = useState<CallState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }>>([])

  const attemptIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Vapi event listeners
  useEffect(() => {
    if (!vapiManager.isReady()) return

    const handleCallStart = () => {
      console.log('Call started')
      setCallState('connected')
      startTimeRef.current = Date.now()

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 1000)
    }

    const handleCallEnd = async (callData: any) => {
      console.log('Call ended', callData)
      setCallState('ended')

      // Stop duration counter
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }

      // Update attempt with call data
      if (attemptIdRef.current) {
        try {
          await updateAttempt(attemptIdRef.current, {
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
            vapi_call_id: callData.call?.id,
            recording_url: callData.call?.recordingUrl,
            transcript_text: transcript.map(t => `${t.role}: ${t.content}`).join('\n'),
            transcript_json: JSON.stringify(transcript),
            status: 'completed'
          })

          // Trigger scoring asynchronously
          try {
            await scoreAttempt(attemptIdRef.current)
          } catch (scoringError) {
            console.error('Failed to score attempt:', scoringError)
          }

          if (onCallComplete) {
            onCallComplete(attemptIdRef.current)
          }
        } catch (error) {
          console.error('Failed to update attempt:', error)
        }
      }
    }

    const handleSpeechStart = () => {
      setIsUserSpeaking(true)
    }

    const handleSpeechEnd = () => {
      setIsUserSpeaking(false)
    }

    const handleMessage = (message: any) => {
      console.log('Received message:', message)

      // Handle different message types
      switch (message.type) {
        case 'transcript':
          if (message.transcript?.text) {
            setTranscript(prev => [
              ...prev,
              {
                role: message.transcript.user ? 'user' : 'assistant',
                content: message.transcript.text,
                timestamp: Date.now()
              }
            ])
          }
          break
        case 'function-call':
          // Handle function calls if needed
          break
        case 'speech-start':
          setIsAiSpeaking(true)
          break
        case 'speech-end':
          setIsAiSpeaking(false)
          break
      }
    }

    const handleError = (error: any) => {
      console.error('Vapi error:', error)
      setError(error.message || 'An error occurred during the call')
      setCallState('error')
    }

    // Register event listeners
    vapiManager.onCallStart(handleCallStart)
    vapiManager.onCallEnd(handleCallEnd)
    vapiManager.onSpeechStart(handleSpeechStart)
    vapiManager.onSpeechEnd(handleSpeechEnd)
    vapiManager.onMessage(handleMessage)
    vapiManager.onError(handleError)

    // Cleanup
    return () => {
      vapiManager.removeAllListeners()
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [duration, transcript, onCallComplete])

  const startCall = async () => {
    try {
      setCallState('connecting')
      setError(null)

      // Create attempt record
      const attempt = await createAttempt({
        scenario_id: scenario.id,
        assignment_id: assignmentId,
        user_id: userId,
        org_id: orgId
      })
      attemptIdRef.current = attempt.id

      // Get or create assistant for this scenario
      const assistantId = await getScenarioAssistant(scenario.id, scenario)

      // Start Vapi call with assistant ID
      await vapiManager.startCall(assistantId)

    } catch (error: any) {
      console.error('Failed to start call:', error)
      setError(error.message || 'Failed to start call')
      setCallState('error')
    }
  }

  const endCall = async () => {
    try {
      await vapiManager.stopCall()
    } catch (error: any) {
      console.error('Failed to end call:', error)
      setError(error.message || 'Failed to end call')
    }
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    vapiManager.setMuted(newMutedState)
    setIsMuted(newMutedState)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCallStateColor = () => {
    switch (callState) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCallStateText = () => {
    switch (callState) {
      case 'idle': return 'Ready to start'
      case 'connecting': return 'Connecting...'
      case 'connected': return 'Call in progress'
      case 'ended': return 'Call ended'
      case 'error': return 'Error occurred'
    }
  }

  return (
    <div className="space-y-6">
      {/* Scenario Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </div>
            <Badge className={getCallStateColor()}>
              {getCallStateText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-muted-foreground">
                {formatDuration(duration)}
                {scenario.estimated_duration && ` / ${Math.round(scenario.estimated_duration / 60)}m`}
              </div>
            </div>
            <div>
              <div className="font-medium">Character</div>
              <div className="text-muted-foreground capitalize">
                {scenario.persona?.profile?.name || scenario.persona?.role || 'AI Agent'}
              </div>
            </div>
            <div>
              <div className="font-medium">Your Status</div>
              <div className="flex items-center gap-1">
                {isUserSpeaking ? (
                  <>
                    <Mic className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Speaking</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Listening</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="font-medium">AI Status</div>
              <div className="flex items-center gap-1">
                {isAiSpeaking ? (
                  <>
                    <Volume2 className="h-3 w-3 text-blue-500" />
                    <span className="text-blue-500">Speaking</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Listening</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {scenario.estimated_duration && callState === 'connected' && (
            <div className="mt-4">
              <Progress
                value={(duration / scenario.estimated_duration) * 100}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            {callState === 'idle' && (
              <Button
                onClick={startCall}
                size="lg"
                className="bg-green-500 hover:bg-green-600"
              >
                <Phone className="h-5 w-5 mr-2" />
                Start Call
              </Button>
            )}

            {callState === 'connecting' && (
              <Button size="lg" disabled>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Connecting...
              </Button>
            )}

            {callState === 'connected' && (
              <>
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Mute
                    </>
                  )}
                </Button>

                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="lg"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Call
                </Button>
              </>
            )}

            {callState === 'ended' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Call completed successfully!</span>
              </div>
            )}

            {callState === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Call failed</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error: {error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Transcript */}
      {transcript.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Transcript</CardTitle>
            <CardDescription>
              Real-time conversation transcript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md ${
                    entry.role === 'user'
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-medium capitalize">{entry.role === 'user' ? 'You' : scenario.persona?.profile?.name || 'AI'}</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm">{entry.content}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}