"use client";

import * as React from "react";
import { type LucideIcon, List, Search, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================================================
// EmptyState - General purpose empty state component
// ============================================================================

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Headline title using Space Grotesk font */
  title: string;
  /** Description text below the title */
  description: string;
  /** Optional action button configuration */
  action?: EmptyStateAction;
  /** Additional CSS classes */
  className?: string;
  /** Disable animation */
  animated?: boolean;
}

/**
 * EmptyState - General purpose empty state component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No messages yet"
 *   description="When someone sends you a message, it will appear here."
 *   action={{
 *     label: "Compose message",
 *     onClick: () => console.log("Compose"),
 *     icon: Plus
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  animated = true,
}: EmptyStateProps) {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const containerTransition = {
    duration: 0.3,
    ease: "easeOut" as const,
    staggerChildren: 0.1,
  };

  const content = (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <h3 className="font-headline text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size="default"
          className="mt-2"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={containerTransition}
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12 px-4",
          className
        )}
      >
        <motion.div variants={itemVariants} className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-2 text-center">
          <h3 className="font-headline text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </motion.div>
        {action && (
          <motion.div variants={itemVariants}>
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size="default"
              className="mt-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 px-4",
        className
      )}
    >
      {content}
    </div>
  );
}

// ============================================================================
// EmptyStateList - For empty lists/tables
// ============================================================================

export interface EmptyStateListProps {
  /** Title text for the empty list */
  title: string;
  /** Description text explaining the empty state */
  description: string;
  /** Callback when create button is clicked */
  onCreate?: () => void;
  /** Label for the create button */
  createLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disable animation */
  animated?: boolean;
  /** Custom icon (defaults to List) */
  icon?: LucideIcon;
}

/**
 * EmptyStateList - For empty lists/tables
 *
 * @example
 * ```tsx
 * <EmptyStateList
 *   title="No scenarios yet"
 *   description="Get started by creating your first training scenario."
 *   onCreate={() => router.push('/scenarios/new')}
 *   createLabel="Create scenario"
 * />
 * ```
 */
export function EmptyStateList({
  title,
  description,
  onCreate,
  createLabel = "Create",
  className,
  animated = true,
  icon: CustomIcon,
}: EmptyStateListProps) {
  const Icon = CustomIcon || List;

  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      action={
        onCreate
          ? {
              label: createLabel,
              onClick: onCreate,
              variant: "default",
            }
          : undefined
      }
      className={className}
      animated={animated}
    />
  );
}

// ============================================================================
// EmptyStateSearch - For no search results
// ============================================================================

export interface EmptyStateSearchProps {
  /** The search query that returned no results */
  searchQuery: string;
  /** Callback when clear search is clicked */
  onClear: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable animation */
  animated?: boolean;
  /** Optional custom description */
  description?: string;
}

/**
 * EmptyStateSearch - For no search results
 *
 * @example
 * ```tsx
 * <EmptyStateSearch
 *   searchQuery={searchTerm}
 *   onClear={() => setSearchTerm("")}
 * />
 * ```
 */
export function EmptyStateSearch({
  searchQuery,
  onClear,
  className,
  animated = true,
  description,
}: EmptyStateSearchProps) {
  return (
    <EmptyState
      icon={Search}
      title={`No results for "${searchQuery}"`}
      description={
        description ||
        "Try adjusting your search terms or filters to find what you're looking for."
      }
      action={{
        label: "Clear search",
        onClick: onClear,
        variant: "outline",
        icon: X,
      }}
      className={className}
      animated={animated}
    />
  );
}

// ============================================================================
// EmptyStateError - For error states
// ============================================================================

export interface EmptyStateErrorProps {
  /** Error title */
  title: string;
  /** Error description */
  description: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Label for the retry button */
  retryLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disable animation */
  animated?: boolean;
}

/**
 * EmptyStateError - For error states
 *
 * @example
 * ```tsx
 * <EmptyStateError
 *   title="Failed to load scenarios"
 *   description="We couldn't fetch your training scenarios. Please try again."
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function EmptyStateError({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  className,
  animated = true,
}: EmptyStateErrorProps) {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const containerTransition = {
    duration: 0.3,
    ease: "easeOut" as const,
    staggerChildren: 0.1,
  };

  const content = (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2 text-center">
        <h3 className="font-headline text-xl font-semibold tracking-tight text-destructive">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="destructive"
          size="default"
          className="mt-2"
        >
          {retryLabel}
        </Button>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={containerTransition}
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12 px-4",
          className
        )}
      >
        <motion.div variants={itemVariants} className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-2 text-center">
          <h3 className="font-headline text-xl font-semibold tracking-tight text-destructive">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </motion.div>
        {onRetry && (
          <motion.div variants={itemVariants}>
            <Button
              onClick={onRetry}
              variant="destructive"
              size="default"
              className="mt-2"
            >
              {retryLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 px-4",
        className
      )}
    >
      {content}
    </div>
  );
}

// Export all types for external use
export type {
  EmptyStateProps as EmptyStateComponentProps,
  EmptyStateListProps as EmptyStateListComponentProps,
  EmptyStateSearchProps as EmptyStateSearchComponentProps,
  EmptyStateErrorProps as EmptyStateErrorComponentProps,
};