"use client"

import { useEffect, useReducer, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  SkipBack,
  SkipForward,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAttemptRecordingPlayback } from "@/actions/recordings"

interface RecordingPlayerProps {
  attemptId: string
  className?: string
}

type RecordingPlayerState = {
  isLoading: boolean
  error: string | null
  recordingUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
}

type RecordingPlayerAction =
  | { type: "loading" }
  | { type: "loaded"; recordingUrl: string }
  | { type: "error"; error: string }
  | { type: "playing"; isPlaying: boolean }
  | { type: "time"; currentTime: number }
  | { type: "duration"; duration: number }
  | { type: "volume"; volume: number }
  | { type: "muted"; isMuted: boolean }

const initialRecordingPlayerState: RecordingPlayerState = {
  isLoading: true,
  error: null,
  recordingUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
}

function recordingPlayerReducer(
  state: RecordingPlayerState,
  action: RecordingPlayerAction,
): RecordingPlayerState {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true, error: null }
    case "loaded":
      return { ...state, isLoading: false, recordingUrl: action.recordingUrl }
    case "error":
      return { ...state, isLoading: false, error: action.error }
    case "playing":
      return { ...state, isPlaying: action.isPlaying }
    case "time":
      return { ...state, currentTime: action.currentTime }
    case "duration":
      return { ...state, duration: action.duration }
    case "volume":
      return { ...state, volume: action.volume, isMuted: action.volume === 0 }
    case "muted":
      return { ...state, isMuted: action.isMuted }
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function RecordingPlayer({ attemptId, className }: RecordingPlayerProps) {
  const [{
    isLoading,
    error,
    recordingUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
  }, dispatch] = useReducer(recordingPlayerReducer, initialRecordingPlayerState)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch signed URL for recording
  useEffect(() => {
    async function fetchRecordingUrl() {
      try {
        dispatch({ type: "loading" })
        const data = await getAttemptRecordingPlayback(attemptId)
        dispatch({ type: "loaded", recordingUrl: data.url })
      } catch (err) {
        dispatch({
          type: "error",
          error: err instanceof Error ? err.message : "Failed to load recording",
        })
      }
    }

    fetchRecordingUrl()
  }, [attemptId])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => dispatch({ type: "time", currentTime: audio.currentTime })
    const handleDurationChange = () => dispatch({ type: "duration", duration: audio.duration })
    const handleEnded = () => dispatch({ type: "playing", isPlaying: false })
    const handleError = () => {
      dispatch({ type: "error", error: "Error loading audio" })
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [recordingUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    dispatch({ type: "playing", isPlaying: !isPlaying })
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    dispatch({ type: "time", currentTime: newTime })
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    dispatch({ type: "volume", volume: newVolume })
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume || 0.5
      dispatch({ type: "muted", isMuted: false })
    } else {
      audio.volume = 0
      dispatch({ type: "muted", isMuted: true })
    }
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  const handleDownload = () => {
    if (!recordingUrl) return

    const a = document.createElement("a")
    a.href = recordingUrl
    a.download = `recording-${attemptId}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading recording…</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !recordingUrl) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-destructive mb-3" />
            <p className="text-sm text-muted-foreground">
              {error || "Recording not available"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="size-5" />
            Call Recording
          </span>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4 mr-2" />
            Download
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio ref={audioRef} src={recordingUrl} preload="metadata" />

        {/* Time slider */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => skip(-10)}
              disabled={currentTime === 0}
            >
              <SkipBack className="size-4" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="size-12"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => skip(10)}
              disabled={currentTime >= duration}
            >
              <SkipForward className="size-4" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="flex-shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
