"use client";

import { ArrowRight } from 'lucide-react';
import { PageHero } from './page-hero';

export default function AnalyticsHero() {
  return (
    <PageHero
      title="Transform sales data into revenue-driving insights"
      description="Stop flying blind with spreadsheets and manual reports. Get real-time dashboards, automated performance tracking, and actionable insights that show exactly how to improve your team's results. See which training works, identify top performers, and prove ROI with data that drives decisions."
      cta={{
        text: "See Your Analytics",
        icon: ArrowRight,
        href: "/request-demo"
      }}
    />
  );
}