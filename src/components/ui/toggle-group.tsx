"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { motion } from "framer-motion"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  animated = false,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    animated?: boolean
  }) {
  const groupContent = (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        "border border-border/50 bg-background/50 backdrop-blur-sm p-1",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {groupContent}
      </motion.div>
    )
  }

  return groupContent
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  animated = false,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants> & {
    animated?: boolean
  }) {
  const context = React.useContext(ToggleGroupContext)

  const itemContent = (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-md shadow-none first:rounded-l-md last:rounded-r-md",
        "focus:z-10 focus-visible:z-10",
        "data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        "hover:bg-muted/50 data-[state=on]:bg-accent/80",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {itemContent}
      </motion.div>
    )
  }

  return itemContent
}

export { ToggleGroup, ToggleGroupItem }