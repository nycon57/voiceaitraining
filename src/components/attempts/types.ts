

export interface AttemptFeedback {
  summary?: string;
  strengths?: FeedbackStrength[];
  improvements?: FeedbackImprovement[];
  next_steps?: string[];
}

/**
 * Combined KPIs
 */
export interface AttemptKPIs {
  global: GlobalKPIs;
  scenario: ScenarioKPIs;
}

export type ScoreBreakdown = Record<string, ScoreBreakdownItem>;

/**
 * Transcript entry
 */
export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

/**
 * Attempt data (subset of full attempt record)
 */
export interface AttemptData {
  id: string;
  score: number | null;
  duration_seconds: number | null;
  status: string;
  transcript_json: string | null;
  kpis: AttemptKPIs | null;
  feedback_json: AttemptFeedback | null;
  score_breakdown: ScoreBreakdown | null;
  scenario_id: string;
  scenarios?: {
    title: string;
    persona?: {
      profile?: {
        name: string;
      };
    };
    difficulty?: string;
  };
}