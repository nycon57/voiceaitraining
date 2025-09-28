"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full shadow-sm",
  {
    variants: {
      size: {
        default: "h-2",
        sm: "h-1.5",
        lg: "h-3",
        xl: "h-4"
      },
      variant: {
        default: "bg-primary/20",
        secondary: "bg-secondary/20",
        success: "bg-emerald-500/20",
        warning: "bg-amber-500/20",
        destructive: "bg-destructive/20"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        destructive: "bg-destructive"
      },
      animated: {
        true: "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      animated: false
    }
  }
)

function Progress({
  className,
  value,
  size,
  variant,
  animated = false,
  showLabel = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> & {
    animated?: boolean
    showLabel?: boolean
  }) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    if (animated && value !== undefined) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    } else if (value !== undefined) {
      setDisplayValue(value)
    }
  }, [value, animated])

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(displayValue || 0)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(progressVariants({ size, variant }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(indicatorVariants({ variant, animated }))}
          style={{
            transform: `translateX(-${100 - (displayValue || 0)}%)`,
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

export { Progress }