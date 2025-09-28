"use client";

const lendingProblemStats = [
  {
    title: "Rate Objections",
    description: "Percentage of loan applications lost due to ineffective rate objection handling",
    number: 65,
    suffix: "%"
  },
  {
    title: "Compliance Issues",
    description: "Average cost per compliance violation in mortgage lending",
    number: "$25K",
    suffix: ""
  },
  {
    title: "Training Time",
    description: "Months to get new loan officers to acceptable performance levels",
    number: 8,
    suffix: "+"
  },
  {
    title: "Lost Revenue",
    description: "Annual revenue lost per loan officer due to poor conversation skills",
    number: "$2M",
    suffix: ""
  },
];

export default function LoanOfficersProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Loan Officers{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Struggle
                </span>{" "}
                With Complex Sales Conversations
              </h2>
              <p className="text-lg text-muted-foreground">
                In today's competitive lending market, loan officers face rate objections, compliance complexity, and long sales cycles. Traditional training doesn't prepare them for real-world mortgage conversations, leading to lost deals and compliance risks.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Failed Mortgage Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Failed Mortgage Call</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Prospect: "Your rate is 0.5% higher than the other guy."</div>
                      <div className="text-sm opacity-90">Loan Officer: "Well, um, we have great service..."</div>
                      <div className="text-sm opacity-90">Prospect: "I'll stick with the lower rate."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">Application Lost</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">-$8,500</div>
                      <div className="text-sm opacity-75">Lost Commission</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Mortgage Call */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI-Trained Loan Officer</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Prospect: "Your rate is 0.5% higher than the other guy."</div>
                      <div className="text-sm opacity-90">Loan Officer: "I understand rate is important. What matters most - lowest payment or fastest closing?"</div>
                      <div className="text-sm opacity-90">Prospect: "We need to close quickly for our move."</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Application Submitted</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">+$8,500</div>
                      <div className="text-sm opacity-75">Earned Commission</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {lendingProblemStats.map((item) => (
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