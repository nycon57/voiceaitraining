import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { ScoreBreakdown } from './types';

export interface BreakdownTabProps {
  scoreBreakdown: ScoreBreakdown;
}

/**
 * BreakdownTab Component
 *
 * Displays detailed score breakdown showing how the final score was calculated.
 * Each metric shows:
 * - Weight (percentage contribution to total)
 * - Score (performance 0-1)
 * - Points earned vs max points
 *
 * @example
 * ```tsx
 * <BreakdownTab scoreBreakdown={attempt.score_breakdown} />
 * ```
 */
export function BreakdownTab({ scoreBreakdown }: BreakdownTabProps) {
  const formatMetricName = (key: string): string => {
    return key
      .replace(/[_]/g, ' ')
      .replace('global ', '')
      .replace('scenario ', '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">
          Detailed Score Breakdown
        </CardTitle>
        <CardDescription>How your final score was calculated</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(scoreBreakdown).map(([key, data]) => {
            const earnedPoints = Math.round(data.score * data.max_points * 100) / 100;
            const scorePercentage = Math.round(data.score * 100);

            return (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">
                    {formatMetricName(key)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Weight: {data.weight}% • Score: {scorePercentage}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {earnedPoints}/{data.max_points}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}