"use client";

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "rounded-md relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-muted/60 animate-pulse",
        shimmer: "bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60 bg-[length:200%_100%] animate-shimmer",
        wave: "bg-muted/60 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-wave"
      },
      speed: {
        slow: "animate-pulse [animation-duration:2s]",
        normal: "",
        fast: "animate-pulse [animation-duration:0.8s]"
      }
    },
    defaultVariants: {
      variant: "default",
      speed: "normal"
    }
  }
)

function Skeleton({
  className,
  variant,
  speed,
  animated = true,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof skeletonVariants> & {
    animated?: boolean
  }) {
  // Extract animated from props to prevent it from being passed to DOM
  const { animated: _, ...domProps } = { animated, ...props };
  const skeletonContent = (
    <div
      data-slot="skeleton"
      className={cn(
        skeletonVariants({ variant, speed }),
        !animated && "animate-none",
        className
      )}
      {...domProps}
    />
  )

  if (animated && variant === "shimmer") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {skeletonContent}
      </motion.div>
    )
  }

  return skeletonContent
}

export { Skeleton }
