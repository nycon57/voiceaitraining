// Database enum values for scenario_attempts.attempt_status
// 'completed' - Successfully completed attempt that counts toward performance
// 'cancelled' - User cancelled the call before completion
// 'practice' - Practice attempt that does not count toward scoring
// 'technical_issue' - Attempt failed due to technical problems
export type AttemptStatus = 'completed' | 'cancelled' | 'practice' | 'technical_issue'

export interface AttemptKPIs {
  talk_ms?: number
  listen_ms?: number
  talk_listen_ratio?: string
  filler_words_count?: number
  interruptions_count?: number
  questions_asked_count?: number
  sentiment_score?: number
  pace_wpm?: number
  required_phrases_mentioned?: string[]
  objections_handled?: string[]
  goal_achieved?: boolean

  // Enhanced KPIs from transcript analysis
  unanswered_questions_count?: number
  weak_responses_count?: number
  fumbled_responses_count?: number
  confidence_score?: number // 0-100
  professionalism_score?: number // 0-100
  clarity_score?: number // 0-100
  avg_response_time_ms?: number
  max_response_time_ms?: number
  dead_air_instances?: number
  empathy_signals_count?: number
}

export interface ScoreBreakdown {
  goal_achievement?: number
  required_phrases?: number
  conversation_quality?: number
  objection_handling?: number
  open_questions?: number
  total_weighted_score: number
}

export interface TranscriptSegment {
  id: string
  speaker: 'trainee' | 'agent'
  text: string
  start_time_ms: number
  end_time_ms: number
  confidence?: number
  annotations?: TranscriptAnnotation[]
}

export interface TranscriptAnnotation {
  type: 'highlight' | 'comment' | 'correction' | 'suggestion'
  start_char: number
  end_char: number
  content: string
  author?: string
  created_at: string
}

export interface ScenarioAttempt {
  id: string
  org_id: string
  user_id: string
  scenario_id?: string
  assignment_id?: string
  vapi_call_id?: string
  started_at: string
  ended_at?: string
  duration_seconds?: number
  recording_url?: string
  transcript_text?: string
  transcript_json?: TranscriptSegment[]
  score?: number
  score_breakdown?: ScoreBreakdown
  kpis?: AttemptKPIs
  attempt_status: AttemptStatus
  feedback_text?: string
  created_at: string
  updated_at: string
}