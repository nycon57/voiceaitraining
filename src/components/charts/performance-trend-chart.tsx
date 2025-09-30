"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { BaseChartProps, PerformanceTrendData } from "./types";

export interface PerformanceTrendChartProps extends BaseChartProps {
  data: PerformanceTrendData[];
  showArea?: boolean;
  showDataPoints?: boolean;
  maxScore?: number;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
};

function ChartLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function ChartEmptyState() {
  return (
    <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-dashed">
      <div className="flex flex-col items-center gap-2 text-center">
        <TrendingUp className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          No performance data available yet
        </div>
      </div>
    </div>
  );
}

export function PerformanceTrendChart({
  data,
  title = "Performance Trend",
  description = "Track your score over time",
  isLoading = false,
  className,
  showArea = false,
  showDataPoints = true,
  maxScore = 100,
}: PerformanceTrendChartProps) {
  const formattedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      date:
        item.date instanceof Date
          ? item.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
      score: Math.round(item.score),
    }));
  }, [data]);

  const averageScore = React.useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.score, 0);
    return Math.round(sum / data.length);
  }, [data]);

  const trend = React.useMemo(() => {
    if (data.length < 2) return 0;
    const firstScore = data[0].score;
    const lastScore = data[data.length - 1].score;
    return Math.round(((lastScore - firstScore) / firstScore) * 100);
  }, [data]);

  return (
    <Card className={cn("w-full", className)} animated={false}>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartLoadingSkeleton />
        ) : data.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              {showArea ? (
                <AreaChart
                  data={formattedData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, maxScore]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                    dot={
                      showDataPoints
                        ? {
                            fill: "hsl(var(--chart-1))",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "hsl(var(--background))",
                          }
                        : false
                    }
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={formattedData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, maxScore]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={
                      showDataPoints
                        ? {
                            fill: "hsl(var(--chart-1))",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "hsl(var(--background))",
                          }
                        : false
                    }
                  />
                </LineChart>
              )}
            </ChartContainer>

            {/* Stats Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-muted-foreground">Average Score</div>
                <div className="mt-1 font-headline text-2xl font-semibold">
                  {averageScore}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-muted-foreground">Total Attempts</div>
                <div className="mt-1 font-headline text-2xl font-semibold">
                  {data.length}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 max-md:col-span-2">
                <div className="text-muted-foreground">Trend</div>
                <div
                  className={cn(
                    "mt-1 font-headline text-2xl font-semibold",
                    trend > 0 && "text-success",
                    trend < 0 && "text-destructive"
                  )}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}