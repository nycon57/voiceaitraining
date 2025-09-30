"use client";

import { Home, DollarSign, Shield, Users, TrendingUp, FileText } from "lucide-react";

const mortgageFeatures = [
  {
    icon: DollarSign,
    title: "Mortgage Rate Objection Scenarios",
    description: "Practice handling rate objections, comparison shopping, and value-based selling with AI prospects who challenge your rates against competitors.",
    benefits: ["Rate objection mastery", "Value proposition training", "Competitive positioning"]
  },
  {
    icon: Shield,
    title: "Compliance Training Scenarios",
    description: "Train on TRID, QM rules, and fair lending practices with scenarios that test compliance knowledge while maintaining sales effectiveness.",
    benefits: ["TRID compliance", "Fair lending practices", "Regulatory confidence"]
  },
  {
    icon: Home,
    title: "First-Time Homebuyer Conversations",
    description: "Master the art of educating first-time buyers about the mortgage process, down payment options, and loan programs in patient, helpful conversations.",
    benefits: ["Educational selling", "Program expertise", "Trust building"]
  },
  {
    icon: TrendingUp,
    title: "Refinancing Discussions",
    description: "Practice cash-out refi conversations, rate-and-term discussions, and helping borrowers understand when refinancing makes financial sense.",
    benefits: ["Refi expertise", "ROI calculations", "Timing guidance"]
  },
  {
    icon: FileText,
    title: "Construction Loan Pitches",
    description: "Train on complex construction-to-perm scenarios, explaining the two-phase process, and managing expectations for custom build financing.",
    benefits: ["Complex loan expertise", "Process explanation", "Expectation management"]
  },
  {
    icon: Users,
    title: "HELOC Sales Training",
    description: "Practice positioning home equity lines of credit for debt consolidation, home improvements, and investment opportunities with confidence.",
    benefits: ["HELOC positioning", "Use case scenarios", "Risk education"]
  }
];

export default function LoanOfficersFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Industry-Specific{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Mortgage Training
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Every scenario is designed specifically for mortgage lending, with realistic borrower personas,
            accurate loan products, and compliance-focused conversation flows.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mortgageFeatures.map((feature, index) => {
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
              Ready to Transform Your Loan Officers?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join 150+ mortgage companies using AI voice training to close more loans,
              reduce compliance risks, and build confident loan officers.
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