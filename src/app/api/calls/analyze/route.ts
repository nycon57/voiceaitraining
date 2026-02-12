import { NextRequest } from 'next/server'
import { requireHuman } from '@/lib/botid'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { analyzeTranscript } from '@/lib/analysis/transcript-analyzer'
import { scoreWithRubric } from '@/lib/analysis/rubric-scorer'
import type { ScenarioRubric } from '@/types/scenario'
import { emitAttemptScored, emitAttemptFeedbackGenerated } from '@/lib/events'

const analyzeCallSchema = z.object({
  attemptId: z.string().uuid(),
  transcript: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant']),
      text: z.string(),
      timestamp: z.number(),
      isFinal: z.boolean(),
    })
  ),
  kpis: z.object({
    duration: z.number(),
    userTalkTime: z.number(),
    agentTalkTime: z.number(),
    talkListenRatio: z.string(),
    fillerWords: z.number(),
    questionsAsked: z.number(),
    interruptions: z.number(),
  }),
})

const ENHANCED_FEEDBACK_SYSTEM_PROMPT = `You are an expert sales coach providing direct, actionable feedback on call performance.

# Critical Instructions
- BE DIRECT AND HONEST. If the trainee fumbled, say so explicitly.
- CITE SPECIFIC MOMENTS with timestamps (e.g., "At 0:39, you said...")
- IDENTIFY CRITICAL FAILURES first (unanswered questions, fumbles, missed opportunities)
- PROVIDE EXACT ALTERNATIVE RESPONSES the trainee should have given
- Focus on what the trainee did WRONG and how to fix it, not generic encouragement

# Tone
- Professional but direct
- Critical when performance was poor
- Specific, not vague
- Action-oriented, not theoretical

Your feedback should help the trainee understand exactly what they did wrong and how to improve.`

export async function POST(req: NextRequest) {
  try {
    const botResponse = await requireHuman()
    if (botResponse) return botResponse

    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { attemptId, transcript, kpis } = analyzeCallSchema.parse(body)

    // Use admin client to bypass RLS - we're already checking auth via getCurrentUser()
    const supabase = await createAdminClient()

    // Get attempt and scenario details
    const { data: attempt, error: attemptError } = await supabase
      .from('scenario_attempts')
      .select('*, scenarios(*)')
      .eq('id', attemptId)
      .eq('org_id', user.orgId)
      .single()

    if (attemptError || !attempt) {
      return new Response('Attempt not found', { status: 404 })
    }

    // Skip analysis if attempt status is not 'completed'
    if (attempt.attempt_status !== 'completed') {
      return new Response(
        JSON.stringify({
          error: 'Analysis skipped',
          message: `Cannot analyze attempts with status '${attempt.attempt_status}'. Only completed attempts can be analyzed.`,
          status: attempt.attempt_status,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const scenario = attempt.scenarios
    const personaName = scenario.persona?.name || 'Agent'

    // Run advanced transcript analysis
    const transcriptAnalysis = await analyzeTranscript(transcript, personaName)

    // Score using rubric
    console.log('[analyze] Scenario rubric:', scenario.rubric)
    const rubricScore = await scoreWithRubric(
      transcriptAnalysis,
      scenario.rubric as ScenarioRubric | undefined,
      transcript,
      kpis
    )
    console.log('[analyze] Rubric score result:', {
      overall_score: rubricScore.overall_score,
      criterion_count: rubricScore.criterion_scores.length,
      criteria: rubricScore.criterion_scores.map(c => ({ name: c.criterion_name, score: c.score, max: c.max_score }))
    })

    // Fire-and-forget: notify subscribers that scoring finished
    const scoreBreakdown = Object.fromEntries(
      rubricScore.criterion_scores.map(
        (c: { criterion_name: string; score: number; max_score: number; percentage: number }) => [
          c.criterion_name,
          { score: c.score, maxScore: c.max_score, percentage: c.percentage },
        ]
      )
    )
    emitAttemptScored({
      attemptId,
      userId: user.id,
      orgId: user.orgId!,
      scenarioId: attempt.scenario_id,
      score: rubricScore.overall_score,
      scoreBreakdown,
      kpis,
      criticalFailures: rubricScore.critical_failures,
    }).catch((err: unknown) => console.error('[analyze] Failed to emit attempt.scored:', err))

    // Build context-aware AI prompt
    const analysisPrompt = buildEnhancedPrompt(
      scenario,
      transcript,
      transcriptAnalysis,
      rubricScore,
      kpis,
      personaName
    )

    // Stream AI feedback using Gemini Flash 2.0
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: ENHANCED_FEEDBACK_SYSTEM_PROMPT,
      prompt: analysisPrompt,
      maxOutputTokens: 800,
    })

    // Create a stream that sends both the text and the final analysis
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the text feedback
          for await (const textPart of result.textStream) {
            const data = JSON.stringify({
              type: 'text_delta',
              content: textPart,
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Build comprehensive analysis response
          const analysis = {
            type: 'analysis_complete',
            analysis: {
              score: rubricScore.overall_score,
              scoreBreakdown: rubricScore.criterion_scores.map(c => ({
                category: c.criterion_name,
                score: c.score,
                maxScore: c.max_score,
                percentage: c.percentage,
              })),
              feedback: await parseFeedbackSections(await result.text),
              keyMoments: buildKeyMoments(transcriptAnalysis, transcript, personaName),
              criticalIssues: buildCriticalIssues(transcriptAnalysis, rubricScore),
              suggestedResponses: buildSuggestedResponses(transcriptAnalysis, scenario),
              nextSteps: buildSmartNextSteps(transcriptAnalysis, rubricScore),
              // Enhanced KPIs
              enhancedKpis: {
                unanswered_questions_count: transcriptAnalysis.unanswered_questions.length,
                weak_responses_count: transcriptAnalysis.weak_responses.length,
                fumbled_responses_count: transcriptAnalysis.fumbled_responses.length,
                confidence_score: transcriptAnalysis.response_quality.confidence_score,
                professionalism_score: transcriptAnalysis.response_quality.professionalism_score,
                clarity_score: transcriptAnalysis.response_quality.clarity_score,
                avg_response_time_ms: transcriptAnalysis.conversation_flow.avg_response_time_ms,
                max_response_time_ms: transcriptAnalysis.conversation_flow.max_response_time_ms,
                dead_air_instances: transcriptAnalysis.conversation_flow.dead_air_instances.length,
                empathy_signals_count: transcriptAnalysis.conversation_flow.empathy_expressions,
              },
            },
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(analysis)}\n\n`))

          // Fire-and-forget: notify subscribers that feedback is ready
          emitAttemptFeedbackGenerated({
            attemptId,
            userId: user.id,
            orgId: user.orgId!,
            feedbackSections: analysis.analysis.feedback,
            nextSteps: analysis.analysis.nextSteps,
          }).catch((err: unknown) => console.error('[analyze] Failed to emit attempt.feedback.generated:', err))

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Error streaming analysis:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error analyzing call:', error)

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Invalid request', details: error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Internal server error', { status: 500 })
  }
}

/**
 * Build enhanced, context-aware prompt for AI feedback
 */
function buildEnhancedPrompt(
  scenario: any,
  transcript: any[],
  analysis: any,
  rubricScore: any,
  kpis: any,
  personaName: string
): string {
  const finalTranscript = transcript.filter(m => m.isFinal)
  const transcriptText = finalTranscript
    .map((m, i) => {
      const speaker = m.role === 'user' ? 'Trainee' : personaName
      const timestamp = formatTimestamp(m.timestamp)
      return `[${timestamp}] ${speaker}: ${m.text}`
    })
    .join('\n')

  // Build critical moments section
  const criticalMoments: string[] = []

  analysis.unanswered_questions.forEach((q: any) => {
    const ts = formatTimestamp(q.timestamp)
    criticalMoments.push(
      `❌ UNANSWERED QUESTION at ${ts}: "${q.question.substring(0, 100)}"`
    )
    if (q.trainee_response) {
      criticalMoments.push(
        `   Trainee's inadequate response: "${q.trainee_response.substring(0, 100)}"`
      )
    }
  })

  analysis.fumbled_responses.forEach((f: any) => {
    const ts = formatTimestamp(f.timestamp)
    const severity = f.severity === 'severe' ? '🚨 SEVERE FUMBLE' : '⚠️ FUMBLE'
    criticalMoments.push(
      `${severity} at ${ts}: "${f.text.substring(0, 100)}"\n   Type: ${f.fumble_type}`
    )
  })

  // Build rubric context
  const rubricContext = rubricScore.criterion_scores
    .map((c: any) => {
      const status = c.met ? '✅' : '❌'
      return `${status} ${c.criterion_name}: ${c.percentage}% (${c.score}/${c.max_score})\n   ${c.reasoning}`
    })
    .join('\n')

  const prompt = `
# SCENARIO CONTEXT
Title: ${scenario.title}
Description: ${scenario.description || 'N/A'}
Goal: ${scenario.goal || 'Complete the call successfully'}

Persona: ${personaName} (${scenario.persona?.role || 'Customer'})
${scenario.persona?.background ? `Background: ${scenario.persona.background}` : ''}
${scenario.persona?.objectives ? `Objectives: ${scenario.persona.objectives.join(', ')}` : ''}
${scenario.persona?.pain_points ? `Concerns: ${scenario.persona.pain_points.join(', ')}` : ''}

# FULL TRANSCRIPT WITH TIMESTAMPS
${transcriptText}

# CRITICAL PERFORMANCE ISSUES
${criticalMoments.length > 0 ? criticalMoments.join('\n') : 'None detected'}

# RUBRIC EVALUATION RESULTS
Overall Score: ${rubricScore.overall_score}/100
${rubricContext}

${rubricScore.critical_failures.length > 0 ? `\nCRITICAL FAILURES:\n${rubricScore.critical_failures.map((f: string) => `- ${f}`).join('\n')}` : ''}

# PERFORMANCE METRICS
- Talk/Listen Ratio: ${kpis.talkListenRatio} (Trainee spoke ${kpis.talkListenRatio.split(':')[0]}% of the time)
- Confidence Score: ${analysis.response_quality.confidence_score}/100
- Professionalism Score: ${analysis.response_quality.professionalism_score}/100
- Questions Asked by Trainee: ${analysis.questions_asked_by_trainee.length}
- Questions Asked by ${personaName}: ${analysis.questions_asked_by_agent.length}
- Unanswered Questions: ${analysis.unanswered_questions.length}
- Fumbles: ${analysis.fumbled_responses.length}
- Average Response Time: ${Math.round(analysis.conversation_flow.avg_response_time_ms / 1000)}s

# YOUR TASK
Provide direct, specific coaching feedback that:

1. **CRITICAL FAILURES** - Start with the most serious issues (unanswered questions, severe fumbles)
   - Cite the exact timestamp and quote what was said
   - Explain WHY it was a problem
   - Give the EXACT response the trainee should have given instead

2. **PERFORMANCE GAPS** - Identify areas that didn't meet the rubric
   - Reference specific rubric criteria that were missed
   - Provide concrete examples from the transcript

3. **WHAT WORKED** - Briefly mention 1-2 things done well (if any)
   - Be specific with timestamps and quotes

4. **ACTION PLAN** - Give 3 specific, prioritized next steps
   - Focus on the highest-impact improvements first
   - Be concrete: "Study X", "Practice Y technique", "Redo this scenario focusing on Z"

Keep total response under 400 words. Be direct and honest.`.trim()

  return prompt
}

/**
 * Build critical issues list
 */
function buildCriticalIssues(analysis: any, rubricScore: any): any[] {
  const issues: any[] = []

  // Unanswered questions
  analysis.unanswered_questions.forEach((q: any) => {
    issues.push({
      type: 'unanswered_question',
      severity: 'critical',
      timestamp: q.timestamp,
      description: `Question not answered: "${q.question.substring(0, 80)}..."`,
      trainee_response: q.trainee_response || 'No response provided',
    })
  })

  // Severe fumbles
  analysis.fumbled_responses
    .filter((f: any) => f.severity === 'severe')
    .forEach((f: any) => {
      issues.push({
        type: 'fumble',
        severity: 'critical',
        timestamp: f.timestamp,
        description: `${f.fumble_type}: "${f.text.substring(0, 80)}..."`,
      })
    })

  // Critical rubric failures
  rubricScore.critical_failures.forEach((failure: string) => {
    issues.push({
      type: 'rubric_failure',
      severity: 'critical',
      description: failure,
    })
  })

  return issues
}

/**
 * Build suggested responses
 */
function buildSuggestedResponses(analysis: any, scenario: any): any[] {
  const suggestions: any[] = []

  analysis.unanswered_questions.slice(0, 3).forEach((q: any) => {
    suggestions.push({
      timestamp: q.timestamp,
      question: q.question,
      trainee_said: q.trainee_response || '(No response)',
      should_have_said: generateIdealResponse(q.question, scenario),
    })
  })

  return suggestions
}

/**
 * Generate an ideal response (placeholder - could use AI in future)
 */
function generateIdealResponse(question: string, scenario: any): string {
  // Simple heuristics - in production, could use AI to generate
  if (question.toLowerCase().includes('cancel')) {
    return "Great question! Our cancellation policy is flexible: you can cancel within 30 days with no penalty. After that, there's a small processing fee. Does that address your concern?"
  }
  if (question.toLowerCase().includes('price') || question.toLowerCase().includes('cost')) {
    return "I'd be happy to discuss pricing. Let me make sure I understand your needs first, then I can provide accurate pricing information. What are your main priorities?"
  }
  return "That's an excellent question. Let me provide you with a clear answer..."
}

/**
 * Build smart next steps based on analysis
 */
function buildSmartNextSteps(analysis: any, rubricScore: any): string[] {
  const steps: string[] = []

  // Prioritize based on biggest gaps
  if (analysis.unanswered_questions.length > 0) {
    steps.push(
      `Study the scenario materials to confidently answer questions about ${extractQuestionTopics(analysis.unanswered_questions).join(', ')}`
    )
  }

  if (analysis.fumbled_responses.length > 2) {
    steps.push(
      'Practice the "Pause-Think-Respond" framework to reduce fumbles and uncertainty'
    )
  }

  if (analysis.response_quality.confidence_score < 70) {
    steps.push(
      'Record yourself practicing responses to build confidence and eliminate filler words'
    )
  }

  const weakCriteria = rubricScore.criterion_scores.filter((c: any) => c.percentage < 60)
  if (weakCriteria.length > 0) {
    steps.push(
      `Focus on improving: ${weakCriteria.map((c: any) => c.criterion_name).join(', ')}`
    )
  }

  steps.push('Redo this scenario applying the feedback above')

  return steps.slice(0, 3)
}

/**
 * Extract question topics
 */
function extractQuestionTopics(questions: any[]): string[] {
  const topics = new Set<string>()

  questions.forEach(q => {
    const text = q.question.toLowerCase()
    if (text.includes('cancel')) topics.add('cancellation policy')
    if (text.includes('price') || text.includes('cost')) topics.add('pricing')
    if (text.includes('contract')) topics.add('contract terms')
    if (text.includes('refund')) topics.add('refund policy')
  })

  return Array.from(topics)
}

/**
 * Build key moments with better categorization
 */
function buildKeyMoments(analysis: any, transcript: any[], personaName: string): any[] {
  const moments: any[] = []

  // Add agent questions
  analysis.questions_asked_by_agent.slice(0, 3).forEach((q: any) => {
    moments.push({
      timestamp: q.timestamp,
      type: q.answered ? 'question_answered' : 'question_unanswered',
      description: `${personaName} asked: "${q.question.substring(0, 60)}..."`,
      severity: q.answered ? 'info' : 'warning',
    })
  })

  // Add fumbles
  analysis.fumbled_responses.slice(0, 2).forEach((f: any) => {
    moments.push({
      timestamp: f.timestamp,
      type: 'fumble',
      description: `Fumble (${f.fumble_type}): "${f.text.substring(0, 50)}..."`,
      severity: f.severity,
    })
  })

  return moments.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Format timestamp
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parse AI feedback into sections
 */
async function parseFeedbackSections(text: string): Promise<any[]> {
  const sections: any[] = []

  // Try to extract structured sections
  const criticalMatch = text.match(/\*\*CRITICAL FAILURES?\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i)
  if (criticalMatch) {
    sections.push({
      title: 'Critical Failures',
      content: criticalMatch[1].trim(),
      type: 'improvement', // Maps to FeedbackSection type
    })
  }

  const performanceMatch = text.match(/\*\*PERFORMANCE GAPS?\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i)
  if (performanceMatch) {
    sections.push({
      title: 'Performance Gaps',
      content: performanceMatch[1].trim(),
      type: 'improvement', // Maps to FeedbackSection type
    })
  }

  const workedMatch = text.match(/\*\*WHAT WORKED\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i)
  if (workedMatch) {
    sections.push({
      title: 'What Worked',
      content: workedMatch[1].trim(),
      type: 'strength', // Maps to FeedbackSection type
    })
  }

  const actionMatch = text.match(/\*\*ACTION PLAN\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i)
  if (actionMatch) {
    sections.push({
      title: 'Action Plan',
      content: actionMatch[1].trim(),
      type: 'neutral', // Maps to FeedbackSection type
    })
  }

  // Fallback: just use the whole text if no structure found
  if (sections.length === 0) {
    sections.push({
      title: 'Feedback',
      content: text,
      type: 'neutral',
    })
  }

  return sections
}
