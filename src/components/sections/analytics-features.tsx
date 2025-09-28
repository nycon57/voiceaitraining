"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Users, Award, Target, Calendar } from "lucide-react";

// Sample data for charts
const performanceData = [
  { month: 'Jan', teamScore: 72, individualScore: 68, roi: 230 },
  { month: 'Feb', teamScore: 78, individualScore: 74, roi: 280 },
  { month: 'Mar', teamScore: 85, individualScore: 82, roi: 340 },
  { month: 'Apr', teamScore: 89, individualScore: 87, roi: 410 },
  { month: 'May', teamScore: 92, individualScore: 90, roi: 485 },
];

const leaderboardData = [
  { name: 'Sarah J.', score: 94, improvement: 23 },
  { name: 'Mike R.', score: 91, improvement: 18 },
  { name: 'Lisa K.', score: 89, improvement: 15 },
  { name: 'Tom H.', score: 87, improvement: 21 },
  { name: 'Emma D.', score: 85, improvement: 12 },
];

const chartConfig = {
  teamScore: {
    label: "Team Average",
    color: "hsl(var(--chart-1))",
  },
  individualScore: {
    label: "Individual Best",
    color: "hsl(var(--chart-2))",
  },
  roi: {
    label: "ROI %",
    color: "hsl(var(--chart-3))",
  },
}

const features = [
  {
    icon: BarChart3,
    title: "Team Performance Dashboards",
    description: "Real-time visibility into team metrics, progress tracking, and performance trends across all reps and training scenarios.",
    highlight: "Get instant insights into what's working"
  },
  {
    icon: Users,
    title: "Individual Progress Tracking",
    description: "Detailed analytics for each rep showing skill development, practice frequency, and improvement trajectories over time.",
    highlight: "Track every rep's unique journey"
  },
  {
    icon: TrendingUp,
    title: "Training ROI Analytics",
    description: "Quantify training investment returns with revenue impact tracking, cost-per-improvement metrics, and predictive modeling.",
    highlight: "Prove training value with hard numbers"
  },
  {
    icon: Target,
    title: "Custom Reporting",
    description: "Build custom reports for stakeholders with automated delivery, white-label options, and flexible data export formats.",
    highlight: "Reports that match your business needs"
  },
  {
    icon: Award,
    title: "Leaderboards & Competitions",
    description: "Gamified performance tracking with team competitions, achievement systems, and recognition programs to drive engagement.",
    highlight: "Turn training into friendly competition"
  },
  {
    icon: Calendar,
    title: "Trend Analysis & Forecasting",
    description: "AI-powered insights that predict performance trends, identify at-risk reps, and recommend optimization strategies.",
    highlight: "Stay ahead with predictive insights"
  },
];

export default function AnalyticsFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              optimize performance
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From real-time dashboards to predictive analytics, get complete visibility into your sales training program with tools that actually drive results.
          </p>
        </div>

        {/* Sample Analytics Dashboard */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Sample Analytics Dashboard</h3>
            <p className="text-muted-foreground">See the kind of insights you'll get right out of the box</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Performance Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Team and individual performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="teamScore"
                        stroke="var(--color-teamScore)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="individualScore"
                        stroke="var(--color-individualScore)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Current month leaderboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData.slice(0, 5).map((rep, index) => (
                    <div key={rep.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{rep.name}</div>
                          <div className="text-xs text-muted-foreground">+{rep.improvement}% this month</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{rep.score}</div>
                        <div className="text-xs text-muted-foreground">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROI Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    485%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Training ROI</div>
                  <div className="text-xs text-green-600 mt-1">↗ +18% from last month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    92%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Team Average</div>
                  <div className="text-xs text-green-600 mt-1">↗ +3% from last month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    23%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Avg Improvement</div>
                  <div className="text-xs text-green-600 mt-1">↗ +5% from last month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    100%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Participation</div>
                  <div className="text-xs text-green-600 mt-1">↗ All reps engaged</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:border-purple-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"></div>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <div className="text-sm text-purple-600 font-medium">{feature.highlight}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20 p-8 md:p-12 border">
            <h3 className="text-2xl font-bold mb-4">Ready to see your analytics in action?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get instant visibility into your team's performance with dashboards that update in real-time.
              No more manual reporting, no more guesswork—just clear insights that drive results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/request-demo"
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                See Analytics Demo
              </a>
              <a
                href="/request-demo"
                className="border border-purple-300 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}