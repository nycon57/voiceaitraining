"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AgentPersonaCard } from "./AgentPersonaCard"
import { ConversationTranscript } from "./ConversationTranscript"
import { LiveKPIIndicators } from "./LiveKPIIndicators"
import { CallControls } from "./CallControls"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CallStatus, TranscriptMessage, CallKPIs } from "@/hooks/useVapiCall"

interface LiveCallInterfaceProps {
  scenario: {
    title: string
    persona: {
      name: string
      role: string
      image_url?: string
      difficulty?: "easy" | "medium" | "hard"
    }
  }
  user: {
    name: string
    avatar?: string
  }
  status: CallStatus
  transcript: TranscriptMessage[]
  kpis: CallKPIs
  isMuted: boolean
  isAgentSpeaking: boolean
  isUserSpeaking: boolean
  volume: number
  onToggleMute: () => void
  onEndCall: () => void
  onCancelAttempt?: () => void
  onVolumeChange: (volume: number) => void
}

export function LiveCallInterface({
  scenario,
  user,
  status,
  transcript,
  kpis,
  isMuted,
  isAgentSpeaking,
  isUserSpeaking,
  volume,
  onToggleMute,
  onEndCall,
  onCancelAttempt,
  onVolumeChange,
}: LiveCallInterfaceProps) {
  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-lg font-bold">
                {scenario.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Training Session in Progress
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "border-success/50 text-success",
                status === "connecting" && "border-warning/50 text-warning"
              )}
            >
              <span className="relative flex h-2 w-2 mr-2">
                {status === "active" && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </>
                )}
              </span>
              {status === "active"
                ? "Call Active"
                : status === "connecting"
                  ? "Connecting..."
                  : "Connected"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container max-w-7xl mx-auto h-full py-6 px-4">
          <div className="grid lg:grid-cols-12 gap-6 h-full">
            {/* Left Sidebar: Agent Persona (Hidden on Mobile) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              <AgentPersonaCard
                persona={scenario.persona}
                isSpeaking={isAgentSpeaking}
                showDetails={false}
                className="sticky top-6"
              />
            </div>

            {/* Center: Conversation Transcript */}
            <div className="lg:col-span-6 flex flex-col h-full">
              {/* Mobile Agent/User Headers */}
              <div className="lg:hidden grid grid-cols-2 gap-4 mb-4">
                {/* Agent */}
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={scenario.persona.image_url}
                        alt={scenario.persona.name}
                      />
                      <AvatarFallback>
                        {scenario.persona.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {scenario.persona.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {isAgentSpeaking && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {isAgentSpeaking ? "Speaking..." : scenario.persona.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* User */}
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <div className="flex items-center gap-1">
                        {isUserSpeaking && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {isUserSpeaking ? "Speaking..." : "You"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Transcript Card */}
              <Card className="flex-1 flex flex-col overflow-hidden">
                <ConversationTranscript
                  messages={transcript}
                  agentName={scenario.persona.name}
                  agentAvatar={scenario.persona.image_url}
                  userName={user.name}
                  userAvatar={user.avatar}
                  autoScroll={true}
                  highlightKeyMoments={true}
                  className="flex-1"
                />
              </Card>
            </div>

            {/* Right Sidebar: User Info & KPIs */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              {/* User Card */}
              <Card className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute inset-0 -m-2 rounded-full transition-all duration-300",
                        isUserSpeaking
                          ? "bg-primary/20 animate-pulse shadow-lg shadow-primary/50"
                          : "bg-transparent"
                      )}
                    />
                    <Avatar className="h-16 w-16 border-4 border-background relative z-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {isUserSpeaking && (
                      <div className="absolute -bottom-1 -right-1 z-20">
                        <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <User className="h-3 w-3" />
                      Trainee
                    </p>
                  </div>
                  {isMuted && (
                    <Badge variant="destructive" className="text-xs">
                      Muted
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Live KPIs - Compact Version */}
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">Live Performance</h3>
                <LiveKPIIndicators kpis={kpis} compact={true} />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile KPIs (Bottom of screen, above controls) */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur-sm px-4 py-3">
        <LiveKPIIndicators kpis={kpis} compact={true} />
      </div>

      {/* Call Controls */}
      <CallControls
        status={status}
        isMuted={isMuted}
        volume={volume}
        duration={kpis.duration}
        onToggleMute={onToggleMute}
        onEndCall={onEndCall}
        onCancelAttempt={onCancelAttempt}
        onVolumeChange={onVolumeChange}
      />
    </div>
  )
}
