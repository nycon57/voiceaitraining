'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
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
}

// Session states
type SessionState = 'setup' | 'connecting' | 'active' | 'paused' | 'ended'

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

export function VoiceSession({ user }: VoiceSessionProps) {
  const searchParams = useSearchParams()
  const scenarioId = searchParams.get('scenario')
  const trackId = searchParams.get('track')
  const type = searchParams.get('type')

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('setup')
  const [sessionTime, setSessionTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  // Real-time metrics
  const [liveMetrics, setLiveMetrics] = useState({
    talkTime: 0,
    listenTime: 0,
    wordsPerMinute: 0,
    fillerWords: 0,
    interruptions: 0
  })

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
        setSessionTime(prev => prev + 1)
        setCallDuration(prev => prev + 1)
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
    setSessionState('connecting')

    const micInitialized = await initializeMicrophone()
    if (!micInitialized) {
      alert('Microphone access is required for voice training')
      setSessionState('setup')
      return
    }

    // Simulate connection delay
    setTimeout(() => {
      setSessionState('active')
      setIsRecording(true)

      // Start the conversation
      append({
        role: 'user',
        content: 'Session started - begin scenario'
      })
    }, 2000)
  }

  // End session
  const endSession = () => {
    setSessionState('ended')
    setIsRecording(false)

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
      setIsRecording(false)
      setSessionState('paused')
    } else {
      setIsRecording(true)
      setSessionState('active')
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

  if (sessionState === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">{mockScenario.title}</h3>
                <Badge variant="secondary">{mockScenario.difficulty}</Badge>
              </div>

              <p className="text-muted-foreground mb-4">{mockScenario.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Scenario Persona
                  </h4>
                  <p className="text-sm text-muted-foreground">{mockScenario.persona}</p>
                  <p className="text-sm text-muted-foreground mt-1">{mockScenario.context}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objectives
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {mockScenario.objectives.slice(0, 3).map((objective, i) => (
                      <li key={i}>• {objective}</li>
                    ))}
                    {mockScenario.objectives.length > 3 && (
                      <li>• +{mockScenario.objectives.length - 3} more...</li>
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
                  <Mic className="h-4 w-4 text-green-500" />
                  <span>Microphone access will be requested</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-green-500" />
                  <span>Ensure your speakers/headphones are working</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Estimated duration: {mockScenario.duration} minutes</span>
                </div>
              </div>
            </div>

            <Button
              onClick={startSession}
              size="lg"
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Voice Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sessionState === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse mb-4">
              <Phone className="h-12 w-12 mx-auto text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Connecting...</h3>
            <p className="text-muted-foreground">
              Setting up your voice training session
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sessionState === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{formatTime(callDuration)}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{ratio.talk}%</div>
                <div className="text-sm text-muted-foreground">Talk Time</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
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
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Session
                </Button>
                <Button variant="outline" className="w-full">
                  Back to Training Hub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active session UI
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
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
              <PhoneOff className="h-4 w-4 mr-2" />
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
              {messages.filter(m => m.role !== 'system').map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
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
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
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
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  onClick={toggleRecording}
                  className="h-16 w-16 rounded-full"
                >
                  {isRecording ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSessionState(sessionState === 'active' ? 'paused' : 'active')}
                >
                  {sessionState === 'active' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5" />
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