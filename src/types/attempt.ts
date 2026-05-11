// Database enum values for scenario_attempts.attempt_status
// 'completed' - Successfully completed attempt that counts toward performance
// 'cancelled' - User cancelled the call before completion
// 'practice' - Practice attempt that does not count toward scoring
// 'technical_issue' - Attempt failed due to technical problems
export type AttemptStatus = 'completed' | 'cancelled' | 'practice' | 'technical_issue'

export interface TranscriptSegment {
  id: string
  speaker: 'trainee' | 'agent'
  text: string
  start_time_ms: number
  end_time_ms: number
  confidence?: number
  annotations?: TranscriptAnnotation[]
}