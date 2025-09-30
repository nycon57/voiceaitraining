"use client";

const problemStats = [
  {
    title: "Manual Reporting Time",
    description: "Hours per week managers waste compiling spreadsheets instead of coaching their teams",
    number: 15,
    suffix: "+"
  },
  {
    title: "Missed Opportunities",
    description: "Potential deals lost because managers can't identify struggling reps in time",
    number: "$2M",
    suffix: "+"
  },
  {
    title: "Training ROI Unknown",
    description: "Companies that can't prove their sales training investment is working",
    number: 85,
    suffix: "%"
  },
  {
    title: "Performance Blind Spots",
    description: "Percentage of performance issues discovered too late to fix effectively",
    number: 70,
    suffix: "%"
  },
];

export default function AnalyticsProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Sales managers are{" "}
                <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  flying blind
                </span>{" "}
                without proper data
              </h2>
              <p className="text-lg text-muted-foreground">
                Most sales teams rely on gut feelings and lagging indicators. Managers spend hours creating reports manually, can't identify training gaps until it's too late, and have no visibility into what actually drives performance improvement.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manual Reporting Hell */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Current State: Manual Chaos</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Manager: "Let me check 5 different spreadsheets..."</div>
                      <div className="text-sm opacity-90">Sales Rep: "How am I performing this month?"</div>
                      <div className="text-sm opacity-90">Manager: "I'll get back to you next week..."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">No Real-Time Insights</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">15+ Hours</div>
                      <div className="text-sm opacity-75">Wasted Weekly on Reports</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Clarity */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">With Analytics: Instant Clarity</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Manager: "Dashboard shows Sarah needs objection practice..."</div>
                      <div className="text-sm opacity-90">Sales Rep: "My performance score improved 23% this week!"</div>
                      <div className="text-sm opacity-90">Manager: "ROI on training is 340% - let's scale this!"</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Data-Driven Decisions</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">15 Seconds</div>
                      <div className="text-sm opacity-75">To Get Any Report</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {problemStats.map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <p className="text-4xl font-bold bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  {item.number}{item.suffix}
                </p>
                <h6 className="text-lg mt-3 mb-2 font-semibold">{item.title}</h6>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}