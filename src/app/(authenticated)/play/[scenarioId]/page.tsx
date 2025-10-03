import { getScenario } from '@/actions/scenarios'
import { getCurrentUser } from '@/lib/auth'
import { VoicePlayer } from '@/components/voice/voice-player'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Target, User } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PlayScenarioPageProps {
  params: Promise<{ scenarioId: string }>
  searchParams: Promise<{ assignmentId?: string }>
}

export default async function PlayScenarioPage({ params, searchParams }: PlayScenarioPageProps) {
  const { scenarioId } = await params
  const { assignmentId } = await searchParams

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  let scenario
  try {
    scenario = await getScenario(scenarioId)
  } catch (error) {
    notFound()
  }

  // Check if scenario is active
  if (scenario.status !== 'active') {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/training`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Scenario Not Available</h3>
            <p className="text-muted-foreground text-center mb-6">
              This scenario is currently in {scenario.status} status and cannot be practiced.
            </p>
            <Button asChild>
              <Link href={`/training`}>
                View Available Scenarios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/training">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Training</h1>
          <p className="text-muted-foreground">
            Practice your skills with AI-powered conversation simulation
          </p>
        </div>
      </div>

      {/* Scenario Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{scenario.title}</CardTitle>
              <CardDescription className="mt-1">
                {scenario.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {scenario.difficulty && (
                <Badge className={getDifficultyColor(scenario.difficulty)}>
                  {scenario.difficulty}
                </Badge>
              )}
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  ~{scenario.estimated_duration ? Math.round(scenario.estimated_duration / 60) : 10} minutes
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Character</div>
                <div className="text-sm text-muted-foreground">
                  {scenario.persona?.profile?.name || 'AI Assistant'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Objective</div>
                <div className="text-sm text-muted-foreground">
                  Practice conversation skills
                </div>
              </div>
            </div>
          </div>

          {scenario.persona?.profile?.background && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Character Background</h4>
              <p className="text-sm text-blue-800">
                {scenario.persona.profile.background}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Player */}
      <VoicePlayer
        scenario={scenario}
        userId={user.id}
        orgId={user.orgId!}
        assignmentId={assignmentId}
        onCallComplete={(attemptId) => {
          // Redirect to results page
          window.location.href = `/attempts/${attemptId}`
        }}
      />

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Training Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🎤 Audio Setup</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use a quiet environment</li>
                <li>• Ensure microphone access is allowed</li>
                <li>• Test audio levels before starting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💬 Conversation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Speak clearly and naturally</li>
                <li>• Listen actively to responses</li>
                <li>• Stay in character throughout</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Performance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Focus on your objectives</li>
                <li>• Handle objections professionally</li>
                <li>• Maintain good talk-to-listen ratio</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏱️ Time Management</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Keep track of conversation flow</li>
                <li>• Don't rush important points</li>
                <li>• Allow natural pauses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}