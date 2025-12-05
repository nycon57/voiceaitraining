/**
 * Transcript Analysis Engine
 *
 * Analyzes call transcripts to detect:
 * - Questions asked by agent and whether trainee answered them
 * - Response quality (fumbles, confidence, professionalism)
 * - Conversation flow and timing
 * - Language quality indicators
 */

export interface TranscriptMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  isFinal: boolean
}

export interface QuestionInstance {
  question: string
  timestamp: number
  speaker: 'agent' | 'trainee'
  answered: boolean
  trainee_response?: string
  response_timestamp?: number
  response_quality?: 'complete' | 'partial' | 'deflection' | 'none'
  response_time_ms?: number
}

export interface FumbleInstance {
  text: string
  timestamp: number
  fumble_type: 'filler_repetition' | 'incomplete_sentence' | 'repeated_question' | 'uncertainty'
  severity: 'minor' | 'moderate' | 'severe'
  context: string
}

export interface ResponseQualityMetrics {
  confidence_score: number // 0-100
  professionalism_score: number // 0-100
  clarity_score: number // 0-100
  empathy_signals: string[]
  confidence_markers: string[]
  fumbles: FumbleInstance[]
}

export interface ConversationFlowMetrics {
  acknowledgments: number
  empathy_expressions: number
  value_statements: number // "I can help", "Let me explain"
  dead_air_instances: Array<{ start: number; duration_ms: number }>
  interruptions: number
  avg_response_time_ms: number
  max_response_time_ms: number
}

export interface TranscriptAnalysis {
  questions_asked_by_agent: QuestionInstance[]
  questions_asked_by_trainee: QuestionInstance[]
  unanswered_questions: QuestionInstance[]
  weak_responses: QuestionInstance[]
  fumbled_responses: FumbleInstance[]
  response_quality: ResponseQualityMetrics
  conversation_flow: ConversationFlowMetrics
  total_exchanges: number
  trainee_turn_count: number
  agent_turn_count: number
}

/**
 * Main analysis function
 */
export async function analyzeTranscript(
  transcript: TranscriptMessage[],
  personaName: string = 'Agent'
): Promise<TranscriptAnalysis> {
  const finalTranscript = transcript.filter(m => m.isFinal)

  const agentQuestions = detectQuestions(finalTranscript, 'assistant', personaName)
  const traineeQuestions = detectQuestions(finalTranscript, 'user', 'Trainee')

  const { unanswered, weak } = analyzeQuestionResponses(
    agentQuestions,
    finalTranscript
  )

  const fumbles = detectFumbles(finalTranscript, 'user')
  const responseQuality = analyzeResponseQuality(finalTranscript, fumbles)
  const conversationFlow = analyzeConversationFlow(finalTranscript)

  return {
    questions_asked_by_agent: agentQuestions,
    questions_asked_by_trainee: traineeQuestions,
    unanswered_questions: unanswered,
    weak_responses: weak,
    fumbled_responses: fumbles,
    response_quality: responseQuality,
    conversation_flow: conversationFlow,
    total_exchanges: finalTranscript.length,
    trainee_turn_count: finalTranscript.filter(m => m.role === 'user').length,
    agent_turn_count: finalTranscript.filter(m => m.role === 'assistant').length,
  }
}

/**
 * Detect questions in transcript
 */
function detectQuestions(
  transcript: TranscriptMessage[],
  role: 'user' | 'assistant',
  speakerName: string
): QuestionInstance[] {
  const questions: QuestionInstance[] = []

  transcript
    .filter(m => m.role === role)
    .forEach(message => {
      // Simple question detection: contains '?' or starts with question words
      const questionPatterns = [
        /\?/,
        /^(what|where|when|why|how|who|which|can|could|would|will|should|do|does|did|is|are|was|were)\b/i,
      ]

      const isQuestion = questionPatterns.some(pattern => pattern.test(message.text))

      if (isQuestion) {
        questions.push({
          question: message.text,
          timestamp: message.timestamp,
          speaker: role === 'assistant' ? 'agent' : 'trainee',
          answered: false, // Will be determined later
        })
      }
    })

  return questions
}

/**
 * Analyze if questions were answered adequately
 */
function analyzeQuestionResponses(
  questions: QuestionInstance[],
  transcript: TranscriptMessage[]
): { unanswered: QuestionInstance[]; weak: QuestionInstance[] } {
  const unanswered: QuestionInstance[] = []
  const weak: QuestionInstance[] = []

  questions.forEach(question => {
    // Find the next trainee message after this question
    const questionIndex = transcript.findIndex(
      m => m.timestamp === question.timestamp
    )

    if (questionIndex === -1) return

    // Look for trainee response within next 3 messages
    const nextMessages = transcript.slice(questionIndex + 1, questionIndex + 4)
    const traineeResponse = nextMessages.find(m => m.role === 'user')

    if (!traineeResponse) {
      unanswered.push(question)
      return
    }

    const responseTime = traineeResponse.timestamp - question.timestamp
    question.trainee_response = traineeResponse.text
    question.response_timestamp = traineeResponse.timestamp
    question.response_time_ms = responseTime * 1000

    // Analyze response quality
    const quality = assessResponseQuality(traineeResponse.text, question.question)
    question.response_quality = quality
    question.answered = quality !== 'none'

    if (quality === 'none' || quality === 'deflection') {
      unanswered.push(question)
    } else if (quality === 'partial') {
      weak.push(question)
    }
  })

  return { unanswered, weak }
}

/**
 * Assess quality of a response to a question
 */
function assessResponseQuality(
  response: string,
  question: string
): 'complete' | 'partial' | 'deflection' | 'none' {
  const lowerResponse = response.toLowerCase()

  // Check for deflection patterns
  const deflectionPatterns = [
    /what (was|did) you (say|ask|need)/i,
    /can you repeat/i,
    /I don't (know|understand)/i,
  ]

  if (deflectionPatterns.some(p => p.test(response))) {
    return 'deflection'
  }

  // Check for empty/unclear responses
  if (response.length < 10 || /^(uh|um|er|ah|hmm|well)\b/i.test(response)) {
    return 'none'
  }

  // Check if response directly addresses question keywords
  const questionKeywords = extractKeywords(question)
  const responseKeywords = extractKeywords(response)
  const overlap = questionKeywords.filter(kw =>
    responseKeywords.some(rw => rw.includes(kw) || kw.includes(rw))
  )

  // Complete answer: addresses most keywords and provides information
  if (overlap.length >= questionKeywords.length * 0.6 && response.length > 30) {
    return 'complete'
  }

  // Partial answer: some relevance but incomplete
  if (overlap.length > 0 || response.length > 20) {
    return 'partial'
  }

  return 'none'
}

/**
 * Extract keywords from text (remove stop words)
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'can', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'what', 'where', 'when', 'why', 'how', 'who', 'which',
  ])

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
}

/**
 * Detect fumbles in trainee responses
 */
function detectFumbles(
  transcript: TranscriptMessage[],
  role: 'user' | 'assistant'
): FumbleInstance[] {
  const fumbles: FumbleInstance[] = []

  transcript
    .filter(m => m.role === role)
    .forEach((message, index) => {
      const text = message.text
      const lowerText = text.toLowerCase()

      // Detect filler word repetition
      const fillerRepeats = /\b(uh+|um+|er+|ah+)(\s+(uh+|um+|er+|ah+)){2,}/gi
      if (fillerRepeats.test(text)) {
        fumbles.push({
          text,
          timestamp: message.timestamp,
          fumble_type: 'filler_repetition',
          severity: 'moderate',
          context: getContextAround(transcript, index),
        })
      }

      // Detect incomplete sentences
      if (
        text.length > 10 &&
        !text.trim().endsWith('.') &&
        !text.trim().endsWith('?') &&
        !text.trim().endsWith('!') &&
        text.includes(' ')
      ) {
        fumbles.push({
          text,
          timestamp: message.timestamp,
          fumble_type: 'incomplete_sentence',
          severity: 'minor',
          context: getContextAround(transcript, index),
        })
      }

      // Detect repeated question pattern
      const repeatedQuestionPatterns = [
        /what (was|did) you (say|ask|need|want to know)/i,
        /the .+ is what you (said|asked|mentioned)/i,
      ]

      if (repeatedQuestionPatterns.some(p => p.test(text))) {
        fumbles.push({
          text,
          timestamp: message.timestamp,
          fumble_type: 'repeated_question',
          severity: 'severe',
          context: getContextAround(transcript, index),
        })
      }

      // Detect uncertainty markers
      const uncertaintyPatterns = [
        /^(uh|um|er)\s+(yeah|yes|okay|well)/i,
        /I (think|guess|suppose|maybe)/i,
        /kind of|sort of|I don't know/i,
      ]

      if (uncertaintyPatterns.some(p => p.test(text))) {
        fumbles.push({
          text,
          timestamp: message.timestamp,
          fumble_type: 'uncertainty',
          severity: text.length < 20 ? 'severe' : 'moderate',
          context: getContextAround(transcript, index),
        })
      }
    })

  return fumbles
}

/**
 * Get context around a message
 */
function getContextAround(
  transcript: TranscriptMessage[],
  index: number
): string {
  const before = index > 0 ? transcript[index - 1] : null
  const current = transcript[index]
  const after = index < transcript.length - 1 ? transcript[index + 1] : null

  let context = ''
  if (before) context += `[Before] ${before.text}\n`
  context += `[Current] ${current.text}`
  if (after) context += `\n[After] ${after.text}`

  return context
}

/**
 * Analyze overall response quality
 */
function analyzeResponseQuality(
  transcript: TranscriptMessage[],
  fumbles: FumbleInstance[]
): ResponseQualityMetrics {
  const traineeMessages = transcript.filter(m => m.role === 'user')

  // Confidence markers (positive indicators)
  const confidenceMarkers: string[] = []
  const confidencePatterns = [
    /\b(absolutely|certainly|definitely|of course|I can help|let me explain)\b/i,
    /\b(great question|that's a good point|I understand)\b/i,
  ]

  traineeMessages.forEach(m => {
    confidencePatterns.forEach(pattern => {
      const match = m.text.match(pattern)
      if (match) confidenceMarkers.push(match[0])
    })
  })

  // Empathy signals
  const empathySignals: string[] = []
  const empathyPatterns = [
    /\b(I understand|I hear you|that makes sense|I appreciate)\b/i,
    /\b(thank you for|I'm sorry to hear|I can see)\b/i,
  ]

  traineeMessages.forEach(m => {
    empathyPatterns.forEach(pattern => {
      const match = m.text.match(pattern)
      if (match) empathySignals.push(match[0])
    })
  })

  // Calculate scores
  const fumbleCount = fumbles.length
  const severeFumbles = fumbles.filter(f => f.severity === 'severe').length
  const totalWords = traineeMessages.reduce(
    (sum, m) => sum + m.text.split(/\s+/).length,
    0
  )

  // Confidence score (0-100)
  let confidenceScore = 80
  confidenceScore -= severeFumbles * 20
  confidenceScore -= fumbleCount * 5
  confidenceScore += confidenceMarkers.length * 5
  confidenceScore = Math.max(0, Math.min(100, confidenceScore))

  // Professionalism score (0-100)
  let professionalismScore = 85
  const fillerWords = fumbles.filter(f => f.fumble_type === 'filler_repetition').length
  professionalismScore -= fillerWords * 10
  professionalismScore -= severeFumbles * 15
  professionalismScore = Math.max(0, Math.min(100, professionalismScore))

  // Clarity score (0-100)
  let clarityScore = 75
  const incompleteSentences = fumbles.filter(f => f.fumble_type === 'incomplete_sentence').length
  clarityScore -= incompleteSentences * 8
  clarityScore += empathySignals.length * 3
  clarityScore = Math.max(0, Math.min(100, clarityScore))

  return {
    confidence_score: Math.round(confidenceScore),
    professionalism_score: Math.round(professionalismScore),
    clarity_score: Math.round(clarityScore),
    empathy_signals: empathySignals,
    confidence_markers: confidenceMarkers,
    fumbles,
  }
}

/**
 * Analyze conversation flow and timing
 */
function analyzeConversationFlow(
  transcript: TranscriptMessage[]
): ConversationFlowMetrics {
  const traineeMessages = transcript.filter(m => m.role === 'user')

  // Count acknowledgments
  const acknowledgmentPatterns = [
    /\b(yes|yeah|okay|alright|sure|absolutely|I see)\b/i,
  ]
  const acknowledgments = traineeMessages.filter(m =>
    acknowledgmentPatterns.some(p => p.test(m.text))
  ).length

  // Count empathy expressions
  const empathyPatterns = [
    /\b(I understand|I hear you|that makes sense|I appreciate|thank you)\b/i,
  ]
  const empathyExpressions = traineeMessages.filter(m =>
    empathyPatterns.some(p => p.test(m.text))
  ).length

  // Count value statements
  const valuePatterns = [
    /\b(I can help|let me explain|let me clarify|I'll|I will)\b/i,
  ]
  const valueStatements = traineeMessages.filter(m =>
    valuePatterns.some(p => p.test(m.text))
  ).length

  // Calculate response times
  const responseTimes: number[] = []
  for (let i = 1; i < transcript.length; i++) {
    if (transcript[i].role === 'user' && transcript[i - 1].role === 'assistant') {
      const responseTime = (transcript[i].timestamp - transcript[i - 1].timestamp) * 1000
      responseTimes.push(responseTime)
    }
  }

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
    : 0

  const maxResponseTime = responseTimes.length > 0
    ? Math.max(...responseTimes)
    : 0

  // Detect dead air (response time > 5 seconds)
  const deadAirInstances = responseTimes
    .map((time, i) => ({
      start: transcript[i * 2].timestamp,
      duration_ms: time,
    }))
    .filter(instance => instance.duration_ms > 5000)

  return {
    acknowledgments,
    empathy_expressions: empathyExpressions,
    value_statements: valueStatements,
    dead_air_instances: deadAirInstances,
    interruptions: 0, // Would need more sophisticated timing analysis
    avg_response_time_ms: Math.round(avgResponseTime),
    max_response_time_ms: Math.round(maxResponseTime),
  }
}
