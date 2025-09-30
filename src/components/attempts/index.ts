/**
 * Attempt Results Components
 *
 * Reusable components for displaying attempt results and performance analysis
 */

export { AttemptHeader } from './attempt-header';
export type { AttemptHeaderProps } from './attempt-header';

export { BreakdownTab } from './breakdown-tab';
export type { BreakdownTabProps } from './breakdown-tab';

export { FeedbackTab } from './feedback-tab';
export type { FeedbackTabProps } from './feedback-tab';

export { KPIsTab } from './kpis-tab';
export type { KPIsTabProps } from './kpis-tab';

export { TranscriptTab } from './transcript-tab';
export type { TranscriptTabProps } from './transcript-tab';

export type {
  AttemptData,
  AttemptFeedback,
  AttemptKPIs,
  FeedbackImprovement,
  FeedbackStrength,
  GlobalKPIs,
  ScenarioKPIs,
  ScoreBreakdown,
  ScoreBreakdownItem,
  TranscriptEntry,
} from './types';