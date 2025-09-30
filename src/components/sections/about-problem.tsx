"use client";


const problemStats = [
  {
    title: "Training Time Lost",
    description: "Hours per month managers spend on ineffective roleplay sessions that don't improve performance",
    number: 60,
    suffix: "+"
  },
  {
    title: "Revenue Lost",
    description: "Annual revenue lost due to poor sales conversation skills and missed opportunities",
    number: "$1M",
    suffix: "+"
  },
  {
    title: "Onboarding Time",
    description: "Months it takes to get new reps to quota with traditional training methods",
    number: 6,
    suffix: "+"
  },
  {
    title: "Success Rate",
    description: "Percentage of roleplay feedback that actually translates to improved sales performance",
    number: 15,
    suffix: "%"
  },
];

export default function AboutProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                The{" "}
                <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  Expensive Problem
                </span>{" "}
                Every Sales Team Faces
              </h2>
              <p className="text-lg text-muted-foreground">
                Sales managers spend 60+ hours monthly on training that doesn't stick. Reps practice once, forget twice, and cost companies millions in lost deals. Traditional roleplay is inconsistent, expensive, and impossible to scale across distributed teams.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Failed Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Failed Sales Call</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Rep: "So, um, let me tell you about our product..."</div>
                      <div className="text-sm opacity-90">Prospect: "I'm not interested."</div>
                      <div className="text-sm opacity-90">Rep: "But wait, you haven't heard the features..."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">Call Ended</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">-$50K</div>
                      <div className="text-sm opacity-75">Lost Deal Value</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI-Trained Rep Call</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Rep: "I understand you're busy. What's your biggest challenge with [specific pain point]?"</div>
                      <div className="text-sm opacity-90">Prospect: "Actually, that's exactly what we're struggling with..."</div>
                      <div className="text-sm opacity-90">Rep: "Here's how we've helped similar companies solve that..."</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Deal Closed</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">+$50K</div>
                      <div className="text-sm opacity-75">Won Deal Value</div>
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