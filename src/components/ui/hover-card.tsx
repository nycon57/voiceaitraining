'use client';

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface HoverCardContentProps extends React.ComponentProps<typeof HoverCardPrimitive.Content> {
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glassMorphism?: boolean;
}

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      className={cn('transition-all duration-200 hover:scale-105', className)}
      {...props}
    >
      {children}
    </HoverCardPrimitive.Trigger>
  );
}

const sizeVariants = {
  sm: 'w-48',
  md: 'w-64',
  lg: 'w-80',
  xl: 'w-96',
};

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 8,
  animated = true,
  size = 'md',
  glassMorphism = true,
  children,
  ...props
}: HoverCardContentProps) {
  const variants = {
    initial: { opacity: 0, scale: 0.95, y: -5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -5 }
  };

  const baseClasses = cn(
    'z-50 origin-[--radix-hover-card-content-transform-origin] rounded-md border p-4 shadow-lg outline-hidden',
    sizeVariants[size],
    glassMorphism
      ? 'bg-popover/95 text-popover-foreground backdrop-blur-sm'
      : 'bg-popover text-popover-foreground',
    className
  );

  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      {animated ? (
        <HoverCardPrimitive.Content asChild align={align} sideOffset={sideOffset} {...props}>
          <motion.div
            data-slot="hover-card-content"
            className={baseClasses}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </HoverCardPrimitive.Content>
      ) : (
        <HoverCardPrimitive.Content
          data-slot="hover-card-content"
          align={align}
          sideOffset={sideOffset}
          className={cn(
            baseClasses,
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          {...props}
        >
          {children}
        </HoverCardPrimitive.Content>
      )}
    </HoverCardPrimitive.Portal>
  );
}

// Additional utility components for common hover card patterns
function HoverCardHeader({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pb-2 border-b border-border/50', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function HoverCardTitle({
  className,
  isHeadline = true,
  ...props
}: React.ComponentProps<'h3'> & { isHeadline?: boolean }) {
  return (
    <h3
      className={cn(
        'text-sm font-semibold leading-none',
        isHeadline && 'font-headline',
        className
      )}
      {...props}
    />
  );
}

function HoverCardDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground mt-1', className)}
      {...props}
    />
  );
}

function HoverCardFooter({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pt-2 mt-2 border-t border-border/50', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardDescription,
  HoverCardFooter,
};