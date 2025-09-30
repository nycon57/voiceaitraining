"use client";

import { BarChart3, MessageSquare, Target, Heart, CheckCircle, TrendingUp } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Talk-to-Listen Ratio Analysis",
    description: "Measure the perfect balance between speaking and listening. AI tracks when reps talk too much or fail to ask enough questions.",
    metrics: ["Target ratio: 45%", "Optimal range tracking", "Time segment analysis"],
    gradient: "from-chart-1 to-chart-2"
  },
  {
    icon: MessageSquare,
    title: "Objection Handling Assessment",
    description: "Analyze how effectively reps acknowledge, empathize, and address customer concerns. Get specific scoring on objection response techniques.",
    metrics: ["Response time tracking", "Empathy statement detection", "Resolution success rate"],
    gradient: "from-chart-1 via-chart-2 to-chart-3"
  },
  {
    icon: Target,
    title: "Closing Technique Evaluation",
    description: "Score the effectiveness of closing attempts, timing, and follow-through. Identify missed opportunities and successful close patterns.",
    metrics: ["Close attempt timing", "Technique effectiveness", "Follow-up quality"],
    gradient: "from-chart-1 to-chart-1"
  },
  {
    icon: Heart,
    title: "Sentiment & Tone Analysis",
    description: "Track emotional intelligence throughout the conversation. Monitor customer sentiment shifts and rep tone consistency.",
    metrics: ["Sentiment trajectory", "Tone matching", "Emotional moments"],
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: CheckCircle,
    title: "Key Message Tracking",
    description: "Ensure reps hit all required talking points and value propositions. Track which messages resonate most with prospects.",
    metrics: ["Message completion rate", "Value prop delivery", "Positioning accuracy"],
    gradient: "from-chart-2 to-chart-1"
  },
  {
    icon: TrendingUp,
    title: "Conversation Flow Scoring",
    description: "Analyze the natural progression of the sales conversation. Identify awkward transitions, pacing issues, and momentum building.",
    metrics: ["Transition quality", "Pacing optimization", "Momentum tracking"],
    gradient: "from-chart-2 to-chart-1"
  }
];

export default function AIScoringFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Six Core Metrics That{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Drive Sales Success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our AI analyzes the fundamental elements of every successful sales conversation.
            Get precise measurements on the techniques that separate top performers from the rest.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>

                <div className="relative">
                  {/* Icon */}
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-4 text-xl font-bold">{feature.title}</h3>
                  <p className="mb-6 text-muted-foreground">{feature.description}</p>

                  {/* Metrics */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Key Metrics</h4>
                    <ul className="space-y-2">
                      {feature.metrics.map((metric, metricIndex) => (
                        <li key={metricIndex} className="flex items-center gap-2 text-sm">
                          <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`}></div>
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="rounded-2xl border bg-gradient-to-br from-chart-1/5 to-chart-2/5 dark:from-chart-1/10 dark:to-chart-2/10 p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              All Metrics Work Together for{" "}
              <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                Complete Performance Insights
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our AI doesn't just score individual elements - it understands how all six metrics combine to create winning sales conversations.
              Get a holistic view of performance with actionable next steps.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 border">
                <div className="text-3xl font-bold bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent mb-2">95%</div>
                <div className="text-sm font-semibold mb-1">Scoring Accuracy</div>
                <div className="text-xs text-muted-foreground">Consistent across all calls</div>
              </div>

              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 border">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">3x</div>
                <div className="text-sm font-semibold mb-1">Faster Improvement</div>
                <div className="text-xs text-muted-foreground">Compared to traditional coaching</div>
              </div>

              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 border">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">100%</div>
                <div className="text-sm font-semibold mb-1">Objective Analysis</div>
                <div className="text-xs text-muted-foreground">No bias, just data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}