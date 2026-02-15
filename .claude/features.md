# Feature Areas

## Voice Simulation

- Vapi agent per scenario: STT Deepgram, LLM GPT-4 class via Vercel AI SDK, TTS ElevenLabs
- Browser player: mic permissions, connect, timer, live call status, safe end
- Server: start call endpoint creates attempt, end-of-call webhook persists artifacts

## Scenario Authoring

- **Manual**: persona, prompt, rubric editor with JSON validation
- **AI Draft**: generate scenario from brief, admin edits and publishes
- **Branching v1**: authorable hints in branching JSON, runtime dispatcher augments prompts

## Scoring and Feedback

### Global KPIs
- Talk-listen ratio, filler count, interruptions, pace wpm, sentiment proxy

### Scenario KPIs
- Required phrases, objection tags addressed, open question count, goal hit

### Scoring
- Weighted rubric to numeric score with breakdown

### Feedback
- LLM summary with 2-4 cited transcript spans and next steps

## Assignments and Tracks

- Assign a scenario or track to users or teams with due dates and thresholds
- Auto reminders, overdue flags, manager daily digest
- Track progression with prerequisites

## Reporting and Leaderboards

- Org overview, Scenario insights, Team leaderboard, HR compliance
- CSV export, scheduled email reports, signed links for recordings

## Integrations

### Webhook Events
- `scenario.assigned`, `scenario.completed`, `attempt.scored.low`, `track.completed`, `user.added`
- Manual replay and retry logs, HMAC signatures
- Stripe billing and plan entitlements

### Webhook Payload Template

```json
{
  "event": "scenario.completed",
  "idempotency_key": "uuid",
  "org": {"id": "...", "name": "..."},
  "user": {"id": "...", "email": "...", "name": "...", "role": "trainee"},
  "scenario": {"id": "...", "title": "..."},
  "attempt": {
    "id": "...", "score": 87, "duration_seconds": 312,
    "kpis": {"talk_listen": "45:55", "filler_words": 3},
    "recording_url": "signed-url", "transcript_url": "signed-url"
  },
  "timestamp": "2025-09-20T21:12:33Z",
  "signature": "hmac-sha256=..."
}
```
