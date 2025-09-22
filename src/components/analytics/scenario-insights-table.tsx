'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScenarioInsight } from '@/lib/analytics'

interface ScenarioInsightsTableProps {
  data: ScenarioInsight[]
  isLoading?: boolean
}

export function ScenarioInsightsTable({ data, isLoading = false }: ScenarioInsightsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenario Performance</CardTitle>
          <CardDescription>Performance breakdown by scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Performance</CardTitle>
        <CardDescription>
          Performance breakdown by training scenario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scenario</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Avg Duration</TableHead>
              <TableHead>Difficulty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((scenario) => (
              <TableRow key={scenario.scenario_id}>
                <TableCell>
                  <div className="font-medium">{scenario.scenario_title}</div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{scenario.attempt_count}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${getScoreColor(scenario.average_score)}`}>
                      {scenario.average_score}%
                    </span>
                    <Progress
                      value={scenario.average_score}
                      className="w-12 h-2"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{scenario.completion_rate}%</span>
                    <Progress
                      value={scenario.completion_rate}
                      className="w-12 h-2"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(scenario.average_duration)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scenario data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}