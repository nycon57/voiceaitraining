"use client";

const insuranceProblemStats = [
  {
    title: "Trust Barriers",
    description: "Percentage of prospects who don't trust insurance agents initially",
    number: 72,
    suffix: "%"
  },
  {
    title: "Product Complexity",
    description: "Average number of questions prospects ask about coverage details",
    number: 18,
    suffix: "+"
  },
  {
    title: "Price Objections",
    description: "Percentage of sales conversations derailed by premium concerns",
    number: 58,
    suffix: "%"
  },
  {
    title: "Lost Revenue",
    description: "Annual revenue lost per agent due to poor needs assessment skills",
    number: "$1.8M",
    suffix: ""
  },
];

export default function InsuranceProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Insurance Agents{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Struggle
                </span>{" "}
                To Build Trust &amp; Explain Value
              </h2>
              <p className="text-lg text-muted-foreground">
                In today's skeptical market, insurance agents face trust barriers, complex product explanations, and price-focused objections. Traditional training doesn't prepare them for real needs assessment conversations, leading to lost policies and missed cross-selling opportunities.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Failed Insurance Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Failed Insurance Call</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Prospect: "That's way too expensive for life insurance."</div>
                      <div className="text-sm opacity-90">Agent: "Well, this is the standard rate for your age..."</div>
                      <div className="text-sm opacity-90">Prospect: "I'll think about it and call you back."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">No Follow-up, Lost Sale</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">-$4,200</div>
                      <div className="text-sm opacity-75">Lost Annual Premium</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Insurance Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI-Trained Insurance Agent</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Prospect: "That's way too expensive for life insurance."</div>
                      <div className="text-sm opacity-90">Agent: "I understand cost is a concern. What would happen to your family's mortgage if something happened to you?"</div>
                      <div className="text-sm opacity-90">Prospect: "I never thought about that. Let me see the numbers again."</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Policy Purchased + Auto Cross-sell</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">+$6,800</div>
                      <div className="text-sm opacity-75">Total Annual Premiums</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {insuranceProblemStats.map((item) => (
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