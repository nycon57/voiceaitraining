"use client";

import { Search, Monitor, Handshake, Settings, Shield, Target } from "lucide-react";

const techSalesFeatures = [
  {
    icon: Search,
    title: "Technical Discovery Calls",
    description: "Master discovery questioning with AI prospects who challenge technical requirements, ask about integrations, and reveal complex use cases.",
    benefits: ["Advanced questioning", "Needs assessment", "Technical qualification"]
  },
  {
    icon: Monitor,
    title: "SaaS Demo Presentations",
    description: "Practice customized demos with AI buyers who interrupt with questions, request specific features, and challenge your value proposition.",
    benefits: ["Demo customization", "Feature positioning", "Objection handling"]
  },
  {
    icon: Handshake,
    title: "Enterprise Negotiation",
    description: "Navigate complex enterprise deals with AI decision makers who negotiate pricing, terms, and implementation timelines like real C-level executives.",
    benefits: ["Contract negotiation", "Pricing discussions", "Implementation planning"]
  },
  {
    icon: Settings,
    title: "Implementation Discussions",
    description: "Practice technical implementation conversations with AI IT teams who ask about APIs, data migration, and integration requirements.",
    benefits: ["Technical positioning", "Implementation clarity", "Risk mitigation"]
  },
  {
    icon: Shield,
    title: "Security & Compliance Conversations",
    description: "Handle security reviews and compliance discussions with AI prospects who challenge data protection, SOC2, and regulatory requirements.",
    benefits: ["Security positioning", "Compliance confidence", "Risk addressing"]
  },
  {
    icon: Target,
    title: "Competitive Positioning",
    description: "Win against competitors with AI prospects who compare features, pricing, and roadmap against specific competitors in your market.",
    benefits: ["Competitor knowledge", "Differentiation", "Value articulation"]
  }
];

export default function TechSalesFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Industry-Specific{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Tech Sales Training
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Every scenario is designed specifically for technology sales, with realistic buyer personas,
            accurate technical challenges, and enterprise-focused conversation flows.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {techSalesFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="rounded-lg border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Training Benefits:</h4>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="rounded-lg border bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 dark:from-chart-1/10 dark:via-chart-2/10 dark:to-chart-3/10 p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Tech Sales Team?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join 200+ SaaS companies using AI voice training to close more enterprise deals,
              reduce sales cycles, and build confident technical sales professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/request-demo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 text-white font-semibold hover:opacity-90 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/demo-credentials"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}