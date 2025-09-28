"use client";

const healthcareProblemStats = [
  {
    title: "Clinical Credibility",
    description: "Percentage of sales lost due to lack of clinical understanding",
    number: 58,
    suffix: "%"
  },
  {
    title: "Sales Cycle Length",
    description: "Average months for healthcare technology adoption decisions",
    number: 18,
    suffix: "+"
  },
  {
    title: "ROI Justification",
    description: "Percentage of deals stalled on budget and ROI concerns",
    number: 72,
    suffix: "%"
  },
  {
    title: "Lost Revenue",
    description: "Annual revenue lost per rep due to poor clinical conversations",
    number: "$1.8M",
    suffix: ""
  },
];

export default function HealthcareProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Healthcare Sales Teams{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Struggle
                </span>{" "}
                With Clinical Conversations
              </h2>
              <p className="text-lg text-muted-foreground">
                In healthcare sales, providers demand clinical evidence, ROI justification, and deep product understanding. Traditional training doesn't prepare reps for skeptical clinicians, complex budget processes, and evidence-based discussions, leading to lost deals and stalled opportunities.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Failed Healthcare Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Failed Provider Call</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Provider: "What's the clinical evidence for improved outcomes?"</div>
                      <div className="text-sm opacity-90">Sales Rep: "Well, our customers really like it..."</div>
                      <div className="text-sm opacity-90">Provider: "I need peer-reviewed data, not testimonials."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">Meeting Ended Early</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">-$180K</div>
                      <div className="text-sm opacity-75">Lost Deal Value</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Healthcare Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI-Trained Healthcare Rep</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Provider: "What's the clinical evidence for improved outcomes?"</div>
                      <div className="text-sm opacity-90">Sales Rep: "Great question. The Johnson study showed 23% reduction in readmissions. Let me walk through the methodology..."</div>
                      <div className="text-sm opacity-90">Provider: "This aligns with our quality metrics. What's the implementation timeline?"</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Proposal Requested</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">+$180K</div>
                      <div className="text-sm opacity-75">Deal Progression</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {healthcareProblemStats.map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
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