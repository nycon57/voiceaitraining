"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground [a&]:hover:bg-primary [a&]:hover:scale-105",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground [a&]:hover:bg-secondary [a&]:hover:scale-105",
        destructive:
          "border-transparent bg-destructive/90 text-white [a&]:hover:bg-destructive [a&]:hover:scale-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "text-foreground border-border/50 bg-background/80 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:scale-105",
        muted:
          "bg-muted/80 text-muted-foreground border-transparent [a&]:hover:bg-muted [a&]:hover:scale-105",
        info:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 [a&]:hover:bg-amber-500/20 [a&]:hover:scale-105",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 [a&]:hover:bg-emerald-500/20 [a&]:hover:scale-105",
        warning:
          "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400 [a&]:hover:bg-orange-500/20 [a&]:hover:scale-105",
      },
      size: {
        default: "px-2.5 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  isHeadline = false,
  animated = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    isHeadline?: boolean
    animated?: boolean
  }) {
  // Extract custom props to prevent them from being passed to DOM
  const { asChild: _, isHeadline: __, animated: ___, ...domProps } = { asChild, isHeadline, animated, ...props };
  const Comp = asChild ? Slot : "span"

  const content = (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        isHeadline && "font-headline font-semibold",
        className
      )}
      {...domProps}
    />
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}

export { Badge, badgeVariants };
