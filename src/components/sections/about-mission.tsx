import Image from 'next/image';
import { Heart, Target, Zap } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const MISSION_VALUES = [
  {
    icon: Target,
    title: 'Performance-Driven',
    description: 'Every feature is built to directly impact close rates and revenue generation.',
  },
  {
    icon: Heart,
    title: 'Empowering Reps',
    description: 'We believe every rep deserves the tools to succeed, not just the top performers.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'No 6-month ramp times. See improvement in days, not months.',
  },
];

export default function AboutMission() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="grid place-content-center gap-10 lg:grid-cols-2">
          <Image
            src="/images/about/hero.webp"
            alt="Our mission in action"
            width={600}
            height={450}
            className="mr-auto max-h-[450px] w-full rounded-xl object-cover"
          />
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 lg:items-start">
            <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-headline lg:text-left">
              Making Every Sales Conversation{" "}
              <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                Count
              </span>
            </h2>
            <p className="text-center text-muted-foreground lg:text-left lg:text-lg">
              We started this company because we were tired of watching talented people fail at sales due to poor training. Traditional roleplay is broken, expensive, and doesn't scale. Our AI provides unlimited, judgment-free practice with instant feedback.
            </p>

            <div className="mt-9 flex w-full flex-col justify-center gap-6 md:flex-row lg:justify-start">
              <div className="flex justify-between gap-6">
                <div className="mx-auto">
                  <p className="mb-1.5 text-3xl font-bold">500+</p>
                  <p className="text-muted-foreground">Teams Helped</p>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div className="mx-auto">
                  <p className="mb-1.5 text-3xl font-bold">95%</p>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
              </div>
              <Separator
                orientation="vertical"
                className="hidden h-auto md:block"
              />
              <Separator orientation="horizontal" className="block md:hidden" />
              <div className="flex justify-between gap-6">
                <div className="mx-auto">
                  <p className="mb-1.5 text-3xl font-bold">$12M+</p>
                  <p className="text-muted-foreground">Extra Revenue</p>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div className="mx-auto">
                  <p className="mb-1.5 text-3xl font-bold">40%</p>
                  <p className="text-muted-foreground">Avg Improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MISSION_VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="flex items-center gap-6 rounded-lg border border-border bg-muted p-8 sm:flex-col sm:items-start">
                <div className="mx-0 h-12 w-12 sm:mx-auto lg:mx-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {value.title}
                  </p>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}