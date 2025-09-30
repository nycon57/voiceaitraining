import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { FeatureValue } from './feature-value';
import type { CategoryConfigMap, Plan } from './types';

export interface FeatureComparisonProps {
  /**
   * All plans to compare
   */
  plans: Plan[];
  /**
   * Category configuration (icons and names)
   */
  categoryConfig: CategoryConfigMap;
  /**
   * Layout mode - mobile shows one plan at a time, desktop shows side-by-side
   */
  layout?: 'mobile' | 'desktop';
  /**
   * For mobile layout - currently selected plan index
   */
  selectedPlan?: string;
  /**
   * For mobile layout - callback when plan selection changes
   */
  onPlanChange?: (planIndex: string) => void;
}

/**
 * FeatureComparison Component
 *
 * Displays feature comparison tables across multiple pricing plans.
 * Supports two layouts:
 * - Mobile: Single plan selector with vertical feature list
 * - Desktop: Side-by-side comparison grid
 *
 * @example
 * ```tsx
 * // Desktop layout
 * <FeatureComparison
 *   plans={PLANS}
 *   categoryConfig={CATEGORY_CONFIG}
 *   layout="desktop"
 * />
 *
 * // Mobile layout
 * <FeatureComparison
 *   plans={PLANS}
 *   categoryConfig={CATEGORY_CONFIG}
 *   layout="mobile"
 *   selectedPlan="0"
 *   onPlanChange={setSelectedPlan}
 * />
 * ```
 */
export function FeatureComparison({
  plans,
  categoryConfig,
  layout = 'mobile',
  selectedPlan,
  onPlanChange,
}: FeatureComparisonProps) {
  if (layout === 'mobile') {
    return (
      <MobileFeatureComparison
        plans={plans}
        categoryConfig={categoryConfig}
        selectedPlan={selectedPlan || '0'}
        onPlanChange={onPlanChange}
      />
    );
  }

  return (
    <DesktopFeatureComparison
      plans={plans}
      categoryConfig={categoryConfig}
    />
  );
}

/**
 * Mobile layout - shows one plan at a time with a selector
 */
function MobileFeatureComparison({
  plans,
  categoryConfig,
  selectedPlan,
  onPlanChange,
}: Required<
  Pick<FeatureComparisonProps, 'plans' | 'categoryConfig' | 'selectedPlan'>
> &
  Pick<FeatureComparisonProps, 'onPlanChange'>) {
  const selectedPlanIndex = parseInt(selectedPlan);
  const plan = plans[selectedPlanIndex];

  return (
    <div className="space-y-14">
      {Object.entries(plan.features).map(([category, features], index) => {
        const categoryInfo =
          categoryConfig[category as keyof typeof categoryConfig];

        return (
          <div key={category} className="space-y-5.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="from-muted/30 via-muted/10 to-card flex aspect-square size-10 items-center justify-center rounded-md border bg-gradient-to-r p-2">
                  <categoryInfo.icon className="size-4.5" />
                </div>
                <h3 className="font-headline text-lg font-semibold">
                  {categoryInfo.name}
                </h3>
              </div>
              {index === 0 && onPlanChange && (
                <Select value={selectedPlan} onValueChange={onPlanChange}>
                  <SelectTrigger className="text-muted-foreground w-22 gap-3 border-0 px-4 text-center">
                    {plans[selectedPlanIndex].name}
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((planItem, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {planItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              {features.map((feature: { name: string; value: string | boolean }, featureIndex: number) => (
                <div
                  key={featureIndex}
                  className="flex items-center justify-between border-b py-4 last:border-b-0"
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

/**
 * Desktop layout - shows side-by-side plan comparison in a grid
 */
function DesktopFeatureComparison({
  plans,
  categoryConfig,
}: Pick<FeatureComparisonProps, 'plans' | 'categoryConfig'>) {
  return (
    <div className="space-y-14">
      {Object.entries(categoryConfig).map(([categoryKey, categoryInfo]) => {
        const categoryKeyTyped = categoryKey as keyof typeof categoryConfig;

        return (
          <div key={categoryKey}>
            <div className="flex items-center gap-1.5 ps-6 pb-5.5">
              <div className="from-muted/30 via-muted/10 to-card flex aspect-square size-10 items-center justify-center rounded-md border bg-gradient-to-r p-2">
                <categoryInfo.icon className="size-4.5" />
              </div>
              <h3 className="font-headline text-lg font-semibold">
                {categoryInfo.name}
              </h3>
            </div>
            {plans[0].features[categoryKeyTyped].map(
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
                    {plans.map((plan, planIndex) => {
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
}