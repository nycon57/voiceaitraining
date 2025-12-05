"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { User, Briefcase, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentPersonaCardProps {
  persona: {
    name: string
    role: string
    image_url?: string
    difficulty?: "easy" | "medium" | "hard"
    personality?: string[]
    background?: string
  }
  isSpeaking?: boolean
  showDetails?: boolean
  className?: string
}

export function AgentPersonaCard({
  persona,
  isSpeaking = false,
  showDetails = true,
  className,
}: AgentPersonaCardProps) {
  const difficultyColors = {
    easy: "bg-success/20 text-success border-success/40",
    medium: "bg-warning/20 text-warning border-warning/40",
    hard: "bg-destructive/20 text-destructive border-destructive/40",
  }

  const initials = persona.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar with Speaking Indicator */}
          <div className="relative">
            <div
              className={cn(
                "absolute inset-0 -m-2 rounded-full transition-all duration-300",
                isSpeaking
                  ? "bg-primary/20 animate-pulse shadow-lg shadow-primary/50"
                  : "bg-transparent"
              )}
            />
            <Avatar className="h-24 w-24 border-4 border-background relative z-10">
              <AvatarImage src={persona.image_url} alt={persona.name} />
              <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isSpeaking && (
              <div className="absolute -bottom-1 -right-1 z-20">
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Name and Role */}
          <div className="space-y-1">
            <h3 className="font-headline text-xl font-bold">{persona.name}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{persona.role}</span>
            </div>
          </div>

          {/* Difficulty Badge */}
          {persona.difficulty && (
            <Badge
              variant="outline"
              className={cn("border", difficultyColors[persona.difficulty])}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {persona.difficulty.charAt(0).toUpperCase() + persona.difficulty.slice(1)}
            </Badge>
          )}

          {/* Background & Personality */}
          {showDetails && (
            <div className="w-full space-y-3 text-left">
              {persona.background && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Background
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {persona.background}
                  </p>
                </div>
              )}

              {persona.personality && persona.personality.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Personality
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.personality.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Speaking Indicator Text */}
          {isSpeaking && (
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Speaking...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
