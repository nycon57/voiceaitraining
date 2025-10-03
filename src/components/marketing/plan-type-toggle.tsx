"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface PlanTypeToggleProps {
  value: 'individual' | 'team'
  onChange: (value: 'individual' | 'team') => void
  className?: string
}

export function PlanTypeToggle({ value, onChange, className }: PlanTypeToggleProps) {
  return (
    <div className={cn("inline-flex items-center rounded-lg border bg-muted/50 p-1", className)}>
      <button
        type="button"
        onClick={() => onChange('individual')}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-all",
          value === 'individual'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Individual
      </button>
      <button
        type="button"
        onClick={() => onChange('team')}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-all",
          value === 'team'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Team
      </button>
    </div>
  )
}

interface BillingIntervalToggleProps {
  value: 'monthly' | 'annual'
  onChange: (value: 'monthly' | 'annual') => void
  savings?: string
  className?: string
}

export function BillingIntervalToggle({ value, onChange, savings, className }: BillingIntervalToggleProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={cn(
          "text-sm font-medium transition-colors",
          value === 'monthly'
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <div className="inline-flex items-center rounded-lg border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            value === 'monthly'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange('annual')}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            value === 'annual'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          Annual
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange('annual')}
        className={cn(
          "text-sm font-medium transition-colors",
          value === 'annual'
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Annual {savings && <span className="ml-1 text-xs text-green-600 dark:text-green-400">({savings})</span>}
      </button>
    </div>
  )
}