import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mic,
  Play,
  BookOpen,
  Target,
  Clock,
  Trophy,
  Zap,
  Users,
  Star,
  ChevronRight,
  Briefcase,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface TrainingHubProps {
  user: AuthUser
}

// Mock data for initial development
const mockQuickStart = [
  {
    id: 1,
    title: "Quick Practice Session",
    description: "Jump into a random scenario for immediate practice",
    type: "quick_practice",
    difficulty: "mixed",
    duration: "5-10 min",
    icon: Zap,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Continue Last Session",
    description: "Resume your previous training session",
    type: "continue",
    difficulty: "medium",
    duration: "15 min",
    icon: Play,
    color: "bg-green-500"
  }
]

const mockScenarios = [
  {
    id: 1,
    title: "Cold Call Introduction",
    description: "Master the art of opening conversations with prospects",
    difficulty: "beginner",
    duration: "10-15 min",
    completions: 156,
    avgScore: 85,
    tags: ["Communication", "First Impression"],
    industry: "General"
  },
  {
    id: 2,
    title: "Objection Handling",
    description: "Learn to address common customer concerns effectively",
    difficulty: "intermediate",
    duration: "15-20 min",
    completions: 89,
    avgScore: 78,
    tags: ["Persuasion", "Problem Solving"],
    industry: "General"
  },
  {
    id: 3,
    title: "Loan Application Process",
    description: "Guide customers through loan applications smoothly",
    difficulty: "advanced",
    duration: "20-25 min",
    completions: 45,
    avgScore: 82,
    tags: ["Finance", "Compliance"],
    industry: "Banking"
  },
  {
    id: 4,
    title: "Insurance Claims Review",
    description: "Handle insurance claims with empathy and efficiency",
    difficulty: "intermediate",
    duration: "15-20 min",
    completions: 67,
    avgScore: 79,
    tags: ["Empathy", "Process"],
    industry: "Insurance"
  }
]

const mockTracks = [
  {
    id: 1,
    title: "Sales Fundamentals",
    description: "Complete foundation in sales communication",
    scenarios: 8,
    duration: "2-3 hours",
    progress: 75,
    difficulty: "beginner",
    participants: 234
  },
  {
    id: 2,
    title: "Loan Officer Certification",
    description: "Industry-specific training for loan officers",
    scenarios: 12,
    duration: "4-5 hours",
    progress: 25,
    difficulty: "intermediate",
    participants: 89
  },
  {
    id: 3,
    title: "Advanced Objection Handling",
    description: "Master complex objection scenarios",
    scenarios: 6,
    duration: "2 hours",
    progress: 0,
    difficulty: "advanced",
    participants: 45
  }
]

const mockAssignments = [
  {
    id: 1,
    title: "Cold Call Introduction",
    type: "Scenario",
    assignedBy: "Sarah Manager",
    dueDate: "2025-01-25",
    status: "in_progress",
    progress: 60
  },
  {
    id: 2,
    title: "Q1 Sales Training Track",
    type: "Track",
    assignedBy: "Mike Director",
    dueDate: "2025-02-15",
    status: "assigned",
    progress: 0
  }
]

export function TrainingHub({ user }: TrainingHubProps) {
  return (
    <div className="space-y-6">

      {/* Quick Start Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockQuickStart.map((option) => (
          <Card key={option.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${option.color} rounded-lg p-3`}>
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{option.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">{option.duration}</span>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/training/session/new?type=${option.type}`}>
                    Start
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Training Content */}
      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="tracks" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Training Tracks
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Assignments
          </TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Scenarios</CardTitle>
              <CardDescription>
                Practice specific skills with targeted scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockScenarios.map((scenario) => (
                  <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {scenario.description}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          scenario.difficulty === 'beginner' ? 'secondary' :
                          scenario.difficulty === 'intermediate' ? 'default' : 'destructive'
                        }>
                          {scenario.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scenario.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {scenario.completions} attempts
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {scenario.avgScore}% avg
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {scenario.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          {scenario.industry}
                        </Badge>
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/training/session/new?scenario=${scenario.id}`}>
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            Start Training
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tracks Tab */}
        <TabsContent value="tracks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Tracks</CardTitle>
              <CardDescription>
                Structured learning paths with multiple scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTracks.map((track) => (
                  <Card key={track.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{track.title}</h3>
                            <Badge variant={
                              track.difficulty === 'beginner' ? 'secondary' :
                              track.difficulty === 'intermediate' ? 'default' : 'destructive'
                            }>
                              {track.difficulty}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground mb-3">{track.description}</p>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {track.scenarios} scenarios
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {track.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {track.participants} participants
                            </div>
                          </div>

                          {track.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{track.progress}%</span>
                              </div>
                              <Progress value={track.progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          <Button asChild>
                            <Link href={`/training/track/${track.id}`}>
                              <div className="flex items-center gap-2">
                                {track.progress > 0 ? 'Continue' : 'Start Track'}
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assignments</CardTitle>
              <CardDescription>
                Training assigned by your manager or organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{assignment.title}</h3>
                            <Badge variant={assignment.type === 'Track' ? 'default' : 'secondary'}>
                              {assignment.type}
                            </Badge>
                            <Badge variant={
                              assignment.status === 'completed' ? 'default' :
                              assignment.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {assignment.status === 'completed' ? 'Completed' :
                               assignment.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>Assigned by: {assignment.assignedBy}</span>
                            <span>Due: {assignment.dueDate}</span>
                          </div>

                          {assignment.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{assignment.progress}%</span>
                              </div>
                              <Progress value={assignment.progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          <Button asChild>
                            <Link href={`/training/session/new?${assignment.type === 'Track' ? 'track' : 'scenario'}=${assignment.id}`}>
                              <div className="flex items-center gap-2">
                                {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                    <p className="text-muted-foreground">
                      Your manager hasn't assigned any training yet. Try exploring scenarios or tracks above.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}