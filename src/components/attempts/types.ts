/**
 * Attempt Results Types
 *
 * Shared types for attempt results and performance analysis
 */

/**
 * Feedback item from AI analysis
 */
export interface FeedbackStrength {
  area: string;
  description: string;
}

export interface FeedbackImprovement {
  area: string;
  description: string;
  suggestion: string;
}

export interface AttemptFeedback {
  summary?: string;
  strengths?: FeedbackStrength[];
  improvements?: FeedbackImprovement[];
  next_steps?: string[];
}

/**
 * Global KPIs (communication metrics)
 */
export interface GlobalKPIs {
  talk_listen_ratio?: {
    formatted: string;
    user_percentage: number;
    ai_percentage: number;
  };
  filler_words?: {
    count: number;
    rate_per_minute: number;
  };
  speaking_pace?: {
    words_per_minute: number;
  };
  response_time?: {
    average_ms: number;
  };
  sentiment_score?: {
    user_sentiment: number;
  };
  interruptions?: {
    count: number;
  };
}

/**
 * Scenario-specific KPIs
 */
export interface ScenarioKPIs {
  required_phrases?: {
    mentioned: number;
    total: number;
    percentage: number;
  };
  open_questions?: {
    count: number;
  };
  objection_handling?: {
    success_rate: number;
  };
  goal_achievement?: {
    primary_goal_achieved: boolean;
  };
}

/**
 * Combined KPIs
 */
export interface AttemptKPIs {
  global: GlobalKPIs;
  scenario: ScenarioKPIs;
}

/**
 * Score breakdown item
 */
export interface ScoreBreakdownItem {
  weight: number;
  score: number;
  max_points: number;
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