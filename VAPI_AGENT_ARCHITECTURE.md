# Vapi Agent Architecture - Base Agents + Transient Overrides

**Last Updated**: October 3, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

---

## 🎯 Overview

This document explains the **Base Agent + Transient Override** architecture for Vapi voice assistants. This pattern enables infinite scenario scalability using only 4 permanent base agents.

### Key Benefits

- **Scalability**: 1,000+ scenarios use only 4 permanent agents
- **Performance**: No API calls to create assistants (instant call start)
- **Cost Efficiency**: Pay for 4 agents, not 1,000+
- **Flexibility**: Full customization via database-stored scenario data
- **Maintainability**: Update base behavior affects all scenarios using that agent

---

## 📐 Architecture Pattern

### The Problem We're Solving

**Before (Inefficient)**:
- Create a unique Vapi assistant for every scenario
- 1,000 scenarios = 1,000 permanent assistants in Vapi
- API call to create assistant on every call start (slow)
- Difficult to update behaviors across scenarios

**After (Efficient)**:
- 4 permanent base agents with core personalities
- Each scenario references one base agent
- Scenario-specific context injected via transient overrides at call-time
- 1,000 scenarios = 4 permanent assistants (scalable)

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vapi Dashboard                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Professional │  │  Difficult   │  │   Friendly   │  + 1 more│
│  │   Customer   │  │   Customer   │  │   Prospect   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│   asst_abc123       asst_def456       asst_ghi789             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Environment Variables
                   (VAPI_AGENT_PROFESSIONAL, etc.)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Database: scenarios                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Scenario: "First-time Homebuyer"                         │  │
│  │ vapi_base_agent: "friendly"                              │  │
│  │ persona: { name: "Sarah", background: "..." }            │  │
│  │ ai_prompt: "You're excited but nervous..."               │  │
│  │ difficulty: "easy"                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Call Start (API Route)
                  buildAssistantOverrides(scenario)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Transient Configuration                        │
│  {                                                              │
│    assistantId: "asst_ghi789",  // Base: friendly             │
│    assistantOverrides: {                                       │
│      model: {                                                  │
│        messages: [{                                            │
│          role: "system",                                       │
│          content: "You are Sarah, a first-time homebuyer..." │
│        }],                                                     │
│        temperature: 0.6                                        │
│      },                                                        │
│      voice: { provider: "elevenlabs", voiceId: "bella" },    │
│      firstMessage: "Hello, this is Sarah..."                  │
│    }                                                           │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Vapi Web SDK: vapi.start(config)
                              ↓
                      Live Voice Call 🎙️
```

---

## 🏗️ Implementation Components

### 1. Base Agents (Permanent in Vapi)

Four permanent assistants created manually in Vapi Dashboard:

| Agent Type      | Personality                          | Use Cases                       | Voice     |
|-----------------|--------------------------------------|---------------------------------|-----------|
| **Professional**| Polite, thoughtful, businesslike     | Standard sales calls, B2B       | Sarah     |
| **Difficult**   | Skeptical, demanding, impatient      | Objection handling, tough cases | Antoni    |
| **Friendly**    | Warm, enthusiastic, receptive        | Easy scenarios, new trainees    | Bella     |
| **Neutral**     | Balanced, reactive to performance    | Testing, mixed scenarios        | Customizable |

### 2. Database Schema

```sql
-- scenarios table
ALTER TABLE scenarios
  ADD COLUMN vapi_base_agent TEXT DEFAULT 'professional',
  ADD COLUMN vapi_overrides JSONB DEFAULT NULL;

-- Valid agent types
CHECK (vapi_base_agent IN ('professional', 'difficult', 'friendly', 'neutral'))
```

**Example Scenario Record**:
```json
{
  "id": "uuid",
  "title": "Skeptical Refinance Client",
  "vapi_base_agent": "difficult",
  "persona": {
    "name": "Robert Miller",
    "role": "Experienced homeowner",
    "background": "Has been burned by lenders before",
    "objectives": ["Get lowest rate", "Avoid hidden fees"],
    "pain_points": ["Previous bad experience", "Trust issues"]
  },
  "ai_prompt": "You're skeptical. Challenge claims. Only convinced by numbers.",
  "difficulty": "hard",
  "vapi_overrides": {
    "temperature": 0.9,
    "voice_emotion": "stern",
    "max_duration_seconds": 900
  }
}
```

### 3. Code Architecture

**File Structure**:
```
src/
├── lib/
│   ├── vapi-agents.ts ........... Base agent configs, helper functions
│   └── vapi.ts .................. Client-side Vapi manager
├── types/
│   └── scenario.ts .............. VapiBaseAgent, VapiOverrides types
└── app/api/calls/start/
    └── route.ts ................. Builds transient overrides
```

**Key Functions**:

```typescript
// Get permanent assistant ID
getAssistantId('professional') → 'asst_abc123'

// Build scenario-specific overrides
buildAssistantOverrides(scenario) → {
  model: { messages: [...], temperature: 0.7 },
  voice: { provider: 'elevenlabs', voiceId: 'sarah' },
  firstMessage: "Hello, I'm ready when you are."
}

// Build dynamic system prompt
buildSystemPrompt(scenario) → "You are Sarah, a first-time..."
```

---

## 🚀 Setup Guide

### Step 1: Create Base Agents in Vapi Dashboard

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai) → **Assistants**
2. Create **4 assistants** with these configurations:

#### Professional Customer
```
Name: Professional Customer - Base Agent
Model: GPT-4 or GPT-3.5-turbo
Temperature: 0.7
Transcriber: Deepgram Nova-2
Voice: ElevenLabs - sarah
System Message: "You are a professional business customer..."
Max Duration: 600s
End on Silence: 30s
```

#### Difficult Customer
```
Name: Difficult Customer - Base Agent
Model: GPT-4
Temperature: 0.85
Voice: ElevenLabs - antoni
System Message: "You are skeptical and demanding..."
End on Silence: 20s (less patient)
```

#### Friendly Prospect
```
Name: Friendly Prospect - Base Agent
Model: GPT-3.5-turbo
Temperature: 0.6
Voice: ElevenLabs - bella
System Message: "You are enthusiastic and friendly..."
End on Silence: 40s (patient)
```

#### Neutral Caller
```
Name: Neutral Caller - Base Agent
Model: GPT-3.5-turbo
Temperature: 0.7
Voice: Your choice
System Message: "You are neutral, mood shifts..."
End on Silence: 30s
```

3. **Copy each Assistant ID** (looks like `asst_abc123...`)

### Step 2: Update Environment Variables

Add to `.env.local`:

```bash
# Vapi Base Agents (replace with your actual IDs from Step 1)
VAPI_AGENT_PROFESSIONAL=asst_your_professional_id
VAPI_AGENT_DIFFICULT=asst_your_difficult_id
VAPI_AGENT_FRIENDLY=asst_your_friendly_id
VAPI_AGENT_NEUTRAL=asst_your_neutral_id
```

### Step 3: Run Database Migration

```bash
# Apply migration to add vapi_base_agent and vapi_overrides columns
psql $DATABASE_URL -f db/migrations/0011_add_vapi_base_agents.sql

# Or via Supabase CLI
npx supabase db push
```

### Step 4: Verify Setup

```typescript
// Test that all agents are configured
import { validateVapiAgentConfig } from '@/lib/vapi-agents'

const { isValid, missingAgents } = validateVapiAgentConfig()
console.log('Config valid:', isValid)
if (!isValid) {
  console.error('Missing agents:', missingAgents)
}
```

---

## 📝 Creating Scenarios

### Example 1: Easy Scenario (Friendly Agent)

```typescript
const easyScenario = {
  title: "First-time Homebuyer Inquiry",
  vapi_base_agent: "friendly",
  difficulty: "easy",
  persona: {
    name: "Sarah Johnson",
    role: "First-time homebuyer",
    background: "Young professional, excited but nervous",
    objectives: ["Learn about mortgage options", "Understand payments"],
    personality: ["Enthusiastic", "Curious", "Trusting"]
  },
  ai_prompt: "You're excited about buying your first home. Ask clarifying questions. Be receptive to explanations.",
  // No overrides needed - use friendly base agent defaults
}
```

### Example 2: Hard Scenario (Difficult Agent + Overrides)

```typescript
const hardScenario = {
  title: "Skeptical Refinance Client",
  vapi_base_agent: "difficult",
  difficulty: "hard",
  persona: {
    name: "Robert Miller",
    role: "Experienced homeowner",
    background: "Burned by lenders before, very price-sensitive",
    objectives: ["Get absolute lowest rate", "Avoid all hidden fees"],
    pain_points: ["Previous bad experience", "Trust issues", "Time pressure"],
    personality: ["Skeptical", "Demanding", "Impatient"]
  },
  ai_prompt: "You've been burned before. Challenge every claim. Bring up fees repeatedly. Only convinced by specific numbers and guarantees.",
  vapi_overrides: {
    temperature: 0.9,  // More unpredictable
    voice_emotion: "stern",
    end_call_on_silence_seconds: 15  // Less patient
  }
}
```

### Example 3: Medium Scenario (Professional Agent)

```typescript
const mediumScenario = {
  title: "Business Loan Inquiry",
  vapi_base_agent: "professional",
  difficulty: "medium",
  persona: {
    name: "Michael Chen",
    role: "Small business owner",
    background: "Running a successful café, looking to expand",
    objectives: ["Secure funding for expansion", "Understand terms"],
    personality: ["Businesslike", "Analytical", "Time-conscious"]
  },
  ai_prompt: "You're busy but interested. Ask relevant business questions. Want clear ROI and payment terms.",
  vapi_overrides: {
    background_sound: "cafe"  // Immersive background
  }
}
```

---

## 🔧 Customization Options

### VapiOverrides Options

All fields are optional. Override base agent defaults per-scenario:

```typescript
interface VapiOverrides {
  temperature?: number              // 0.0-1.0 (higher = more creative)
  voice_emotion?: 'neutral' | 'warm' | 'stern' | 'friendly'
  background_sound?: 'office' | 'cafe' | 'quiet' | 'street'
  max_duration_seconds?: number     // Default: 600 (10 min)
  end_call_on_silence_seconds?: number  // Default: 30s
}
```

### Dynamic System Prompts

The system prompt is built dynamically from:

1. **Base Role**: From `persona.role` and `persona.name`
2. **Background**: From `persona.background`
3. **Objectives**: From `persona.objectives[]`
4. **Pain Points**: From `persona.pain_points[]`
5. **Scenario Instructions**: From `ai_prompt`
6. **Personality Traits**: From `persona.personality[]`
7. **Difficulty Behavior**: Auto-generated from `difficulty` level

**Example Generated Prompt**:
```
You are participating in a sales training simulation. Your role is to play "First-time homebuyer" named Sarah Johnson.

BACKGROUND:
Young professional, excited but nervous about buying first home.

YOUR OBJECTIVES:
- Learn about mortgage options
- Understand monthly payments

SCENARIO INSTRUCTIONS:
You're excited but slightly overwhelmed. Ask clarifying questions. Be receptive to explanations.

PERSONALITY TRAITS:
- Enthusiastic
- Curious
- Trusting

BEHAVIOR LEVEL: Easy
- Be receptive and cooperative
- Respond positively to reasonable answers
- Show interest when trainee makes good points

CONVERSATION GUIDELINES:
- Keep responses conversational (1-3 sentences)
- Stay in character throughout
- Ask follow-up questions when appropriate
...
```

---

## 🎮 Call Flow

### Complete Call Lifecycle

```typescript
// 1. User clicks "Start Call"
onClick={startCall}

// 2. Client: POST /api/calls/start
fetch('/api/calls/start', {
  body: JSON.stringify({ scenarioId })
})

// 3. Server: Get scenario from DB
const scenario = await supabase
  .from('scenarios')
  .select('*')
  .eq('id', scenarioId)
  .single()

// 4. Server: Get base assistant ID
const assistantId = getAssistantId(scenario.vapi_base_agent)
// → 'asst_ghi789' (friendly base agent)

// 5. Server: Build transient overrides
const assistantOverrides = buildAssistantOverrides(scenario)
// → { model: { messages: [...], temperature: 0.6 }, voice: {...} }

// 6. Server: Return to client
return { assistantId, assistantOverrides }

// 7. Client: Start Vapi call with overrides
await vapi.start({
  assistantId: 'asst_ghi789',     // Base permanent agent
  assistantOverrides: {            // Scenario-specific overrides
    model: {
      messages: [{ role: 'system', content: dynamicPrompt }],
      temperature: 0.6
    },
    voice: { provider: 'elevenlabs', voiceId: 'bella' },
    firstMessage: "Hello, this is Sarah. How can I help?"
  }
})

// 8. Live call with customized AI agent! 🎙️
```

---

## 🧪 Testing

### Validate Configuration

```bash
# Check environment variables are set
node -e "require('dotenv').config(); console.log({
  professional: process.env.VAPI_AGENT_PROFESSIONAL,
  difficult: process.env.VAPI_AGENT_DIFFICULT,
  friendly: process.env.VAPI_AGENT_FRIENDLY,
  neutral: process.env.VAPI_AGENT_NEUTRAL
})"
```

### Test System Prompt Generation

```typescript
import { buildSystemPrompt } from '@/lib/vapi-agents'

const testScenario = {
  persona: { name: "Test User", role: "Customer", ... },
  ai_prompt: "Test instructions",
  difficulty: "medium"
}

const prompt = buildSystemPrompt(testScenario)
console.log(prompt)
// Verify prompt includes all scenario details
```

### Test Call Start

1. Create a test scenario in your DB with `vapi_base_agent: 'friendly'`
2. Start a call from the UI
3. Check browser console:
   ```
   Starting call with base agent: friendly
   Assistant ID: asst_ghi789
   ```
4. During call, verify AI responds according to scenario persona

---

## 📊 Monitoring & Analytics

### Track Agent Usage

```sql
-- Count scenarios by base agent type
SELECT vapi_base_agent, COUNT(*) as scenario_count
FROM scenarios
WHERE status = 'active'
GROUP BY vapi_base_agent
ORDER BY scenario_count DESC;
```

### Monitor Call Performance

```sql
-- Average scores by base agent
SELECT
  s.vapi_base_agent,
  AVG(sa.score) as avg_score,
  COUNT(*) as call_count
FROM scenario_attempts sa
JOIN scenarios s ON sa.scenario_id = s.id
WHERE sa.score IS NOT NULL
GROUP BY s.vapi_base_agent
ORDER BY avg_score DESC;
```

---

## 🚨 Troubleshooting

### Issue: "No assistant ID found for base agent"

**Cause**: Environment variable not set
**Fix**:
```bash
# Verify .env.local has all 4 agent IDs
grep VAPI_AGENT .env.local

# Restart dev server
pnpm dev
```

### Issue: Call starts with wrong personality

**Cause**: Scenario missing `vapi_base_agent` field
**Fix**:
```sql
UPDATE scenarios
SET vapi_base_agent = 'professional'
WHERE vapi_base_agent IS NULL;
```

### Issue: System prompt not customizing

**Cause**: Scenario missing `persona` or `ai_prompt`
**Fix**: Add complete persona data to scenario record

---

## 🎯 Best Practices

### 1. Choose the Right Base Agent

- **Professional**: Default for most business scenarios
- **Difficult**: Objection handling, advanced training
- **Friendly**: Onboarding new reps, confidence building
- **Neutral**: A/B testing, mixed difficulty

### 2. Use Overrides Sparingly

Only override when scenario requires different behavior:
- **Always override**: System message (via persona/ai_prompt)
- **Sometimes override**: Temperature, voice emotion
- **Rarely override**: Max duration, end on silence

### 3. Maintain Persona Consistency

Ensure `persona` data aligns with chosen base agent:
- Friendly agent → Enthusiastic persona ✅
- Friendly agent → Skeptical persona ❌ (use Difficult instead)

### 4. Test Across Difficulties

Create 3 versions of each scenario:
- Easy: Friendly agent, low temperature
- Medium: Professional/Neutral, balanced
- Hard: Difficult agent, high temperature

---

## 📚 Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Overall project architecture
- [VAPI_COMPLETE_IMPLEMENTATION.md](./VAPI_COMPLETE_IMPLEMENTATION.md) - Full Vapi integration guide
- [Vapi Docs: Transient vs Permanent](https://docs.vapi.ai/assistants/concepts/transient-vs-permanent-configurations)

---

## 🎉 Summary

**This architecture enables**:

✅ Infinite scenario scalability with 4 base agents
✅ Instant call starts (no assistant creation API calls)
✅ Full customization via database-stored scenario data
✅ Easy maintenance (update base agents affects all scenarios)
✅ Cost efficiency (4 permanent agents vs 1,000+)

**The secret sauce**: Combine permanent base agents (core personality) with transient overrides (scenario-specific context) at call-time.

---

**Last Updated**: October 3, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
