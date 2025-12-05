export type ScenarioStatus = 'draft' | 'active' | 'archived'
export type ScenarioDifficulty = 'easy' | 'medium' | 'hard'
export type VapiBaseAgent = 'professional' | 'difficult' | 'friendly' | 'neutral'

export interface VapiOverrides {
  temperature?: number // 0.0 - 1.0, higher = more creative/unpredictable
  voice_emotion?: 'neutral' | 'warm' | 'stern' | 'friendly'
  background_sound?: 'office' | 'cafe' | 'quiet' | 'street'
  max_duration_seconds?: number // Override default 600s
  end_call_on_silence_seconds?: number // Override default 30s
}

export interface ScenarioPersona {
  role: string
  name?: string
  background?: string
  personality?: string[]
  objectives?: string[]
  pain_points?: string[]
}

export interface ScenarioRubric {
  goal_achievement?: {
    weight: number
    description: string
    required: boolean
  }
  required_phrases?: {
    weight: number
    phrases: string[]
  }
  open_questions?: {
    weight: number
    minimum_count: number
  }
  objections_handled?: {
    weight: number
    objection_types: string[]
  }
  conversation_quality?: {
    weight: number
    metrics: string[]
  }
}

export interface ScenarioBranching {
  nodes: ScenarioBranchNode[]
  edges: ScenarioBranchEdge[]
  start_node: string
}

export interface ScenarioBranchNode {
  id: string
  type: 'ai_response' | 'condition' | 'end'
  content?: string
  conditions?: BranchCondition[]
}

export interface ScenarioBranchEdge {
  id: string
  from: string
  to: string
  condition?: string
}

export interface BranchCondition {
  type: 'keyword' | 'semantic' | 'sentiment' | 'duration'
  value: any
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than'
}

export interface Scenario {
  id: string
  org_id: string
  title: string
  description?: string
  persona?: ScenarioPersona
  difficulty?: ScenarioDifficulty
  ai_prompt?: string
  branching?: ScenarioBranching
  rubric?: ScenarioRubric
  status: ScenarioStatus
  vapi_base_agent?: VapiBaseAgent // Base permanent Vapi assistant to use
  vapi_overrides?: VapiOverrides // Optional transient behavior overrides
  created_by?: string
  created_at: string
  updated_at: string
}