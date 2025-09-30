import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { AttemptKPIs } from './types';

export interface KPIsTabProps {
  kpis: AttemptKPIs;
}

/**
 * KPIsTab Component
 *
 * Displays performance KPIs including:
 * - Global communication metrics (talk/listen ratio, filler words, pace, etc.)
 * - Scenario-specific metrics (required phrases, objections, goals, etc.)
 *
 * @example
 * ```tsx
 * <KPIsTab kpis={attempt.kpis} />
 * ```
 */
export function KPIsTab({ kpis }: KPIsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Global KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">
            Communication Metrics
          </CardTitle>
          <CardDescription>Core conversation analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis.global.talk_listen_ratio && (
            <KPIItem
              label="Talk/Listen Ratio"
              value={kpis.global.talk_listen_ratio.formatted}
            />
          )}

          {kpis.global.filler_words && (
            <KPIItem
              label="Filler Words"
              value={`${kpis.global.filler_words.count} (${kpis.global.filler_words.rate_per_minute}/min)`}
            />
          )}

          {kpis.global.speaking_pace && (
            <KPIItem
              label="Speaking Pace"
              value={`${kpis.global.speaking_pace.words_per_minute} WPM`}
            />
          )}

          {kpis.global.response_time && (
            <KPIItem
              label="Avg Response Time"
              value={`${Math.round(kpis.global.response_time.average_ms / 1000)}s`}
            />
          )}

          {kpis.global.sentiment_score && (
            <KPIItem
              label="Sentiment Score"
              value={`${Math.round(kpis.global.sentiment_score.user_sentiment * 100)}%`}
            />
          )}

          {kpis.global.interruptions && (
            <KPIItem
              label="Interruptions"
              value={kpis.global.interruptions.count.toString()}
            />
          )}
        </CardContent>
      </Card>

      {/* Scenario KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">
            Scenario Performance
          </CardTitle>
          <CardDescription>Goal and technique analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis.scenario.required_phrases && (
            <KPIItem
              label="Required Phrases"
              value={`${kpis.scenario.required_phrases.mentioned}/${kpis.scenario.required_phrases.total} (${kpis.scenario.required_phrases.percentage}%)`}
            />
          )}

          {kpis.scenario.open_questions && (
            <KPIItem
              label="Open Questions"
              value={kpis.scenario.open_questions.count.toString()}
            />
          )}

          {kpis.scenario.objection_handling && (
            <KPIItem
              label="Objection Handling"
              value={`${kpis.scenario.objection_handling.success_rate}%`}
            />
          )}

          {kpis.scenario.goal_achievement && (
            <KPIItem
              label="Primary Goal"
              value={
                kpis.scenario.goal_achievement.primary_goal_achieved
                  ? '✅ Achieved'
                  : '❌ Not Achieved'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual KPI row item
 */
function KPIItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}