"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface TooltipProviderProps extends React.ComponentProps<typeof TooltipPrimitive.Provider> {
  delayDuration?: number;
  animated?: boolean;
}

function TooltipProvider({
  delayDuration = 200,
  animated = true,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

interface TooltipProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {
  delayDuration?: number;
}

function Tooltip({
  delayDuration = 200,
  ...props
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

interface TooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  animated?: boolean;
  variant?: "default" | "destructive" | "secondary";
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  animated = true,
  variant = "default",
  ...props
}: TooltipContentProps) {
  const contentVariants = {
    initial: { opacity: 0, scale: 0.8, y: variant === "default" ? 10 : 0 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: variant === "default" ? -10 : 0 }
  };

  const variantStyles = {
    default: "bg-foreground text-background",
    destructive: "bg-destructive text-destructive-foreground border border-destructive/20",
    secondary: "bg-secondary text-secondary-foreground border border-border"
  };

  const arrowVariantStyles = {
    default: "bg-foreground fill-foreground",
    destructive: "bg-destructive fill-destructive",
    secondary: "bg-secondary fill-secondary"
  };

  const tooltipClasses = cn(
    "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-2 text-xs text-balance font-medium",
    "backdrop-blur-sm shadow-lg",
    variantStyles[variant],
    className
  );

  if (animated) {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          asChild
          {...props}
        >
          <motion.div
            className={tooltipClasses}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {children}
            <TooltipPrimitive.Arrow
              className={cn(
                "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
                arrowVariantStyles[variant]
              )}
            />
          </motion.div>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={tooltipClasses}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
            arrowVariantStyles[variant]
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
