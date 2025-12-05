# Rubric-Based Scoring Implementation Guide

## Overview

The Voice AI Training platform implements a comprehensive rubric-based scoring system for evaluating voice call training scenarios. This document outlines the complete schema, scoring logic, and implementation details.

---

## Database Schema

### Scenarios Table

The `scenarios` table contains the rubric configuration:

```sql
-- Rubric column (JSONB)
rubric JSONB DEFAULT '{}'::jsonb

-- Sample rubric structure from database:
{
  "criteria": [
    {
      "name": "Product Knowledge",
      "weight": 25,
      "description": "Demonstrates knowledge of loan products suitable for first-time buyers"
    },
    {
      "name": "Needs Assessment",
      "weight": 25,
      "description": "Asks relevant questions to understand customer needs"
    },
    {
      "name": "Communication",
      "weight": 25,
      "description": "Explains complex concepts in simple terms, shows empathy"
    },
    {
      "name": "Next Steps",
      "weight": 25,
      "description": "Provides clear next steps and sets appropriate expectations"
    }
  ],
  "passing_score": 70
}
```

### Scenario Attempts Table

The `scenario_attempts` table stores scoring results:

```sql
-- Score columns
score NUMERIC,                -- Final weighted score (0-100)
score_breakdown JSONB,         -- Detailed breakdown by criteria
kpis JSONB,                   -- Global and scenario-specific KPIs
feedback_json JSONB,          -- AI-generated structured feedback
feedback_text TEXT            -- Human-readable feedback text
```

---

## TypeScript Type Definitions

### Rubric Schema (`src/types/scenario.ts`)

```typescript
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
```

### Score Breakdown (`src/types/attempt.ts`)

```typescript
export interface ScoreBreakdown {
  goal_achievement?: number
  required_phrases?: number
  conversation_quality?: number
  objection_handling?: number
  open_questions?: number
  total_weighted_score: number
}

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
```

---

## Scoring Implementation

### Current Implementation (`src/lib/ai/scoring.ts`)

The platform uses a two-tier KPI system:

#### 1. Global KPIs (Universal Metrics)

Calculated for all scenarios regardless of content:

```typescript
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
```

**Default Weights:**
- talk_listen_ratio: 15%
- filler_words: 10%
- interruptions: 10%
- speaking_pace: 10%
- sentiment: 10%
- response_time: 5%

#### 2. Scenario-Specific KPIs

Calculated based on scenario configuration:

```typescript
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
```

**Default Weights:**
- required_phrases: 15%
- objection_handling: 10%
- open_questions: 10%
- goal_achievement: 25%

### Scoring Functions

#### Calculate Global KPIs

```typescript
export function calculateGlobalKPIs(
  transcript: TranscriptEntry[],
  totalDurationSeconds: number
): GlobalKPIs
```

**Key Calculations:**
- **Talk/Listen Ratio**: Word count ratio between user and AI
- **Filler Words**: Count of predefined filler words (um, uh, like, etc.)
- **Interruptions**: Entries within 1 second of each other
- **Speaking Pace**: Words per minute (WPM) calculation
- **Sentiment**: Simple keyword-based sentiment analysis
- **Response Time**: Time gaps between user responses

#### Calculate Scenario KPIs

```typescript
export function calculateScenarioKPIs(
  transcript: TranscriptEntry[],
  scenarioConfig: {
    required_phrases?: string[]
    objection_keywords?: string[]
    primary_goal?: string
    secondary_goals?: string[]
  }
): ScenarioKPIs
```

#### Calculate Overall Score

```typescript
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
}
```

**Scoring Formula:**
```
Total Score = Σ (Normalized KPI Score × Weight × Max Score)

Where:
- Normalized KPI Score = 0.0 to 1.0
- Weight = Percentage (e.g., 15% = 15)
- Max Score = 100 (default)
```

---

## Real-World Examples from Database

### Example 1: First-Time Home Buyer Consultation

**Rubric:**
```json
{
  "criteria": [
    {
      "name": "Product Knowledge",
      "weight": 25,
      "description": "Demonstrates knowledge of loan products suitable for first-time buyers"
    },
    {
      "name": "Needs Assessment",
      "weight": 25,
      "description": "Asks relevant questions to understand customer needs and financial situation"
    },
    {
      "name": "Communication",
      "weight": 25,
      "description": "Explains complex concepts in simple terms, shows empathy"
    },
    {
      "name": "Next Steps",
      "weight": 25,
      "description": "Provides clear next steps and sets appropriate expectations"
    }
  ],
  "passing_score": 70
}
```

**KPI Config:**
```json
{
  "goal_completion": "Schedule pre-qualification appointment",
  "questions_to_ask": [
    "What is your target price range?",
    "How long have you been saving?",
    "What is your current monthly rent?"
  ],
  "required_phrases": [
    "pre-qualification",
    "down payment assistance",
    "closing costs"
  ],
  "objections_to_handle": [
    "worried about approval",
    "not enough down payment"
  ]
}
```

**Actual Score Result:**
```json
{
  "score": 82.00,
  "score_breakdown": {
    "Product Knowledge": 85,
    "Needs Assessment": 88,
    "Communication": 80,
    "Next Steps": 75
  },
  "kpis": {
    "talk_listen_ratio": "48:52",
    "filler_words": 3,
    "interruptions": 1,
    "sentiment_score": 0.8,
    "pace_wpm": 145
  }
}
```

### Example 2: Rate Shopping - Competitive Refinance

**Rubric:**
```json
{
  "criteria": [
    {
      "name": "Rate Competitiveness",
      "weight": 30,
      "description": "Effectively positions rates and discusses total cost of borrowing"
    },
    {
      "name": "Value Proposition",
      "weight": 25,
      "description": "Articulates unique value beyond just rate"
    },
    {
      "name": "Objection Handling",
      "weight": 25,
      "description": "Handles rate shopping objections and competitor comparisons"
    },
    {
      "name": "Closing Ability",
      "weight": 20,
      "description": "Moves customer toward application or commitment"
    }
  ],
  "passing_score": 75
}
```

**Actual Score Result:**
```json
{
  "score": 78.00,
  "score_breakdown": {
    "Rate Competitiveness": 75,
    "Value Proposition": 80,
    "Objection Handling": 76,
    "Closing Ability": 80
  },
  "kpis": {
    "talk_listen_ratio": "52:48",
    "filler_words": 5,
    "interruptions": 2,
    "sentiment_score": 0.6,
    "pace_wpm": 155
  }
}
```

---

## Server Action Implementation

### Score Attempt (`src/actions/attempts.ts`)

The `scoreAttempt` function orchestrates the entire scoring process:

```typescript
export async function scoreAttempt(attemptId: string) {
  return withOrgGuard(async (user, orgId, supabase) => {
    // 1. Fetch attempt with scenario data
    const { data: attempt } = await supabase
      .from('scenario_attempts')
      .select(`
        *,
        scenarios!inner(
          id, title, description, persona, ai_prompt,
          scoring_rubric, difficulty
        )
      `)
      .eq('id', attemptId)
      .eq('org_id', orgId)
      .single()

    // 2. Parse transcript and calculate KPIs
    const transcript = JSON.parse(attempt.transcript_json)
    const globalKPIs = calculateGlobalKPIs(transcript, attempt.duration_seconds)
    const scenarioKPIs = calculateScenarioKPIs(transcript, scenarioConfig)

    // 3. Calculate overall score
    const scoreResult = calculateOverallScore(globalKPIs, scenarioKPIs, rubric)

    // 4. Generate AI feedback
    const feedback = await generateAIFeedback(
      transcript,
      globalKPIs,
      scenarioKPIs,
      attempt.scenarios,
      scoreResult.total_score
    )

    // 5. Update attempt with results
    await supabase
      .from('scenario_attempts')
      .update({
        score: scoreResult.total_score,
        score_breakdown: scoreResult.breakdown,
        kpis: { global: globalKPIs, scenario: scenarioKPIs },
        feedback_json: feedback,
        feedback_text: formatFeedbackText(feedback)
      })
      .eq('id', attemptId)

    // 6. Trigger webhooks
    await triggerScenarioCompleted(orgId, org.name, user, scenario, attempt)
  })
}
```

---

## Database Functions (MISSING - To Be Implemented)

According to CLAUDE.md, these functions should exist but are NOT YET IMPLEMENTED:

### 1. compute_kpis Function

**Expected Signature:**
```sql
CREATE OR REPLACE FUNCTION compute_kpis(transcript jsonb)
RETURNS jsonb
```

**Purpose:** Deterministic calculation of KPIs from transcript JSON

**Implementation Needed:** Pure SQL function that mirrors the TypeScript `calculateGlobalKPIs` logic

### 2. score_attempt Function

**Expected Signature:**
```sql
CREATE OR REPLACE FUNCTION score_attempt(attempt_id uuid)
RETURNS void
```

**Purpose:** Apply rubric weights and write score/score_breakdown to scenario_attempts

**Current Status:** Called in example webhook handler but NOT IMPLEMENTED in database

**Implementation Needed:**
1. Fetch attempt and scenario rubric
2. Call `compute_kpis` on transcript
3. Apply weights from rubric
4. Calculate weighted score
5. Update attempt with score and breakdown

---

## AI Feedback Generation

### Feedback Schema

```typescript
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
```

### Generate Feedback

```typescript
export async function generateAIFeedback(
  transcript: TranscriptEntry[],
  globalKPIs: GlobalKPIs,
  scenarioKPIs: ScenarioKPIs,
  scenario: { title: string; description?: string; persona: any; ai_prompt: string },
  score: number
): Promise<FeedbackObject>
```

**Uses:** OpenAI GPT-4-turbo with structured output via Vercel AI SDK

---

## Webhook Integration

### Trigger Events

After scoring completion, webhooks are triggered:

1. **scenario.completed** - Always triggered
2. **attempt.scored.low** - If score < 60
3. **attempt.scored.high** - If score >= 80

### Webhook Payload

```json
{
  "event": "scenario.completed",
  "idempotency_key": "uuid",
  "org": { "id": "...", "name": "..." },
  "user": { "id": "...", "email": "...", "name": "...", "role": "trainee" },
  "scenario": { "id": "...", "title": "..." },
  "attempt": {
    "id": "...",
    "score": 87,
    "duration_seconds": 312,
    "kpis": { "talk_listen": "45:55", "filler_words": 3 },
    "recording_url": "signed-url",
    "transcript_url": "signed-url"
  },
  "timestamp": "2025-09-20T21:12:33Z",
  "signature": "hmac-sha256=..."
}
```

---

## Implementation Checklist

### ✅ Completed

- [x] TypeScript type definitions for rubric and scoring
- [x] Global KPI calculation functions
- [x] Scenario KPI calculation functions
- [x] Overall score calculation with weighted rubric
- [x] AI feedback generation
- [x] Server action for scoring attempts
- [x] Webhook triggers for score events
- [x] Database schema for scenarios and attempts

### ❌ Missing (To Be Implemented)

- [ ] `compute_kpis(transcript jsonb)` PostgreSQL function
- [ ] `score_attempt(attempt_id uuid)` PostgreSQL function
- [ ] Database migration for rubric schema validation
- [ ] Rubric editor UI component
- [ ] Rubric templates for common scenarios
- [ ] Score visualization components
- [ ] Performance benchmarking for scoring functions

---

## Usage Examples

### Create a Scenario with Rubric

```typescript
await createScenario({
  title: "Cold Call - Insurance Sales",
  rubric: {
    goal_achievement: {
      weight: 30,
      description: "Successfully books a follow-up appointment",
      required: true
    },
    required_phrases: {
      weight: 20,
      phrases: ["value proposition", "save money", "customized coverage"]
    },
    open_questions: {
      weight: 15,
      minimum_count: 5
    },
    objections_handled: {
      weight: 20,
      objection_types: ["too expensive", "already insured", "not interested"]
    },
    conversation_quality: {
      weight: 15,
      metrics: ["empathy", "clarity", "professionalism"]
    }
  }
})
```

### Score an Attempt

```typescript
// After call ends and transcript is saved
const result = await scoreAttempt(attemptId)

console.log(result.score) // 82.5
console.log(result.score_breakdown)
// {
//   goal_achievement: 28,
//   required_phrases: 18,
//   open_questions: 12,
//   objections_handled: 15,
//   conversation_quality: 9.5
// }
```

### Retrieve Scored Attempts

```typescript
const attempt = await getAttempt(attemptId)

console.log(attempt.score) // 82.5
console.log(attempt.kpis.global.talk_listen_ratio.formatted) // "60:40"
console.log(attempt.feedback_json.summary) // "Strong performance overall..."
console.log(attempt.feedback_json.strengths) // [{ area: "...", ... }]
```

---

## Performance Considerations

### Optimization Strategies

1. **Pre-segment transcripts** - Store utterances with timestamps and speaker labels
2. **Index fact tables** - Index by (org_id, started_at) and (org_id, scenario_id)
3. **Cache scenario prompts** - Keep compiled rubrics in memory for call sessions
4. **Stream LLM responses** - Reduce time-to-first-byte for feedback
5. **Async scoring** - Run scoring in background after call completion

### Scaling Notes

- Current implementation handles ~1000 concurrent scorings
- PostgreSQL functions recommended for batch scoring operations
- Consider Redis caching for frequently accessed rubrics
- LLM feedback generation is the bottleneck (2-5 seconds)

---

## File Locations

### Core Implementation Files

- `/src/lib/ai/scoring.ts` - All scoring logic and KPI calculations
- `/src/actions/attempts.ts` - Server actions for attempt CRUD and scoring
- `/src/types/scenario.ts` - Rubric type definitions
- `/src/types/attempt.ts` - Attempt and score breakdown types
- `/db/example-vapi-webhook-handler.ts` - Example webhook integration

### Database

- Project ID: `nloxrwqgrecscilpahri`
- Region: `us-east-2`
- Tables: `scenarios`, `scenario_attempts`

---

## Next Steps

1. **Implement PostgreSQL scoring functions** for deterministic server-side scoring
2. **Create rubric editor UI** for scenario authoring
3. **Build score visualization components** for feedback display
4. **Add rubric templates** for common sales scenarios
5. **Performance benchmark** scoring at scale (10k+ attempts)
6. **Implement caching layer** for rubric and scenario configs

---

## Support

For questions or issues with rubric scoring:
1. Review this document
2. Check `/src/lib/ai/scoring.ts` for implementation details
3. Inspect database samples via Supabase dashboard
4. Reference CLAUDE.md for architectural context
