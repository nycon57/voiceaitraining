"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

const contentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  isHeadline = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  isHeadline?: boolean
}) {
  return (
    <motion.div
      variants={tabVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2 }}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "bg-muted/60 dark:bg-muted/30 text-muted-foreground backdrop-blur-sm border border-border/50",
          "inline-flex h-10 w-fit items-center justify-center rounded-lg p-1",
          "shadow-sm hover:shadow-md transition-all duration-200",
          isHeadline && "font-headline font-semibold",
          className
        )}
        {...props}
      />
    </motion.div>
  )
}

function TabsTrigger({
  className,
  isHeadline = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  isHeadline?: boolean
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring",
        "dark:data-[state=active]:border-input dark:data-[state=active]:bg-background/80",
        "text-foreground dark:text-muted-foreground",
        "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent",
        "px-3 py-1.5 text-sm font-medium whitespace-nowrap",
        "transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-1",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]",
        "hover:bg-background/50 hover:text-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isHeadline && "font-headline font-semibold",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <TabsPrimitive.Content
        data-slot="tabs-content"
        className={cn("flex-1 outline-none", className)}
        value={value}
        {...props}
      >
        {children}
      </TabsPrimitive.Content>
    )
  }

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      value={value}
      {...props}
      asChild
    >
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
