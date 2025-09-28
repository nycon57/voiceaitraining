"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-sm transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-5 w-9",
        sm: "h-4 w-7",
        lg: "h-6 w-11"
      },
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 focus-visible:border-ring focus-visible:ring-ring/50",
        success: "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-input focus-visible:ring-emerald-500/50",
        warning: "data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-input focus-visible:ring-amber-500/50",
        destructive: "data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input focus-visible:ring-destructive/50"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-full ring-0 transition-all duration-200 shadow-sm",
  {
    variants: {
      size: {
        default: "size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
        sm: "size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0.5",
        lg: "size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

function Switch({
  className,
  size,
  variant,
  animated = false,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants> & {
    animated?: boolean
  }) {
  const switchContent = (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ size, variant }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          thumbVariants({ size }),
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )

  if (animated) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        {switchContent}
      </motion.div>
    )
  }

  return switchContent
}

export { Switch }