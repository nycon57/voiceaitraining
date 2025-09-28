"use client";

import { ArrowRight } from 'lucide-react';
import { PageHero } from './page-hero';

export default function LoanOfficersHero() {
  return (
    <PageHero
      title="Train loan officers to close 40% more mortgage deals"
      description="Mortgage loan officers struggle with rate objections, compliance complexity, and competitive markets. Our AI voice agents simulate realistic lending scenarios - from first-time homebuyer conversations to complex refinancing discussions. Train your team to handle every objection, maintain compliance, and close more loans without the scheduling hassles of traditional roleplay."
      cta={{
        text: "Start Training Loan Officers",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}