'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glassMorphism?: boolean;
  showCloseButton?: boolean;
}

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn('transition-all duration-200 hover:scale-105', className)}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
}

const sizeVariants = {
  sm: 'w-56',
  md: 'w-72',
  lg: 'w-80',
  xl: 'w-96',
};

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  size = 'md',
  animated = true,
  glassMorphism = true,
  showCloseButton = false,
  children,
  ...props
}: PopoverContentProps) {
  const variants = {
    initial: { opacity: 0, scale: 0.95, y: -5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -5 }
  };

  const baseClasses = cn(
    'z-50 origin-[--radix-popover-content-transform-origin] rounded-md border p-4 shadow-lg outline-hidden',
    sizeVariants[size],
    glassMorphism
      ? 'bg-popover/95 text-popover-foreground backdrop-blur-sm'
      : 'bg-popover text-popover-foreground',
    className
  );

  return (
    <PopoverPrimitive.Portal>
      {animated ? (
        <PopoverPrimitive.Content asChild align={align} sideOffset={sideOffset} {...props}>
          <motion.div
            data-slot="popover-content"
            className={baseClasses}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {showCloseButton && (
              <PopoverPrimitive.Close className="absolute top-2 right-2 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden p-1">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </PopoverPrimitive.Close>
            )}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </PopoverPrimitive.Content>
      ) : (
        <PopoverPrimitive.Content
          data-slot="popover-content"
          align={align}
          sideOffset={sideOffset}
          className={cn(
            baseClasses,
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          {...props}
        >
          {showCloseButton && (
            <PopoverPrimitive.Close className="absolute top-2 right-2 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden p-1">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </PopoverPrimitive.Close>
          )}
          {children}
        </PopoverPrimitive.Content>
      )}
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

// Additional utility components for common popover patterns
function PopoverHeader({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pb-3 border-b border-border/50', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function PopoverTitle({
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

function PopoverDescription({
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

function PopoverFooter({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pt-3 mt-3 border-t border-border/50', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverFooter,
};
