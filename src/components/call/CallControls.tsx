"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
  XCircle,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { CancelAttemptDialog } from "./CancelAttemptDialog"
import { cn } from "@/lib/utils"
import type { CallStatus } from "@/hooks/useVapiCall"

interface CallControlsProps {
  status: CallStatus
  isMuted: boolean
  volume: number
  duration: number
  onToggleMute: () => void
  onEndCall: () => void
  onCancelAttempt?: () => void
  onVolumeChange: (volume: number) => void
  className?: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function CallControls({
  status,
  isMuted,
  volume,
  duration,
  onToggleMute,
  onEndCall,
  onCancelAttempt,
  onVolumeChange,
  className,
}: CallControlsProps) {
  const [showEndCallDialog, setShowEndCallDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleEndCallClick = () => {
    if (status === "active" && duration > 5) {
      // Show confirmation if call is active and longer than 5 seconds
      setShowEndCallDialog(true)
    } else {
      onEndCall()
    }
  }

  const handleConfirmEndCall = () => {
    setShowEndCallDialog(false)
    onEndCall()
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = () => {
    if (onCancelAttempt) {
      onCancelAttempt()
    }
  }

  const isCallActive = status === "active" || status === "connected"
  const isEnding = status === "ending"

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 p-4 bg-background/95 backdrop-blur-sm border-t",
          className
        )}
      >
        {/* Primary Controls Row */}
        <div className="flex items-center justify-center gap-4">
          {/* Call Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-sm",
                status === "active" && "border-success/50 text-success",
                status === "connecting" && "border-warning/50 text-warning",
                status === "error" && "border-destructive/50 text-destructive"
              )}
            >
              <span className="relative flex h-2 w-2 mr-2">
                {status === "active" && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </>
                )}
                {status === "connecting" && (
                  <Loader2 className="h-2 w-2 animate-spin" />
                )}
              </span>
              {formatDuration(duration)}
            </Badge>
          </div>

          {/* Main Call Controls */}
          <div className="flex items-center gap-3">
            {/* Mute/Unmute */}
            <Button
              size="lg"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={onToggleMute}
              disabled={!isCallActive}
              className="h-14 w-14 rounded-full"
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
              <span className="sr-only">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </Button>

            {/* End Call */}
            <Button
              size="lg"
              variant="destructive"
              onClick={handleEndCallClick}
              disabled={!isCallActive || isEnding}
              className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90"
            >
              {isEnding ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <PhoneOff className="h-6 w-6" />
              )}
              <span className="sr-only">End Call</span>
            </Button>

            {/* Volume Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={!isCallActive}
                  className="h-14 w-14 rounded-full"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                  <span className="sr-only">Volume</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60" align="center">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Agent Volume</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(volume * 100)}%
                    </p>
                  </div>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([value]) => onVolumeChange(value / 100)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Settings (Future Feature) */}
          <Button
            size="lg"
            variant="ghost"
            disabled
            className="h-14 w-14 rounded-full"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>

        {/* Secondary Actions Row */}
        {onCancelAttempt && (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelClick}
              disabled={!isCallActive || isEnding}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Attempt
            </Button>
          </div>
        )}
      </div>

      {/* End Call Confirmation Dialog */}
      <AlertDialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End the call?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this training session? Your progress
              will be saved and analyzed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Call</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEndCall}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              End Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Attempt Confirmation Dialog */}
      <CancelAttemptDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </>
  )
}
