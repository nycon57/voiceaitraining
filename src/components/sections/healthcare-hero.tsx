"use client";

import { ArrowRight } from 'lucide-react';
import { PageHero } from './page-hero';

export default function HealthcareHero() {
  return (
    <PageHero
      title="Train healthcare sales teams to build trusted provider relationships"
      description="Healthcare sales professionals struggle with clinical complexity, skeptical providers, and long sales cycles. Our AI voice agents simulate realistic clinical conversations - from evidence-based discussions to ROI justifications. Train your team to speak the language of healthcare, build clinical credibility, and close deals faster without scheduling conflicts with busy providers."
      cta={{
        text: "Train Healthcare Sales",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}