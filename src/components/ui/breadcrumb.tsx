"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  animated?: boolean;
}

function Breadcrumb({ animated = true, ...props }: BreadcrumbProps) {
  const breadcrumbVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any;
    return (
      <motion.nav
        aria-label="breadcrumb"
        data-slot="breadcrumb"
        variants={breadcrumbVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...motionProps}
      />
    );
  }

  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

interface BreadcrumbItemProps extends React.ComponentProps<"li"> {
  animated?: boolean;
}

function BreadcrumbItem({ className, animated = true, ...props }: BreadcrumbItemProps) {
  const itemVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any;
    return (
      <motion.li
        data-slot="breadcrumb-item"
        className={cn("inline-flex items-center gap-1.5", className)}
        variants={itemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...motionProps}
      />
    );
  }

  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-medium font-headline", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5 text-muted-foreground/60", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}