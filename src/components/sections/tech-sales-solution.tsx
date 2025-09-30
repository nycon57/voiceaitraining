"use client";

import { CheckCircle, Clock, Target, Shield, Zap } from "lucide-react";

const techSalesTransformations = [
  {
    problem: "58% deals lost to technical objections",
    solution: "Master technical discovery",
    icon: Target
  },
  {
    problem: "12+ month sales cycles",
    solution: "Accelerate enterprise deals",
    icon: Clock
  },
  {
    problem: "73% demo failures",
    solution: "Nail every demo presentation",
    icon: Shield
  },
  {
    problem: "$1.2M lost to competitors",
    solution: "Win competitive situations",
    icon: Zap
  }
];

export default function TechSalesSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 dark:from-chart-1/10 dark:via-chart-2/10 dark:to-chart-3/10">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Master Every{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Enterprise Sales
            </span>{" "}
            Conversation
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Train your tech sales team with AI prospects that simulate real enterprise scenarios -
            from technical discovery calls to security discussions. No more scheduling conflicts or
            uncomfortable roleplay sessions with colleagues.
          </p>
        </div>

        {/* Before/After Transformation Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {techSalesTransformations.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-6 rounded-lg border border-border bg-muted p-8 sm:flex-col sm:items-start">
                <div className="mx-0 h-12 w-12 sm:mx-auto lg:mx-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3">
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
              <h3 className="text-2xl font-bold mb-6">How AI Voice Training Transforms Tech Sales Teams</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Technical Enterprise Prospects</h4>
                    <p className="text-sm text-muted-foreground">Practice with AI buyers that ask technical questions, challenge integrations, and simulate real enterprise purchasing decisions.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Discovery and Demo Mastery</h4>
                    <p className="text-sm text-muted-foreground">Get instant feedback on discovery questioning, demo flow, and technical positioning without risking real prospects.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">SaaS-Specific Scenarios</h4>
                    <p className="text-sm text-muted-foreground">Train on API discussions, security reviews, implementation planning, and competitive positioning with industry-accurate scenarios.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300" />
                    <span className="font-semibold">Tech Sales Training Complete</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">50%</div>
                      <div className="text-xs opacity-75">Faster Deals</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">65%</div>
                      <div className="text-xs opacity-75">Higher Win Rate</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Mastered Skills:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      <li>• Technical discovery questions</li>
                      <li>• Demo customization</li>
                      <li>• Competitive positioning</li>
                      <li>• Enterprise negotiation</li>
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