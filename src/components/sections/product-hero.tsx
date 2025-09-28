"use client";

import { ArrowRight, Play } from 'lucide-react';
import { PageHero } from './page-hero';

export default function ProductHero() {
  return (
    <PageHero
      title="The Complete Voice AI Training Platform for Sales Teams"
      description="Practice realistic sales conversations with AI prospects. Get instant feedback on your performance. Master objection handling, closing techniques, and conversation flow. No scheduling. No judgment. Just results that drive revenue."
      cta={{
        text: "Start Free Trial",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}
