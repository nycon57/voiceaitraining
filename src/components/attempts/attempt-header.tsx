import { Trophy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDifficultyColor, getScoreColor } from '@/lib/utils/dashboard-utils';

import type { AttemptData } from './types';

export interface AttemptHeaderProps {
  attempt: AttemptData;
  /**
   * Custom function to format duration
   * Defaults to MM:SS format
   */
  formatDuration?: (seconds: number) => string;
}

/**
 * AttemptHeader Component
 *
 * Displays overall attempt performance summary including:
 * - Final score with progress bar
 * - Duration, character, difficulty, and status
 * - Color-coded score badge
 *
 * @example
 * ```tsx
 * <AttemptHeader attempt={attemptData} />
 * ```
 */
export function AttemptHeader({ attempt, formatDuration = defaultFormatDuration }: AttemptHeaderProps) {
  const score = attempt.score || 0;
  const duration = attempt.duration_seconds || 0;
  const scenarioTitle = attempt.scenarios?.title || 'Training Session';
  const characterName = attempt.scenarios?.persona?.profile?.name || 'AI Agent';
  const difficulty = attempt.scenarios?.difficulty || 'Medium';

  // Get score variant for badge
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Overall Performance Score
            </CardTitle>
            <CardDescription>
              {scenarioTitle} • {formatDuration(duration)}
            </CardDescription>
          </div>
          <Badge variant={getScoreBadgeVariant(score)} size="lg">
            {Math.round(score)}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress
            value={score}
            className="h-3"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <StatItem
              label="Duration"
              value={formatDuration(duration)}
            />
            <StatItem
              label="Character"
              value={characterName}
            />
            <StatItem
              label="Difficulty"
              value={difficulty}
              valueClassName="capitalize"
            />
            <StatItem
              label="Status"
              value="Completed"
              valueClassName="text-success font-medium"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual stat item
 */
function StatItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <div className="font-medium">{label}</div>
      <div className={valueClassName || 'text-muted-foreground'}>
        {value}
      </div>
    </div>
  );
}

/**
 * Default duration formatter (MM:SS)
 */
function defaultFormatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}