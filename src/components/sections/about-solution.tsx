"use client";

import { CheckCircle, ArrowRight, Zap, Target, Clock, Brain } from "lucide-react";

const transformations = [
  {
    problem: "60+ hours monthly training",
    solution: "15 minutes daily practice",
    icon: Clock
  },
  {
    problem: "$1M+ revenue lost annually",
    solution: "40% more deals closed",
    icon: Target
  },
  {
    problem: "6+ months to quota",
    solution: "30 days to transformation",
    icon: Zap
  },
  {
    problem: "15% training success rate",
    solution: "95% performance improvement",
    icon: Brain
  }
];

export default function AboutSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            The Only Sales Training That{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Actually Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Instead of scheduling expensive roleplay sessions that reps hate, our AI voice agents provide
            unlimited realistic practice that transforms struggling reps into confident closers.
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
              <h3 className="text-2xl font-bold mb-6">How AI Voice Training Transforms Your Team</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Realistic AI Prospects</h4>
                    <p className="text-sm text-muted-foreground">Your reps practice with AI agents that respond like real customers, handle objections, and never get tired of roleplay.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Instant Performance Feedback</h4>
                    <p className="text-sm text-muted-foreground">AI analyzes every word, pause, and objection handling technique to give precise feedback on what to improve.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Continuous Skill Building</h4>
                    <p className="text-sm text-muted-foreground">15 minutes daily practice builds muscle memory for handling any sales scenario that comes their way.</p>
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
                    <span className="font-semibold">Training Session Complete</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-xs opacity-75">Objections Handled</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">+40%</div>
                      <div className="text-xs opacity-75">Performance Boost</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Next Steps:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      <li>• Practice discovery questions</li>
                      <li>• Work on closing techniques</li>
                      <li>• Master price objections</li>
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