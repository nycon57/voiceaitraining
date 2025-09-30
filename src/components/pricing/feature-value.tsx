import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface FeatureValueProps {
  /**
   * The value to display - can be a boolean (check/minus icon) or string (text display)
   */
  value: string | boolean;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * FeatureValue Component
 *
 * Displays a feature value in pricing tables. Renders as:
 * - Boolean true: Green checkmark icon
 * - Boolean false: Gray minus icon
 * - String: Text display with optional multiline support (split on \n)
 *
 * @example
 * ```tsx
 * <FeatureValue value={true} />
 * <FeatureValue value="Up to 25 users" />
 * <FeatureValue value="PDF, CSV\nExcel" />
 * ```
 */
export function FeatureValue({ value, className }: FeatureValueProps) {
  if (typeof value === 'boolean') {
    return (
      <div
        className={cn(
          'flex size-5.5 items-center justify-center rounded-full',
          value ? 'bg-secondary' : 'bg-muted',
          className,
        )}
      >
        {value ? (
          <Check className="size-3.5 text-secondary-foreground" />
        ) : (
          <Minus className="size-3.5 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div className={cn('text-sm', className)}>
      {typeof value === 'string'
        ? value.split('\n').map((line, idx) =>
            idx === 0 ? (
              <span key={idx} className="text-accent-foreground font-medium">
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
}