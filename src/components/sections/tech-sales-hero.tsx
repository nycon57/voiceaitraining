"use client";

import { ArrowRight } from 'lucide-react';
import { PageHero } from './page-hero';

export default function TechSalesHero() {
  return (
    <PageHero
      title="Train SaaS sales teams to close enterprise deals faster"
      description="Technology sales teams struggle with technical discovery calls, complex demos, and lengthy enterprise cycles. Our AI voice agents simulate realistic SaaS scenarios - from technical objections to security conversations. Train your team to master discovery, handle competitive threats, and close enterprise deals without the complexity of traditional roleplay."
      cta={{
        text: "Train Tech Sales Team",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}