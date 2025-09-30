"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Target,
  FileText,
  Briefcase,
  Calendar,
  Clock,
  AlertCircle,
  Play,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyStateList } from "@/components/ui/empty-state";

// ============================================================================
// Types
// ============================================================================

export interface AssignmentTask {
  id: string;
  title: string;
  type: "scenario" | "track";
  due_at: string | null;
  status: "not_started" | "in_progress" | "completed";
  progress: number; // 0-100
  best_score?: number | null;
  is_overdue: boolean;
  scenario_id?: string | null;
  track_id?: string | null;
}

export interface TasksTableProps {
  tasks?: AssignmentTask[];
  className?: string;
  onStartTask?: (task: AssignmentTask) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format a date string with urgency context
 */
function formatDueDate(dueDate: string | null, isOverdue: boolean): {
  text: string;
  color: string;
  Icon: typeof Calendar | typeof Clock | typeof AlertCircle;
} {
  if (!dueDate) {
    return {
      text: "No deadline",
      color: "text-muted-foreground",
      Icon: Calendar,
    };
  }

  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (isOverdue) {
    return {
      text: "Overdue",
      color: "text-red-600 dark:text-red-400",
      Icon: AlertCircle,
    };
  }

  if (diffDays <= 3 && diffDays >= 0) {
    const daysText = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays} days`;
    return {
      text: `Due ${daysText}`,
      color: "text-amber-600 dark:text-amber-400",
      Icon: Clock,
    };
  }

  // Format the date nicely
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);

  return {
    text: formattedDate,
    color: "text-muted-foreground",
    Icon: Calendar,
  };
}

/**
 * Get action button props based on status
 */
function getActionButton(status: AssignmentTask["status"]): {
  label: string;
  Icon: typeof Play | typeof ArrowRight | typeof RotateCcw;
  variant: "default" | "outline";
} {
  switch (status) {
    case "not_started":
      return { label: "Start", Icon: Play, variant: "default" };
    case "in_progress":
      return { label: "Continue", Icon: ArrowRight, variant: "default" };
    case "completed":
      return { label: "Retry", Icon: RotateCcw, variant: "outline" };
  }
}

/**
 * Get status badge variant
 */
function getStatusBadgeVariant(
  status: AssignmentTask["status"]
): "outline" | "default" | "success" {
  switch (status) {
    case "not_started":
      return "outline";
    case "in_progress":
      return "default";
    case "completed":
      return "success";
  }
}

/**
 * Get type badge props
 */
function getTypeBadgeProps(type: AssignmentTask["type"]): {
  label: string;
  Icon: typeof FileText | typeof Briefcase;
  variant: "secondary" | "default";
} {
  if (type === "scenario") {
    return { label: "Scenario", Icon: FileText, variant: "secondary" };
  }
  return { label: "Track", Icon: Briefcase, variant: "default" };
}

/**
 * Sort tasks by urgency (overdue first, then by due date)
 */
function sortTasksByUrgency(tasks: AssignmentTask[]): AssignmentTask[] {
  return [...tasks].sort((a, b) => {
    // Overdue tasks first
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;

    // Then by due date (null dates go to end)
    if (!a.due_at && b.due_at) return 1;
    if (a.due_at && !b.due_at) return -1;
    if (!a.due_at && !b.due_at) return 0;

    return new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime();
  });
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function TasksTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Desktop skeleton */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-2 w-32 animate-pulse rounded-full bg-muted" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-9 w-24 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile skeleton */}
      <div className="grid gap-4 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} animated={false}>
            <CardContent className="space-y-4 pt-6">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Mobile Task Card
// ============================================================================

interface TaskCardProps {
  task: AssignmentTask;
  onStartTask?: (task: AssignmentTask) => void;
}

function TaskCard({ task, onStartTask }: TaskCardProps) {
  const { text: dueDateText, color: dueDateColor, Icon: DueDateIcon } = formatDueDate(
    task.due_at,
    task.is_overdue
  );
  const { label: actionLabel, Icon: ActionIcon, variant: actionVariant } =
    getActionButton(task.status);
  const { label: typeLabel, Icon: TypeIcon, variant: typeBadgeVariant } =
    getTypeBadgeProps(task.type);
  const statusVariant = getStatusBadgeVariant(task.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="space-y-4 pt-6">
          {/* Title */}
          <h3 className="font-medium text-base leading-tight">{task.title}</h3>

          {/* Type and Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={typeBadgeVariant}>
              <TypeIcon />
              {typeLabel}
            </Badge>
            <Badge variant={statusVariant}>
              {task.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Due Date */}
          <div className={cn("flex items-center gap-2 text-sm", dueDateColor)}>
            <DueDateIcon className="h-4 w-4" />
            <span>{dueDateText}</span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={task.progress} variant="default" className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            variant={actionVariant}
            size="default"
            onClick={() => onStartTask?.(task)}
          >
            <ActionIcon />
            {actionLabel}
          </Button>

          {/* Best Score (if completed) */}
          {task.status === "completed" && task.best_score !== null && (
            <div className="text-center text-sm text-muted-foreground">
              Best score: <span className="font-medium">{task.best_score}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Desktop Table Row
// ============================================================================

interface TaskRowProps {
  task: AssignmentTask;
  onStartTask?: (task: AssignmentTask) => void;
}

function TaskRow({ task, onStartTask }: TaskRowProps) {
  const { text: dueDateText, color: dueDateColor, Icon: DueDateIcon } = formatDueDate(
    task.due_at,
    task.is_overdue
  );
  const { label: actionLabel, Icon: ActionIcon, variant: actionVariant } =
    getActionButton(task.status);
  const { label: typeLabel, Icon: TypeIcon, variant: typeBadgeVariant } =
    getTypeBadgeProps(task.type);
  const statusVariant = getStatusBadgeVariant(task.status);

  return (
    <TableRow className="group">
      {/* Title */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{task.title}</span>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell>
        <Badge variant={typeBadgeVariant}>
          {typeLabel}
        </Badge>
      </TableCell>

      {/* Due Date */}
      <TableCell>
        <div className={cn("flex items-center gap-2 text-sm", dueDateColor)}>
          <DueDateIcon className="h-4 w-4" />
          <span>{dueDateText}</span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant={statusVariant}>
          {task.status.replace("_", " ")}
        </Badge>
      </TableCell>

      {/* Progress */}
      <TableCell>
        <div className="flex items-center gap-3 min-w-[140px]">
          <Progress value={task.progress} variant="default" className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground w-10 text-right">
            {task.progress}%
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={actionVariant}
          onClick={() => onStartTask?.(task)}
          className="ml-auto"
        >
          <ActionIcon />
          {actionLabel}
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TasksTable({ tasks, className, onStartTask }: TasksTableProps) {
  // Loading state
  if (tasks === undefined) {
    return (
      <div className={className}>
        <TasksTableSkeleton />
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className={className}>
        <EmptyStateList
          icon={Target}
          title="No assignments yet"
          description="When your manager assigns you training scenarios or tracks, they'll appear here."
          createLabel="Browse Scenarios"
          onCreate={onStartTask ? () => {
            // Navigate to scenarios - caller should handle this
            console.log("Browse scenarios clicked");
          } : undefined}
        />
      </div>
    );
  }

  // Sort tasks by urgency
  const sortedTasks = sortTasksByUrgency(tasks);

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TaskRow key={task.id} task={task} onStartTask={onStartTask} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} onStartTask={onStartTask} />
        ))}
      </div>
    </div>
  );
}