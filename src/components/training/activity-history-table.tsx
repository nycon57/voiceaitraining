"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyStateList } from "@/components/ui/empty-state"
import {
  History,
  Search,
  Eye,
  RotateCcw,
  ArrowUpDown,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface ActivityHistoryRow {
  id: string
  scenarioId: string
  scenarioTitle: string
  type: "scenario" | "track"
  startedAt: string
  duration: number // seconds
  score?: number
  status: "completed" | "in_progress" | "failed"
}

interface ActivityHistoryTableProps {
  activities: ActivityHistoryRow[]
}

const statusConfig = {
  completed: {
    label: "Completed",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-green-500",
  },
  in_progress: {
    label: "In Progress",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-blue-500",
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-500",
  },
}

const typeConfig = {
  scenario: {
    label: "Scenario",
    variant: "outline" as const,
  },
  track: {
    label: "Track",
    variant: "secondary" as const,
  },
}

export function ActivityHistoryTable({ activities }: ActivityHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<"date" | "score" | "duration">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.scenarioTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter
    const matchesType = typeFilter === "all" || activity.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "date":
        comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        break
      case "score":
        comparison = (a.score || 0) - (b.score || 0)
        break
      case "duration":
        comparison = a.duration - b.duration
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground"
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  if (activities.length === 0) {
    return (
      <Card animated={false}>
        <CardContent className="pt-6">
          <EmptyStateList
            icon={History}
            title="No training history"
            description="Your completed training sessions will appear here."
            animated={false}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card animated={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Activity History
        </CardTitle>
        <CardDescription>
          View all your training attempts and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search training..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="scenario">Scenarios</SelectItem>
                <SelectItem value="track">Tracks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Training</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("duration")}>
                  <div className="flex items-center gap-1">
                    Duration
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("score")}>
                  <div className="flex items-center gap-1">
                    Score
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>No activities match your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedActivities.map((activity) => {
                  const StatusIcon = statusConfig[activity.status].icon
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {activity.scenarioTitle}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={typeConfig[activity.type].variant}
                          size="sm"
                        >
                          {typeConfig[activity.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.startedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {formatDuration(activity.duration)}
                      </TableCell>
                      <TableCell>
                        {activity.score !== undefined ? (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span
                              className={cn(
                                "font-semibold tabular-nums",
                                getScoreColor(activity.score)
                              )}
                            >
                              {activity.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <StatusIcon
                            className={cn("h-4 w-4", statusConfig[activity.status].color)}
                          />
                          <span className="text-sm">
                            {statusConfig[activity.status].label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = `/attempts/${activity.id}`
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {activity.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                window.location.href = `/play/${activity.scenarioId}`
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {sortedActivities.length} of {activities.length} activities
        </div>
      </CardContent>
    </Card>
  )
}
