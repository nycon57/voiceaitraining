'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const separatorVariants = cva(
  'shrink-0 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-border',
        accent: 'bg-accent',
        muted: 'bg-muted',
        primary: 'bg-primary/20',
        success: 'bg-green-200 dark:bg-green-800',
        warning: 'bg-amber-200 dark:bg-amber-800',
        destructive: 'bg-red-200 dark:bg-red-800',
      },
      thickness: {
        thin: 'data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px',
        medium: 'data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5',
        thick: 'data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1',
      },
      spacing: {
        none: '',
        sm: 'data-[orientation=horizontal]:my-2 data-[orientation=vertical]:mx-2',
        md: 'data-[orientation=horizontal]:my-4 data-[orientation=vertical]:mx-4',
        lg: 'data-[orientation=horizontal]:my-6 data-[orientation=vertical]:mx-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      thickness: 'thin',
      spacing: 'none',
    },
  }
);

interface SeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  animated?: boolean;
  gradient?: boolean;
}

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  variant,
  thickness,
  spacing,
  animated = false,
  gradient = false,
  ...props
}: SeparatorProps) {
  const baseClasses = cn(
    separatorVariants({ variant, thickness, spacing }),
    'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full',
    gradient && orientation === 'horizontal' && 'bg-gradient-to-r from-transparent via-border to-transparent',
    gradient && orientation === 'vertical' && 'bg-gradient-to-b from-transparent via-border to-transparent',
    className
  );

  if (animated) {
    const variants = {
      initial: {
        opacity: 0,
        scaleX: orientation === 'horizontal' ? 0 : 1,
        scaleY: orientation === 'vertical' ? 0 : 1,
      },
      animate: {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
      },
    };

    return (
      <SeparatorPrimitive.Root
        data-slot="separator"
        decorative={decorative}
        orientation={orientation}
        className={baseClasses}
        {...props}
        asChild
      >
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </SeparatorPrimitive.Root>
    );
  }

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={baseClasses}
      {...props}
    />
  );
}

// Enhanced separator with text content
interface SeparatorWithTextProps extends Omit<SeparatorProps, 'orientation'> {
  children: React.ReactNode;
  position?: 'left' | 'center' | 'right';
}

function SeparatorWithText({
  children,
  className,
  position = 'center',
  variant = 'default',
  animated = false,
  ...props
}: SeparatorWithTextProps) {
  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={cn(
        'relative flex items-center',
        positionClasses[position],
        className
      )}
    >
      <Separator
        className="flex-1"
        variant={variant}
        animated={animated}
        {...props}
      />
      <span className="bg-background px-3 text-xs font-medium text-muted-foreground font-headline">
        {children}
      </span>
      <Separator
        className="flex-1"
        variant={variant}
        animated={animated}
        {...props}
      />
    </div>
  );
}

// Decorative separator with icons
interface SeparatorWithIconProps extends Omit<SeparatorProps, 'orientation'> {
  icon: React.ReactNode;
}

function SeparatorWithIcon({
  icon,
  className,
  variant = 'default',
  animated = false,
  ...props
}: SeparatorWithIconProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <Separator
        className="flex-1"
        variant={variant}
        animated={animated}
        {...props}
      />
      <div className="bg-background px-2 text-muted-foreground">
        {icon}
      </div>
      <Separator
        className="flex-1"
        variant={variant}
        animated={animated}
        {...props}
      />
    </div>
  );
}

export { Separator, SeparatorWithText, SeparatorWithIcon };
