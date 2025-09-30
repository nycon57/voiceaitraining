"use client";

import { Clock, Users, UserX, AlertTriangle } from "lucide-react";

const problemStats = [
  {
    title: "Scheduling Conflicts",
    description: "Hours wasted weekly trying to coordinate roleplay sessions between busy sales reps and managers",
    number: 12,
    suffix: "+",
    icon: Clock
  },
  {
    title: "Inconsistent Training",
    description: "Percentage of roleplay sessions that provide different feedback for the same performance",
    number: 85,
    suffix: "%",
    icon: Users
  },
  {
    title: "Limited Scenarios",
    description: "Average number of different sales scenarios most reps practice before going live",
    number: 3,
    suffix: "",
    icon: AlertTriangle
  },
  {
    title: "Training Avoidance",
    description: "Percentage of sales reps who avoid roleplay training due to embarrassment or judgment",
    number: 70,
    suffix: "%",
    icon: UserX
  },
];

export default function VoiceSimulationProblem() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex w-full flex-col items-stretch justify-between gap-8 lg:flex-row">
            <div className="w-full max-w-md">
              <h2 className="my-5 text-4xl md:text-5xl lg:text-6xl font-headline">
                Traditional{" "}
                <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  Role-Play Training
                </span>{" "}
                Is Broken
              </h2>
              <p className="text-lg text-muted-foreground">
                Sales managers waste countless hours scheduling roleplay sessions that reps dread.
                The feedback is inconsistent, the scenarios are limited, and most reps avoid practice
                due to judgment and embarrassment. Meanwhile, real prospects suffer from unprepared conversations.
              </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Roleplay Problems */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-600/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-base font-semibold">Traditional Roleplay Session</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">Manager: "Let's practice that objection again..."</div>
                      <div className="text-sm opacity-90">Rep: "I feel stupid doing this fake conversation"</div>
                      <div className="text-sm opacity-90">Manager: "Just pretend I'm a real customer"</div>
                      <div className="text-sm opacity-90 text-red-200 font-medium">Session Ends in Frustration</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm opacity-75">Real Improvement</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Voice Training Success */}
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20 rounded-lg blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 rounded-lg p-6 text-white h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-base font-semibold">AI Voice Training</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-sm opacity-90">AI: "I'm not sure your solution fits our budget..."</div>
                      <div className="text-sm opacity-90">Rep: "I understand budget is important. What's driving that concern?"</div>
                      <div className="text-sm opacity-90">AI: "Well, we've had issues with ROI on similar investments"</div>
                      <div className="text-sm opacity-90 text-green-200 font-medium">Natural Conversation Flows</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm opacity-75">Skill Improvement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 justify-between gap-8 sm:grid-cols-2 md:grid-cols-4">
            {problemStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <Icon className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    {item.number}{item.suffix}
                  </p>
                  <h6 className="text-lg mt-3 mb-2 font-semibold">{item.title}</h6>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}