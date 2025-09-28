import { Metadata } from 'next';
import AnalyticsHero from '@/components/sections/analytics-hero';
import AnalyticsProblem from '@/components/sections/analytics-problem';
import AnalyticsSolution from '@/components/sections/analytics-solution';
import AnalyticsFeatures from '@/components/sections/analytics-features';
import AnalyticsValueStack from '@/components/sections/analytics-value-stack';

export const metadata: Metadata = {
  title: 'Analytics & Insights | Audio Agent Sales Training',
  description: 'Transform sales data into revenue-driving insights with real-time dashboards, automated reports, and predictive analytics. Get 360° visibility into your sales training performance.',
  keywords: 'sales analytics, performance tracking, training ROI, sales dashboards, team insights, predictive analytics',
};

export default function Analytics() {
  return (
    <>
      <AnalyticsHero />
      <AnalyticsProblem />
      <AnalyticsSolution />
      <AnalyticsFeatures />
      <AnalyticsValueStack />
    </>
  );
}