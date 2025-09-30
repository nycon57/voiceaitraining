'use client';

import {
  Activity,
  Brain,
  Briefcase,
  Building,
  Rocket,
} from 'lucide-react';
import { useState } from 'react';

import {
  FeatureComparison,
  PricingCard,
  type CategoryConfigMap,
  type Plan,
} from '@/components/pricing';

const PLANS: Plan[] = [
  {
    name: 'Starter',
    type: 'basic',
    icon: Rocket,
    price: {
      monthly: 49,
      yearly: 490,
    },
    button: {
      text: 'Start Free Trial',
      variant: 'default',
      href: '/request-demo',
    },
    features: {
      training: [
        { name: 'Voice AI Conversations', value: true },
        { name: 'Basic Scenarios', value: '10 included' },
        { name: 'Call Recordings', value: true },
        { name: 'Performance Reports', value: 'Basic' },
        { name: 'Team Management', value: 'Up to 5 users' },
        { name: 'Custom Scenarios', value: false },
        { name: 'Advanced Analytics', value: false },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Individual Reports', value: true },
        { name: 'Team Leaderboards', value: false },
        { name: 'Export Data', value: 'PDF only' },
        { name: 'Historical Data', value: '3 months' },
        { name: 'API Access', value: false },
        { name: 'Webhooks', value: false },
      ],
    },
  },
  {
    name: 'Professional',
    type: 'business',
    icon: Briefcase,
    price: {
      monthly: 149,
      yearly: 1490,
    },
    button: {
      text: 'Start Free Trial',
      variant: 'default',
      href: '/request-demo',
    },
    features: {
      training: [
        { name: 'Voice AI Conversations', value: true },
        { name: 'Basic Scenarios', value: '50 included' },
        { name: 'Call Recordings', value: true },
        { name: 'Performance Reports', value: 'Advanced' },
        { name: 'Team Management', value: 'Up to 25 users' },
        { name: 'Custom Scenarios', value: 'Unlimited' },
        { name: 'Advanced Analytics', value: true },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Individual Reports', value: true },
        { name: 'Team Leaderboards', value: true },
        { name: 'Export Data', value: 'PDF, CSV, Excel' },
        { name: 'Historical Data', value: '12 months' },
        { name: 'API Access', value: 'Limited' },
        { name: 'Webhooks', value: '5 endpoints' },
      ],
    },
  },
  {
    name: 'Enterprise',
    type: 'enterprise',
    icon: Building,
    price: {
      monthly: 299,
      yearly: 2990,
    },
    button: {
      text: 'Contact Sales',
      variant: 'default',
      href: '/request-demo',
    },
    features: {
      training: [
        { name: 'Voice AI Conversations', value: true },
        { name: 'Basic Scenarios', value: 'Unlimited' },
        { name: 'Call Recordings', value: true },
        { name: 'Performance Reports', value: 'Enterprise' },
        { name: 'Team Management', value: 'Unlimited users' },
        { name: 'Custom Scenarios', value: 'Unlimited' },
        { name: 'Advanced Analytics', value: true },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Individual Reports', value: true },
        { name: 'Team Leaderboards', value: true },
        { name: 'Export Data', value: 'All formats' },
        { name: 'Historical Data', value: 'Unlimited' },
        { name: 'API Access', value: 'Full access' },
        { name: 'Webhooks', value: 'Unlimited' },
      ],
    },
  },
];

const CATEGORY_CONFIG: CategoryConfigMap = {
  training: {
    name: 'Training Features',
    icon: Activity,
  },
  analytics: {
    name: 'Analytics and Reporting',
    icon: Brain,
  },
};

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('0');

  return (
    <section className="section-padding relative container space-y-15 md:space-y-20 lg:space-y-30">
      <div className="mx-auto max-w-4xl space-y-4 text-balance sm:text-center">
        <h1 className="font-headline md:text-6xxl text-5xl leading-none tracking-tight text-balance">
          Pricing designed to <br className="hidden sm:block" />
          <span className="text-gradient">scale with you!</span>
        </h1>

        <p className="text-muted-foreground leading-snug md:text-lg lg:text-xl">
          Transform your sales training with AI-powered voice conversations.
          Choose the plan that fits your team size and training needs.
        </p>
      </div>

      {/* Mobile Pricing Table */}
      <div className="lg:hidden">
        <div className="mb-8 grid gap-6">
          {PLANS.map((planItem) => (
            <PricingCard key={planItem.name} plan={planItem} />
          ))}
        </div>

        {/* Mobile Feature Comparison */}
        <FeatureComparison
          plans={PLANS}
          categoryConfig={CATEGORY_CONFIG}
          layout="mobile"
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
        />
      </div>

      {/* Desktop Pricing Table */}
      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-4 gap-6">
            <div className="p-0"></div>
            {PLANS.map((plan, index) => (
              <PricingCard key={index} plan={plan} />
            ))}
          </div>
          <FeatureComparison
            plans={PLANS}
            categoryConfig={CATEGORY_CONFIG}
            layout="desktop"
          />
        </div>
      </div>
    </section>
  );
};

export default PricingPage;