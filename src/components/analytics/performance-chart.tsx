'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PerformanceTrend } from '@/lib/analytics'

const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false })
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false })
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })

interface PerformanceChartProps {
  data: PerformanceTrend[]
  isLoading?: boolean
}

const chartConfig = {
  average_score: {
    label: "Average Score",
    color: "hsl(var(--chart-1))",
  },
  attempt_count: {
    label: "Attempts",
    color: "hsl(var(--chart-2))",
  },
  completion_rate: {
    label: "Completion Rate",
    color: "hsl(var(--chart-3))",
  },
}

export function PerformanceChart({ data, isLoading = false }: PerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Daily performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart…</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>
          Daily performance metrics over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="average_score"
              stroke="var(--color-average_score)"
              strokeWidth={2}
              dot={{ fill: "var(--color-average_score)", strokeWidth: 2, r: 4 }}
              name="Average Score"
            />
            <Line
              type="monotone"
              dataKey="completion_rate"
              stroke="var(--color-completion_rate)"
              strokeWidth={2}
              dot={{ fill: "var(--color-completion_rate)", strokeWidth: 2, r: 4 }}
              name="Completion Rate (%)"
            />
          </LineChart>
        </ChartContainer>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 bg-chart-1 rounded" />
            <span>Average Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 bg-chart-3 rounded" />
            <span>Completion Rate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
