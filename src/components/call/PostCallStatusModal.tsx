"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  FlaskConical,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type CallCompletionReason =
  | "complete"
  | "practice"
  | "technical"
  | "cancelled"

interface PostCallStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (reason: CallCompletionReason) => void
  duration: number
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function PostCallStatusModal({
  open,
  onOpenChange,
  onComplete,
  duration,
}: PostCallStatusModalProps) {
  const handleSelection = (reason: CallCompletionReason) => {
    onOpenChange(false)
    onComplete(reason)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 border-2 border-warning/30">
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Mark This Attempt?
          </DialogTitle>
          <DialogDescription className="text-center">
            This was a short call ({formatDuration(duration)}). How would you
            like to record this session?
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Separator />
        </div>

        <div className="space-y-3">
          {/* Complete */}
          <button
            onClick={() => handleSelection("complete")}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all",
              "hover:border-primary hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "group"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Count as Complete</p>
                  <Badge
                    variant="outline"
                    className="border-primary/50 text-primary text-xs"
                  >
                    Recommended
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save and score this attempt normally. Best for brief but
                  meaningful interactions.
                </p>
              </div>
            </div>
          </button>

          {/* Practice */}
          <button
            onClick={() => handleSelection("practice")}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all",
              "hover:border-primary hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "group"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FlaskConical className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-sm">Mark as Practice</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save for reference, but don't count toward your score. Won't
                  affect your performance metrics.
                </p>
              </div>
            </div>
          </button>

          {/* Technical Issue */}
          <button
            onClick={() => handleSelection("technical")}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all",
              "hover:border-primary hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "group"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-sm">Technical Issue</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save for review, flag as having technical problems. Your
                  manager will be notified.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2">
          <Separator />
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelection("cancelled")}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Attempt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
