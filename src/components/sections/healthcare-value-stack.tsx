"use client";

import { ArrowRight, CheckCircle, TrendingUp, Shield, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValueItem {
  title: string;
  typical: { value: string; unit?: string; desc: string };
  ourPlatform: { value: string; unit?: string; desc: string };
}

const HEALTHCARE_VALUE_COMPARISON: ValueItem[] = [
  {
    title: "Clinical Sales Training Platform",
    typical: {
      value: "$12,000",
      unit: "/mo",
      desc: "Traditional healthcare sales training programs and consulting",
    },
    ourPlatform: {
      value: "Included",
      desc: "Unlimited practice with realistic clinical scenarios",
    },
  },
  {
    title: "Medical Education Program",
    typical: {
      value: "$5,000",
      unit: "/setup",
      desc: "Clinical knowledge training and certification programs",
    },
    ourPlatform: {
      value: "Included",
      desc: "Evidence-based conversation training and clinical credibility",
    },
  },
  {
    title: "Healthcare Sales Analytics",
    typical: {
      value: "$3,500",
      unit: "/mo",
      desc: "Performance tracking and ROI measurement tools",
    },
    ourPlatform: {
      value: "Included",
      desc: "Detailed metrics on clinical conversations and value selling",
    },
  },
  {
    title: "Provider Roleplay Coordination",
    typical: {
      value: "$6,000",
      unit: "/mo",
      desc: "Arranging training sessions with busy healthcare professionals",
    },
    ourPlatform: {
      value: "Included",
      desc: "Self-directed training with AI clinicians available 24/7",
    },
  },
  {
    title: "Healthcare CRM Integration",
    typical: {
      value: "$2,000",
      unit: "/mo",
      desc: "Integration with Salesforce Health Cloud and other systems",
    },
    ourPlatform: {
      value: "Included",
      desc: "Seamless integration with major healthcare CRM platforms",
    },
  },
  {
    title: "Custom Clinical Scenarios",
    typical: {
      value: "$8,000",
      unit: "/library",
      desc: "Development of specialty-specific training content",
    },
    ourPlatform: {
      value: "Included",
      desc: "300+ healthcare scenarios across all specialties and products",
    },
  },
];

// Success metrics for healthcare sales
const healthcareSuccessMetrics = [
  {
    icon: TrendingUp,
    metric: "60%",
    label: "Better Adoption Rates",
    description: "Average increase in product adoption after clinical credibility training"
  },
  {
    icon: Shield,
    metric: "45%",
    label: "Shorter Sales Cycles",
    description: "Reduction in time from first contact to contract signature"
  },
  {
    icon: Clock,
    metric: "80%",
    label: "Faster ROI Justification",
    description: "Success rate in presenting compelling business cases to C-suite"
  },
  {
    icon: Target,
    metric: "90%",
    label: "Clinical Confidence",
    description: "Improvement in ability to discuss clinical evidence with providers"
  }
];

export default function HealthcareValueStack() {
  const totalTypicalValue = HEALTHCARE_VALUE_COMPARISON.reduce((sum, item) => {
    const value = parseInt(item.typical.value.replace('$', '').replace(',', ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Success Metrics */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline mb-4">
              Proven Results for{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Healthcare Teams
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See the measurable impact on your sales team's clinical credibility and your bottom line
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {healthcareSuccessMetrics.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
                    {item.metric}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Value Comparison */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-8 md:grid-cols-8 lg:grid-cols-12">
          {/* Header */}
          <div className="col-span-4 mb-8 max-w-4xl md:col-span-8 md:mb-12 lg:col-span-10 lg:col-start-2 lg:mb-16">
            <h2 className="mb-4 text-center text-4xl sm:text-left md:text-5xl lg:text-6xl font-headline">
              Everything You Need vs.{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Typical Costs
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-snug text-center sm:text-left">
              Complete healthcare sales training platform with everything your team needs to build clinical credibility,
              shorten sales cycles, and close more deals - all for less than traditional training costs.
            </p>
          </div>

          {/* Column Headers */}
          <div className="col-span-4 px-4 md:col-span-8 lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-4 items-center gap-6 md:grid-cols-8">
              <div className="col-span-4 md:col-span-2"></div>
              <div className="col-span-2 ml-0 md:col-span-3 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase md:text-sm">
                  Typical Cost
                </h4>
              </div>
              <div className="col-span-2 ml-0 md:col-span-3 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                <h4 className="text-xs font-bold tracking-wider uppercase md:text-sm bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Our Platform
                </h4>
              </div>
            </div>
          </div>

          {/* Comparison rows wrapper */}
          <div className="col-span-4 md:col-span-8 lg:col-span-10 lg:col-start-2">
            {HEALTHCARE_VALUE_COMPARISON.map((row, index) => (
              <div
                key={index}
                className="group border-t border-border/20 px-4 transition-colors first:border-t-0 hover:bg-muted/30"
              >
                <div className="grid grid-cols-4 items-start gap-6 py-8 md:grid-cols-8">
                  <h3 className="col-span-4 mt-2 text-base font-bold md:col-span-2 md:text-lg">
                    {row.title}
                  </h3>

                  {/* Typical Cost */}
                  <div className="col-span-2 flex flex-col md:col-span-3">
                    <div className="ml-0 transition-colors group-hover:text-foreground md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                      <p className="mb-1 flex items-baseline text-2xl font-bold text-muted-foreground md:mb-2 md:text-4xl">
                        {row.typical.value}
                        {row.typical.unit && (
                          <sup className="ml-0.5 text-xs text-muted-foreground md:text-sm">
                            {row.typical.unit}
                          </sup>
                        )}
                      </p>
                      <p className="text-xs leading-tight text-muted-foreground md:text-sm md:leading-normal">
                        {row.typical.desc}
                      </p>
                    </div>
                  </div>

                  {/* Our Platform Value */}
                  <div className="col-span-2 flex flex-col md:col-span-3">
                    <div className="ml-0 transition-colors group-hover:text-accent-foreground md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                      <p className="mb-1 flex items-baseline text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent md:mb-2 md:text-4xl">
                        {row.ourPlatform.value}
                        {row.ourPlatform.unit && (
                          <sup className="ml-0.5 text-xs md:text-sm">
                            {row.ourPlatform.unit}
                          </sup>
                        )}
                      </p>
                      <p className="text-xs leading-tight text-muted-foreground md:text-sm md:leading-normal">
                        {row.ourPlatform.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAYOFF SECTION */}
          <div className="col-span-4 md:col-span-8 lg:col-span-10 lg:col-start-2">
            <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white rounded-xl p-8 md:p-12 shadow-xl border border-purple-500/30">
              <div className="grid grid-cols-4 items-center gap-6 md:grid-cols-8">
                <h3 className="col-span-4 text-xl font-black md:col-span-2 md:text-3xl">
                  YOUR INVESTMENT
                </h3>

                {/* What You'd Pay Elsewhere */}
                <div className="col-span-2 flex flex-col md:col-span-3">
                  <div className="ml-0 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                    <p className="text-3xl font-black text-red-300 line-through md:text-6xl">
                      ${totalTypicalValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-200">
                      If purchased separately
                    </p>
                  </div>
                </div>

                {/* Your Price Today */}
                <div className="col-span-2 flex flex-col md:col-span-3">
                  <div className="ml-0 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                    <div className="relative pr-12">
                      <p className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent md:text-5xl lg:text-6xl leading-none">
                        $597
                      </p>
                      <div className="absolute -top-1 -right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold transform rotate-12">
                        98% OFF
                      </div>
                    </div>
                    <p className="text-sm text-yellow-200 font-semibold mt-2">
                      Per sales rep/month - Everything included
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom guarantee row */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-semibold">14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-semibold">60% better adoption guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-semibold">Cancel anytime</span>
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg">
                    Start Training Healthcare Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}