/**
 * Rubric-Based Scoring Engine
 *
 * Evaluates call attempts against scenario-specific rubrics
 * Combines rule-based and AI-assisted evaluation
 */

import type { ScenarioRubric } from '@/types/scenario'
import type { TranscriptAnalysis } from './transcript-analyzer'

export interface CriterionScore {
  criterion_id: string
  criterion_name: string
  score: number
  max_score: number
  percentage: number
  weight: number
  evidence: string[]
  reasoning: string
  met: boolean
}

export interface RubricScore {
  overall_score: number
  weighted_score: number
  criterion_scores: CriterionScore[]
  critical_failures: string[]
  strengths: string[]
  areas_for_improvement: string[]
}

/**
 * Score an attempt using the scenario rubric
 */
export async function scoreWithRubric(
  transcriptAnalysis: TranscriptAnalysis,
  rubric: ScenarioRubric | undefined,
  transcript: Array<{ role: string; text: string; timestamp: number }>,
  kpis: any
): Promise<RubricScore> {
  console.log('[scoreWithRubric] Rubric provided:', !!rubric)
  console.log('[scoreWithRubric] Rubric keys:', rubric ? Object.keys(rubric) : 'none')

  // Check if rubric is empty or undefined
  const hasRubricCriteria = rubric && Object.keys(rubric).length > 0

  if (!hasRubricCriteria) {
    // Fallback to basic scoring if no rubric defined or empty
    console.log('[scoreWithRubric] Using basic score fallback (no rubric criteria)')
    return generateBasicScore(transcriptAnalysis, kpis)
  }

  const criterionScores: CriterionScore[] = []
  const criticalFailures: string[] = []
  const strengths: string[] = []
  const areasForImprovement: string[] = []

  // Evaluate goal achievement
  if (rubric.goal_achievement) {
    const goalScore = evaluateGoalAchievement(
      transcriptAnalysis,
      rubric.goal_achievement,
      transcript
    )
    criterionScores.push(goalScore)

    if (!goalScore.met && rubric.goal_achievement.required) {
      criticalFailures.push(
        `Goal not achieved: ${rubric.goal_achievement.description}`
      )
    }

    if (goalScore.percentage >= 80) {
      strengths.push(goalScore.criterion_name)
    } else if (goalScore.percentage < 60) {
      areasForImprovement.push(goalScore.criterion_name)
    }
  }

  // Evaluate required phrases
  if (rubric.required_phrases) {
    const phrasesScore = evaluateRequiredPhrases(
      rubric.required_phrases,
      transcript
    )
    criterionScores.push(phrasesScore)

    if (phrasesScore.percentage < 50) {
      criticalFailures.push(
        `Missing required phrases: ${phrasesScore.evidence.join(', ')}`
      )
    }

    if (phrasesScore.percentage >= 80) {
      strengths.push(phrasesScore.criterion_name)
    } else {
      areasForImprovement.push(phrasesScore.criterion_name)
    }
  }

  // Evaluate open questions
  if (rubric.open_questions) {
    const questionsScore = evaluateOpenQuestions(
      rubric.open_questions,
      transcriptAnalysis
    )
    criterionScores.push(questionsScore)

    if (questionsScore.percentage >= 80) {
      strengths.push(questionsScore.criterion_name)
    } else if (questionsScore.percentage < 60) {
      areasForImprovement.push(questionsScore.criterion_name)
    }
  }

  // Evaluate objections handled
  if (rubric.objections_handled) {
    const objectionsScore = evaluateObjectionsHandled(
      rubric.objections_handled,
      transcriptAnalysis,
      transcript
    )
    criterionScores.push(objectionsScore)

    if (objectionsScore.percentage >= 80) {
      strengths.push(objectionsScore.criterion_name)
    } else if (objectionsScore.percentage < 60) {
      areasForImprovement.push(objectionsScore.criterion_name)
    }
  }

  // Evaluate conversation quality
  if (rubric.conversation_quality) {
    const qualityScore = evaluateConversationQuality(
      rubric.conversation_quality,
      transcriptAnalysis,
      kpis
    )
    criterionScores.push(qualityScore)

    if (qualityScore.percentage >= 80) {
      strengths.push(qualityScore.criterion_name)
    } else if (qualityScore.percentage < 60) {
      areasForImprovement.push(qualityScore.criterion_name)
    }
  }

  // Calculate weighted score
  const totalWeight = criterionScores.reduce((sum, c) => sum + c.weight, 0)
  const weightedScore = criterionScores.reduce(
    (sum, c) => sum + (c.percentage * c.weight) / 100,
    0
  )
  const overall = totalWeight > 0 ? Math.round(weightedScore / totalWeight * 100) : 0

  return {
    overall_score: overall,
    weighted_score: Math.round(weightedScore),
    criterion_scores: criterionScores,
    critical_failures: criticalFailures,
    strengths: strengths,
    areas_for_improvement: areasForImprovement,
  }
}

/**
 * Evaluate goal achievement
 */
function evaluateGoalAchievement(
  analysis: TranscriptAnalysis,
  goalConfig: NonNullable<ScenarioRubric['goal_achievement']>,
  transcript: Array<{ role: string; text: string }>
): CriterionScore {
  // Check if key questions were answered
  const questionCompletionRate =
    analysis.questions_asked_by_agent.length > 0
      ? (analysis.questions_asked_by_agent.length - analysis.unanswered_questions.length) /
        analysis.questions_asked_by_agent.length
      : 1.0

  // Check for positive outcome indicators
  const positiveIndicators = [
    /sounds good/i,
    /let's (do it|move forward|proceed)/i,
    /I'm ready/i,
    /thank you/i,
  ]

  const hasPositiveOutcome = transcript.some(m =>
    m.role === 'assistant' && positiveIndicators.some(p => p.test(m.text))
  )

  // Calculate score
  let score = questionCompletionRate * 0.7
  if (hasPositiveOutcome) score += 0.3

  const maxScore = goalConfig.weight
  const actualScore = Math.round(score * maxScore)
  const percentage = Math.round(score * 100)

  const evidence: string[] = []
  if (questionCompletionRate < 1) {
    evidence.push(
      `${analysis.unanswered_questions.length} questions left unanswered`
    )
  }
  if (hasPositiveOutcome) {
    evidence.push('Customer expressed positive intent')
  }

  return {
    criterion_id: 'goal_achievement',
    criterion_name: 'Goal Achievement',
    score: actualScore,
    max_score: maxScore,
    percentage,
    weight: goalConfig.weight,
    evidence,
    reasoning: goalConfig.description,
    met: percentage >= 60,
  }
}

/**
 * Evaluate required phrases
 */
function evaluateRequiredPhrases(
  phrasesConfig: NonNullable<ScenarioRubric['required_phrases']>,
  transcript: Array<{ role: string; text: string }>
): CriterionScore {
  const traineeMessages = transcript
    .filter(m => m.role === 'user')
    .map(m => m.text.toLowerCase())
    .join(' ')

  const mentionedPhrases: string[] = []
  const missingPhrases: string[] = []

  phrasesConfig.phrases.forEach(phrase => {
    const phraseLower = phrase.toLowerCase()
    if (traineeMessages.includes(phraseLower)) {
      mentionedPhrases.push(phrase)
    } else {
      missingPhrases.push(phrase)
    }
  })

  const completionRate = phrasesConfig.phrases.length > 0
    ? mentionedPhrases.length / phrasesConfig.phrases.length
    : 1.0

  const maxScore = phrasesConfig.weight
  const actualScore = Math.round(completionRate * maxScore)
  const percentage = Math.round(completionRate * 100)

  const evidence = [
    ...mentionedPhrases.map(p => `✓ "${p}"`),
    ...missingPhrases.map(p => `✗ Missing: "${p}"`),
  ]

  return {
    criterion_id: 'required_phrases',
    criterion_name: 'Required Phrases',
    score: actualScore,
    max_score: maxScore,
    percentage,
    weight: phrasesConfig.weight,
    evidence,
    reasoning: `Used ${mentionedPhrases.length}/${phrasesConfig.phrases.length} required phrases`,
    met: percentage >= 70,
  }
}

/**
 * Evaluate open questions
 */
function evaluateOpenQuestions(
  questionsConfig: NonNullable<ScenarioRubric['open_questions']>,
  analysis: TranscriptAnalysis
): CriterionScore {
  const questionCount = analysis.questions_asked_by_trainee.length
  const minRequired = questionsConfig.minimum_count

  const completionRate = Math.min(1.0, questionCount / minRequired)

  const maxScore = questionsConfig.weight
  const actualScore = Math.round(completionRate * maxScore)
  const percentage = Math.round(completionRate * 100)

  const evidence = [
    `Asked ${questionCount} questions (minimum: ${minRequired})`,
  ]

  return {
    criterion_id: 'open_questions',
    criterion_name: 'Open Questions',
    score: actualScore,
    max_score: maxScore,
    percentage,
    weight: questionsConfig.weight,
    evidence,
    reasoning: `Asked ${questionCount} open-ended questions`,
    met: questionCount >= minRequired,
  }
}

/**
 * Evaluate objections handled
 */
function evaluateObjectionsHandled(
  objectionsConfig: NonNullable<ScenarioRubric['objections_handled']>,
  analysis: TranscriptAnalysis,
  transcript: Array<{ role: string; text: string }>
): CriterionScore {
  // Detect objections in agent messages
  const objectionKeywords = objectionsConfig.objection_types.map(t => t.toLowerCase())
  const agentMessages = transcript.filter(m => m.role === 'assistant')

  const detectedObjections: string[] = []
  agentMessages.forEach(m => {
    objectionKeywords.forEach(keyword => {
      if (m.text.toLowerCase().includes(keyword)) {
        detectedObjections.push(keyword)
      }
    })
  })

  // Check if objections were addressed (questions answered)
  const objectionResponseRate =
    detectedObjections.length > 0
      ? 1 - (analysis.unanswered_questions.length / Math.max(1, analysis.questions_asked_by_agent.length))
      : 1.0

  const maxScore = objectionsConfig.weight
  const actualScore = Math.round(objectionResponseRate * maxScore)
  const percentage = Math.round(objectionResponseRate * 100)

  const evidence = [
    `${detectedObjections.length} objections detected`,
    `${analysis.unanswered_questions.length} questions left unaddressed`,
  ]

  return {
    criterion_id: 'objections_handled',
    criterion_name: 'Objection Handling',
    score: actualScore,
    max_score: maxScore,
    percentage,
    weight: objectionsConfig.weight,
    evidence,
    reasoning: `Addressed objections with ${percentage}% effectiveness`,
    met: percentage >= 70,
  }
}

/**
 * Evaluate conversation quality
 */
function evaluateConversationQuality(
  qualityConfig: NonNullable<ScenarioRubric['conversation_quality']>,
  analysis: TranscriptAnalysis,
  kpis: any
): CriterionScore {
  // Aggregate quality metrics
  const metrics = {
    professionalism: analysis.response_quality.professionalism_score / 100,
    confidence: analysis.response_quality.confidence_score / 100,
    clarity: analysis.response_quality.clarity_score / 100,
    empathy: Math.min(1.0, analysis.conversation_flow.empathy_expressions / 2),
    talkListenBalance: getTalkListenBalance(kpis.talkListenRatio),
  }

  const avgQuality = Object.values(metrics).reduce((sum, v) => sum + v, 0) / Object.keys(metrics).length

  const maxScore = qualityConfig.weight
  const actualScore = Math.round(avgQuality * maxScore)
  const percentage = Math.round(avgQuality * 100)

  const evidence = [
    `Professionalism: ${analysis.response_quality.professionalism_score}/100`,
    `Confidence: ${analysis.response_quality.confidence_score}/100`,
    `Clarity: ${analysis.response_quality.clarity_score}/100`,
    `Empathy signals: ${analysis.conversation_flow.empathy_expressions}`,
  ]

  return {
    criterion_id: 'conversation_quality',
    criterion_name: 'Conversation Quality',
    score: actualScore,
    max_score: maxScore,
    percentage,
    weight: qualityConfig.weight,
    evidence,
    reasoning: `Overall quality score of ${percentage}% across multiple dimensions`,
    met: percentage >= 70,
  }
}

/**
 * Calculate talk/listen balance score
 */
function getTalkListenBalance(ratio: string): number {
  const [userPercent] = ratio.split(':').map(Number)
  // Ideal is 40-50%
  if (userPercent >= 40 && userPercent <= 50) return 1.0
  if (userPercent >= 35 && userPercent <= 55) return 0.8
  if (userPercent >= 30 && userPercent <= 60) return 0.6
  return 0.4
}

/**
 * Generate basic score when no rubric is defined
 */
function generateBasicScore(
  analysis: TranscriptAnalysis,
  kpis: any
): RubricScore {
  console.log('[generateBasicScore] Starting basic score generation')
  console.log('[generateBasicScore] Analysis:', {
    unanswered_count: analysis.unanswered_questions.length,
    fumbles: analysis.fumbled_responses.length,
    questions_by_agent: analysis.questions_asked_by_agent.length
  })
  console.log('[generateBasicScore] KPIs:', kpis)

  const criterionScores: CriterionScore[] = []
  const criticalFailures: string[] = []

  // CRITICAL: Check for minimum duration and meaningful engagement
  const MIN_DURATION_SECONDS = 60
  const MIN_EXCHANGES = 3 // At least 3 back-and-forth exchanges

  const isDurationTooShort = kpis.duration < MIN_DURATION_SECONDS
  const totalMessages = analysis.questions_asked_by_agent.length + analysis.questions_asked_by_trainee.length
  const hasMinimalEngagement = totalMessages < MIN_EXCHANGES

  if (isDurationTooShort) {
    criticalFailures.push(`Call ended prematurely (${kpis.duration}s) - minimum ${MIN_DURATION_SECONDS}s required`)
  }

  if (hasMinimalEngagement) {
    criticalFailures.push(`Insufficient conversation - only ${totalMessages} exchanges (minimum ${MIN_EXCHANGES} required)`)
  }

  // Question Handling (with duration penalty)
  let questionRate = analysis.questions_asked_by_agent.length > 0
    ? 1 - (analysis.unanswered_questions.length / analysis.questions_asked_by_agent.length)
    : 1.0

  // Apply severe penalty for short calls
  if (isDurationTooShort) {
    questionRate = Math.min(questionRate, 0.3) // Cap at 30% if call is too short
  }

  criterionScores.push({
    criterion_id: 'question_handling',
    criterion_name: 'Question Handling',
    score: Math.round(questionRate * 30),
    max_score: 30,
    percentage: Math.round(questionRate * 100),
    weight: 30,
    evidence: [
      `${analysis.unanswered_questions.length} unanswered questions`,
      ...(isDurationTooShort ? ['Penalty: Call too short'] : [])
    ],
    reasoning: 'Ability to answer customer questions',
    met: questionRate >= 0.7,
  })

  // Response Quality (with engagement penalty)
  let qualityScore = (
    analysis.response_quality.professionalism_score +
    analysis.response_quality.confidence_score +
    analysis.response_quality.clarity_score
  ) / 3

  // Apply severe penalty for minimal engagement
  if (hasMinimalEngagement) {
    qualityScore = Math.min(qualityScore, 40) // Cap at 40% if insufficient conversation
  }

  criterionScores.push({
    criterion_id: 'response_quality',
    criterion_name: 'Response Quality',
    score: Math.round(qualityScore * 0.3),
    max_score: 30,
    percentage: Math.round(qualityScore),
    weight: 30,
    evidence: [
      `Professionalism: ${analysis.response_quality.professionalism_score}`,
      `Confidence: ${analysis.response_quality.confidence_score}`,
      ...(hasMinimalEngagement ? ['Penalty: Insufficient engagement'] : [])
    ],
    reasoning: 'Professional and confident communication',
    met: qualityScore >= 70,
  })

  // Talk/Listen Balance
  const balance = getTalkListenBalance(kpis.talkListenRatio)
  criterionScores.push({
    criterion_id: 'talk_listen',
    criterion_name: 'Talk/Listen Balance',
    score: Math.round(balance * 20),
    max_score: 20,
    percentage: Math.round(balance * 100),
    weight: 20,
    evidence: [`Ratio: ${kpis.talkListenRatio}`],
    reasoning: 'Balanced conversation engagement',
    met: balance >= 0.8,
  })

  // Communication Clarity
  const clarityScore = Math.max(0, 100 - (analysis.fumbled_responses.length * 10))
  criterionScores.push({
    criterion_id: 'clarity',
    criterion_name: 'Communication Clarity',
    score: Math.round(clarityScore * 0.2),
    max_score: 20,
    percentage: clarityScore,
    weight: 20,
    evidence: [`${analysis.fumbled_responses.length} fumbles detected`],
    reasoning: 'Clear, articulate communication',
    met: clarityScore >= 70,
  })

  const overall = Math.round(
    criterionScores.reduce((sum, c) => sum + c.score, 0)
  )

  // Add critical failure for dead air/long pauses
  if (analysis.conversation_flow.dead_air_instances && analysis.conversation_flow.dead_air_instances.length > 2) {
    criticalFailures.push(`Excessive dead air - ${analysis.conversation_flow.dead_air_instances.length} instances of long pauses`)
  }

  console.log('[generateBasicScore] Final scores:', {
    overall,
    criterion_count: criterionScores.length,
    criteria: criterionScores.map(c => ({ name: c.criterion_name, score: c.score })),
    critical_failures: criticalFailures
  })

  return {
    overall_score: overall,
    weighted_score: overall,
    criterion_scores: criterionScores,
    critical_failures: [
      ...criticalFailures,
      ...(analysis.unanswered_questions.length > 2 ? ['Multiple unanswered questions'] : [])
    ],
    strengths: criterionScores.filter(c => c.percentage >= 80).map(c => c.criterion_name),
    areas_for_improvement: criterionScores.filter(c => c.percentage < 70).map(c => c.criterion_name),
  }
}
