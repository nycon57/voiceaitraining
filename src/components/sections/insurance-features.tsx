"use client";

import { Heart, Car, Home, Building, Shield, Users } from "lucide-react";

const insuranceFeatures = [
  {
    icon: Heart,
    title: "Life Insurance Needs Assessment",
    description: "Practice conducting thorough financial needs analysis, discussing beneficiaries, and explaining the difference between term and permanent life insurance with sensitive, caring conversations.",
    benefits: ["Needs discovery mastery", "Beneficiary discussions", "Financial protection planning"]
  },
  {
    icon: Car,
    title: "Auto & Home Policy Reviews",
    description: "Train on reviewing existing coverage, identifying gaps, and recommending appropriate limits while building trust through transparent, educational conversations about protection needs.",
    benefits: ["Coverage gap analysis", "Limit recommendations", "Trust-building techniques"]
  },
  {
    icon: Building,
    title: "Commercial Insurance Pitches",
    description: "Master complex business insurance conversations, from general liability to workers' comp, while demonstrating expertise and building confidence with business owners and risk managers.",
    benefits: ["Business risk assessment", "Commercial expertise", "B2B relationship building"]
  },
  {
    icon: Shield,
    title: "Claims Process Discussions",
    description: "Practice explaining the claims process, setting proper expectations, and maintaining client relationships during stressful situations while demonstrating your agency's advocacy role.",
    benefits: ["Claims advocacy", "Expectation management", "Stress situation handling"]
  },
  {
    icon: Users,
    title: "Cross-Selling Scenarios",
    description: "Learn to identify cross-selling opportunities naturally, present additional coverage options without seeming pushy, and create comprehensive protection plans that serve client needs.",
    benefits: ["Natural opportunity identification", "Multi-product expertise", "Comprehensive planning"]
  },
  {
    icon: Home,
    title: "Compliance Training Scenarios",
    description: "Practice state-specific insurance regulations, proper disclosure requirements, and ethical sales practices while maintaining effective sales conversations that protect both client and agency.",
    benefits: ["Regulatory compliance", "Ethical selling", "Disclosure mastery"]
  }
];

export default function InsuranceFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Industry-Specific{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Insurance Training
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Every scenario is designed specifically for insurance sales, with realistic client personas,
            accurate policy details, and compliance-focused conversation flows that build trust.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {insuranceFeatures.map((feature, index) => {
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
              Ready to Build Trusted Insurance Agents?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join 120+ insurance agencies using AI voice training to sell more policies,
              improve client retention, and build agents who clients trust and recommend.
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