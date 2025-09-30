import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { Plan } from './types';

export interface PricingCardProps {
  /**
   * Plan data to display
   */
  plan: Plan;
  /**
   * Optional className for custom styling
   */
  className?: string;
  /**
   * Whether to show the featured gradient border (typically for the "Professional" plan)
   */
  featured?: boolean;
  /**
   * Billing cycle to display (defaults to monthly)
   */
  billingCycle?: 'monthly' | 'yearly';
}

/**
 * PricingCard Component
 *
 * Displays a pricing plan card with name, description, price, and call-to-action.
 * The "Professional" plan (or featured plan) gets a special gradient border treatment.
 *
 * @example
 * ```tsx
 * <PricingCard
 *   plan={professionalPlan}
 *   featured={true}
 *   billingCycle="monthly"
 * />
 * ```
 */
export function PricingCard({
  plan,
  className,
  featured,
  billingCycle = 'monthly',
}: PricingCardProps) {
  // Auto-detect featured plan if not explicitly set
  const isPro = featured ?? plan.name === 'Professional';

  // Get price based on billing cycle
  const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
  const priceLabel =
    billingCycle === 'yearly' ? '/ year' : '/ month';

  // Get plan description based on name
  const getDescription = (planName: string) => {
    switch (planName) {
      case 'Starter':
        return 'Perfect for small sales teams getting started';
      case 'Professional':
        return 'Advanced features for growing teams';
      case 'Enterprise':
        return 'Complete solution for large organizations';
      default:
        return '';
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden shadow-none',
        // Gradient border effect for featured plan
        isPro &&
          'before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-tr before:from-chart-1/10 before:via-chart-2 before:to-chart-3 before:mask-b-from-40% before:mask-b-to-80%',
        isPro &&
          'after:bg-card after:absolute after:inset-[1px] after:rounded-[calc(var(--radius)-1px)]',
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
            <CardTitle className="font-headline text-3xl tracking-tight md:text-4xl">
              {plan.name}
            </CardTitle>
            <CardDescription className="text-base leading-snug md:text-lg lg:text-xl">
              {getDescription(plan.name)}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-baseline gap-1 font-medium tracking-tight md:flex-row">
            <span className="font-azeret-mono text-4xxl leading-none md:text-5xl lg:text-6xl">
              ${price}
            </span>
            <span className="text-muted-foreground text-lg md:text-xl">
              {priceLabel}
            </span>
          </CardContent>
        </div>

        <CardFooter>
          <Button variant="secondary" className="h-12 w-full" asChild>
            <Link href={plan.button.href}>{plan.button.text}</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}