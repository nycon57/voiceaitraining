"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  animated?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, animated = true, ...props }, ref) => {
    // Extract animated from props to prevent it from being passed to DOM
    const { animated: _, ...domProps } = { animated, ...props };
    const inputVariants = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    };

    const inputClasses = cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      'hover:border-accent-foreground/50 transition-all duration-200',
      className,
    );

    if (animated) {
      return (
        <motion.input
          type={type}
          data-slot="input"
          className={inputClasses}
          ref={ref}
          variants={inputVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          {...domProps}
        />
      );
    }

    return (
      <input
        type={type}
        data-slot="input"
        className={inputClasses}
        ref={ref}
        {...domProps}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
