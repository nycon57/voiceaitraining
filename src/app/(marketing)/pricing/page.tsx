'use client';

import {
  Activity,
  Brain,
  Briefcase,
  Building,
  Check,
  Minus,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type PlanType = 'basic' | 'business' | 'enterprise';

interface Plan {
  name: string;
  type: PlanType;
  icon: React.ElementType;
  price: {
    monthly: number;
    yearly: number;
  };
  button: {
    text: string;
    variant: 'default' | 'outline';
    href: string;
  };
  features: {
    training: {
      name: string;
      value: string | boolean;
    }[];
    analytics: {
      name: string;
      value: string | boolean;
    }[];
  };
}

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

const CATEGORY_CONFIG = {
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
        <h1 className="md:text-6xxl text-5xl leading-none tracking-tight text-balance">
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
          <FeatureComparison layout="desktop" />
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({
  plan,
  className,
}: {
  plan: Plan;
  className?: string;
}) => {
  const isPro = plan.name === 'Professional';

  return (
    <Card
      className={cn(
        'relative overflow-hidden shadow-none dark:bg-[#07070e]',
        isPro &&
          'before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-tr before:from-[var(--chart-1)]/10 before:via-[var(--chart-2)] before:to-[var(--chart-3)] before:mask-b-from-40% before:mask-b-to-80%',
        isPro &&
          'after:bg-card after:absolute after:inset-[1px] after:rounded-[calc(var(--radius)-1px)] dark:after:bg-[#07070e]',
        className,
      )}
    >
      <div
        className={cn(
          'relative z-10 flex h-full flex-col justify-between gap-6',
        )}
      >
        <div className="flex h-full items-center justify-between gap-6 lg:flex-col lg:items-start">
          <CardHeader className="flex-1 gap-4">
            <CardTitle className="text-3xl tracking-tight md:text-4xl">
              {plan.name}
            </CardTitle>
            <CardDescription className="text-base leading-snug md:text-lg lg:text-xl">
              {plan.name === 'Starter' &&
                'Perfect for small sales teams getting started'}
              {plan.name === 'Professional' && 'Advanced features for growing teams'}
              {plan.name === 'Enterprise' &&
                'Complete solution for large organizations'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-baseline gap-1 font-medium tracking-tight md:flex-row">
            <span className="font-azeret-mono text-4xxl leading-none md:text-5xl lg:text-6xl">
              ${plan.price.monthly}
            </span>
            <span className="text-muted-foreground text-lg md:text-xl">
              / month
            </span>
          </CardContent>
        </div>
        <CardFooter className="">
          <Button variant="secondary" className="h-12 w-full" asChild>
            <Link href={plan.button.href}>{plan.button.text}</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

const FeatureValue = ({ value }: { value: string | boolean }) => {
  if (typeof value === 'boolean') {
    return (
      <div
        className={cn(
          `flex size-5.5 items-center justify-center rounded-full`,
          value ? 'bg-secondary' : 'bg-muted',
        )}
      >
        {value ? (
          <Check className={cn('size-3.5')} />
        ) : (
          <Minus className={cn('size-3.5')} />
        )}
      </div>
    );
  }

  return (
    <div>
      {typeof value === 'string'
        ? value.split('\n').map((line, idx) =>
            idx === 0 ? (
              <span key={idx} className="text-accent-foreground text-sm">
                {line}
              </span>
            ) : (
              <span key={idx} className="text-muted-foreground block text-xs">
                {line}
              </span>
            ),
          )
        : value}
    </div>
  );
};

const FeatureComparison = ({
  layout = 'mobile',
  selectedPlan,
  onPlanChange,
}: {
  layout?: 'mobile' | 'desktop';
  selectedPlan?: string;
  onPlanChange?: (planIndex: string) => void;
}) => {
  if (layout === 'mobile') {
    const selectedPlanIndex = parseInt(selectedPlan || '0');
    const plan = PLANS[selectedPlanIndex];

    return (
      <div className="space-y-14">
        {Object.entries(plan.features).map(([category, features], index) => {
          const categoryInfo =
            CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];

          return (
            <div key={category} className="space-y-5.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="from-muted/30 via-muted/10 to-card flex aspect-square size-10 items-center justify-center rounded-md border bg-gradient-to-r p-2">
                    <categoryInfo.icon className="size-4.5" />
                  </div>
                  <h3 className="">{categoryInfo.name}</h3>
                </div>
                {index === 0 && (
                  <Select value={selectedPlan} onValueChange={onPlanChange}>
                    <SelectTrigger className="text-muted-foreground w-22 gap-3 border-0 px-4 text-center">
                      {PLANS[selectedPlanIndex].name}
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((planItem, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {planItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="">
                {features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center justify-between border-b py-4"
                  >
                    <span className="text-foreground font-medium">
                      {feature.name}
                    </span>
                    <div className="w-22">
                      <FeatureValue value={feature.value} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="space-y-14">
      {Object.entries(CATEGORY_CONFIG).map(([categoryKey, categoryInfo]) => {
        const categoryKeyTyped = categoryKey as keyof typeof CATEGORY_CONFIG;

        return (
          <div key={categoryKey} className="">
            <div className="flex items-center gap-1.5 ps-6 pb-5.5">
              <div className="from-muted/30 via-muted/10 to-card flex aspect-square size-10 items-center justify-center rounded-md border bg-gradient-to-r p-2">
                <categoryInfo.icon className="size-4.5" />
              </div>
              <h3 className="">{categoryInfo.name}</h3>
            </div>
            {PLANS[0].features[categoryKeyTyped].map(
              (feature, featureIndex) => (
                <div
                  key={featureIndex}
                  className={cn(
                    'grid border-t py-4 lg:grid-cols-4',
                    featureIndex === 0 && 'border-t-0',
                  )}
                >
                  <span className="inline-flex items-center ps-6 font-medium">
                    {feature.name}
                  </span>
                  <div className="col-span-3 grid grid-cols-3">
                    {PLANS.map((plan, planIndex) => {
                      const planFeature =
                        plan.features[categoryKeyTyped][featureIndex];
                      return (
                        <div key={planIndex} className="flex items-center">
                          <FeatureValue value={planFeature.value} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PricingPage;