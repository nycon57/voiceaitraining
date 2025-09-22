import Vapi from '@vapi-ai/web'

if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set')
}

class VapiManager {
  private vapi: Vapi | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
      this.isInitialized = true
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.vapi !== null
  }

  async startCall(assistantId: string): Promise<void> {
    if (!this.vapi) {
      throw new Error('Vapi not initialized')
    }

    return this.vapi.start(assistantId)
  }

  async stopCall(): Promise<void> {
    if (!this.vapi) {
      throw new Error('Vapi not initialized')
    }

    return this.vapi.stop()
  }

  onMessage(handler: (message: any) => void): void {
    if (!this.vapi) return
    this.vapi.on('message', handler)
  }

  onCallStart(handler: () => void): void {
    if (!this.vapi) return
    this.vapi.on('call-start', handler)
  }

  onCallEnd(handler: (callData: any) => void): void {
    if (!this.vapi) return
    this.vapi.on('call-end', handler)
  }

  onSpeechStart(handler: () => void): void {
    if (!this.vapi) return
    this.vapi.on('speech-start', handler)
  }

  onSpeechEnd(handler: () => void): void {
    if (!this.vapi) return
    this.vapi.on('speech-end', handler)
  }

  onError(handler: (error: any) => void): void {
    if (!this.vapi) return
    this.vapi.on('error', handler)
  }

  removeAllListeners(): void {
    if (!this.vapi) return
    this.vapi.removeAllListeners()
  }

  isMuted(): boolean {
    if (!this.vapi) return false
    return this.vapi.isMuted()
  }

  setMuted(muted: boolean): void {
    if (!this.vapi) return
    this.vapi.setMuted(muted)
  }
}

// Singleton instance
export const vapiManager = new VapiManager()

// Helper to create assistant using Vapi API (server-side)
export async function createVapiAssistant(
  name: string,
  systemPrompt: string,
  voiceId: string = 'sarah'
) {
  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_PRIVATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 500,
      },
      voice: {
        provider: 'elevenlabs',
        voiceId,
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en-US',
      },
      endCallOnSilence: true,
      maxDurationSeconds: 600,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create Vapi assistant')
  }

  return response.json()
}

// Helper to get or create assistant for a scenario
export async function getScenarioAssistant(scenarioId: string, scenario: any): Promise<string> {
  // In a real implementation, you might cache assistant IDs in your database
  // For now, we'll create a new assistant for each scenario

  const systemPrompt = buildSystemPrompt(
    scenario.persona,
    scenario.ai_prompt,
    `This is a training simulation for scenario: "${scenario.title}". ${scenario.description || ''}`
  )

  try {
    const assistant = await createVapiAssistant(
      `${scenario.title} - Training Assistant`,
      systemPrompt
    )

    return assistant.id
  } catch (error) {
    console.error('Failed to create Vapi assistant:', error)
    // Fallback: use a default assistant ID (you should create one in Vapi dashboard)
    return process.env.VAPI_DEFAULT_ASSISTANT_ID || 'default-assistant-id'
  }
}

// Default voice configurations (ElevenLabs voice IDs)
export const VOICE_CONFIGS = {
  professional_female: 'sarah',
  professional_male: 'antoni',
  friendly_female: 'bella',
  friendly_male: 'josh',
}

// Helper to build system prompt with scenario context
export function buildSystemPrompt(
  persona: any,
  scenarioContext: string,
  additionalInstructions?: string
): string {
  const basePrompt = `You are participating in a sales training simulation. Your role is to play "${persona?.role || 'Customer'}" named ${persona?.profile?.name || 'Customer'}.

BACKGROUND:
${persona?.profile?.background || 'You are a potential customer interested in learning more about the product or service.'}

SCENARIO CONTEXT:
${scenarioContext}

PERSONALITY & BEHAVIOR:
- Be realistic and human-like in your responses
- Stay in character throughout the conversation
- Respond naturally to the trainee's questions and statements
- Present realistic objections and concerns when appropriate
- If the trainee is doing well, be receptive but not overly easy
- If the trainee makes mistakes, respond realistically (confusion, clarification requests, etc.)

CONVERSATION GUIDELINES:
- Keep responses conversational and natural (1-3 sentences typically)
- Don't be overly helpful or difficult - act like a real person would
- Ask follow-up questions when appropriate
- Express genuine interest or concerns based on what the trainee says
- End the call naturally when a logical conclusion is reached

${additionalInstructions || ''}

Remember: This is a training simulation. Your goal is to provide realistic practice, not to be overly cooperative or difficult.`

  return basePrompt
}