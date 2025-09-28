'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputOTPVariants = cva(
  'disabled:cursor-not-allowed transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        success: '[&>div>div]:border-green-300 [&>div>div]:focus:border-green-500 [&>div>div]:focus:ring-green-500/20',
        warning: '[&>div>div]:border-amber-300 [&>div>div]:focus:border-amber-500 [&>div>div]:focus:ring-amber-500/20',
        destructive: '[&>div>div]:border-red-300 [&>div>div]:focus:border-red-500 [&>div>div]:focus:ring-red-500/20',
      },
      size: {
        sm: '[&>div>div]:h-8 [&>div>div]:w-8 [&>div>div]:text-sm',
        md: '[&>div>div]:h-9 [&>div>div]:w-9 [&>div>div]:text-sm',
        lg: '[&>div>div]:h-10 [&>div>div]:w-10 [&>div>div]:text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface InputOTPProps
  extends React.ComponentProps<typeof OTPInput>,
    VariantProps<typeof inputOTPVariants> {
  containerClassName?: string;
  animated?: boolean;
}

interface InputOTPSlotProps extends React.ComponentProps<'div'> {
  index: number;
  animated?: boolean;
}

function InputOTP({
  className,
  containerClassName,
  variant,
  size,
  animated = true,
  ...props
}: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName
      )}
      className={cn(inputOTPVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function InputOTPGroup({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function InputOTPSlot({
  index,
  className,
  animated = true,
  ...props
}: InputOTPSlotProps) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  const slotVariants = {
    initial: { scale: 0.95, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 },
    filled: { scale: 1, opacity: 1 },
    empty: { scale: 1, opacity: 0.9 },
  };

  const getVariant = () => {
    if (isActive) return 'active';
    if (char) return 'filled';
    return 'empty';
  };

  return (
    <motion.div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px] hover:border-ring/60',
        className
      )}
      variants={animated ? slotVariants : undefined}
      animate={animated ? getVariant() : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {char && animated ? (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ) : (
        char
      )}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="bg-foreground h-4 w-px"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.div>
  );
}

function InputOTPSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className={cn('text-muted-foreground flex items-center justify-center', className)}
      {...props}
    >
      <MinusIcon className="size-4" />
    </div>
  );
}

// Enhanced pattern component for common OTP patterns
interface InputOTPPatternProps {
  length?: number;
  pattern?: 'numeric' | 'alphanumeric' | 'alphabetic';
  onComplete?: (value: string) => void;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

function InputOTPPattern({
  length = 6,
  pattern = 'numeric',
  onComplete,
  variant = 'default',
  size = 'md',
  animated = true,
  className,
}: InputOTPPatternProps) {
  const patternMap = {
    numeric: /^[0-9]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    alphabetic: /^[a-zA-Z]+$/,
  };

  return (
    <InputOTP
      maxLength={length}
      pattern={patternMap[pattern].source}
      onComplete={onComplete}
      variant={variant}
      size={size}
      animated={animated}
      className={className}
    >
      <InputOTPGroup>
        {Array.from({ length }, (_, i) => (
          <InputOTPSlot key={i} index={i} animated={animated} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, InputOTPPattern };
