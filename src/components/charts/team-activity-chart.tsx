"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import { Users } from "lucide-react";

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

import type { BaseChartProps, TeamActivityData } from "./types";

export interface TeamActivityChartProps extends BaseChartProps {
  data: TeamActivityData[];
  colorByCategory?: boolean;
  horizontal?: boolean;
  showValues?: boolean;
}

const categoryColors: Record<string, string> = {
  default: "hsl(var(--chart-1))",
  completed: "hsl(var(--success))",
  inProgress: "hsl(var(--warning))",
  pending: "hsl(var(--info))",
  failed: "hsl(var(--destructive))",
};

const chartConfig = {
  value: {
    label: "Activity",
    color: "hsl(var(--chart-1))",
  },
};

function ChartLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[250px] w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function ChartEmptyState() {
  return (
    <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed">
      <div className="flex flex-col items-center gap-2 text-center">
        <Users className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          No team activity data available yet
        </div>
      </div>
    </div>
  );
}

export function TeamActivityChart({
  data,
  title = "Team Activity",
  description = "Activity metrics by user or time period",
  isLoading = false,
  className,
  colorByCategory = false,
  horizontal = false,
  showValues = false,
}: TeamActivityChartProps) {
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const totalActivity = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const topPerformer = React.useMemo(() => {
    if (data.length === 0) return null;
    return sortedData[0];
  }, [sortedData, data.length]);

  const getBarColor = React.useCallback(
    (category?: string) => {
      if (!colorByCategory || !category) {
        return "hsl(var(--chart-1))";
      }
      return categoryColors[category] || categoryColors.default;
    },
    [colorByCategory]
  );

  // Truncate labels for mobile
  const formatLabel = (label: string) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return label.length > 10 ? label.substring(0, 10) + "..." : label;
    }
    return label;
  };

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
            <ChartContainer
              config={chartConfig}
              className={cn(
                "w-full",
                horizontal ? "h-[300px]" : "h-[250px]"
              )}
            >
              <BarChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                layout={horizontal ? "vertical" : "horizontal"}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  {...(horizontal
                    ? { horizontal: true, vertical: false }
                    : { horizontal: false, vertical: true })}
                />
                {horizontal ? (
                  <>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                      tickFormatter={formatLabel}
                    />
                  </>
                ) : (
                  <>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tickFormatter={formatLabel}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                  </>
                )}
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  label={
                    showValues
                      ? { position: "top", fontSize: 12 }
                      : undefined
                  }
                >
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.category)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Stats Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-muted-foreground">Total Activity</div>
                <div className="mt-1 font-headline text-2xl font-semibold">
                  {totalActivity.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-muted-foreground">Team Members</div>
                <div className="mt-1 font-headline text-2xl font-semibold">
                  {data.length}
                </div>
              </div>
              {topPerformer && (
                <div className="rounded-lg border bg-muted/50 p-3 max-md:col-span-2">
                  <div className="text-muted-foreground">Top Performer</div>
                  <div className="mt-1 font-headline text-base font-semibold truncate">
                    {topPerformer.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {topPerformer.value.toLocaleString()} activities
                  </div>
                </div>
              )}
            </div>

            {/* Legend for categories */}
            {colorByCategory &&
              data.some((item) => item.category) && (
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                  {Array.from(
                    new Set(data.map((item) => item.category).filter(Boolean))
                  ).map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{
                          backgroundColor: getBarColor(category),
                        }}
                      />
                      <span className="capitalize text-muted-foreground">
                        {category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
}