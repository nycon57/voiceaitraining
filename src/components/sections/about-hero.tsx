"use client";

import { ArrowRight } from 'lucide-react';
import { PageHero } from './page-hero';

export default function AboutHero() {
  return (
    <PageHero
      title="We help sales teams close 40% more deals without adding headcount"
      description="Companies lose $1M+ annually from poor sales conversations. Our AI voice agents transform struggling reps into confident closers in 30 days instead of 6+ months. No more scheduling roleplay sessions. No more inconsistent training. Every rep gets unlimited practice with realistic AI prospects that never get tired, never judge, and give instant feedback on what actually closes deals."
      cta={{
        text: "Start Free Trial",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}
