/**
 * Chart Components Demo
 *
 * This file demonstrates how to use the chart components in your application.
 * Copy and adapt these examples for your use cases.
 */

"use client";

import { PerformanceTrendChart, TeamActivityChart, KPIMetricsChart } from "./index";

// Sample data generators for demonstration
const generatePerformanceData = () => [
  { date: "2025-01-15", score: 72 },
  { date: "2025-01-18", score: 78 },
  { date: "2025-01-22", score: 82 },
  { date: "2025-01-25", score: 79 },
  { date: "2025-01-28", score: 85 },
  { date: "2025-02-01", score: 88 },
  { date: "2025-02-05", score: 91 },
];

const generateTeamData = () => [
  { label: "Sarah Johnson", value: 28, category: "completed" },
  { label: "Michael Chen", value: 24, category: "completed" },
  { label: "Emily Rodriguez", value: 22, category: "completed" },
  { label: "David Kim", value: 19, category: "inProgress" },
  { label: "Lisa Anderson", value: 16, category: "completed" },
  { label: "James Wilson", value: 12, category: "pending" },
];

const generateKPIData = () => [
  { date: "2025-01-15", talkListenRatio: 45, fillerWords: 12, pace: 155 },
  { date: "2025-01-18", talkListenRatio: 48, fillerWords: 10, pace: 160 },
  { date: "2025-01-22", talkListenRatio: 50, fillerWords: 8, pace: 165 },
  { date: "2025-01-25", talkListenRatio: 52, fillerWords: 7, pace: 158 },
  { date: "2025-01-28", talkListenRatio: 55, fillerWords: 5, pace: 162 },
  { date: "2025-02-01", talkListenRatio: 58, fillerWords: 4, pace: 168 },
];

export function ChartsDemo() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="font-headline mb-4 text-2xl font-semibold">
          Performance Trend Chart
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Line Chart Example */}
          <PerformanceTrendChart
            data={generatePerformanceData()}
            title="My Performance (Line)"
            description="Track your score improvements"
            showArea={false}
            showDataPoints={true}
          />

          {/* Area Chart Example */}
          <PerformanceTrendChart
            data={generatePerformanceData()}
            title="My Performance (Area)"
            description="Gradient area visualization"
            showArea={true}
            showDataPoints={false}
          />
        </div>
      </div>

      <div>
        <h2 className="font-headline mb-4 text-2xl font-semibold">
          Team Activity Chart
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vertical Bars */}
          <TeamActivityChart
            data={generateTeamData()}
            title="Team Completions (Vertical)"
            description="Scenario completions by team member"
            colorByCategory={true}
            horizontal={false}
          />

          {/* Horizontal Bars */}
          <TeamActivityChart
            data={generateTeamData()}
            title="Team Completions (Horizontal)"
            description="Alternative horizontal layout"
            colorByCategory={true}
            horizontal={true}
            showValues={true}
          />
        </div>
      </div>

      <div>
        <h2 className="font-headline mb-4 text-2xl font-semibold">
          KPI Metrics Chart
        </h2>
        <div className="grid gap-6">
          {/* Multiple KPIs */}
          <KPIMetricsChart
            data={generateKPIData()}
            title="Voice Call KPIs"
            description="Track multiple performance indicators"
            metrics={["talkListenRatio", "fillerWords", "pace"]}
            metricLabels={{
              talkListenRatio: "Talk/Listen Ratio",
              fillerWords: "Filler Words",
              pace: "Words per Minute",
            }}
            metricColors={{
              talkListenRatio: "hsl(var(--success))",
              fillerWords: "hsl(var(--warning))",
              pace: "hsl(var(--info))",
            }}
            showLegend={true}
            stacked={false}
          />

          {/* Stacked KPIs */}
          <KPIMetricsChart
            data={generateKPIData()}
            title="Stacked KPI View"
            description="Cumulative visualization"
            metrics={["talkListenRatio", "fillerWords", "pace"]}
            metricLabels={{
              talkListenRatio: "Talk/Listen",
              fillerWords: "Fillers",
              pace: "Pace",
            }}
            metricColors={{
              talkListenRatio: "hsl(var(--chart-1))",
              fillerWords: "hsl(var(--chart-2))",
              pace: "hsl(var(--chart-3))",
            }}
            showLegend={true}
            stacked={true}
          />
        </div>
      </div>

      <div>
        <h2 className="font-headline mb-4 text-2xl font-semibold">
          Loading and Empty States
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Loading State */}
          <PerformanceTrendChart
            data={[]}
            title="Loading Example"
            isLoading={true}
          />

          {/* Empty State */}
          <TeamActivityChart
            data={[]}
            title="Empty State Example"
            description="When there's no data"
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Integration Example
 *
 * Here's how you would integrate these charts in a real page with async data:
 */

/*
import { useEffect, useState } from "react";
import { PerformanceTrendChart } from "@/components/charts";
import { getScenarioAttempts } from "@/actions/attempts";

export function DashboardPage() {
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const attempts = await getScenarioAttempts();

        // Transform API data to chart format
        const chartData = attempts.map(attempt => ({
          date: new Date(attempt.created_at),
          score: attempt.score,
          label: attempt.scenario_title
        }));

        setPerformanceData(chartData);
      } catch (error) {
        console.error("Failed to load performance data", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-headline mb-6 text-3xl font-bold">
        Performance Dashboard
      </h1>

      <PerformanceTrendChart
        data={performanceData}
        title="Your Progress"
        description="Track your improvement over time"
        isLoading={isLoading}
        showArea={true}
        showDataPoints={true}
      />
    </div>
  );
}
*/