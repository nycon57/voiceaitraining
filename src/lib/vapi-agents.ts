/**
 * Vapi Base Agent Configuration
 *
 * This file defines the permanent base Vapi assistants and provides helpers
 * for building transient overrides at call-time.
 *
 * Architecture:
 * - 4 permanent base assistants stored in Vapi (created manually in dashboard)
 * - Each scenario references one base agent via vapi_base_agent field
 * - At call-time, we build transient overrides using scenario-specific data
 * - This approach scales to 1000+ scenarios without creating new assistants
 */

import type { Scenario, VapiBaseAgent, VapiOverrides } from '@/types/scenario'

// ============================================================================
// Base Agent Mappings
// ============================================================================

/**
 * Maps base agent types to their permanent Vapi assistant IDs
 * These IDs come from assistants created manually in the Vapi dashboard
 *
 * IMPORTANT: Set these in your .env.local file:
 * - VAPI_AGENT_PROFESSIONAL=asst_...
 * - VAPI_AGENT_DIFFICULT=asst_...
 * - VAPI_AGENT_FRIENDLY=asst_...
 * - VAPI_AGENT_NEUTRAL=asst_...
 */
export const VAPI_BASE_AGENTS: Record<VapiBaseAgent, string> = {
  professional: process.env.VAPI_AGENT_PROFESSIONAL || process.env.VAPI_DEFAULT_ASSISTANT_ID || '',
  difficult: process.env.VAPI_AGENT_DIFFICULT || process.env.VAPI_DEFAULT_ASSISTANT_ID || '',
  friendly: process.env.VAPI_AGENT_FRIENDLY || process.env.VAPI_DEFAULT_ASSISTANT_ID || '',
  neutral: process.env.VAPI_AGENT_NEUTRAL || process.env.VAPI_DEFAULT_ASSISTANT_ID || '',
} as const

// ============================================================================
// Voice Configurations
// ============================================================================

/**
 * ElevenLabs voice ID mappings for different emotional tones
 * These can be overridden per-scenario via vapi_overrides.voice_emotion
 */
export const VOICE_CONFIGS = {
  neutral: { provider: '11labs', voiceId: 'sarah' },
  warm: { provider: '11labs', voiceId: 'bella' },
  stern: { provider: '11labs', voiceId: 'antoni' },
  friendly: { provider: '11labs', voiceId: 'josh' },
} as const

/**
 * Default voice for each base agent type
 */
export const DEFAULT_AGENT_VOICES: Record<VapiBaseAgent, keyof typeof VOICE_CONFIGS> = {
  professional: 'neutral',
  difficult: 'stern',
  friendly: 'warm',
  neutral: 'neutral',
}

// ============================================================================
// Temperature Mappings
// ============================================================================

/**
 * Default temperature settings based on difficulty level
 * Higher temperature = more creative/unpredictable responses
 */
export const DIFFICULTY_TEMPERATURES = {
  easy: 0.6,    // More predictable, easier to handle
  medium: 0.7,  // Balanced
  hard: 0.85,   // More unpredictable, challenging
} as const

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the Vapi assistant ID for a given base agent type
 */
export function getAssistantId(baseAgent: VapiBaseAgent = 'professional'): string {
  const assistantId = VAPI_BASE_AGENTS[baseAgent]

  if (!assistantId) {
    console.warn(`No assistant ID found for base agent: ${baseAgent}. Using default.`)
    return process.env.VAPI_DEFAULT_ASSISTANT_ID || ''
  }

  return assistantId
}

/**
 * Get or create an assistant configuration for a specific scenario
 * Returns the assistant ID to use for the call
 *
 * This function determines the appropriate base assistant and can be extended
 * to create transient assistants in the future
 */
export async function getScenarioAssistant(
  scenarioId: string,
  scenario: Partial<Scenario>
): Promise<string> {
  // Determine the base agent type from the scenario
  const baseAgent = scenario.vapi_base_agent || 'professional'

  // Get the permanent assistant ID for this base agent type
  const assistantId = getAssistantId(baseAgent)

  if (!assistantId) {
    throw new Error(
      `No Vapi assistant configured for base agent type: ${baseAgent}. ` +
      `Please set VAPI_AGENT_${baseAgent.toUpperCase()} or VAPI_DEFAULT_ASSISTANT_ID in your environment.`
    )
  }

  return assistantId
}

/**
 * Build the system prompt with scenario-specific context
 * This is injected as a transient override at call-time
 */
export function buildSystemPrompt(scenario: Scenario): string {
  const persona = scenario.persona
  const difficulty = scenario.difficulty || 'medium'

  // Base role and identity
  const roleSection = `You are participating in a sales training simulation. Your role is to play "${persona?.role || 'Customer'}"${persona?.name ? ` named ${persona.name}` : ''}.`

  // Background and context
  const backgroundSection = persona?.background
    ? `\n\nBACKGROUND:\n${persona.background}`
    : ''

  // Objectives (what the persona wants to achieve)
  const objectivesSection = persona?.objectives && persona.objectives.length > 0
    ? `\n\nYOUR OBJECTIVES:\n${persona.objectives.map(obj => `- ${obj}`).join('\n')}`
    : ''

  // Pain points (concerns or challenges)
  const painPointsSection = persona?.pain_points && persona.pain_points.length > 0
    ? `\n\nYOUR CONCERNS:\n${persona.pain_points.map(pp => `- ${pp}`).join('\n')}`
    : ''

  // Scenario-specific instructions
  const scenarioSection = scenario.ai_prompt
    ? `\n\nSCENARIO INSTRUCTIONS:\n${scenario.ai_prompt}`
    : ''

  // Personality traits
  const personalitySection = persona?.personality && persona.personality.length > 0
    ? `\n\nPERSONALITY TRAITS:\n${persona.personality.map(trait => `- ${trait}`).join('\n')}`
    : ''

  // Behavior guidelines based on difficulty
  const behaviorGuidelines = getBehaviorGuidelines(difficulty)

  // Conversation rules
  const conversationRules = `\n\nCONVERSATION GUIDELINES:
- Keep responses conversational and natural (1-3 sentences typically)
- Stay in character throughout the entire conversation
- Respond realistically based on what the trainee says
- Ask follow-up questions when appropriate
- Express genuine interest or concerns based on the conversation
- If the trainee doesn't respond after 10-15 seconds, ask "Are you still there?" or "Did I lose you?"
- End the call naturally when a logical conclusion is reached
- Don't be overly helpful or difficult - act like a real person would
- If the trainee goes silent for too long or seems unprepared, you can end the call politely`

  // Combine all sections
  return [
    roleSection,
    backgroundSection,
    objectivesSection,
    painPointsSection,
    scenarioSection,
    personalitySection,
    behaviorGuidelines,
    conversationRules,
  ].filter(Boolean).join('\n')
}

/**
 * Get behavior guidelines based on difficulty level
 */
function getBehaviorGuidelines(difficulty: Scenario['difficulty']): string {
  switch (difficulty) {
    case 'easy':
      return `\n\nBEHAVIOR LEVEL: Easy
- Be receptive and cooperative
- Respond positively to reasonable answers
- Ask clarifying questions but don't challenge much
- Show interest when the trainee makes good points
- Warm up quickly to competent salespeople`

    case 'hard':
      return `\n\nBEHAVIOR LEVEL: Challenging
- Be skeptical and demanding
- Challenge claims and ask for proof
- Bring up objections and concerns frequently
- Don't warm up easily - require convincing
- Only soften if the trainee handles you exceptionally well`

    case 'medium':
    default:
      return `\n\nBEHAVIOR LEVEL: Moderate
- Be realistic and balanced
- Present reasonable objections when appropriate
- Respond naturally to the trainee's approach
- Your mood can shift based on their performance
- Be neither overly easy nor overly difficult`
  }
}

/**
 * Build transient assistant overrides for a specific scenario
 * These overrides customize the base permanent assistant at call-time
 */
export function buildAssistantOverrides(scenario: Scenario): {
  model?: {
    messages?: Array<{ role: string; content: string }>
    temperature?: number
  }
  voice?: {
    provider: string
    voiceId: string
  }
  firstMessage?: string
  silenceTimeoutSeconds?: number
  responseDelaySeconds?: number
  llmRequestDelaySeconds?: number
  maxDurationSeconds?: number
  endCallMessage?: string
  endCallPhrases?: string[]
} {
  const overrides = scenario.vapi_overrides || {}
  const baseAgent = scenario.vapi_base_agent || 'professional'
  const difficulty = scenario.difficulty || 'medium'

  // Build system message with scenario context
  const systemMessage = buildSystemPrompt(scenario)

  // Determine temperature (override > difficulty default > 0.7)
  const temperature = overrides.temperature
    || DIFFICULTY_TEMPERATURES[difficulty]
    || 0.7

  // Determine voice (override > agent default)
  const voiceEmotion = overrides.voice_emotion || DEFAULT_AGENT_VOICES[baseAgent]
  const voice = VOICE_CONFIGS[voiceEmotion]

  // Build the override object
  // Note: Using gpt-4o-mini for Vapi as it's stable, fast, and cost-effective for voice agents
  return {
    model: {
      provider: 'openai', // Required field
      model: 'gpt-4o-mini', // Stable model for voice agents
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
      ],
      temperature,
    },
    voice,
    firstMessage: scenario.persona?.name
      ? `Hello, this is ${scenario.persona.name}. How can I help you?`
      : "Hello, I'm ready when you are.",

    // Silence and inactivity handling
    silenceTimeoutSeconds: 30, // End call after 30 seconds of silence
    responseDelaySeconds: 1, // Wait 1 second before responding (natural conversation flow)
    llmRequestDelaySeconds: 0.1, // Minimal delay for LLM request

    // Call duration and end handling
    maxDurationSeconds: overrides.max_duration_seconds || 600, // 10 minutes default
    endCallMessage: "Thank you for the practice. Goodbye!",
    endCallPhrases: [
      "goodbye",
      "have a good day",
      "talk to you later",
      "bye",
      "thanks for your time"
    ],
  }
}

/**
 * Validate that all required base agent environment variables are set
 * Call this at app startup to catch configuration issues early
 */
export function validateVapiAgentConfig(): {
  isValid: boolean
  missingAgents: VapiBaseAgent[]
} {
  const missingAgents: VapiBaseAgent[] = []

  for (const [agentType, assistantId] of Object.entries(VAPI_BASE_AGENTS)) {
    if (!assistantId || assistantId === '') {
      missingAgents.push(agentType as VapiBaseAgent)
    }
  }

  return {
    isValid: missingAgents.length === 0,
    missingAgents,
  }
}

/**
 * Get a human-readable description of a base agent type
 */
export function getAgentDescription(agent: VapiBaseAgent): string {
  const descriptions: Record<VapiBaseAgent, string> = {
    professional: 'Polite, thoughtful business professional. Asks relevant questions and listens carefully.',
    difficult: 'Skeptical and demanding customer. Challenges claims and requires convincing.',
    friendly: 'Enthusiastic and receptive prospect. Interested but not overly easy.',
    neutral: 'Balanced caller whose mood shifts based on salesperson performance.',
  }

  return descriptions[agent]
}

// ============================================================================
// Export Types for External Use
// ============================================================================

export type VoiceEmotion = keyof typeof VOICE_CONFIGS
export type VapiAssistantConfig = ReturnType<typeof buildAssistantOverrides>
