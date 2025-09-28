'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const radioGroupVariants = cva(
  'grid gap-3',
  {
    variants: {
      orientation: {
        vertical: 'grid-cols-1',
        horizontal: 'grid-flow-col auto-cols-max gap-4',
      },
      size: {
        sm: 'gap-2',
        md: 'gap-3',
        lg: 'gap-4',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
      size: 'md',
    },
  }
);

const radioItemVariants = cva(
  'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square shrink-0 rounded-full border shadow-xs transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-5',
      },
      variant: {
        default: 'hover:border-ring hover:shadow-sm',
        success: 'border-green-300 text-green-600 focus-visible:border-green-500 focus-visible:ring-green-500/20',
        warning: 'border-amber-300 text-amber-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20',
        destructive: 'border-red-300 text-red-600 focus-visible:border-red-500 focus-visible:ring-red-500/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

interface RadioGroupProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioGroupVariants> {
  animated?: boolean;
}

interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioItemVariants> {
  animated?: boolean;
}

function RadioGroup({
  className,
  orientation,
  size,
  animated = true,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(radioGroupVariants({ orientation, size }), className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  size,
  variant,
  animated = true,
  ...props
}: RadioGroupItemProps) {
  const indicatorSize = {
    sm: 'size-1.5',
    md: 'size-2',
    lg: 'size-2.5',
  };

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioItemVariants({ size, variant }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {animated ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <CircleIcon className={cn('fill-current absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', indicatorSize[size || 'md'])} />
          </motion.div>
        ) : (
          <CircleIcon className={cn('fill-current absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', indicatorSize[size || 'md'])} />
        )}
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

// Enhanced RadioGroupCard component for better UX
interface RadioGroupCardProps extends React.ComponentProps<'div'> {
  value: string;
  title: string;
  description?: string;
  disabled?: boolean;
  animated?: boolean;
}

function RadioGroupCard({
  className,
  value,
  title,
  description,
  disabled = false,
  animated = true,
  children,
  ...props
}: RadioGroupCardProps) {
  return (
    <motion.div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-start space-x-3 rounded-lg border p-4 transition-all duration-200 hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      whileHover={animated && !disabled ? { scale: 1.02 } : {}}
      whileTap={animated && !disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
      {...props}
    >
      <RadioGroupItem value={value} disabled={disabled} animated={animated} className="mt-1" />
      <div className="grid gap-1 leading-none">
        <label
          htmlFor={value}
          className="text-sm font-medium font-headline leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {title}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
    </motion.div>
  );
}

export { RadioGroup, RadioGroupItem, RadioGroupCard };