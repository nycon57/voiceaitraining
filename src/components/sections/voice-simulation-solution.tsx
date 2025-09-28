"use client";

import { CheckCircle, Clock, Users, Target, Shield } from "lucide-react";

const benefits = [
  {
    problem: "Schedule conflicts and wasted time",
    solution: "Practice 24/7 on your schedule",
    icon: Clock
  },
  {
    problem: "Limited scenario variety",
    solution: "Unlimited diverse conversations",
    icon: Target
  },
  {
    problem: "Inconsistent feedback quality",
    solution: "AI-powered precise analysis",
    icon: Users
  },
  {
    problem: "Judgment and embarrassment",
    solution: "Safe, private practice space",
    icon: Shield
  }
];

export default function VoiceSimulationSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            AI Prospects That{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Never Get Tired
            </span>
            , Never Judge
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our voice simulation technology creates realistic AI prospects that respond naturally to every question,
            handle objections authentically, and provide the perfect practice environment for building confidence.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {benefits.map((item, index) => {
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

        {/* How Voice Simulation Works */}
        <div className="bg-muted rounded-2xl p-8 md:p-12 border">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">How Voice Simulation Creates Perfect Practice</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Natural Speech Recognition</h4>
                    <p className="text-sm text-muted-foreground">Advanced STT technology captures every word, pause, and tone to understand exactly what your rep is saying and how they're saying it.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Realistic AI Responses</h4>
                    <p className="text-sm text-muted-foreground">Our AI prospects respond with industry-specific objections, ask realistic questions, and maintain natural conversation flow that feels completely authentic.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Human-Like Voice Synthesis</h4>
                    <p className="text-sm text-muted-foreground">ElevenLabs TTS creates voices so realistic, your reps will forget they're practicing with AI until they see their instant performance scores.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Instant Performance Analysis</h4>
                    <p className="text-sm text-muted-foreground">Real-time AI coaching analyzes talk-listen ratio, objection handling, question quality, and emotional intelligence for immediate improvement insights.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Live Voice Simulation Session</span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-xs opacity-75 mb-2">AI Prospect</div>
                      <div className="text-sm">"I'm happy with our current solution. Why should I consider switching?"</div>
                    </div>

                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-xs opacity-75 mb-2">Sales Rep</div>
                      <div className="text-sm">"That's great to hear you have a solution working. What would need to change for you to consider an upgrade?"</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-300">95%</div>
                      <div className="text-xs opacity-75">Question Quality</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-300">60:40</div>
                      <div className="text-xs opacity-75">Listen:Talk</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-yellow-300">A+</div>
                      <div className="text-xs opacity-75">Response</div>
                    </div>
                  </div>

                  <div className="bg-green-400/20 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm font-medium text-green-200">Excellent discovery question!</span>
                    </div>
                    <div className="text-xs opacity-90">
                      You turned their objection into an opportunity to understand their needs better.
                    </div>
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