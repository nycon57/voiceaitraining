export type AttemptStatus = 'in_progress' | 'completed' | 'failed' | 'cancelled'

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
  status: AttemptStatus
  feedback_text?: string
  created_at: string
  updated_at: string
}