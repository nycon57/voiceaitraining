"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border/50",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 border-destructive/30",
        warning:
          "text-amber-600 bg-amber-50 dark:bg-amber-950/20 [&>svg]:text-current border-amber-200 dark:border-amber-800/30",
        success:
          "text-green-600 bg-green-50 dark:bg-green-950/20 [&>svg]:text-current border-green-200 dark:border-green-800/30",
        info:
          "text-blue-600 bg-blue-50 dark:bg-blue-950/20 [&>svg]:text-current border-blue-200 dark:border-blue-800/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {
  animated?: boolean;
}

function Alert({
  className,
  variant,
  animated = true,
  ...props
}: AlertProps) {
  const alertAnimationVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  const alertClasses = cn(alertVariants({ variant }), className);

  if (animated) {
    return (
      <motion.div
        data-slot="alert"
        role="alert"
        className={alertClasses}
        variants={alertAnimationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="alert"
      role="alert"
      className={alertClasses}
      {...props}
    />
  );
}

interface AlertTitleProps extends React.ComponentProps<"div"> {
  isHeadline?: boolean;
}

function AlertTitle({ className, isHeadline = true, ...props }: AlertTitleProps) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        isHeadline && "font-headline font-semibold",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }