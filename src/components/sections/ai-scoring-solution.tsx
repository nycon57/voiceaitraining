"use client";

import { CheckCircle, ArrowRight, Zap, Target, Clock, Brain } from "lucide-react";

const transformations = [
  {
    problem: "73% inconsistent feedback",
    solution: "95% scoring accuracy",
    icon: Target
  },
  {
    problem: "14+ day feedback delays",
    solution: "Instant analysis",
    icon: Clock
  },
  {
    problem: "85% bias-affected reviews",
    solution: "100% objective scoring",
    icon: Brain
  },
  {
    problem: "22% improvement rate",
    solution: "3x faster development",
    icon: Zap
  }
];

export default function AIScoringSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            AI that analyzes{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              every word, pause, and technique
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our AI scoring engine eliminates human bias and provides instant, objective feedback on every sales conversation.
            Get precise metrics on what matters most - talk-to-listen ratios, objection handling, and closing effectiveness.
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
              <h3 className="text-2xl font-bold mb-6">How AI Scoring Transforms Performance Reviews</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Real-Time Conversation Analysis</h4>
                    <p className="text-sm text-muted-foreground">AI processes every word, pause, and tone shift to identify specific improvement opportunities as they happen.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Objective Performance Metrics</h4>
                    <p className="text-sm text-muted-foreground">Get precise scores on talk-to-listen ratios, objection handling, discovery questions, and closing techniques.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Actionable Improvement Plans</h4>
                    <p className="text-sm text-muted-foreground">Receive specific coaching recommendations with practice scenarios targeted to your weakest areas.</p>
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
                    <span className="font-semibold">AI Scoring Complete</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">87</div>
                      <div className="text-xs opacity-75">Overall Score</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">65%</div>
                      <div className="text-xs opacity-75">Talk Ratio</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">Discovery Questions: 6/10</div>
                      <div className="text-xs opacity-90">Ask more open-ended questions early</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">Objection Handling: 9/10</div>
                      <div className="text-xs opacity-90">Excellent price objection response</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Recommended Practice:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      <li>• "Discovery Questions" scenario</li>
                      <li>• "Active Listening" training</li>
                      <li>• "Question Flow" technique</li>
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