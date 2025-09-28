'use client';

import * as React from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface AspectRatioProps extends React.ComponentProps<typeof AspectRatioPrimitive.Root> {
  animated?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  overlay?: boolean;
  overlayContent?: React.ReactNode;
}

const roundedVariants = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

function AspectRatio({
  className,
  children,
  animated = false,
  rounded = 'md',
  overlay = false,
  overlayContent,
  ...props
}: AspectRatioProps) {
  const variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const content = (
    <div className={cn('relative overflow-hidden', roundedVariants[rounded], className)}>
      {children}
      {overlay && overlayContent && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center">
          {overlayContent}
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props}>
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {content}
        </motion.div>
      </AspectRatioPrimitive.Root>
    );
  }

  return (
    <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props}>
      {content}
    </AspectRatioPrimitive.Root>
  );
}

export { AspectRatio };