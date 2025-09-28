"use client";

import { CheckCircle, BarChart3, TrendingUp, Target, Users } from "lucide-react";

const transformations = [
  {
    problem: "15+ hours weekly reporting",
    solution: "Real-time dashboards",
    icon: BarChart3
  },
  {
    problem: "Unknown training ROI",
    solution: "Automated ROI tracking",
    icon: TrendingUp
  },
  {
    problem: "Performance blind spots",
    solution: "Instant visibility",
    icon: Target
  },
  {
    problem: "Manual team tracking",
    solution: "Automated insights",
    icon: Users
  }
];

export default function AnalyticsSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Complete visibility into{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              every aspect
            </span>{" "}
            of sales training
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform hours of manual reporting into instant insights. See exactly what's working, who needs help, and how training translates to revenue—all in real-time dashboards that update automatically.
          </p>
        </div>

        {/* Before/After Transformation Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {transformations.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-6 rounded-lg border border-border bg-muted p-8 sm:flex-col sm:items-start">
                <div className="mx-0 h-12 w-12 sm:mx-auto lg:mx-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {item.solution}
                  </p>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Replaces: {item.problem}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="bg-muted rounded-2xl p-8 md:p-12 border">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">How Analytics Transform Your Sales Management</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Real-Time Performance Tracking</h4>
                    <p className="text-sm text-muted-foreground">Monitor individual and team performance as it happens. See exactly who's improving, who needs help, and which skills require attention.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Automated ROI Reporting</h4>
                    <p className="text-sm text-muted-foreground">Prove training value with automated reports that connect practice sessions directly to sales outcomes and revenue impact.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Predictive Insights</h4>
                    <p className="text-sm text-muted-foreground">AI identifies patterns and predicts performance trends, helping you proactively address issues before they impact results.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300" />
                    <span className="font-semibold">Analytics Dashboard</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">340%</div>
                      <div className="text-xs opacity-75">Training ROI</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">23%</div>
                      <div className="text-xs opacity-75">Performance Gain</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">5x</div>
                      <div className="text-xs opacity-75">Faster Reporting</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-xs opacity-75">Team Visibility</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Top Insights Today:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      <li>• Sarah's objection handling improved 34%</li>
                      <li>• Team discovery questions up 28%</li>
                      <li>• Close rate trending 15% higher</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}