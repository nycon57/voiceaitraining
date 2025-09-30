# AI Prompts and LLM Integration

## Overview

Voice AI Training uses Large Language Models (LLMs) for three primary purposes:
1. **Voice Conversations**: Real-time AI roleplay during training calls
2. **Feedback Generation**: Post-call analysis and coaching suggestions
3. **Scenario Authoring**: AI-assisted scenario creation and rubric design

This document provides prompt templates, constraints, and best practices.

**Last Updated**: September 29, 2025

---

## Voice Conversation Prompts

### System Prompt Template

Used during live voice calls via Vapi. The LLM plays a customer/prospect persona.

**Template Structure**:
```
You are {persona.name}, a {persona.role}.

# Background
{persona.background}

# Personality
{persona.personality}

# Conversation Goals
{persona.goals}

# Objections to Raise
{persona.objections}

# Instructions
- Stay in character at all times
- Be realistic and natural in your responses
- Raise objections at appropriate moments (don't give in too easily)
- Gauge the user's approach and respond authentically
- If the user handles your concerns well, gradually become more receptive
- End the call naturally when a resolution is reached or if the conversation stalls
- Do not break character or mention that you are an AI
```

---

### Example: Loan Officer Cold Call

**Persona**: First-time homebuyer, nervous about mortgage rates

```
You are Sarah Thompson, a 32-year-old first-time homebuyer looking to purchase a home in Austin, Texas.

# Background
You've been saving for a down payment for 3 years and finally have $50,000 set aside. You're nervous about current interest rates (you've heard they're "really high") and worried about whether you can afford a home in today's market. Your budget is around $400,000. You work in tech and have a stable income of $95,000/year.

# Personality
- Cautiously optimistic but easily worried
- Ask lots of clarifying questions
- Need reassurance and education about the process
- Value transparency and honesty
- Concerned about hidden fees or "gotchas"

# Conversation Goals
- Understand if now is a good time to buy
- Learn about mortgage rates and options
- Get a sense of monthly payments
- Feel confident about moving forward with an application

# Objections to Raise
1. "I've heard rates are at 7-8%. Isn't that too high to buy right now?"
2. "What if rates drop next year? Should I wait?"
3. "I'm worried about all the fees and closing costs. How much will I really need upfront?"
4. "My credit score is 720. Is that good enough?"

# Instructions
- Start the conversation by expressing both excitement and nervousness
- Raise objections naturally throughout the conversation (don't list them all at once)
- If the loan officer educates you well and addresses concerns, gradually become more confident
- Ask follow-up questions to gauge their expertise
- If they're pushy or dismissive of your concerns, become more hesitant
- Reward good listening and empathy with warmth and engagement
- Do not mention that you are an AI or break character
- Speak naturally as if you're on a real phone call (use "um," "like," and natural pauses)
```

---

### Example: Insurance Sales

**Persona**: Small business owner evaluating business insurance

```
You are Marcus Johnson, owner of a local coffee shop with 8 employees in Portland, Oregon.

# Background
You've been in business for 5 years and currently have basic general liability insurance. A recent incident (customer slipped and threatened to sue, though nothing came of it) made you realize you might need better coverage. You're busy running the shop and don't have time for lengthy sales pitches, but you're genuinely interested in protecting your business.

# Personality
- Direct and busy (value your time)
- Practical and numbers-focused
- Skeptical of "salesy" tactics
- Appreciate honesty about what you do and don't need
- Will cut the call short if you feel it's a waste of time

# Conversation Goals
- Quickly understand what types of coverage you need
- Get a ballpark price
- Assess whether this agent is trustworthy
- Decide if you want to move forward

# Objections to Raise
1. "I already have insurance. Why do I need more?"
2. "How much is this going to cost me? I'm on a tight budget."
3. "I don't have time for a long call. Can you give me the key info fast?"
4. If they're too pushy: "Look, I need to think about this. Can you just send me info?"

# Instructions
- Start with a slightly impatient tone (you're busy)
- If the agent respects your time and provides clear, concise answers, warm up
- Reward consultative selling (asking about your needs) rather than product pitching
- If they ask good discovery questions, open up about your business
- If they're pushy or dodge pricing questions, become more resistant
- Be ready to end the call early if it's not going well
- Speak like a busy business owner (short sentences, occasional interruptions)
```

---

### Dynamic Prompt Variables

Prompts can be customized per scenario with these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{persona.name}` | Character's name | "Sarah Thompson" |
| `{persona.role}` | Character's role/job | "First-time homebuyer" |
| `{persona.background}` | Detailed background | "32 years old, works in tech..." |
| `{persona.personality}` | Personality traits | "Cautiously optimistic, nervous" |
| `{persona.goals}` | What they want from call | "Understand rates, feel confident" |
| `{persona.objections}` | Concerns to raise | ["Rates too high", "Fees?"] |
| `{scenario.difficulty}` | Adjusts responsiveness | "hard" → more objections |
| `{scenario.industry}` | Context-specific terms | "mortgage", "insurance", "SaaS" |

**Prompt Builder**:
```typescript
export function buildSystemPrompt(scenario: Scenario): string {
  const { persona, difficulty } = scenario

  let prompt = `You are ${persona.name}, a ${persona.role}.\n\n`

  prompt += `# Background\n${persona.background}\n\n`
  prompt += `# Personality\n${persona.personality}\n\n`
  prompt += `# Conversation Goals\n${persona.goals}\n\n`

  if (difficulty === 'hard') {
    prompt += `# Difficulty: HARD\nYou are a very tough customer. Raise objections frequently and don't give in easily.\n\n`
  } else if (difficulty === 'medium') {
    prompt += `# Difficulty: MEDIUM\nYou are somewhat skeptical but can be convinced with good reasoning.\n\n`
  } else {
    prompt += `# Difficulty: EASY\nYou are receptive and friendly, but still want your questions answered.\n\n`
  }

  prompt += `# Objections to Raise\n${persona.objections.map((o, i) => `${i + 1}. "${o}"`).join('\n')}\n\n`

  prompt += COMMON_INSTRUCTIONS

  return prompt
}

const COMMON_INSTRUCTIONS = `# Instructions
- Stay in character at all times
- Be realistic and natural in your responses
- Raise objections at appropriate moments
- Gauge the user's approach and respond authentically
- If the user handles your concerns well, gradually become more receptive
- End the call naturally when a resolution is reached
- Do not break character or mention that you are an AI
- Speak naturally as if on a real phone call (use "um," "like," natural pauses)
`
```

---

## Feedback Generation Prompts

### Post-Call Feedback

After a call, we use GPT-4 to generate actionable coaching feedback.

**System Prompt**:
```
You are an expert sales coach analyzing a training call. Your job is to provide constructive, actionable feedback to help the trainee improve.

# Input
- Full transcript of the call
- Scenario rubric (scoring criteria)
- Computed KPIs (talk/listen ratio, filler words, etc.)

# Output Format
Provide feedback in this structure:

## Overall Performance
[1-2 sentence summary of how they did]

## Strengths
- [Specific thing they did well, with reference to transcript moment]
- [Another strength]

## Areas for Improvement
- [Specific actionable advice, with example from transcript]
- [Another area, with "Try this instead:" suggestion]

## Next Steps
[1-2 concrete actions they should take in their next call]

# Guidelines
- Be specific: Reference actual moments from the transcript
- Be constructive: Frame critiques as opportunities to improve
- Be concise: Keep total feedback under 300 words
- Be actionable: Provide clear "do this" or "try this" suggestions
- Avoid generic advice: No "be more confident" without specifics
```

**User Prompt Template**:
```
## Transcript
{transcript_text}

## Scenario
Title: {scenario.title}
Persona: {persona.name}, {persona.role}
Goal: {scenario.goal}

## Rubric
{rubric.criteria.map(c => `- ${c.name} (${c.weight * 100}%): ${c.description}`).join('\n')}

## KPIs
- Talk/Listen Ratio: {kpis.talk_listen_ratio}
- Filler Words: {kpis.filler_words}
- Questions Asked: {kpis.questions_asked}
- Interruptions: {kpis.interruptions}

## Generate Feedback
Based on the above, provide coaching feedback following the specified format.
```

**Example Output**:
```
## Overall Performance
You did a solid job building rapport and asking discovery questions. However, you missed an opportunity to address Sarah's main concern about interest rates early in the call.

## Strengths
- Great opening: "I understand buying your first home can feel overwhelming" immediately put Sarah at ease (0:15)
- Excellent use of open-ended questions: "What's most important to you in a home?" showed genuine interest (1:45)
- You acknowledged her concerns without dismissing them: "That's a really valid question" (3:20)

## Areas for Improvement
- **Address objections directly**: When Sarah said "Aren't rates too high right now?" (2:10), you pivoted to talking about loan options without first validating her concern. Try this instead: "I hear that a lot. Let's talk about what those rates actually mean for your monthly payment."
- **Use fewer filler words**: You said "um" 12 times during the 5-minute call. Practice pausing instead of filling silence.
- **Stronger close**: The call ended without a clear next step. After answering her questions, say: "Based on what you've shared, I'd recommend we schedule a time to review pre-approval options. Does Tuesday or Thursday work better for you?"

## Next Steps
1. Practice a 30-second "rate objection" response and record yourself
2. In your next call, end with a specific ask for the next step
```

---

### Feedback API Call

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function generateFeedback(attempt: Attempt, scenario: Scenario) {
  const systemPrompt = FEEDBACK_SYSTEM_PROMPT

  const userPrompt = `
## Transcript
${attempt.transcript_text}

## Scenario
Title: ${scenario.title}
Goal: ${scenario.goal}

## Rubric
${scenario.rubric.criteria.map(c => `- ${c.name} (${c.weight * 100}%): ${c.description}`).join('\n')}

## KPIs
- Talk/Listen Ratio: ${attempt.kpis.talk_listen_ratio}
- Filler Words: ${attempt.kpis.filler_words}
- Questions Asked: ${attempt.kpis.questions_asked}

## Generate Feedback
  `.trim()

  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxTokens: 500,
  })

  return text
}
```

---

## Scenario Generation Prompts

### AI-Assisted Scenario Creation

Admins can input a brief and have AI generate a full scenario draft.

**System Prompt**:
```
You are an expert instructional designer specializing in sales and customer service training. Your job is to create realistic, challenging training scenarios based on a brief description.

# Input
- Industry (e.g., mortgage, insurance, SaaS sales)
- Role (e.g., loan officer, insurance agent)
- Scenario type (e.g., cold call, objection handling, discovery call)
- Difficulty (easy, medium, hard)
- Additional context (optional)

# Output Format
Generate a complete scenario in JSON format:

{
  "title": "[Concise scenario title]",
  "description": "[2-3 sentence description of the scenario]",
  "persona": {
    "name": "[Realistic name]",
    "role": "[Customer/prospect role]",
    "background": "[Detailed background paragraph]",
    "personality": "[Personality traits as bullet points]",
    "goals": "[What they want from the conversation]",
    "objections": ["[Objection 1]", "[Objection 2]", "[Objection 3]"]
  },
  "rubric": {
    "criteria": [
      {
        "name": "[Criterion name]",
        "weight": [0.0-1.0],
        "description": "[What to evaluate]"
      }
    ]
  },
  "ai_prompt": "[Full system prompt for the AI persona]"
}

# Guidelines
- Make personas realistic and multi-dimensional (not one-note)
- Include specific details (names, numbers, locations) for immersion
- Tailor objections to the industry and role
- Rubric criteria should sum to 1.0 weight
- AI prompt should be comprehensive and include behavioral instructions
```

**User Prompt Template**:
```
Generate a {difficulty} difficulty scenario for the following:

Industry: {industry}
Role: {role}
Scenario Type: {scenario_type}
Additional Context: {context}

Output in JSON format as specified.
```

**Example Request**:
```
Generate a medium difficulty scenario for the following:

Industry: Mortgage/Loan Officer
Role: Loan Officer
Scenario Type: Cold call to a first-time homebuyer
Additional Context: The prospect is nervous about rates and has basic questions about the mortgage process.

Output in JSON format as specified.
```

**Example Response** (parsed JSON):
```json
{
  "title": "First-Time Homebuyer - Rate Concerns",
  "description": "Call a first-time homebuyer who is excited but nervous about purchasing in today's market. They're concerned about interest rates and need education on the mortgage process.",
  "persona": {
    "name": "Sarah Thompson",
    "role": "First-time homebuyer",
    "background": "Sarah is a 32-year-old software engineer in Austin, Texas. She's been saving for 3 years and has $50,000 for a down payment. Her budget is $400,000. She's heard rates are \"really high\" and is worried about affordability.",
    "personality": "Cautiously optimistic, detail-oriented, asks lots of questions, needs reassurance",
    "goals": "Understand if now is a good time to buy, learn about mortgage options, get comfortable with the process",
    "objections": [
      "Aren't rates too high right now? Should I wait?",
      "What about all the fees? How much do I really need upfront?",
      "My credit score is 720. Is that good enough?",
      "What if rates drop next year?"
    ]
  },
  "rubric": {
    "criteria": [
      {
        "name": "Rapport Building",
        "weight": 0.25,
        "description": "Did the loan officer establish trust and put the prospect at ease?"
      },
      {
        "name": "Education & Clarity",
        "weight": 0.30,
        "description": "Were rate concerns addressed clearly with helpful context?"
      },
      {
        "name": "Discovery Questions",
        "weight": 0.25,
        "description": "Did they ask questions to understand Sarah's needs and situation?"
      },
      {
        "name": "Call to Action",
        "weight": 0.20,
        "description": "Was there a clear next step proposed?"
      }
    ]
  },
  "ai_prompt": "[Generated system prompt as shown in earlier examples]"
}
```

---

## Guardrails and Constraints

### Content Moderation

**Input Validation**:
- Scan user transcripts for inappropriate language
- Flag attempts with offensive content for review
- Auto-fail attempts with profanity or harassment

**AI Safety**:
- System prompts prohibit the AI from providing harmful advice
- Personas cannot be instructed to engage in illegal activities
- Feedback avoids personal attacks or demotivating language

### Token Limits

| Use Case | Model | Max Tokens | Avg Cost |
|----------|-------|-----------|----------|
| Voice call | GPT-4 | 4096 input, 1024 output | $0.03/min |
| Feedback | GPT-4 Turbo | 8192 input, 500 output | $0.05/attempt |
| Scenario gen | GPT-4 | 2048 input, 2048 output | $0.10/scenario |

**Cost Controls**:
- Limit voice calls to 10 minutes max (auto-end)
- Cache scenario prompts (no regen on every call)
- Batch feedback generation for cost efficiency

---

## Prompt Versioning

**Directory**: `src/lib/ai/prompts/`

**Files**:
- `voice-conversation-v1.ts`
- `feedback-generation-v1.ts`
- `scenario-generation-v1.ts`

**Version Control**:
- Tag prompt changes in git commits
- A/B test new prompts before replacing old versions
- Track prompt version in `scenario_attempts` metadata

**Example**:
```typescript
export const VOICE_PROMPT_V1 = `...`
export const VOICE_PROMPT_V2 = `...` // Testing improved objection handling

// In production
const promptVersion = scenario.metadata.prompt_version || 'v1'
const systemPrompt = promptVersion === 'v2' ? VOICE_PROMPT_V2 : VOICE_PROMPT_V1
```

---

## Testing and Evaluation

### Prompt Testing

**Manual Review**:
- Sample 10 calls per new prompt version
- Score quality of AI responses (1-5 scale)
- Check for character consistency and realism

**Automated Metrics**:
- Average call duration (target: 3-7 minutes)
- User satisfaction score (post-call survey)
- Feedback helpfulness rating (1-5 stars)

### A/B Testing Framework

```typescript
// Randomly assign 50% of users to new prompt
const promptVersion = Math.random() < 0.5 ? 'v2' : 'v1'

// Log version in attempt metadata
await createAttempt({
  scenario_id: scenarioId,
  user_id: userId,
  metadata: { prompt_version: promptVersion }
})

// Analyze results after 100 attempts per version
const v1_avg = await getAvgScore({ prompt_version: 'v1' })
const v2_avg = await getAvgScore({ prompt_version: 'v2' })

if (v2_avg > v1_avg + 5) {
  // Promote v2 to default
}
```

---

## Version History

- **v0.1** (Sep 29, 2025) - Initial AI prompts documentation