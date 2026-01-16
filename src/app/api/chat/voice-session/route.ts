import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { requireHuman } from '@/lib/botid'

export async function POST(req: NextRequest) {
  try {
    const botResponse = await requireHuman()
    if (botResponse) return botResponse

    const { messages } = await req.json()

    // System prompt for voice training scenarios
    const systemPrompt = `You are an AI training assistant for sales representatives. You should:

1. Stay in character as the specified persona throughout the conversation
2. Respond naturally and conversationally, as if you're really on a phone call
3. Present realistic objections and challenges that sales reps commonly face
4. Gradually reveal information and show interest levels based on how well the trainee performs
5. Keep responses concise and phone-appropriate (1-3 sentences typically)
6. Use natural speech patterns with occasional hesitations, confirmations, etc.
7. End the conversation naturally when objectives are met or after reasonable duration

Remember: This is voice training, so responses should sound natural when spoken aloud.`

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8, // Higher temperature for more natural variation
      maxOutputTokens: 150, // Keep responses concise for voice
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Voice session chat error:', error)
    return Response.json(
      { error: 'Failed to process voice session' },
      { status: 500 }
    )
  }
}