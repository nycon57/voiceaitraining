# Audio Agent Sales Training

AI voice agent SaaS platform for sales call training — scores reps against KPIs, gives managers enterprise tracking. Initial vertical: loan officers.

## Commands

```bash
pnpm dev              # Development server
pnpm lint             # ALWAYS run after code changes
pnpm typecheck        # ALWAYS run after code changes
pnpm verify           # Pre-deployment (lint + typecheck + build)
pnpm verify:build     # Pre-deployment (build only)
pnpm build            # Production build
pnpm clean            # Clean build cache
pnpm reinstall        # Fresh dependency install
```

## Critical Rules

- **Supabase: ALWAYS use MCP tools** — never manual CLI. See [Database](.claude/database.md)
- **TypeScript strict** — no `any` unless justified
- **Business logic in `src/actions/` and `src/lib/`** — not in React components
- **Zod validation** on all server action and API handler inputs
- **RLS on all tenant tables** — every server action must call `set_org_claim()`

## Detailed Instructions

- [Workflow & Task Management](.claude/workflow.md)
- [Architecture & Patterns](.claude/architecture.md)
- [Database & Supabase](.claude/database.md)
- [Development Guidelines](.claude/development.md)
- [Feature Areas](.claude/features.md)
- [Testing & Code Review](.claude/testing-and-review.md)
