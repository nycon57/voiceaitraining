'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CollapsibleProps extends React.ComponentProps<typeof CollapsiblePrimitive.Root> {
  animated?: boolean;
}

interface CollapsibleTriggerProps extends React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger> {
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'ghost' | 'outline';
}

interface CollapsibleContentProps extends React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent> {
  animated?: boolean;
}

function Collapsible({
  animated = true,
  ...props
}: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

const triggerVariants = {
  default: 'hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
  outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
};

function CollapsibleTrigger({
  className,
  children,
  showIcon = true,
  iconPosition = 'right',
  variant = 'default',
  ...props
}: CollapsibleTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Monitor the data-state attribute to sync with Radix state
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
          const state = trigger.getAttribute('data-state');
          setIsOpen(state === 'open');
        }
      });
    });

    observer.observe(trigger, { attributes: true });

    // Set initial state
    const initialState = trigger.getAttribute('data-state');
    setIsOpen(initialState === 'open');

    return () => observer.disconnect();
  }, []);

  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      ref={triggerRef}
      data-slot="collapsible-trigger"
      className={cn(
        'flex w-full items-center justify-between p-2 text-sm font-medium transition-all duration-200 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        triggerVariants[variant],
        className
      )}
      {...props}
    >
      {iconPosition === 'left' && showIcon && (
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDownIcon className="size-4" />
        </motion.div>
      )}

      <span className={cn('flex-1', iconPosition === 'left' ? 'ml-2' : '', iconPosition === 'right' ? 'text-left' : 'text-center')}>
        {children}
      </span>

      {iconPosition === 'right' && showIcon && (
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDownIcon className="size-4" />
        </motion.div>
      )}
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
}

function CollapsibleContent({
  className,
  children,
  animated = true,
  ...props
}: CollapsibleContentProps) {
  if (animated) {
    return (
      <CollapsiblePrimitive.CollapsibleContent
        data-slot="collapsible-content"
        className={cn('overflow-hidden', className)}
        {...props}
      >
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-2 pt-0">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </CollapsiblePrimitive.CollapsibleContent>
    );
  }

  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="p-2 pt-0">
        {children}
      </div>
    </CollapsiblePrimitive.CollapsibleContent>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
