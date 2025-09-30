/**
 * Dashboard Utility Functions
 *
 * Centralized utilities for dashboard components including color mapping,
 * formatting, and status management.
 */

import type { BadgeProps } from "@/components/ui/badge"

/**
 * Get color classes for score-based metrics
 * @param score - Numeric score (0-100)
 * @returns Tailwind color classes
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-success dark:text-success'
  if (score >= 70) return 'text-warning dark:text-warning'
  return 'text-destructive dark:text-destructive'
}

/**
 * Get badge variant based on status
 * @param status - Status string
 * @returns Badge variant
 */
export function getStatusVariant(status: string): BadgeProps['variant'] {
  const statusMap: Record<string, BadgeProps['variant']> = {
    completed: 'default',
    active: 'secondary',
    in_progress: 'secondary',
    pending: 'outline',
    overdue: 'destructive',
    draft: 'outline',
    published: 'default',
    archived: 'outline'
  }

  return statusMap[status.toLowerCase()] || 'outline'
}

/**
 * Get color classes for difficulty levels
 * @param difficulty - Difficulty level
 * @returns Tailwind color classes
 */
export function getDifficultyColor(difficulty: string): string {
  const difficultyMap: Record<string, string> = {
    easy: 'text-success bg-success/10 border-success/20',
    medium: 'text-warning bg-warning/10 border-warning/20',
    hard: 'text-destructive bg-destructive/10 border-destructive/20',
    expert: 'text-primary bg-primary/10 border-primary/20'
  }

  return difficultyMap[difficulty.toLowerCase()] || 'text-muted-foreground bg-muted'
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`
}

/**
 * Format percentage change with sign
 * @param value - Numeric percentage value
 * @returns Formatted percentage string with + or - sign
 */
export function formatPercentageChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Get trend indicator data
 * @param current - Current value
 * @param previous - Previous value
 * @returns Trend data with direction and percentage
 */
export function getTrend(current: number, previous: number) {
  const change = current - previous
  const percentage = previous !== 0 ? (change / previous) * 100 : 0

  return {
    direction: change >= 0 ? 'up' as const : 'down' as const,
    value: formatPercentageChange(percentage),
    isPositive: change >= 0
  }
}

/**
 * Generate avatar fallback from name
 * @param name - Full name
 * @returns Two-letter initials
 */
export function generateAvatarFallback(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Get severity-based alert colors
 * @param severity - Alert severity level
 * @returns Tailwind color classes for alert
 */
export function getAlertColors(severity: 'info' | 'success' | 'warning' | 'error'): string {
  const severityMap = {
    info: 'bg-info/10 border-info/20 text-info-foreground',
    success: 'bg-success/10 border-success/20 text-success-foreground',
    warning: 'bg-warning/10 border-warning/20 text-warning-foreground',
    error: 'bg-destructive/10 border-destructive/20 text-destructive-foreground'
  }

  return severityMap[severity]
}

/**
 * Get progress bar color based on completion percentage
 * @param progress - Progress percentage (0-100)
 * @returns Tailwind color class for progress bar
 */
export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-success'
  if (progress >= 75) return 'bg-primary'
  if (progress >= 50) return 'bg-warning'
  return 'bg-destructive'
}

/**
 * Format large numbers with K/M/B suffixes
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
  return `${(num / 1000000000).toFixed(1)}B`
}

/**
 * Get relative time string
 * @param date - Date to compare
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return date.toLocaleDateString()
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}