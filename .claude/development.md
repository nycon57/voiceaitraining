# Development Guidelines

## Code Standards

- TypeScript strict — no `any` unless justified
- Keep business rules in `src/actions/**` and `src/lib/**`, not in React components
- Zod validation for all inputs to server actions and API handlers
- UI components in ShadCN style with accessibility defaults
- All UI imports from `@/components/ui/*` — re-run `shadcn add` if tokens drift

## Performance Optimization

- Prefer Server Components and Server Actions; keep client components minimal
- Use `unstable_cache` for scenario library and org config
- Batch inserts for attempts and KPI events, then refresh MVs
- Debounce leaderboard queries and paginate attempts
- Pre-sign storage links in parallel with feedback generation
- Pre-segment transcripts to utterances with timestamps and speaker labels
- Index `fact_*` by `(org_id, started_at)` and `(org_id, scenario_id)`
- Materialized views refreshed on-demand post batch insert, plus nightly cron
- Stream LLM responses for feedback to reduce TTFB
- Cache scenario prompts and compiled rubric in memory for call sessions

## Environment Variables

### App
- `NEXT_PUBLIC_APP_URL`
- `NEXT_RUNTIME` — edge or nodejs where needed

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Clerk
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_*` for plan ids

### Email
- `RESEND_API_KEY`
- `EMAIL_FROM` — default sender

### AI
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `ELEVENLABS_API_KEY`

### Vapi
- `VAPI_API_KEY`
- `VAPI_PROJECT_ID`

### Security
- `WEBHOOK_DEFAULT_SECRET`
- `ENCRYPTION_KEY` — if encrypting stored PII

## Common Issues and Solutions

1. **Mic permission blocked** — Ensure HTTPS origin and correct browser prompt handling. Local dev: use `vercel dev` or localhost with secure context
2. **RLS query failures** — Verify `set_org_claim` runs in server actions, check `org_id` propagation from Clerk session
3. **Stripe webhook 400** — Confirm correct endpoint secret and raw body parsing in route handler
4. **Vapi transcript missing** — Fallback to post-call STT with Whisper or Deepgram batch API, then recompute KPIs
5. **Signed URL expired** — Regenerate via `/api/storage/sign-url` with TTL in seconds; do not store public URLs
6. **Large transcript feedback latency** — Summarize into outline and pass spans to LLM; apply token budget and trim system prompt
7. **ShadCN component import errors** — All UI imports from `@/components/ui/*`; re-run `shadcn add` if tokens drift
