"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, ArrowUpDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Attempt {
  id: string
  started_at: string
  duration_seconds?: number
  score?: number
  status: 'completed' | 'in_progress' | 'failed'
}

interface AttemptHistoryTableProps {
  attempts: Attempt[]
  onAttemptClick: (attemptId: string) => void
}

export function AttemptHistoryTable({ attempts, onAttemptClick }: AttemptHistoryTableProps) {
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedAttempts = [...attempts].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
        break
      case 'score':
        comparison = (a.score || 0) - (b.score || 0)
        break
      case 'duration':
        comparison = (a.duration_seconds || 0) - (b.duration_seconds || 0)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleSort = (column: 'date' | 'score' | 'duration') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreBadge = (score?: number) => {
    if (score === undefined || score === null) return null

    if (score >= 90) return <Badge variant="default" className="bg-chart-2/20 text-chart-2">Excellent</Badge>
    if (score >= 70) return <Badge variant="default" className="bg-chart-1/20 text-chart-1">Good</Badge>
    if (score >= 50) return <Badge variant="default" className="bg-warning/20 text-warning">Fair</Badge>
    return <Badge variant="default" className="bg-destructive/20 text-destructive">Needs Work</Badge>
  }

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <History className="h-5 w-5" />
            Attempt History
          </CardTitle>
          <CardDescription>Your previous attempts at this scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No attempts yet. Start practicing to see your history here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <History className="h-5 w-5" />
          Attempt History
        </CardTitle>
        <CardDescription>Click any attempt to view detailed analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => toggleSort('duration')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Duration
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => toggleSort('score')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Score
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAttempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  onClick={() => onAttemptClick(attempt.id)}
                  className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(attempt.started_at), { addSuffix: true })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(attempt.started_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm font-medium">
                      {formatDuration(attempt.duration_seconds)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm font-bold">
                      {attempt.score !== undefined ? `${attempt.score}%` : '—'}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {attempt.status === 'completed' ? (
                      getScoreBadge(attempt.score)
                    ) : (
                      <Badge variant="outline">{attempt.status}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
