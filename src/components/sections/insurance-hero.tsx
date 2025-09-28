"use client";

import { ArrowRight } from 'lucide-react';
import { PageHero } from './page-hero';

export default function InsuranceHero() {
  return (
    <PageHero
      title="Transform insurance agents into trusted advisors"
      description="Insurance agents struggle with complex product explanations, price objections, and building trust with prospects. Our AI voice agents simulate realistic client scenarios - from life insurance needs assessments to home policy reviews. Train your team to conduct thorough needs analysis, explain coverage clearly, and overcome objections while building the trust that drives referrals."
      cta={{
        text: "Train Insurance Agents",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}