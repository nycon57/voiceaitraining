'use client';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import Aurora from '@/components/ui/aurora';

export default function Hero() {
  return (
    <section className="section-padding relative">
      {/* Aurora Background - Full viewport width, 65% height */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[65%] overflow-hidden">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="relative container">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div className="flex max-w-3xl flex-1 flex-col items-start gap-5">
            <h1 className="font-headline text-5xl leading-none tracking-tight text-balance md:text-6xl lg:text-7xl">
              Master sales calls with{' '}
              <span className="text-gradient">AI voice agents</span>
            </h1>

            <p className="text-muted-foreground leading-snug md:text-lg lg:text-xl">
              Train your sales team with realistic AI-powered voice simulations.
              Practice real scenarios, get instant feedback, and track performance
              metrics that drive results.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <div className="flex gap-4.5">
              <Button className="flex-1 md:min-w-45">Start Free Trial</Button>
              <Button className="flex-1 md:min-w-45" variant="outline">
                Book a Demo
              </Button>
            </div>
            <div className="text-center text-sm">
              Used by 500+ sales teams · 95% improvement in training ROI
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <Image
          src="/images/home/hero.webp"
          alt="App screenshot"
          className="ring-foreground/5 mt-10 w-full rounded-xs shadow-2xl ring-6 invert md:mt-20 md:rounded-sm md:px-[1px] md:ring-16 lg:mt-30 dark:invert-0"
          width={1440}
          height={905}
          priority
        />
      </div>
    </section>
  );
}

