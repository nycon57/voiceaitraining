'use client';

import {
  Activity,
  Brain,
  Briefcase,
  Building,
  Rocket,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import {
  FeatureComparison,
  PricingCard,
  type CategoryConfigMap,
  type Plan,
} from '@/components/pricing';
import { PlanTypeToggle, BillingIntervalToggle } from '@/components/marketing/plan-type-toggle';

// Team Plans (existing)
const TEAM_PLANS: Plan[] = [
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
        { name: 'Team Management', value: 'Up to 10 users' },
        { name: 'Custom Scenarios', value: '25 scenarios' },
        { name: 'Advanced Analytics', value: false },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Individual Reports', value: true },
        { name: 'Team Leaderboards', value: true },
        { name: 'Export Data', value: 'PDF only' },
        { name: 'Historical Data', value: '90 days' },
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
      monthly: 199,
      yearly: 1990,
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
        { name: 'Team Management', value: 'Up to 50 users' },
        { name: 'Custom Scenarios', value: '100 scenarios' },
        { name: 'Advanced Analytics', value: true },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Individual Reports', value: true },
        { name: 'Team Leaderboards', value: true },
        { name: 'Export Data', value: 'PDF, CSV, Excel' },
        { name: 'Historical Data', value: '180 days' },
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

// Individual Plans (new)
const INDIVIDUAL_PLANS: Plan[] = [
  {
    name: 'Free',
    type: 'basic',
    icon: User,
    price: {
      monthly: 0,
      yearly: 0,
    },
    button: {
      text: 'Get Started Free',
      variant: 'outline',
      href: '/sign-up',
    },
    features: {
      training: [
        { name: 'Voice AI Conversations', value: true },
        { name: 'Training Sessions', value: '10 per month' },
        { name: 'Pre-built Scenarios', value: '3 included' },
        { name: 'Call Recordings', value: true },
        { name: 'Performance Reports', value: 'Basic' },
        { name: 'AI Scenario Generation', value: false },
        { name: 'Custom Branding', value: false },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Performance Analytics', value: 'Basic' },
        { name: 'Export Data', value: 'PDF only' },
        { name: 'Historical Data', value: '30 days' },
        { name: 'API Access', value: false },
        { name: 'Webhooks', value: false },
        { name: 'Priority Support', value: false },
      ],
    },
  },
  {
    name: 'Pro',
    type: 'business',
    icon: Zap,
    price: {
      monthly: 29,
      yearly: 290,
    },
    button: {
      text: 'Start Pro Trial',
      variant: 'default',
      href: '/sign-up',
    },
    features: {
      training: [
        { name: 'Voice AI Conversations', value: true },
        { name: 'Training Sessions', value: '100 per month' },
        { name: 'Custom Scenarios', value: '50 scenarios' },
        { name: 'Call Recordings', value: true },
        { name: 'Performance Reports', value: 'Advanced' },
        { name: 'AI Scenario Generation', value: true },
        { name: 'Custom Branding', value: false },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Performance Analytics', value: 'Advanced' },
        { name: 'Export Data', value: 'PDF, CSV' },
        { name: 'Historical Data', value: '90 days' },
        { name: 'API Access', value: false },
        { name: 'Webhooks', value: false },
        { name: 'Priority Support', value: 'Email' },
      ],
    },
  },
  {
    name: 'Ultra',
    type: 'enterprise',
    icon: Rocket,
    price: {
      monthly: 99,
      yearly: 990,
    },
    button: {
      text: 'Start Ultra Trial',
      variant: 'default',
      href: '/sign-up',
    },
    features: {
      training: [
        { name: 'Voice AI Conversations', value: true },
        { name: 'Training Sessions', value: '500 per month' },
        { name: 'Custom Scenarios', value: '200 scenarios' },
        { name: 'Call Recordings', value: true },
        { name: 'Performance Reports', value: 'Enterprise' },
        { name: 'AI Scenario Generation', value: true },
        { name: 'Custom Branding', value: true },
      ],
      analytics: [
        { name: 'Basic KPIs', value: true },
        { name: 'Performance Analytics', value: 'Advanced + AI Insights' },
        { name: 'Export Data', value: 'All formats' },
        { name: 'Historical Data', value: '1 year' },
        { name: 'API Access', value: 'Full access' },
        { name: 'Webhooks', value: 'Unlimited' },
        { name: 'Priority Support', value: '24/7' },
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
  const [planType, setPlanType] = useState<'individual' | 'team'>('individual');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const activePlans = planType === 'individual' ? INDIVIDUAL_PLANS : TEAM_PLANS;

  return (
    <section className="section-padding relative container space-y-15 md:space-y-20 lg:space-y-30">
      <div className="mx-auto max-w-4xl space-y-6 text-balance sm:text-center">
        <h1 className="font-headline md:text-6xxl text-5xl leading-none tracking-tight text-balance">
          Pricing designed to <br className="hidden sm:block" />
          <span className="text-gradient">scale with you!</span>
        </h1>

        <p className="text-muted-foreground leading-snug md:text-lg lg:text-xl">
          Transform your sales training with AI-powered voice conversations.
          Choose the plan that fits your needs.
        </p>

        {/* Plan Type Toggle */}
        <div className="flex flex-col items-center gap-4 pt-6">
          <PlanTypeToggle value={planType} onChange={setPlanType} />

          {/* Billing Interval Toggle - Only show for paid plans */}
          {planType === 'team' || planType === 'individual' ? (
            <BillingIntervalToggle
              value={billingInterval}
              onChange={setBillingInterval}
              savings="Save 2 months"
            />
          ) : null}
        </div>

        {/* Plan Type Description */}
        <div className="pt-4">
          {planType === 'individual' ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Perfect for freelancers, consultants, and solo practitioners</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Built for sales teams and organizations</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Pricing Table */}
      <div className="lg:hidden">
        <div className="mb-8 grid gap-6">
          {activePlans.map((planItem) => (
            <PricingCard key={planItem.name} plan={planItem} />
          ))}
        </div>

        {/* Mobile Feature Comparison */}
        <FeatureComparison
          plans={activePlans}
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
            {activePlans.map((plan, index) => (
              <PricingCard key={index} plan={plan} />
            ))}
          </div>
          <FeatureComparison
            plans={activePlans}
            categoryConfig={CATEGORY_CONFIG}
            layout="desktop"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl pt-12 border-t">
        <h3 className="font-headline text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Can I upgrade from Individual to Team?</h4>
            <p className="text-muted-foreground">
              Yes! You can upgrade from any Individual plan to a Team plan at any time.
              Your data and training history will be preserved.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What happens when I reach my session limit?</h4>
            <p className="text-muted-foreground">
              You'll receive a notification when you reach 80% of your limit.
              Once you hit your limit, you can upgrade to continue training or wait until the next month.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
            <p className="text-muted-foreground">
              Yes, we offer a 30-day money-back guarantee on all paid plans.
              If you're not satisfied, contact us for a full refund.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPage;