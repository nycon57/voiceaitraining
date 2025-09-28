'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Volume2,
  Mic,
  MessageSquare,
  FileText,
  Download,
  Play,
  RotateCcw,
  Share,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface SessionReviewProps {
  sessionId: string
  user: AuthUser
}

// Mock session data
const mockSessionData = {
  id: "session_123",
  scenario: {
    title: "Cold Call Introduction",
    difficulty: "beginner",
    objectives: [
      "Introduce yourself professionally",
      "Establish rapport quickly",
      "Present value proposition clearly",
      "Handle any initial objections",
      "Schedule a follow-up meeting"
    ]
  },
  performance: {
    overallScore: 87,
    duration: 584, // seconds
    completedAt: "2025-01-20T14:30:00Z"
  },
  metrics: {
    talkTime: 245,
    listenTime: 339,
    wordsPerMinute: 142,
    fillerWords: 8,
    interruptions: 2,
    sentiment: 0.72, // positive sentiment
    pace: "optimal"
  },
  objectives: [
    { text: "Introduce yourself professionally", completed: true, timestamp: "00:45" },
    { text: "Establish rapport quickly", completed: true, timestamp: "01:23" },
    { text: "Present value proposition clearly", completed: true, timestamp: "02:45" },
    { text: "Handle any initial objections", completed: false, timestamp: null },
    { text: "Schedule a follow-up meeting", completed: true, timestamp: "08:12" }
  ],
  transcript: [
    { speaker: "user", timestamp: "00:00", text: "Hi Sarah, this is John from TechCorp. How are you doing today?" },
    { speaker: "ai", timestamp: "00:05", text: "Oh hi John, I'm doing well thanks. What can I do for you?" },
    { speaker: "user", timestamp: "00:12", text: "I know you're busy, so I'll be brief. I wanted to talk to you about how we might be able to help streamline your customer management process." },
    { speaker: "ai", timestamp: "00:23", text: "Okay, I'm listening. We do struggle with keeping track of all our customer interactions." },
    { speaker: "user", timestamp: "00:31", text: "That's exactly what I thought might be the case. Many small businesses like yours find that as they grow, managing customer relationships becomes more challenging." },
    { speaker: "ai", timestamp: "00:42", text: "Yes, that's definitely true. We've been using spreadsheets but it's getting unwieldy." }
  ],
  feedback: {
    strengths: [
      "Excellent opening - professional and warm tone",
      "Good active listening throughout the conversation",
      "Successfully identified customer pain points",
      "Maintained appropriate speaking pace"
    ],
    improvements: [
      "Could have been more assertive when handling the pricing objection",
      "Missed opportunity to ask qualifying questions about budget",
      "Should have confirmed next steps more clearly"
    ],
    nextSteps: [
      "Practice objection handling scenarios",
      "Work on closing techniques",
      "Review discovery question frameworks"
    ]
  }
}

export function SessionReview({ sessionId, user }: SessionReviewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTalkListenRatio = () => {
    const total = mockSessionData.metrics.talkTime + mockSessionData.metrics.listenTime
    const talkPercent = Math.round((mockSessionData.metrics.talkTime / total) * 100)
    const listenPercent = 100 - talkPercent
    return { talk: talkPercent, listen: listenPercent }
  }

  const ratio = getTalkListenRatio()
  const completedObjectives = mockSessionData.objectives.filter(obj => obj.completed).length

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-medium">Session Review</span>
            </div>
            <Badge variant="outline">{mockSessionData.scenario.title}</Badge>
            <Badge variant="secondary">{mockSessionData.scenario.difficulty}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button asChild>
              <Link href="/training">
                Back to Training
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Score Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {mockSessionData.performance.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500">+12 from last session</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {formatTime(mockSessionData.performance.duration)}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-xs text-muted-foreground mt-1">Target: 8-12 min</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {completedObjectives}/{mockSessionData.objectives.length}
                </div>
                <div className="text-sm text-muted-foreground">Objectives Met</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round((completedObjectives / mockSessionData.objectives.length) * 100)}% completion
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{ratio.talk}%</div>
                <div className="text-sm text-muted-foreground">Talk Time</div>
                <div className="text-xs text-muted-foreground mt-1">Target: 40-45%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Scenario Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockSessionData.objectives.map((objective, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        objective.completed
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-muted-foreground'
                      }`}>
                        {objective.completed && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${
                          objective.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {objective.text}
                        </span>
                        {objective.timestamp && (
                          <div className="text-xs text-muted-foreground">
                            Completed at {objective.timestamp}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Key Performance Metrics
                  </CardTitle>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{mockSessionData.metrics.wordsPerMinute}</div>
                      <div className="text-xs text-muted-foreground">Words/Min</div>
                      <div className="text-xs text-green-500">Optimal pace</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{mockSessionData.metrics.fillerWords}</div>
                      <div className="text-xs text-muted-foreground">Filler Words</div>
                      <div className="text-xs text-orange-500">Room for improvement</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold">{mockSessionData.metrics.interruptions}</div>
                    <div className="text-xs text-muted-foreground">Interruptions</div>
                    <div className="text-xs text-green-500">Excellent listening</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Speaking Pace</span>
                    <Badge variant="default">{mockSessionData.metrics.pace}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Words per Minute</span>
                    <span className="font-medium">{mockSessionData.metrics.wordsPerMinute}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Filler Words</span>
                    <span className="font-medium">{mockSessionData.metrics.fillerWords}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interruptions</span>
                    <span className="font-medium">{mockSessionData.metrics.interruptions}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Time Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Duration</span>
                    <span className="font-medium">{formatTime(mockSessionData.performance.duration)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Talk Time</span>
                    <span className="font-medium">{formatTime(mockSessionData.metrics.talkTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Listen Time</span>
                    <span className="font-medium">{formatTime(mockSessionData.metrics.listenTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Talk Percentage</span>
                    <span className="font-medium">{ratio.talk}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sentiment Score</span>
                    <Badge variant="default">
                      {Math.round(mockSessionData.metrics.sentiment * 100)}% Positive
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Objectives Met</span>
                    <span className="font-medium">
                      {completedObjectives}/{mockSessionData.objectives.length}
                    </span>
                  </div>
                  <Progress
                    value={(completedObjectives / mockSessionData.objectives.length) * 100}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation Transcript
                </CardTitle>
                <CardDescription>
                  Full transcript of your training session with timestamps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockSessionData.transcript.map((entry, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-xs text-muted-foreground font-mono w-16 flex-shrink-0 mt-1">
                        {entry.timestamp}
                      </div>
                      <div className="flex gap-3 flex-1">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          entry.speaker === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          {entry.speaker === 'user' ? (
                            <Mic className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">
                            {entry.speaker === 'user' ? 'You' : 'Sarah (Customer)'}
                          </div>
                          <p className="text-sm">{entry.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mockSessionData.feedback.strengths.map((strength, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mockSessionData.feedback.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mockSessionData.feedback.nextSteps.map((step, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild>
                <Link href="/training/session/new?scenario=1" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry This Scenario
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/training" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Back to Training Hub
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Progress Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}