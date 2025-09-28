"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground hover:bg-destructive/10"
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  isHeadline = false,
  animated = false,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    isHeadline?: boolean
    animated?: boolean
  }) {
  const toggleContent = (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(
        toggleVariants({ variant, size }),
        isHeadline && "font-headline font-semibold",
        className
      )}
      {...props}
    />
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        {toggleContent}
      </motion.div>
    )
  }

  return toggleContent
}

export { Toggle, toggleVariants }