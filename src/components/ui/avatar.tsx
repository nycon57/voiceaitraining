"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full shadow-sm border border-border/50",
  {
    variants: {
      size: {
        sm: "size-6",
        default: "size-8",
        lg: "size-10",
        xl: "size-12",
        "2xl": "size-16"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

function Avatar({
  className,
  size,
  animated = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & {
    animated?: boolean
  }) {
  const avatarContent = (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {avatarContent}
      </motion.div>
    )
  }

  return avatarContent
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover transition-all duration-200", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  isHeadline = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  isHeadline?: boolean
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted/80 backdrop-blur-sm flex size-full items-center justify-center rounded-full",
        "text-muted-foreground font-medium text-sm transition-colors duration-200",
        isHeadline && "font-headline font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }