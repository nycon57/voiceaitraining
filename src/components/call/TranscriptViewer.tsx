"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Search, Download, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TranscriptMessage } from "@/hooks/useVapiCall"

interface TranscriptViewerProps {
  transcript: TranscriptMessage[]
  personaName?: string
  className?: string
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TranscriptViewer({
  transcript,
  personaName = "Agent",
  className,
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [copied, setCopied] = useState(false)

  const filteredTranscript = searchQuery
    ? transcript.filter((msg) =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcript

  const handleCopyTranscript = async () => {
    const text = transcript
      .map((msg) => {
        const speaker = msg.role === "user" ? "You" : personaName
        const time = formatTimestamp(msg.timestamp)
        return `[${time}] ${speaker}: ${msg.text}`
      })
      .join("\n\n")

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadTranscript = () => {
    const text = transcript
      .map((msg) => {
        const speaker = msg.role === "user" ? "You" : personaName
        const time = formatTimestamp(msg.timestamp)
        return `[${time}] ${speaker}: ${msg.text}`
      })
      .join("\n\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcript-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Call Transcript
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTranscript}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTranscript}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredTranscript.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">
                {searchQuery
                  ? "No messages match your search"
                  : "No transcript available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTranscript.map((message, index) => (
                <div
                  key={message.id || index}
                  className={cn(
                    "flex gap-3 rounded-lg p-3 transition-colors",
                    message.role === "user"
                      ? "bg-primary/5 ml-8"
                      : "bg-muted/50 mr-8"
                  )}
                >
                  <div className="flex-shrink-0">
                    <Badge
                      variant={message.role === "user" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {formatTimestamp(message.timestamp)}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {message.role === "user" ? "You" : personaName}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
