"use client";

import { Stethoscope, DollarSign, Shield, Users, TrendingUp, FileText } from "lucide-react";

const healthcareFeatures = [
  {
    icon: Stethoscope,
    title: "Clinical Value Discussions",
    description: "Practice presenting clinical evidence, outcomes data, and peer-reviewed studies with AI providers who challenge assumptions and demand proof.",
    benefits: ["Evidence-based selling", "Clinical credibility", "Study presentation skills"]
  },
  {
    icon: Users,
    title: "Provider Education Scenarios",
    description: "Master the art of educating busy clinicians about new technologies, treatment protocols, and implementation strategies in time-constrained conversations.",
    benefits: ["Educational selling", "Technology adoption", "Change management"]
  },
  {
    icon: DollarSign,
    title: "Budget & ROI Conversations",
    description: "Train on complex healthcare economics discussions, demonstrating cost savings, efficiency gains, and patient outcome improvements to financial stakeholders.",
    benefits: ["ROI justification", "Cost-benefit analysis", "Financial modeling"]
  },
  {
    icon: TrendingUp,
    title: "Implementation Planning",
    description: "Practice positioning implementation timelines, staff training requirements, and workflow integration with providers focused on operational impact.",
    benefits: ["Project planning", "Workflow analysis", "Risk mitigation"]
  },
  {
    icon: Shield,
    title: "Compliance Training",
    description: "Train on HIPAA requirements, FDA regulations, and quality standards with scenarios that test compliance knowledge while maintaining sales effectiveness.",
    benefits: ["Regulatory confidence", "Compliance assurance", "Risk management"]
  },
  {
    icon: FileText,
    title: "Multi-Stakeholder Meetings",
    description: "Practice navigating complex healthcare decisions involving clinicians, administrators, IT staff, and C-suite executives with competing priorities.",
    benefits: ["Stakeholder management", "Consensus building", "Decision facilitation"]
  }
];

export default function HealthcareFeatures() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Master{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Healthcare-Specific
            </span>{" "}
            Sales Scenarios
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Train your team on the complex conversations that define healthcare sales success.
            From clinical evidence discussions to multi-stakeholder budget meetings, our AI
            agents simulate every challenging scenario your reps will face.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {healthcareFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-purple-200 hover:shadow-lg dark:hover:border-purple-800"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-muted-foreground">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 p-8 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
            <h3 className="mb-4 text-2xl font-bold">Ready to Transform Your Healthcare Sales Team?</h3>
            <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
              Join healthcare companies that trust AI voice training to build clinical credibility,
              shorten sales cycles, and close more deals with confident, knowledgeable sales teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/request-demo"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-colors hover:from-purple-700 hover:to-pink-700"
              >
                Start Healthcare Training
              </a>
              <span className="text-sm text-muted-foreground">
                Join 200+ healthcare companies
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}