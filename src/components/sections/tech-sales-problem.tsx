"use client";

const techSalesProblemStats = [
  {
    title: "Long Sales Cycles",
    description: "Average enterprise SaaS sales cycle length in months",
    number: 12,
    suffix: "+"
  },
  {
    title: "Technical Objections",
    description: "Percentage of deals lost due to unaddressed technical concerns",
    number: 58,
    suffix: "%"
  },
  {
    title: "Demo Failures",
    description: "Deals lost when demos don't address specific use cases",
    number: 73,
    suffix: "%"
  },
  {
    title: "Competitive Losses",
    description: "Average revenue lost per rep annually to better-positioned competitors",
    number: "$1.2M",
    suffix: ""
  },
];

export default function TechSalesProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Tech Sales Teams{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Struggle
                </span>{" "}
                With Complex Enterprise Sales
              </h2>
              <p className="text-lg text-muted-foreground">
                In competitive SaaS markets, sales reps face technical complexity, long enterprise cycles, and sophisticated buyers. Traditional training doesn't prepare them for real-world technical conversations, leading to lost deals and missed quotas.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Failed Tech Sales Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Failed Enterprise Demo</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Prospect: "How does this integrate with our existing tech stack?"</div>
                      <div className="text-sm opacity-90">Sales Rep: "I'll need to check with our technical team..."</div>
                      <div className="text-sm opacity-90">Prospect: "We need someone who understands our requirements."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">Deal Lost to Competitor</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">-$85K</div>
                      <div className="text-sm opacity-75">Lost ARR</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Tech Sales Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI-Trained Sales Rep</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Prospect: "How does this integrate with our existing tech stack?"</div>
                      <div className="text-sm opacity-90">Sales Rep: "Great question! We have native APIs for Salesforce and HubSpot. What's your current CRM?"</div>
                      <div className="text-sm opacity-90">Prospect: "Perfect, we use Salesforce. Let's schedule the technical review."</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Demo Scheduled</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">+$85K</div>
                      <div className="text-sm opacity-75">Pipeline ARR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {techSalesProblemStats.map((item) => (
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