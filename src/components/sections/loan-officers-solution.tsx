"use client";

import { CheckCircle, Clock, Target, Shield, Zap } from "lucide-react";

const lendingTransformations = [
  {
    problem: "65% deals lost to rate objections",
    solution: "Master rate objection handling",
    icon: Target
  },
  {
    problem: "$25K compliance violations",
    solution: "100% compliant conversations",
    icon: Shield
  },
  {
    problem: "8+ months to proficiency",
    solution: "60 days to loan mastery",
    icon: Clock
  },
  {
    problem: "$2M lost revenue per LO",
    solution: "40% more closed loans",
    icon: Zap
  }
];

export default function LoanOfficersSolution() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Master Every{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Mortgage Conversation
            </span>{" "}
            Scenario
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Train your loan officers with AI prospects that simulate real mortgage scenarios -
            from rate objections to compliance discussions. No more scheduling conflicts or
            uncomfortable roleplay sessions with colleagues.
          </p>
        </div>

        {/* Before/After Transformation Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {lendingTransformations.map((item, index) => {
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
              <h3 className="text-2xl font-bold mb-6">How AI Voice Training Transforms Loan Officers</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Realistic Mortgage Prospects</h4>
                    <p className="text-sm text-muted-foreground">Practice with AI borrowers that raise rate objections, ask about closing costs, and challenge loan terms just like real prospects.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Compliance-Safe Feedback</h4>
                    <p className="text-sm text-muted-foreground">Get instant feedback on conversation flow, regulatory compliance, and objection handling without risking real customer relationships.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mortgage-Specific Scenarios</h4>
                    <p className="text-sm text-muted-foreground">Train on purchase loans, refinancing, HELOCs, construction loans, and jumbo mortgages with industry-accurate scenarios.</p>
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
                    <span className="font-semibold">Mortgage Training Complete</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">40%</div>
                      <div className="text-xs opacity-75">More Closings</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-xs opacity-75">Compliant</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Mastered Skills:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      <li>• Rate objection handling</li>
                      <li>• Closing cost discussions</li>
                      <li>• Loan product positioning</li>
                      <li>• Referral request techniques</li>
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