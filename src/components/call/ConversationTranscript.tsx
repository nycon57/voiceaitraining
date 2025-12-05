"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle, CheckCircle2, HelpCircle, ArrowDown } from "lucide-react"
import type { TranscriptMessage } from "@/hooks/useVapiCall"

interface ConversationTranscriptProps {
  messages: TranscriptMessage[]
  agentName: string
  agentAvatar?: string
  userName: string
  userAvatar?: string
  autoScroll?: boolean
  highlightKeyMoments?: boolean
  className?: string
}

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function detectKeyMoment(text: string, role: "user" | "assistant"): {
  type: "objection" | "question" | "commitment" | null
  icon: React.ReactNode
} {
  const lowerText = text.toLowerCase()

  // Detect objections
  if (
    lowerText.includes("but") ||
    lowerText.includes("however") ||
    lowerText.includes("too expensive") ||
    lowerText.includes("not sure") ||
    lowerText.includes("worried") ||
    lowerText.includes("concern")
  ) {
    return {
      type: "objection",
      icon: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
    }
  }

  // Detect questions
  if (role === "user" && text.includes("?")) {
    return {
      type: "question",
      icon: <HelpCircle className="h-3.5 w-3.5 text-primary" />,
    }
  }

  // Detect commitments
  if (
    (lowerText.includes("yes") && lowerText.includes("schedule")) ||
    lowerText.includes("let's do it") ||
    lowerText.includes("sounds good") ||
    lowerText.includes("i'll go ahead") ||
    lowerText.includes("sign me up")
  ) {
    return {
      type: "commitment",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
    }
  }

  return { type: null, icon: null }
}

export function ConversationTranscript({
  messages,
  agentName,
  agentAvatar,
  userName,
  userAvatar,
  autoScroll = true,
  highlightKeyMoments = true,
  className,
}: ConversationTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const lastMessageCountRef = useRef(messages.length)

  // Check if user is near bottom of scroll
  const isNearBottom = (element: HTMLDivElement) => {
    const threshold = 100 // pixels from bottom
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold
  }

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollRef.current) return

    const nearBottom = isNearBottom(scrollRef.current)

    // If user scrolled to bottom manually, resume auto-scroll
    if (nearBottom) {
      setIsUserScrolling(false)
      setShowScrollButton(false)
    } else {
      // User scrolled up, pause auto-scroll
      setIsUserScrolling(true)
      setShowScrollButton(true)
    }
  }

  // Auto-scroll to bottom when new messages arrive (only if not manually scrolling)
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return

    const hasNewMessages = messages.length > lastMessageCountRef.current
    lastMessageCountRef.current = messages.length

    // Only auto-scroll if user hasn't manually scrolled up
    if (hasNewMessages && !isUserScrolling) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, autoScroll, isUserScrolling])

  // Scroll to bottom manually
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
      setIsUserScrolling(false)
      setShowScrollButton(false)
    }
  }

  const agentInitials = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn("relative flex-1 flex flex-col", className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth"
      >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">
              The conversation will appear here once you start speaking.
            </div>
            <div className="text-xs text-muted-foreground/60">
              Your words will be transcribed in real-time.
            </div>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const isUser = message.role === "user"
          const keyMoment = highlightKeyMoments
            ? detectKeyMoment(message.text, message.role)
            : { type: null, icon: null }

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300",
                isUser ? "flex-row-reverse" : "flex-row",
                !message.isFinal && "opacity-60"
              )}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={isUser ? userAvatar : agentAvatar}
                  alt={isUser ? userName : agentName}
                />
                <AvatarFallback className="text-xs">
                  {isUser ? userInitials : agentInitials}
                </AvatarFallback>
              </Avatar>

              {/* Message Content */}
              <div
                className={cn(
                  "flex flex-col gap-1.5 max-w-[75%]",
                  isUser ? "items-end" : "items-start"
                )}
              >
                {/* Header */}
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <span className="font-medium">
                    {isUser ? userName : agentName}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {keyMoment.icon && keyMoment.icon}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm",
                    keyMoment.type === "objection" && "ring-2 ring-destructive/30",
                    keyMoment.type === "commitment" && "ring-2 ring-success/30"
                  )}
                >
                  {message.text}
                </div>

                {/* Key Moment Badge */}
                {keyMoment.type && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      keyMoment.type === "objection" &&
                        "border-destructive/50 text-destructive",
                      keyMoment.type === "commitment" &&
                        "border-success/50 text-success",
                      keyMoment.type === "question" &&
                        "border-primary/50 text-primary"
                    )}
                  >
                    {keyMoment.type.charAt(0).toUpperCase() +
                      keyMoment.type.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          )
        })
      )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="sm"
            onClick={scrollToBottom}
            className="shadow-lg"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            New messages
          </Button>
        </div>
      )}
    </div>
  )
}
