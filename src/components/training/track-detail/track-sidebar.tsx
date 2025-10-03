"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, Layers, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { enrollUser } from "@/actions/enrollments"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TrackSidebarProps {
  trackId: string
  track: {
    scenario_count: number
    total_duration?: number
    enrollment_count?: number
  }
  progress?: {
    progress_percentage: number
    current_scenario_index: number
  } | null
  isEnrolled: boolean
}

export function TrackSidebar({ trackId, track, progress, isEnrolled }: TrackSidebarProps) {
  const router = useRouter()
  const [isEnrolling, setIsEnrolling] = useState(false)

  const totalHours = track.total_duration
    ? Math.round(track.total_duration / 3600)
    : Math.ceil((track.scenario_count * 300) / 3600)

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      await enrollUser({
        type: 'track',
        trackId,
      })
      toast.success('Successfully enrolled in track!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll')
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* CTA Card */}
      <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            {isEnrolled ? (
              <>
                <div>
                  <div className="font-headline text-2xl font-bold mb-2">
                    Continue Learning
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pick up where you left off and keep making progress.
                  </p>
                </div>

                {progress && (
                  <div className="space-y-2 p-3 rounded-lg bg-background/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-semibold">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                    <Progress value={progress.progress_percentage} className="h-2" />
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  asChild
                >
                  <Link href={`/training/tracks/${trackId}`}>
                    <Play className="h-5 w-5 mr-2" />
                    Continue Track
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <div>
                  <div className="font-headline text-2xl font-bold mb-2">
                    Ready to begin?
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enroll in this track to start your learning journey.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>Enrolling...</>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Enroll Now
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Track Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Track Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Scenarios</div>
              <div className="text-sm text-muted-foreground">
                {track.scenario_count} total scenarios
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Time to Complete</div>
              <div className="text-sm text-muted-foreground">
                Approximately {totalHours} hours
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Learners</div>
              <div className="text-sm text-muted-foreground">
                {track.enrollment_count || 0} enrolled
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Certificate Preview */}
      {isEnrolled && progress?.progress_percentage === 100 && (
        <Card className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Track Complete!
            </CardTitle>
            <CardDescription>
              Congratulations on completing this track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/certificates/${trackId}`}>
                View Certificate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
