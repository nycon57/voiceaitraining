"use client";

import { ArrowRight, CheckCircle, TrendingUp, Clock, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValueMetric {
  title: string;
  before: { value: string; desc: string };
  after: { value: string; desc: string };
  improvement: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VALUE_METRICS: ValueMetric[] = [
  {
    title: "Practice Opportunities",
    before: {
      value: "3-5",
      desc: "roleplay sessions per month"
    },
    after: {
      value: "150+",
      desc: "AI conversations per month"
    },
    improvement: "10x more practice",
    icon: Users
  },
  {
    title: "Training Time",
    before: {
      value: "6 months",
      desc: "to reach quota traditionally"
    },
    after: {
      value: "30 days",
      desc: "with AI voice training"
    },
    improvement: "80% faster onboarding",
    icon: Clock
  },
  {
    title: "Performance Improvement",
    before: {
      value: "15%",
      desc: "success rate with traditional roleplay"
    },
    after: {
      value: "95%",
      desc: "improvement with AI training"
    },
    improvement: "6x better results",
    icon: TrendingUp
  },
  {
    title: "Revenue Impact",
    before: {
      value: "$50K",
      desc: "average deal size before training"
    },
    after: {
      value: "$70K",
      desc: "average deal size after training"
    },
    improvement: "40% higher deal value",
    icon: DollarSign
  }
];

const ROI_BENEFITS = [
  "Eliminate expensive roleplay coordination costs",
  "Reduce new hire onboarding time by 80%",
  "Increase deal closure rates by 40%",
  "Scale training across unlimited team members",
  "24/7 practice availability without additional costs",
  "Real-time performance tracking and optimization"
];

export default function VoiceSimulationValueStack() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 dark:from-chart-1/10 dark:via-chart-2/10 dark:to-chart-3/10">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            The ROI of{" "}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Perfect Practice
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Voice simulation doesn't just improve training—it transforms your entire sales operation
            with measurable impact on performance, efficiency, and revenue.
          </p>
        </div>

        {/* Value Metrics */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {VALUE_METRICS.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-card border border-border rounded-xl p-6 h-full transition-all duration-300 group-hover:border-chart-2/30 group-hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-2/20">
                      <Icon className="h-5 w-5 text-chart-2 dark:text-chart-2" />
                    </div>
                    <h3 className="text-sm font-semibold">{metric.title}</h3>
                  </div>

                  {/* Before */}
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800/30">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">{metric.before.value}</span>
                      <span className="text-xs text-red-500">BEFORE</span>
                    </div>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">{metric.before.desc}</p>
                  </div>

                  {/* After */}
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{metric.after.value}</span>
                      <span className="text-xs text-green-500">AFTER</span>
                    </div>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">{metric.after.desc}</p>
                  </div>

                  {/* Improvement */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 text-white text-xs font-semibold rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      {metric.improvement}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ROI Calculation */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 mb-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Calculate Your Voice Simulation ROI</h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Traditional Training Costs</span>
                  <span className="font-bold text-red-600">$15,000/month</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Voice Simulation Platform</span>
                  <span className="font-bold text-green-600">$497/user/month</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-chart-1/10 to-chart-2/10 dark:from-chart-1/20 dark:to-chart-2/20 rounded-lg border border-chart-2/30 dark:border-chart-2/30/30">
                  <span className="font-bold">Monthly Savings (10 users)</span>
                  <span className="font-bold text-chart-2 text-xl">$10,030</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <span className="font-bold">Annual ROI</span>
                  <span className="font-bold text-green-600 text-2xl">$120,360</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Additional Benefits</h4>
              <ul className="space-y-3">
                {ROI_BENEFITS.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 text-white rounded-2xl p-8 md:p-12 shadow-xl border border-chart-2/30 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Start Transforming Your Sales Training Today
          </h3>
          <p className="text-chart-3 mb-8 max-w-2xl mx-auto">
            Join hundreds of sales teams already using voice simulation to build confidence,
            improve performance, and close more deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold">No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-chart-1 to-chart-1 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 rounded-full shadow-lg"
              asChild
            >
              <a href="/request-demo" className="flex items-center">
                Try Voice Simulation Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full"
              asChild
            >
              <a href="/demo-credentials">
                View Demo
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}