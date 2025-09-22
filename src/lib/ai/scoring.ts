import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface TranscriptEntry {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  duration?: number
}

export interface GlobalKPIs {
  talk_listen_ratio: {
    user_percentage: number
    ai_percentage: number
    formatted: string
  }
  filler_words: {
    count: number
    rate_per_minute: number
    words: string[]
  }
  interruptions: {
    count: number
    user_interruptions: number
    ai_interruptions: number
  }
  speaking_pace: {
    words_per_minute: number
    total_words: number
    speaking_time_seconds: number
  }
  sentiment_score: {
    overall: number
    user_sentiment: number
    ai_sentiment: number
  }
  response_time: {
    average_ms: number
    median_ms: number
    max_ms: number
  }
}

export interface ScenarioKPIs {
  required_phrases: {
    total: number
    mentioned: number
    percentage: number
    phrases: Array<{
      phrase: string
      mentioned: boolean
      timestamp?: number
    }>
  }
  objection_handling: {
    objections_raised: number
    objections_addressed: number
    success_rate: number
  }
  open_questions: {
    count: number
    rate_per_minute: number
  }
  goal_achievement: {
    primary_goal_achieved: boolean
    secondary_goals_achieved: number
    total_secondary_goals: number
  }
}

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically',
  'literally', 'totally', 'really', 'very', 'super', 'kind of', 'sort of'
]

export function calculateGlobalKPIs(
  transcript: TranscriptEntry[],
  totalDurationSeconds: number
): GlobalKPIs {
  if (!transcript.length) {
    return getEmptyGlobalKPIs()
  }

  const userEntries = transcript.filter(entry => entry.role === 'user')
  const aiEntries = transcript.filter(entry => entry.role === 'assistant')

  // Calculate talk/listen ratio
  const userWordCount = userEntries.reduce((sum, entry) =>
    sum + entry.content.split(' ').length, 0
  )
  const aiWordCount = aiEntries.reduce((sum, entry) =>
    sum + entry.content.split(' ').length, 0
  )
  const totalWords = userWordCount + aiWordCount

  const userPercentage = totalWords > 0 ? Math.round((userWordCount / totalWords) * 100) : 0
  const aiPercentage = 100 - userPercentage

  // Calculate filler words
  const fillerWords: string[] = []
  userEntries.forEach(entry => {
    const words = entry.content.toLowerCase().split(' ')
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:]/, '')
      if (FILLER_WORDS.includes(cleanWord)) {
        fillerWords.push(cleanWord)
      }
    })
  })

  // Calculate interruptions (simplified - based on quick succession of entries)
  let userInterruptions = 0
  let aiInterruptions = 0
  for (let i = 1; i < transcript.length; i++) {
    const current = transcript[i]
    const previous = transcript[i - 1]
    const timeDiff = current.timestamp - previous.timestamp

    if (timeDiff < 1000) { // Less than 1 second apart
      if (current.role === 'user' && previous.role === 'assistant') {
        userInterruptions++
      } else if (current.role === 'assistant' && previous.role === 'user') {
        aiInterruptions++
      }
    }
  }

  // Calculate speaking pace
  const speakingTimeSeconds = totalDurationSeconds
  const wordsPerMinute = speakingTimeSeconds > 0 ?
    Math.round((userWordCount / speakingTimeSeconds) * 60) : 0

  // Calculate response times
  const responseTimes: number[] = []
  for (let i = 1; i < transcript.length; i++) {
    if (transcript[i].role === 'user' && transcript[i - 1].role === 'assistant') {
      responseTimes.push(transcript[i].timestamp - transcript[i - 1].timestamp)
    }
  }

  const averageResponseTime = responseTimes.length > 0 ?
    Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0

  const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b)
  const medianResponseTime = sortedResponseTimes.length > 0 ?
    sortedResponseTimes[Math.floor(sortedResponseTimes.length / 2)] : 0

  // Simple sentiment scoring (would use proper NLP in production)
  const userSentiment = calculateSimpleSentiment(
    userEntries.map(e => e.content).join(' ')
  )
  const aiSentiment = calculateSimpleSentiment(
    aiEntries.map(e => e.content).join(' ')
  )

  return {
    talk_listen_ratio: {
      user_percentage: userPercentage,
      ai_percentage: aiPercentage,
      formatted: `${userPercentage}:${aiPercentage}`
    },
    filler_words: {
      count: fillerWords.length,
      rate_per_minute: speakingTimeSeconds > 0 ?
        Math.round((fillerWords.length / speakingTimeSeconds) * 60 * 100) / 100 : 0,
      words: [...new Set(fillerWords)]
    },
    interruptions: {
      count: userInterruptions + aiInterruptions,
      user_interruptions: userInterruptions,
      ai_interruptions: aiInterruptions
    },
    speaking_pace: {
      words_per_minute: wordsPerMinute,
      total_words: userWordCount,
      speaking_time_seconds: speakingTimeSeconds
    },
    sentiment_score: {
      overall: Math.round((userSentiment + aiSentiment) / 2 * 100) / 100,
      user_sentiment: Math.round(userSentiment * 100) / 100,
      ai_sentiment: Math.round(aiSentiment * 100) / 100
    },
    response_time: {
      average_ms: averageResponseTime,
      median_ms: medianResponseTime,
      max_ms: Math.max(...responseTimes, 0)
    }
  }
}

export function calculateScenarioKPIs(
  transcript: TranscriptEntry[],
  scenarioConfig: {
    required_phrases?: string[]
    objection_keywords?: string[]
    primary_goal?: string
    secondary_goals?: string[]
  }
): ScenarioKPIs {
  const userText = transcript
    .filter(entry => entry.role === 'user')
    .map(entry => entry.content.toLowerCase())
    .join(' ')

  // Required phrases analysis
  const requiredPhrases = scenarioConfig.required_phrases || []
  const mentionedPhrases = requiredPhrases.map(phrase => {
    const mentioned = userText.includes(phrase.toLowerCase())
    const timestamp = mentioned ? findPhraseTimestamp(transcript, phrase) : undefined
    return {
      phrase,
      mentioned,
      timestamp
    }
  })

  // Objection handling
  const objectionKeywords = scenarioConfig.objection_keywords || []
  const objections = objectionKeywords.filter(keyword =>
    userText.includes(keyword.toLowerCase())
  )

  // Open questions count
  const openQuestions = transcript
    .filter(entry => entry.role === 'user')
    .reduce((count, entry) => {
      const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which']
      const hasQuestionMark = entry.content.includes('?')
      const hasQuestionWord = questionWords.some(word =>
        entry.content.toLowerCase().includes(word)
      )
      return count + (hasQuestionMark || hasQuestionWord ? 1 : 0)
    }, 0)

  const totalDurationMinutes = transcript.length > 0 ?
    (transcript[transcript.length - 1].timestamp - transcript[0].timestamp) / 60000 : 1

  return {
    required_phrases: {
      total: requiredPhrases.length,
      mentioned: mentionedPhrases.filter(p => p.mentioned).length,
      percentage: requiredPhrases.length > 0 ?
        Math.round((mentionedPhrases.filter(p => p.mentioned).length / requiredPhrases.length) * 100) : 0,
      phrases: mentionedPhrases
    },
    objection_handling: {
      objections_raised: objections.length,
      objections_addressed: objections.length, // Simplified - assume all are addressed if mentioned
      success_rate: objections.length > 0 ? 100 : 0
    },
    open_questions: {
      count: openQuestions,
      rate_per_minute: Math.round((openQuestions / totalDurationMinutes) * 100) / 100
    },
    goal_achievement: {
      primary_goal_achieved: checkGoalAchievement(userText, scenarioConfig.primary_goal),
      secondary_goals_achieved: (scenarioConfig.secondary_goals || [])
        .filter(goal => checkGoalAchievement(userText, goal)).length,
      total_secondary_goals: (scenarioConfig.secondary_goals || []).length
    }
  }
}

export function calculateOverallScore(
  globalKPIs: GlobalKPIs,
  scenarioKPIs: ScenarioKPIs,
  rubric: {
    global_weights: Record<string, number>
    scenario_weights: Record<string, number>
    max_score: number
  }
): {
  total_score: number
  breakdown: Record<string, { score: number; weight: number; max_points: number }>
} {
  const breakdown: Record<string, { score: number; weight: number; max_points: number }> = {}

  // Global KPI scoring
  const globalScores = {
    talk_listen_ratio: scoreTalkListenRatio(globalKPIs.talk_listen_ratio),
    filler_words: scoreFillerWords(globalKPIs.filler_words),
    interruptions: scoreInterruptions(globalKPIs.interruptions),
    speaking_pace: scoreSpeakingPace(globalKPIs.speaking_pace),
    sentiment: globalKPIs.sentiment_score.user_sentiment,
    response_time: scoreResponseTime(globalKPIs.response_time)
  }

  // Scenario KPI scoring
  const scenarioScores = {
    required_phrases: scenarioKPIs.required_phrases.percentage / 100,
    objection_handling: scenarioKPIs.objection_handling.success_rate / 100,
    open_questions: scoreOpenQuestions(scenarioKPIs.open_questions),
    goal_achievement: scoreGoalAchievement(scenarioKPIs.goal_achievement)
  }

  // Apply weights and calculate breakdown
  let totalScore = 0
  const maxScore = rubric.max_score

  Object.entries(globalScores).forEach(([key, score]) => {
    const weight = rubric.global_weights[key] || 0
    const maxPoints = (weight / 100) * maxScore
    const points = score * maxPoints

    breakdown[`global_${key}`] = {
      score: Math.round(score * 100) / 100,
      weight,
      max_points: maxPoints
    }

    totalScore += points
  })

  Object.entries(scenarioScores).forEach(([key, score]) => {
    const weight = rubric.scenario_weights[key] || 0
    const maxPoints = (weight / 100) * maxScore
    const points = score * maxPoints

    breakdown[`scenario_${key}`] = {
      score: Math.round(score * 100) / 100,
      weight,
      max_points: maxPoints
    }

    totalScore += points
  })

  return {
    total_score: Math.round(totalScore * 100) / 100,
    breakdown
  }
}

const feedbackSchema = z.object({
  summary: z.string().describe("Brief 2-3 sentence summary of performance"),
  strengths: z.array(z.object({
    area: z.string(),
    description: z.string(),
    transcript_reference: z.string().optional()
  })).describe("2-3 key strengths with specific examples"),
  improvements: z.array(z.object({
    area: z.string(),
    description: z.string(),
    suggestion: z.string(),
    transcript_reference: z.string().optional()
  })).describe("2-4 areas for improvement with actionable suggestions"),
  next_steps: z.array(z.string()).describe("3-4 specific action items for improvement")
})

export async function generateAIFeedback(
  transcript: TranscriptEntry[],
  globalKPIs: GlobalKPIs,
  scenarioKPIs: ScenarioKPIs,
  scenario: {
    title: string
    description?: string
    persona: any
    ai_prompt: string
  },
  score: number
): Promise<z.infer<typeof feedbackSchema>> {
  const transcriptText = transcript
    .map(entry => `${entry.role.toUpperCase()}: ${entry.content}`)
    .join('\n')

  const prompt = `You are an expert sales training coach analyzing a voice simulation training session.

SCENARIO CONTEXT:
Title: ${scenario.title}
Description: ${scenario.description || 'N/A'}
Character: ${scenario.persona?.profile?.name || scenario.persona?.role || 'AI Agent'}

PERFORMANCE DATA:
Overall Score: ${score}/100

Talk/Listen Ratio: ${globalKPIs.talk_listen_ratio.formatted}
Filler Words: ${globalKPIs.filler_words.count} (${globalKPIs.filler_words.rate_per_minute}/min)
Speaking Pace: ${globalKPIs.speaking_pace.words_per_minute} WPM
Response Time: ${globalKPIs.response_time.average_ms}ms avg
Sentiment: ${globalKPIs.sentiment_score.user_sentiment}

Required Phrases: ${scenarioKPIs.required_phrases.mentioned}/${scenarioKPIs.required_phrases.total} (${scenarioKPIs.required_phrases.percentage}%)
Open Questions: ${scenarioKPIs.open_questions.count}
Goal Achievement: ${scenarioKPIs.goal_achievement.primary_goal_achieved ? 'Yes' : 'No'}

CONVERSATION TRANSCRIPT:
${transcriptText}

Provide constructive feedback focusing on:
1. Communication effectiveness
2. Sales technique and approach
3. Goal achievement and scenario objectives
4. Areas for specific improvement with actionable suggestions

Be specific and reference actual moments from the conversation when possible.`

  try {
    const result = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: feedbackSchema,
      prompt,
      temperature: 0.7
    })

    return result.object
  } catch (error) {
    console.error('Failed to generate AI feedback:', error)
    // Fallback feedback
    return {
      summary: "Performance analysis completed. Review the metrics and transcript for detailed insights.",
      strengths: [
        {
          area: "Participation",
          description: "Actively engaged in the conversation"
        }
      ],
      improvements: [
        {
          area: "Performance Analysis",
          description: "AI feedback generation encountered an issue",
          suggestion: "Review the conversation transcript and metrics manually for insights"
        }
      ],
      next_steps: [
        "Review conversation transcript",
        "Focus on key performance metrics",
        "Practice identified weak areas",
        "Attempt scenario again for improvement"
      ]
    }
  }
}

// Helper functions
function getEmptyGlobalKPIs(): GlobalKPIs {
  return {
    talk_listen_ratio: { user_percentage: 0, ai_percentage: 0, formatted: '0:0' },
    filler_words: { count: 0, rate_per_minute: 0, words: [] },
    interruptions: { count: 0, user_interruptions: 0, ai_interruptions: 0 },
    speaking_pace: { words_per_minute: 0, total_words: 0, speaking_time_seconds: 0 },
    sentiment_score: { overall: 0, user_sentiment: 0, ai_sentiment: 0 },
    response_time: { average_ms: 0, median_ms: 0, max_ms: 0 }
  }
}

function calculateSimpleSentiment(text: string): number {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'like', 'yes', 'absolutely', 'definitely']
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'no', 'never', 'impossible', 'difficult', 'problem', 'issue']

  const words = text.toLowerCase().split(' ')
  let positiveCount = 0
  let negativeCount = 0

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++
    if (negativeWords.includes(word)) negativeCount++
  })

  const totalSentimentWords = positiveCount + negativeCount
  if (totalSentimentWords === 0) return 0.5

  return positiveCount / totalSentimentWords
}

function findPhraseTimestamp(transcript: TranscriptEntry[], phrase: string): number | undefined {
  const entry = transcript.find(entry =>
    entry.role === 'user' && entry.content.toLowerCase().includes(phrase.toLowerCase())
  )
  return entry?.timestamp
}

function checkGoalAchievement(text: string, goal?: string): boolean {
  if (!goal) return false
  return text.includes(goal.toLowerCase())
}

function scoreTalkListenRatio(ratio: GlobalKPIs['talk_listen_ratio']): number {
  // Optimal range is 60-70% user talk time
  const userPercentage = ratio.user_percentage
  if (userPercentage >= 60 && userPercentage <= 70) return 1.0
  if (userPercentage >= 50 && userPercentage <= 80) return 0.8
  if (userPercentage >= 40 && userPercentage <= 90) return 0.6
  return 0.4
}

function scoreFillerWords(fillerWords: GlobalKPIs['filler_words']): number {
  // Less than 2 per minute is excellent
  const rate = fillerWords.rate_per_minute
  if (rate <= 2) return 1.0
  if (rate <= 4) return 0.8
  if (rate <= 6) return 0.6
  return 0.4
}

function scoreInterruptions(interruptions: GlobalKPIs['interruptions']): number {
  // Fewer interruptions are better
  const count = interruptions.user_interruptions
  if (count <= 1) return 1.0
  if (count <= 3) return 0.8
  if (count <= 5) return 0.6
  return 0.4
}

function scoreSpeakingPace(pace: GlobalKPIs['speaking_pace']): number {
  // Optimal speaking pace is 140-160 WPM
  const wpm = pace.words_per_minute
  if (wpm >= 140 && wpm <= 160) return 1.0
  if (wpm >= 120 && wpm <= 180) return 0.8
  if (wpm >= 100 && wpm <= 200) return 0.6
  return 0.4
}

function scoreResponseTime(responseTime: GlobalKPIs['response_time']): number {
  // Faster response times are better (but not too fast)
  const avgMs = responseTime.average_ms
  if (avgMs >= 1000 && avgMs <= 3000) return 1.0 // 1-3 seconds is good
  if (avgMs >= 500 && avgMs <= 5000) return 0.8
  if (avgMs >= 100 && avgMs <= 8000) return 0.6
  return 0.4
}

function scoreOpenQuestions(openQuestions: ScenarioKPIs['open_questions']): number {
  // More open questions are generally better for sales
  const rate = openQuestions.rate_per_minute
  if (rate >= 3) return 1.0
  if (rate >= 2) return 0.8
  if (rate >= 1) return 0.6
  return 0.4
}

function scoreGoalAchievement(goalAchievement: ScenarioKPIs['goal_achievement']): number {
  let score = 0

  // Primary goal is worth 70%
  if (goalAchievement.primary_goal_achieved) {
    score += 0.7
  }

  // Secondary goals are worth 30%
  if (goalAchievement.total_secondary_goals > 0) {
    const secondaryScore = goalAchievement.secondary_goals_achieved / goalAchievement.total_secondary_goals
    score += secondaryScore * 0.3
  } else {
    score += 0.3 // If no secondary goals, give full credit
  }

  return Math.min(score, 1.0)
}