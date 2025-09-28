"use client";

import { ArrowRight, CheckCircle, BarChart3, TrendingUp, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValueItem {
  title: string;
  typical: { value: string; unit?: string; desc: string };
  ourPlatform: { value: string; unit?: string; desc: string };
}

const VALUE_COMPARISON: ValueItem[] = [
  {
    title: "AI Performance Analysis",
    typical: {
      value: "$3,000",
      unit: "/mo",
      desc: "Third-party call analysis and scoring tools",
    },
    ourPlatform: {
      value: "Included",
      desc: "Real-time AI scoring with 95% accuracy",
    },
  },
  {
    title: "Custom Scoring Rubrics",
    typical: {
      value: "$2,500",
      unit: "/setup",
      desc: "Custom performance framework development",
    },
    ourPlatform: {
      value: "Included",
      desc: "Industry-specific rubrics with KPI tracking",
    },
  },
  {
    title: "Manager Coaching Dashboard",
    typical: {
      value: "$1,800",
      unit: "/mo",
      desc: "Team performance tracking platforms",
    },
    ourPlatform: {
      value: "Included",
      desc: "Complete team analytics and coaching tools",
    },
  },
  {
    title: "Performance Analytics",
    typical: {
      value: "$2,200",
      unit: "/mo",
      desc: "Business intelligence and reporting tools",
    },
    ourPlatform: {
      value: "Included",
      desc: "Advanced analytics with trend analysis",
    },
  },
  {
    title: "Quality Assurance Reviews",
    typical: {
      value: "$4,000",
      unit: "/mo",
      desc: "Manual call review and scoring services",
    },
    ourPlatform: {
      value: "Included",
      desc: "Automated QA with instant feedback",
    },
  },
  {
    title: "Training Recommendations",
    typical: {
      value: "$1,500",
      unit: "/mo",
      desc: "Personalized coaching recommendations",
    },
    ourPlatform: {
      value: "Included",
      desc: "AI-powered improvement plans per rep",
    },
  },
];

const sampleMetrics = [
  {
    icon: BarChart3,
    label: "Overall Score",
    value: "87",
    trend: "+12%",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    label: "Talk Ratio",
    value: "42%",
    trend: "Optimal",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Users,
    label: "Discovery Questions",
    value: "8/10",
    trend: "+2",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Target,
    label: "Close Rate",
    value: "73%",
    trend: "+18%",
    color: "from-orange-500 to-red-500"
  }
];

export default function AIScoringValueStack() {
  const totalTypicalValue = VALUE_COMPARISON.reduce((sum, item) => {
    const value = parseInt(item.typical.value.replace('$', '').replace(',', ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  return (
    <section className="py-16 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Complete AI Scoring Platform vs.{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Typical Costs
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get enterprise-grade performance analysis, custom scoring rubrics, and coaching insights -
            all for less than what most companies spend on basic call recording.
          </p>
        </div>

        {/* Sample Dashboard Preview */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Live Performance Dashboard</h3>
            <p className="text-muted-foreground">See exactly what managers and reps get after every scored call</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {sampleMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-xs opacity-75">{metric.label}</div>
                      </div>
                    </div>
                    <div className="text-sm opacity-90 font-medium text-green-300">
                      {metric.trend}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h4 className="font-semibold mb-4">Coaching Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 rounded p-3">
                  <div className="font-medium mb-1">Strong Areas</div>
                  <ul className="text-xs opacity-90 space-y-1">
                    <li>• Excellent objection handling</li>
                    <li>• Natural conversation flow</li>
                    <li>• Strong closing technique</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <div className="font-medium mb-1">Improvement Areas</div>
                  <ul className="text-xs opacity-90 space-y-1">
                    <li>• Ask more discovery questions</li>
                    <li>• Reduce talk time by 3%</li>
                    <li>• Pause more after questions</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <div className="font-medium mb-1">Practice Scenarios</div>
                  <ul className="text-xs opacity-90 space-y-1">
                    <li>• "Discovery Questions" drill</li>
                    <li>• "Active Listening" scenario</li>
                    <li>• "Question Timing" practice</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Comparison */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-8 md:grid-cols-8 lg:grid-cols-12">
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
            {VALUE_COMPARISON.map((row, index) => (
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
                        $497
                      </p>
                      <div className="absolute -top-1 -right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold transform rotate-12">
                        96% OFF
                      </div>
                    </div>
                    <p className="text-sm text-yellow-200 font-semibold mt-2">
                      Per user/month - Everything included
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
                      <span className="font-semibold">95% accuracy guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-semibold">Instant implementation</span>
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg">
                    Start Free Trial
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