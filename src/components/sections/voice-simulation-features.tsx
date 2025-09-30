"use client";

import { Brain, Mic, Users, Zap, MessageSquare, Target, BarChart, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Natural Language Processing",
    description: "Advanced AI understands context, intent, and emotion in real-time conversations",
    benefits: [
      "Contextual understanding of complex sales scenarios",
      "Emotional intelligence detection and response",
      "Multi-turn conversation memory and flow"
    ]
  },
  {
    icon: Mic,
    title: "Realistic Voice Synthesis",
    description: "Human-like voices that create authentic conversation experiences",
    benefits: [
      "Premium voice technology",
      "Industry-specific voice personas",
      "Natural speech patterns and pauses"
    ]
  },
  {
    icon: MessageSquare,
    title: "Dynamic Conversation Flow",
    description: "AI adapts responses based on rep performance and conversation direction",
    benefits: [
      "Branching conversation paths",
      "Realistic objection handling",
      "Adaptive difficulty progression"
    ]
  },
  {
    icon: Users,
    title: "Industry-Specific Personas",
    description: "AI prospects trained on real industry knowledge and pain points",
    benefits: [
      "Loan officer and mortgage scenarios",
      "Industry-specific objections and concerns",
      "Authentic business context and terminology"
    ]
  },
  {
    icon: BarChart,
    title: "Real-Time Performance Analytics",
    description: "Instant feedback on every aspect of the sales conversation",
    benefits: [
      "Talk-listen ratio optimization",
      "Question quality scoring",
      "Objection handling effectiveness"
    ]
  },
  {
    icon: Target,
    title: "Scenario-Based Training",
    description: "Practice specific sales situations with targeted learning outcomes",
    benefits: [
      "Cold calling simulations",
      "Objection handling drills",
      "Closing technique practice"
    ]
  },
  {
    icon: Zap,
    title: "Instant Replay & Analysis",
    description: "Review conversations with AI-powered insights and coaching tips",
    benefits: [
      "Full conversation transcripts",
      "Performance breakdown analysis",
      "Personalized improvement recommendations"
    ]
  },
  {
    icon: Shield,
    title: "Safe Practice Environment",
    description: "Private, judgment-free space for building confidence and skills",
    benefits: [
      "No embarrassment or peer pressure",
      "Unlimited practice opportunities",
      "Progressive skill building"
    ]
  }
];

export default function VoiceSimulationFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            The Technology Behind{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Perfect Practice
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our voice simulation platform combines cutting-edge AI technologies to create
            the most realistic and effective sales training experience possible.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-card border border-border rounded-xl p-6 h-full transition-all duration-300 group-hover:border-chart-2/30 group-hover:shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-2/20 border border-chart-2/20">
                      <Icon className="h-6 w-6 text-chart-2 dark:text-chart-2" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 group-hover:text-chart-2 dark:group-hover:text-chart-2 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 mt-2 flex-shrink-0"></div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}