"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const tableVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

function Table({
  className,
  animated = false,
  ...props
}: React.ComponentProps<"table"> & {
  animated?: boolean
}) {
  const tableContent = (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border border-border/50 shadow-sm bg-background/50 backdrop-blur-sm"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )

  if (animated) {
    return (
      <motion.div
        variants={tableVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {tableContent}
      </motion.div>
    )
  }

  return tableContent
}

function TableHeader({
  className,
  isHeadline = false,
  ...props
}: React.ComponentProps<"thead"> & {
  isHeadline?: boolean
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-border/50 bg-muted/30",
        isHeadline && "font-headline",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/40 data-[state=selected]:bg-muted/60 border-b border-border/30",
        "transition-all duration-200 hover:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  isHeadline = false,
  ...props
}: React.ComponentProps<"th"> & {
  isHeadline?: boolean
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-12 px-4 text-left align-middle font-semibold whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "tracking-wide text-sm",
        isHeadline && "font-headline",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "text-sm",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  isHeadline = false,
  ...props
}: React.ComponentProps<"caption"> & {
  isHeadline?: boolean
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "text-muted-foreground mt-4 text-sm font-medium",
        isHeadline && "font-headline font-semibold",
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}