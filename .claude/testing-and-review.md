# Testing & Code Review

## Testing Strategy

| Type | Scope |
|------|-------|
| Unit | KPI calculators, scoring, payload signing, RLS policy tests |
| Integration | Start call to attempt complete with mocked Vapi |
| E2E | Auth, assignment, attempt, feedback read, exports via Playwright |
| Load | Batch attempts insert and MV refresh at 10k attempts scale |

## Code Review

### Continuous AI Review
1. Start background reviewer: `claude review --watch`
2. Address comments as they appear in terminal or PR
3. Re-run `pnpm verify` before merge
4. Keep prompts and guardrails under version control (inline in `src/lib/agents/*`, `src/lib/ai/scoring.ts`, and `src/lib/vapi-agents.ts`)

### PR Checklist

- [ ] RLS policy tests passing
- [ ] No server action without org guard
- [ ] No public storage URLs for recordings
- [ ] Webhook signatures verified and unit tested
- [ ] Dashboards render under 2 seconds on seeded dataset

## Monitoring and Observability

- Sentry on client and server
- OpenTelemetry traces for call-to-scoring pipeline
- Structured logs for webhook deliveries and retries
- PostHog client-side analytics (e.g., `attempt_cancelled`, `attempt_classified` in call components); server-side domain events (`assignment.created`, `attempt.scored`, etc.) flow through Inngest, not PostHog
