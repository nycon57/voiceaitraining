"use client";

import { CheckCircle, Clock, Target, Shield, Zap } from "lucide-react";

const healthcareTransformations = [
  {
    problem: "58% deals lost to credibility gaps",
    solution: "Master clinical conversations",
    icon: Target
  },
  {
    problem: "72% stalled on ROI concerns",
    solution: "Evidence-based value selling",
    icon: Shield
  },
  {
    problem: "18+ month sales cycles",
    solution: "45% faster deal closure",
    icon: Clock
  },
  {
    problem: "$1.8M lost revenue per rep",
    solution: "60% better close rates",
    icon: Zap
  }
];

export default function HealthcareSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 dark:from-chart-1/10 dark:via-chart-2/10 dark:to-chart-3/10">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Master Every{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Clinical Conversation
            </span>{" "}
            Scenario
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Train your healthcare sales team with AI clinicians that simulate real provider scenarios -
            from evidence discussions to budget justifications. No more scheduling conflicts or
            uncomfortable roleplay sessions with busy healthcare professionals.
          </p>
        </div>

        {/* Before/After Transformation Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {healthcareTransformations.map((item, index) => {
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
              <h3 className="text-2xl font-bold mb-6">How AI Voice Training Transforms Healthcare Sales</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Realistic Healthcare Providers</h4>
                    <p className="text-sm text-muted-foreground">Practice with AI clinicians that demand evidence, question ROI, and challenge product claims just like real healthcare professionals.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Clinical Evidence Training</h4>
                    <p className="text-sm text-muted-foreground">Get instant feedback on clinical accuracy, evidence presentation, and value proposition delivery without risking real provider relationships.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Healthcare-Specific Scenarios</h4>
                    <p className="text-sm text-muted-foreground">Train on medical devices, pharmaceuticals, health IT, and services with clinically accurate scenarios and terminology.</p>
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
                    <span className="font-semibold">Healthcare Training Complete</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">60%</div>
                      <div className="text-xs opacity-75">Better Adoption</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">45%</div>
                      <div className="text-xs opacity-75">Shorter Cycles</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Mastered Skills:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      <li>• Clinical evidence presentation</li>
                      <li>• ROI justification techniques</li>
                      <li>• Provider education methods</li>
                      <li>• Budget conversation skills</li>
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