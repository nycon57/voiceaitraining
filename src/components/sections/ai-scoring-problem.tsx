"use client";

const problemStats = [
  {
    title: "Inconsistent Feedback",
    description: "Percentage of manager feedback that varies wildly between different reviewers for the same call",
    number: 73,
    suffix: "%"
  },
  {
    title: "Delayed Reviews",
    description: "Average days between a sales call and receiving actionable feedback from management",
    number: 14,
    suffix: "+"
  },
  {
    title: "Bias Impact",
    description: "Performance reviews affected by unconscious bias, mood, and personal relationships with reps",
    number: 85,
    suffix: "%"
  },
  {
    title: "Improvement Rate",
    description: "Percentage of reps who actually improve after receiving subjective feedback from managers",
    number: 22,
    suffix: "%"
  },
];

export default function AIScoringProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Subjective feedback is{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  holding your team back
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Manager feedback varies by mood, bias, and personal relationships. Reps wait weeks for reviews that don't provide specific, actionable guidance. Meanwhile, your best opportunities slip away because improvement is too slow and inconsistent.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Biased Feedback */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Manager Review Session</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Manager: "That call felt a bit rushed..."</div>
                      <div className="text-sm opacity-90">Rep: "What specifically should I improve?"</div>
                      <div className="text-sm opacity-90">Manager: "Just... slow down and be more engaging."</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">Vague, Unhelpful Feedback</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">14 Days</div>
                      <div className="text-sm opacity-75">Until Next Review</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Scoring */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI Performance Analysis</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">AI: "Talk-to-listen ratio: 65% (target: 45%)"</div>
                      <div className="text-sm opacity-90">AI: "Used 3 filler words, missed 2 discovery questions"</div>
                      <div className="text-sm opacity-90">AI: "Pricing objection at 14:32 - practice this scenario"</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Instant, Specific Feedback</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">Immediate</div>
                      <div className="text-sm opacity-75">After Every Call</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {problemStats.map((item) => (
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