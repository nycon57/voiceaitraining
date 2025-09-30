"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Props for SkeletonCard component
 */
export interface SkeletonCardProps {
  /**
   * Number of text lines to show in the card body
   * @default 2
   */
  lines?: number

  /**
   * Show an icon placeholder in the header
   * @default false
   */
  hasIcon?: boolean

  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonCard - Loading skeleton that matches StatCard component layout
 *
 * Displays an animated placeholder with header (title + optional icon) and
 * configurable number of content lines. Matches the exact dimensions and spacing
 * of the StatCard component for seamless loading states.
 *
 * @example
 * ```tsx
 * <SkeletonCard hasIcon lines={3} />
 * ```
 */
export function SkeletonCard({
  lines = 2,
  hasIcon = false,
  className,
  variant = "shimmer"
}: SkeletonCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton variant={variant} className="h-4 w-24" />
        {hasIcon && <Skeleton variant={variant} className="h-4 w-4 rounded" />}
      </CardHeader>
      <CardContent>
        <Skeleton variant={variant} className="h-8 w-16 mb-2" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant={variant}
              className={cn("h-3", i === lines - 1 ? "w-3/4" : "w-full")}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Props for SkeletonTable component
 */
export interface SkeletonTableProps {
  /**
   * Number of rows to display (excluding header)
   * @default 5
   */
  rows?: number

  /**
   * Number of columns to display
   * @default 4
   */
  columns?: number

  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonTable - Loading skeleton for data tables
 *
 * Displays a table structure with animated placeholders for headers and data rows.
 * Matches the styling and spacing of the application's Table component with
 * proper borders, padding, and responsive layout.
 *
 * @example
 * ```tsx
 * <SkeletonTable rows={10} columns={5} />
 * ```
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  variant = "shimmer"
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto rounded-lg border border-border/50 shadow-sm bg-background/50 backdrop-blur-sm",
        className
      )}
    >
      <table className="w-full caption-bottom text-sm">
        {/* Table Header */}
        <thead className="border-b border-border/50 bg-muted/30">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle">
                <Skeleton
                  variant={variant}
                  className={cn(
                    "h-4",
                    i === 0 ? "w-32" : i === columns - 1 ? "w-20" : "w-24"
                  )}
                />
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border/30 hover:bg-muted/40 transition-colors"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-4 align-middle">
                  <Skeleton
                    variant={variant}
                    className={cn(
                      "h-4",
                      colIndex === 0 ? "w-40" : colIndex === columns - 1 ? "w-16" : "w-28"
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Props for SkeletonChart component
 */
export interface SkeletonChartProps {
  /**
   * Type of chart being loaded
   * @default 'line'
   */
  type?: "line" | "bar" | "area"

  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Height of the chart skeleton
   * @default "h-[350px]"
   */
  height?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonChart - Loading skeleton for chart components
 *
 * Displays a visual placeholder representing a chart with axes, grid lines,
 * and data visualization shapes. Adapts its appearance based on chart type
 * (line, bar, area) to provide contextual loading feedback.
 *
 * @example
 * ```tsx
 * <SkeletonChart type="bar" height="h-[400px]" />
 * ```
 */
export function SkeletonChart({
  type = "line",
  className,
  height = "h-[350px]",
  variant = "shimmer"
}: SkeletonChartProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border bg-card p-6",
        height,
        className
      )}
    >
      {/* Chart Title Area */}
      <div className="mb-6 space-y-2">
        <Skeleton variant={variant} className="h-5 w-32" />
        <Skeleton variant={variant} className="h-3 w-48" />
      </div>

      {/* Chart Visualization Area */}
      <div className="relative h-full w-full flex items-end justify-between gap-2 px-4 pb-8">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant={variant} className="h-3 w-8" />
          ))}
        </div>

        {/* Chart bars/lines placeholder */}
        <div className="flex-1 flex items-end justify-around gap-1 ml-12">
          {Array.from({ length: 8 }).map((_, i) => {
            const height = Math.random() * 60 + 40 // Random height between 40-100%

            if (type === "bar") {
              return (
                <Skeleton
                  key={i}
                  variant={variant}
                  className="w-full"
                  style={{ height: `${height}%` }}
                />
              )
            }

            if (type === "line" || type === "area") {
              return (
                <div key={i} className="flex flex-col items-center w-full" style={{ height: "100%" }}>
                  <div className="flex-1" />
                  <Skeleton
                    variant={variant}
                    className="w-2 h-2 rounded-full"
                    style={{ marginBottom: `${height}%` }}
                  />
                </div>
              )
            }

            return null
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant={variant} className="h-3 w-12" />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant={variant} className="h-3 w-3 rounded-full" />
            <Skeleton variant={variant} className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Props for SkeletonList component
 */
export interface SkeletonListProps {
  /**
   * Number of list items to display
   * @default 3
   */
  items?: number

  /**
   * Show avatar placeholder for each item
   * @default false
   */
  hasAvatar?: boolean

  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonList - Loading skeleton for list components
 *
 * Displays a vertical list of placeholder items with optional avatars.
 * Useful for recent activity feeds, user lists, or any vertical content lists.
 * Each item includes a primary line and secondary line with proper spacing.
 *
 * @example
 * ```tsx
 * <SkeletonList items={5} hasAvatar />
 * ```
 */
export function SkeletonList({
  items = 3,
  hasAvatar = false,
  className,
  variant = "shimmer"
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            {hasAvatar && (
              <Skeleton variant={variant} className="h-10 w-10 rounded-full" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton variant={variant} className="h-4 w-3/4" />
              <Skeleton variant={variant} className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton variant={variant} className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Props for SkeletonDashboard component
 */
export interface SkeletonDashboardProps {
  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonDashboard - Complete dashboard loading state
 *
 * Displays a full dashboard skeleton with stat cards grid (4 cards) and main
 * content area divided into 8-column and 4-column sections (matching lg:grid-cols-12).
 * Provides a comprehensive loading state for dashboard pages with proper responsive
 * layout that matches the TraineeOverview and other dashboard layouts.
 *
 * @example
 * ```tsx
 * <SkeletonDashboard />
 * ```
 */
export function SkeletonDashboard({
  className,
  variant = "shimmer"
}: SkeletonDashboardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Welcome Header */}
      <div className="space-y-2">
        <Skeleton variant={variant} className="h-9 w-64" />
        <Skeleton variant={variant} className="h-4 w-96" />
      </div>

      {/* Stats Grid - 4 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} hasIcon lines={2} variant={variant} />
        ))}
      </div>

      {/* Main Content Grid - 8/4 column split */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content Area - 8 columns */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton variant={variant} className="h-6 w-48" />
              <Skeleton variant={variant} className="h-4 w-72" />
            </div>
          </CardHeader>
          <CardContent>
            <SkeletonList items={3} variant={variant} />
          </CardContent>
        </Card>

        {/* Sidebar - 4 columns */}
        <div className="space-y-6 lg:col-span-4">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <Skeleton variant={variant} className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton variant={variant} className="h-10 w-full rounded-md" />
              <Skeleton variant={variant} className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <Skeleton variant={variant} className="h-6 w-40" />
                <Skeleton variant={variant} className="h-4 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Skeleton variant={variant} className="h-4 w-32" />
                      <Skeleton variant={variant} className="h-3 w-20" />
                    </div>
                    <Skeleton variant={variant} className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Props for SkeletonText component
 */
export interface SkeletonTextProps {
  /**
   * Number of text lines to display
   * @default 1
   */
  lines?: number

  /**
   * Width pattern for lines
   * @default "full"
   */
  width?: "full" | "varied" | "short" | "medium" | "long"

  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonText - Loading skeleton for text content
 *
 * Displays placeholder lines for text content with configurable patterns.
 * Useful for loading states of paragraphs, descriptions, or any text blocks.
 * Last line is automatically shortened for natural appearance.
 *
 * @example
 * ```tsx
 * <SkeletonText lines={3} width="varied" />
 * ```
 */
export function SkeletonText({
  lines = 1,
  width = "full",
  className,
  variant = "shimmer"
}: SkeletonTextProps) {
  const getWidth = (index: number, total: number) => {
    if (width === "full") return "w-full"
    if (width === "short") return "w-1/3"
    if (width === "medium") return "w-1/2"
    if (width === "long") return "w-3/4"

    // Varied pattern: last line is shorter
    if (index === total - 1) return "w-3/4"
    return "w-full"
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={cn("h-4", getWidth(i, lines))}
        />
      ))}
    </div>
  )
}

/**
 * Props for SkeletonForm component
 */
export interface SkeletonFormProps {
  /**
   * Number of form fields to display
   * @default 3
   */
  fields?: number

  /**
   * Show submit button at the bottom
   * @default true
   */
  hasButton?: boolean

  /**
   * Custom className for additional styling
   */
  className?: string

  /**
   * Variant of the skeleton animation
   * @default "shimmer"
   */
  variant?: "default" | "shimmer" | "wave"
}

/**
 * SkeletonForm - Loading skeleton for form components
 *
 * Displays placeholder form fields with labels and inputs.
 * Useful for loading states of settings forms, edit dialogs, or any form layouts.
 *
 * @example
 * ```tsx
 * <SkeletonForm fields={5} hasButton />
 * ```
 */
export function SkeletonForm({
  fields = 3,
  hasButton = true,
  className,
  variant = "shimmer"
}: SkeletonFormProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant={variant} className="h-4 w-24" />
          <Skeleton variant={variant} className="h-10 w-full rounded-md" />
        </div>
      ))}
      {hasButton && (
        <div className="pt-4">
          <Skeleton variant={variant} className="h-10 w-32 rounded-md" />
        </div>
      )}
    </div>
  )
}