"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { BaseChartProps, KPIMetricsData } from "./types";

export interface KPIMetricsChartProps extends BaseChartProps {
  data: KPIMetricsData[];
  metrics?: string[];
  metricLabels?: Record<string, string>;
  metricColors?: Record<string, string>;
  showLegend?: boolean;
  stacked?: boolean;
}

const defaultMetricColors: Record<string, string> = {
  kpi1: "hsl(var(--success))",
  kpi2: "hsl(var(--warning))",
  kpi3: "hsl(var(--info))",
  kpi4: "hsl(var(--chart-1))",
  kpi5: "hsl(var(--chart-2))",
  kpi6: "hsl(var(--chart-3))",
};

function ChartLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[250px] w-full rounded-lg" />
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
    <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed">
      <div className="flex flex-col items-center gap-2 text-center">
        <Activity className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          No KPI metrics data available yet
        </div>
      </div>
    </div>
  );
}

export function KPIMetricsChart({
  data,
  title = "KPI Metrics",
  description = "Track multiple KPI metrics over time",
  isLoading = false,
  className,
  metrics = ["kpi1", "kpi2", "kpi3"],
  metricLabels = {},
  metricColors = {},
  showLegend = true,
  stacked = false,
}: KPIMetricsChartProps) {
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
    }));
  }, [data]);

  // Build chart config dynamically based on metrics
  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    metrics.forEach((metric) => {
      config[metric] = {
        label: metricLabels[metric] || metric.toUpperCase(),
        color: metricColors[metric] || defaultMetricColors[metric] || "hsl(var(--chart-1))",
      };
    });
    return config;
  }, [metrics, metricLabels, metricColors]);

  // Calculate average for each metric
  const metricAverages = React.useMemo(() => {
    const averages: Record<string, number> = {};

    metrics.forEach((metric) => {
      const values = data
        .map((item) => item[metric])
        .filter((val): val is number => typeof val === "number");

      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        averages[metric] = Math.round((sum / values.length) * 10) / 10;
      } else {
        averages[metric] = 0;
      }
    });

    return averages;
  }, [data, metrics]);

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
              className="h-[250px] w-full"
            >
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                stackOffset={stacked ? "none" : undefined}
              >
                <defs>
                  {metrics.map((metric) => (
                    <linearGradient
                      key={metric}
                      id={`gradient-${metric}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartConfig[metric].color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartConfig[metric].color}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                {showLegend && (
                  <ChartLegend content={<ChartLegendContent />} />
                )}
                {metrics.map((metric) => (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={chartConfig[metric].color}
                    strokeWidth={2}
                    fill={`url(#gradient-${metric})`}
                    stackId={stacked ? "1" : undefined}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ChartContainer>

            {/* KPI Averages */}
            <div
              className={cn(
                "mt-4 grid gap-4 text-sm",
                metrics.length === 1 && "grid-cols-1",
                metrics.length === 2 && "grid-cols-2",
                metrics.length === 3 && "grid-cols-2 md:grid-cols-3",
                metrics.length >= 4 && "grid-cols-2 md:grid-cols-4"
              )}
            >
              {metrics.map((metric) => (
                <div
                  key={metric}
                  className="rounded-lg border bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: chartConfig[metric].color,
                      }}
                    />
                    <div className="text-muted-foreground text-xs">
                      {chartConfig[metric].label}
                    </div>
                  </div>
                  <div className="mt-1 font-headline text-xl font-semibold">
                    {metricAverages[metric].toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-4 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Data Points: {data.length}
                </span>
                <span className="text-muted-foreground">
                  Metrics: {metrics.length}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}