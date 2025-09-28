"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValueItem {
  title: string;
  typical: { value: string; unit?: string; desc: string };
  ourPlatform: { value: string; unit?: string; desc: string };
}

const ANALYTICS_VALUE_COMPARISON: ValueItem[] = [
  {
    title: "Real-Time Analytics Dashboard",
    typical: {
      value: "$2,500",
      unit: "/mo",
      desc: "Business intelligence tools like Tableau or PowerBI",
    },
    ourPlatform: {
      value: "Included",
      desc: "Live performance dashboards with instant updates",
    },
  },
  {
    title: "Custom Reporting Engine",
    typical: {
      value: "$1,800",
      unit: "/mo",
      desc: "Custom report development and maintenance",
    },
    ourPlatform: {
      value: "Included",
      desc: "Drag-and-drop custom reports with automated delivery",
    },
  },
  {
    title: "Performance Trend Analysis",
    typical: {
      value: "$3,000",
      unit: "/setup",
      desc: "Data science consulting for trend modeling",
    },
    ourPlatform: {
      value: "Included",
      desc: "AI-powered trend analysis and forecasting",
    },
  },
  {
    title: "ROI Tracking & Attribution",
    typical: {
      value: "$2,200",
      unit: "/mo",
      desc: "Revenue attribution and ROI analysis tools",
    },
    ourPlatform: {
      value: "Included",
      desc: "Automated training ROI calculation and tracking",
    },
  },
  {
    title: "Team Leaderboards & Gamification",
    typical: {
      value: "$1,500",
      unit: "/mo",
      desc: "Employee engagement and gamification platforms",
    },
    ourPlatform: {
      value: "Included",
      desc: "Built-in competitions and achievement systems",
    },
  },
  {
    title: "Predictive Analytics & Insights",
    typical: {
      value: "$4,000",
      unit: "/mo",
      desc: "Machine learning platforms and data scientists",
    },
    ourPlatform: {
      value: "Included",
      desc: "AI predicts performance trends and recommends actions",
    },
  },
  {
    title: "Data Export & API Access",
    typical: {
      value: "$800",
      unit: "/mo",
      desc: "API development and data integration costs",
    },
    ourPlatform: {
      value: "Included",
      desc: "Full API access and unlimited data exports",
    },
  },
];

export default function AnalyticsValueStack() {
  const totalTypicalValue = ANALYTICS_VALUE_COMPARISON.reduce((sum, item) => {
    const value = parseInt(item.typical.value.replace('$', '').replace(',', ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  return (
    <section className="py-16 md:py-32">
      <div className="container grid grid-cols-4 gap-x-4 gap-y-8 md:grid-cols-8 lg:grid-cols-12">
        {/* Header */}
        <div className="col-span-4 mb-8 max-w-4xl md:col-span-8 md:mb-12 lg:col-span-10 lg:col-start-2 lg:mb-16">
          <h2 className="mb-4 text-center text-4xl sm:text-left md:text-5xl lg:text-6xl font-headline">
            Analytics Features Worth{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              $15,800/month
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-snug text-center sm:text-left">
            While competitors charge separately for each analytics feature, we include everything in your platform.
            Here's what you get compared to building your analytics stack piece by piece:
          </p>
        </div>

        {/* Column Headers */}
        <div className="col-span-4 px-4 md:col-span-8 lg:col-span-10 lg:col-start-2">
          <div className="grid grid-cols-4 items-center gap-6 md:grid-cols-8">
            <div className="col-span-4 md:col-span-2"></div>
            <div className="col-span-2 ml-0 md:col-span-3 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
              <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase md:text-sm">
                Separate Tools
              </h4>
            </div>
            <div className="col-span-2 ml-0 md:col-span-3 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
              <h4 className="text-xs font-bold tracking-wider uppercase md:text-sm bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Our Analytics
              </h4>
            </div>
          </div>
        </div>

        {/* Comparison rows wrapper */}
        <div className="col-span-4 md:col-span-8 lg:col-span-10 lg:col-start-2">
          {ANALYTICS_VALUE_COMPARISON.map((row, index) => (
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

        {/* PAYOFF SECTION - Inline with chart */}
        <div className="col-span-4 md:col-span-8 lg:col-span-10 lg:col-start-2">
          <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white rounded-xl p-8 md:p-12 shadow-xl border border-purple-500/30">
            <div className="grid grid-cols-4 items-center gap-6 md:grid-cols-8">
              <h3 className="col-span-4 text-xl font-black md:col-span-2 md:text-3xl">
                ANALYTICS VALUE
              </h3>

              {/* What You'd Pay Elsewhere */}
              <div className="col-span-2 flex flex-col md:col-span-3">
                <div className="ml-0 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                  <p className="text-3xl font-black text-red-300 line-through md:text-6xl">
                    ${totalTypicalValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-red-200">
                    Separate analytics tools
                  </p>
                </div>
              </div>

              {/* Your Price Today */}
              <div className="col-span-2 flex flex-col md:col-span-3">
                <div className="ml-0 md:ml-32 lg:ml-40 xl:ml-48 2xl:ml-56">
                  <div className="relative pr-12">
                    <p className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent md:text-5xl lg:text-6xl leading-none">
                      $0
                    </p>
                    <div className="absolute -top-1 -right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold transform rotate-12">
                      FREE
                    </div>
                  </div>
                  <p className="text-sm text-yellow-200 font-semibold mt-2">
                    All analytics included with platform
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Benefits */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold mb-3">Real-Time Insights You Get:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>360° team performance visibility</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>70% faster report generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>5x better training insights</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3">Automated Features:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>ROI tracking & attribution</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Predictive performance modeling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Custom report delivery</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
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
                    <span className="font-semibold">White-label reporting</span>
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg">
                  See Analytics Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}