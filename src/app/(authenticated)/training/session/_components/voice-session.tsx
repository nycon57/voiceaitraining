'use client'

import { useEffect, useReducer, useRef, type Dispatch } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Clock,
  Target,
  User,
  Bot,
  Square,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
// import { useChat } from 'ai' // TODO: Fix AI SDK v5 compatibility
import type { AuthUser } from '@/lib/auth'

// Temporary stub until AI SDK v5 compatibility is fixed
const useChat = (_config?: any) => ({
  messages: [] as Array<{ id: string; role: string; content: string }>,
  append: async (_message?: any) => null,
  isLoading: false,
})

interface VoiceSessionProps {
  user: AuthUser
  scenarioId?: string
  trackId?: string
  type?: string
}

// Session states
type SessionState = 'setup' | 'connecting' | 'active' | 'paused' | 'ended'

type VoiceSessionState = {
  sessionState: SessionState
  sessionTime: number
  isRecording: boolean
  isMuted: boolean
  callDuration: number
  liveMetrics: {
    talkTime: number
    listenTime: number
    wordsPerMinute: number
    fillerWords: number
    interruptions: number
  }
}

type VoiceSessionAction =
  | { type: 'sessionState'; sessionState: SessionState }
  | { type: 'recording'; isRecording: boolean }
  | { type: 'muted'; isMuted: boolean }
  | { type: 'tick' }
  | { type: 'startActive' }
  | { type: 'end' }

const initialVoiceSessionState: VoiceSessionState = {
  sessionState: 'setup',
  sessionTime: 0,
  isRecording: false,
  isMuted: false,
  callDuration: 0,
  liveMetrics: {
    talkTime: 0,
    listenTime: 0,
    wordsPerMinute: 0,
    fillerWords: 0,
    interruptions: 0,
  },
}

function voiceSessionReducer(
  state: VoiceSessionState,
  action: VoiceSessionAction,
): VoiceSessionState {
  switch (action.type) {
    case 'sessionState':
      return { ...state, sessionState: action.sessionState }
    case 'recording':
      return { ...state, isRecording: action.isRecording }
    case 'muted':
      return { ...state, isMuted: action.isMuted }
    case 'tick':
      return {
        ...state,
        sessionTime: state.sessionTime + 1,
        callDuration: state.callDuration + 1,
      }
    case 'startActive':
      return { ...state, sessionState: 'active', isRecording: true }
    case 'end':
      return { ...state, sessionState: 'ended', isRecording: false }
  }
}

// Mock scenario data
const mockScenario = {
  id: 1,
  title: "Cold Call Introduction",
  description: "Practice opening conversations with potential clients",
  persona: "Sarah Johnson - Small Business Owner",
  context: "You're calling Sarah about your company's CRM solution. She's busy but has agreed to a brief conversation.",
  objectives: [
    "Introduce yourself professionally",
    "Establish rapport quickly",
    "Present value proposition clearly",
    "Handle any initial objections",
    "Schedule a follow-up meeting"
  ],
  duration: 10, // minutes
  difficulty: "beginner"
}

export function VoiceSession({ user, scenarioId, trackId, type }: VoiceSessionProps) {
  // Session state
  const [{
    sessionState,
    sessionTime,
    isRecording,
    isMuted,
    callDuration,
    liveMetrics,
  }, dispatch] = useReducer(voiceSessionReducer, initialVoiceSessionState)

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  // Chat for conversation tracking
  const { messages, append, isLoading } = useChat({
    api: '/api/chat/voice-session',
    initialMessages: [{
      id: '1',
      role: 'system' as const,
      content: `You are ${mockScenario.persona}. ${mockScenario.context}`
    }]
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionState === 'active') {
      interval = setInterval(() => {
        dispatch({ type: 'tick' })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [sessionState])

  // Initialize microphone
  const initializeMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      audioStreamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      return true
    } catch (error) {
      console.error('Failed to initialize microphone:', error)
      return false
    }
  }

  // Start session
  const startSession = async () => {
    dispatch({ type: 'sessionState', sessionState: 'connecting' })

    const micInitialized = await initializeMicrophone()
    if (!micInitialized) {
      alert('Microphone access is required for voice training')
      dispatch({ type: 'sessionState', sessionState: 'setup' })
      return
    }

    // Simulate connection delay
    setTimeout(() => {
      dispatch({ type: 'startActive' })

      // Start the conversation
      append({
        role: 'user',
        content: 'Session started - begin scenario'
      })
    }, 2000)
  }

  // End session
  const endSession = () => {
    dispatch({ type: 'end' })

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      dispatch({ type: 'recording', isRecording: false })
      dispatch({ type: 'sessionState', sessionState: 'paused' })
    } else {
      dispatch({ type: 'recording', isRecording: true })
      dispatch({ type: 'sessionState', sessionState: 'active' })
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate talk/listen ratio
  const getTalkListenRatio = () => {
    const total = liveMetrics.talkTime + liveMetrics.listenTime
    if (total === 0) return { talk: 0, listen: 0 }

    const talkPercent = Math.round((liveMetrics.talkTime / total) * 100)
    const listenPercent = 100 - talkPercent

    return { talk: talkPercent, listen: listenPercent }
  }

  const ratio = getTalkListenRatio()
  const sectionProps = { user, scenarioId, trackId, type, sessionState, sessionTime, isRecording, isMuted, callDuration, liveMetrics, messages, isLoading, startSession, endSession, toggleRecording, formatTime, ratio, dispatch }

  if (sessionState === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <VoiceSessionSection1 {...sectionProps} />
      </div>
    )
  }

  if (sessionState === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <VoiceSessionSection2 {...sectionProps} />
      </div>
    )
  }

  if (sessionState === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <VoiceSessionSection3 {...sectionProps} />
      </div>
    )
  }

  // Active session UI
  return <VoiceSessionActiveView {...sectionProps} />
}

type VoiceSessionSectionProps = {
  user: AuthUser
  scenarioId?: string
  trackId?: string
  type?: string
  sessionState: SessionState
  sessionTime: number
  isRecording: boolean
  isMuted: boolean
  callDuration: number
  liveMetrics: VoiceSessionState['liveMetrics']
  messages: Array<{ id: string; role: string; content: string }>
  isLoading: boolean
  startSession: () => Promise<void>
  endSession: () => void
  toggleRecording: () => void
  formatTime: (seconds: number) => string
  ratio: { talk: number; listen: number }
  dispatch: Dispatch<VoiceSessionAction>
}

function VoiceSessionSection1(props: VoiceSessionSectionProps) {
  const { user, scenarioId, trackId, type, sessionState, sessionTime, isRecording, isMuted, callDuration, liveMetrics, messages, isLoading, startSession, endSession, toggleRecording, formatTime, ratio, dispatch } = props
  return (
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Voice Training Session</CardTitle>
                <CardDescription>
                  Get ready to practice with AI-powered scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
    
                {/* Scenario Info */}
                <div className="p-6 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="size-5 text-primary" />
                    <h3 className="font-semibold text-lg">{mockScenario.title}</h3>
                    <Badge variant="secondary">{mockScenario.difficulty}</Badge>
                  </div>
    
                  <p className="text-muted-foreground mb-4">{mockScenario.description}</p>
    
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="size-4" />
                        Scenario Persona
                      </h4>
                      <p className="text-sm text-muted-foreground">{mockScenario.persona}</p>
                      <p className="text-sm text-muted-foreground mt-1">{mockScenario.context}</p>
                    </div>
    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="size-4" />
                        Objectives
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {mockScenario.objectives.slice(0, 3).map((objective, i) => (
                          <li key={JSON.stringify(objective)}>• {objective}</li>
                        ))}
                        {mockScenario.objectives.length > 3 && (
                          <li>• +{mockScenario.objectives.length - 3} more…</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
    
                {/* Pre-session checklist */}
                <div className="space-y-3">
                  <h4 className="font-medium">Before we start:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mic className="size-4 text-green-500" />
                      <span>Microphone access will be requested</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="size-4 text-green-500" />
                      <span>Ensure your speakers/headphones are working</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-green-500" />
                      <span>Estimated duration: {mockScenario.duration} minutes</span>
                    </div>
                  </div>
                </div>
    
                <Button
                  onClick={startSession}
                  size="lg"
                  className="w-full"
                >
                  <Phone className="size-4 mr-2" />
                  Start Voice Session
                </Button>
              </CardContent>
            </Card>
  )
}

function VoiceSessionSection2(props: VoiceSessionSectionProps) {
  const { user, scenarioId, trackId, type, sessionState, sessionTime, isRecording, isMuted, callDuration, liveMetrics, messages, isLoading, startSession, endSession, toggleRecording, formatTime, dispatch } = props
  return (
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse mb-4">
                  <Phone className="size-12 mx-auto text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Connecting…</h3>
                <p className="text-muted-foreground">
                  Setting up your voice training session
                </p>
              </CardContent>
            </Card>
  )
}

function VoiceSessionSection3(props: VoiceSessionSectionProps) {
  const { user, scenarioId, trackId, type, sessionState, sessionTime, isRecording, isMuted, callDuration, liveMetrics, messages, isLoading, startSession, endSession, toggleRecording, formatTime, ratio, dispatch } = props
  return (
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Session Complete</CardTitle>
                <CardDescription>
                  Great job! Here's how you performed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
    
                {/* Session Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Clock className="size-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{formatTime(callDuration)}</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Target className="size-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{ratio.talk}%</div>
                    <div className="text-sm text-muted-foreground">Talk Time</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Bot className="size-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{liveMetrics.wordsPerMinute}</div>
                    <div className="text-sm text-muted-foreground">Words/Min</div>
                  </div>
                </div>
    
                <div className="space-y-3">
                  <Button size="lg" className="w-full">
                    View Detailed Feedback
                  </Button>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      <RotateCcw className="size-4 mr-2" />
                      Retry Session
                    </Button>
                    <Button variant="outline" className="w-full">
                      Back to Training Hub
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
  )
}

function VoiceSessionActiveView(props: VoiceSessionSectionProps) {
  const { sessionState, sessionTime, isRecording, isMuted, liveMetrics, messages, isLoading, endSession, toggleRecording, formatTime, ratio, dispatch } = props
  return (
    <div className="min-h-screen bg-background">
    
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${
                    sessionState === 'active' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                  }`} />
                  <span className="font-medium">{mockScenario.title}</span>
                </div>
                <Badge variant="outline">{mockScenario.persona}</Badge>
              </div>
    
              <div className="flex items-center gap-4">
                <div className="text-sm font-mono">
                  {formatTime(sessionTime)}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endSession}
                >
                  <PhoneOff className="size-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          </div>
    
          <div className="grid lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-4rem)]">
    
            {/* Main Call Interface */}
            <div className="lg:col-span-2 space-y-6">
    
              {/* Conversation Display */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-lg">Live Conversation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => message.role !== 'system' && (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <div className={`size-8 rounded-full flex items-center justify-center ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="size-4" />
                            ) : (
                              <Bot className="size-4" />
                            )}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
    
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="size-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="size-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="size-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                          <div className="size-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
    
              {/* Call Controls */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="lg"
                      onClick={() => dispatch({ type: 'muted', isMuted: !isMuted })}
                    >
                      {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                    </Button>
    
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      onClick={toggleRecording}
                      className="size-16 rounded-full"
                    >
                      {isRecording ? <Mic className="size-6" /> : <MicOff className="size-6" />}
                    </Button>
    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => dispatch({ type: 'sessionState', sessionState: sessionState === 'active' ? 'paused' : 'active' })}
                    >
                      {sessionState === 'active' ? <Pause className="size-5" /> : <Play className="size-5" />}
                    </Button>
                  </div>
    
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      {sessionState === 'active' && isRecording ? 'Speaking...' :
                       sessionState === 'paused' ? 'Session paused' :
                       'Ready to speak'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
    
            {/* Sidebar - Live Metrics & Objectives */}
            <div className="space-y-6">
    
              {/* Live Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
    
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Talk/Listen Ratio</span>
                      <span>{ratio.talk}:{ratio.listen}</span>
                    </div>
                    <Progress value={ratio.talk} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: 40-45% talk time
                    </p>
                  </div>
    
                  <Separator />
    
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{liveMetrics.wordsPerMinute}</div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{liveMetrics.fillerWords}</div>
                      <div className="text-xs text-muted-foreground">Filler Words</div>
                    </div>
                  </div>
    
                  <div className="text-center">
                    <div className="text-2xl font-bold">{liveMetrics.interruptions}</div>
                    <div className="text-xs text-muted-foreground">Interruptions</div>
                  </div>
                </CardContent>
              </Card>
    
              {/* Session Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockScenario.objectives.map((objective, i) => (
                      <div key={JSON.stringify(objective)} className="flex items-start gap-3">
                        <div className="size-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
  )
}
