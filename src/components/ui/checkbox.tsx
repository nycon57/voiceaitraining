"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer shrink-0 rounded border shadow-sm transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "size-4 rounded-[4px]",
        sm: "size-3.5 rounded-[3px]",
        lg: "size-5 rounded-[5px]"
      },
      variant: {
        default: "border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50",
        success: "border-input data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500 focus-visible:ring-emerald-500/50",
        warning: "border-input data-[state=checked]:bg-amber-500 data-[state=checked]:text-white data-[state=checked]:border-amber-500 focus-visible:ring-amber-500/50",
        destructive: "border-input data-[state=checked]:bg-destructive data-[state=checked]:text-white data-[state=checked]:border-destructive focus-visible:ring-destructive/50"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

function Checkbox({
  className,
  size,
  variant,
  animated = false,
  indeterminate = false,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants> & {
    animated?: boolean
    indeterminate?: boolean
  }) {
  const checkboxContent = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        checkboxVariants({ size, variant }),
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
        asChild
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {indeterminate ? (
            <MinusIcon className={cn(size === "sm" ? "size-2.5" : size === "lg" ? "size-4" : "size-3")} />
          ) : (
            <CheckIcon className={cn(size === "sm" ? "size-2.5" : size === "lg" ? "size-4" : "size-3")} />
          )}
        </motion.div>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (animated) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        {checkboxContent}
      </motion.div>
    )
  }

  return checkboxContent
}

export { Checkbox }