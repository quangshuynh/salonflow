# CLAUDE.md

## Project

SalonFlow is a salon-management SaaS application built with Next.js and TypeScript.

It includes scheduling, customers, staff, services, reporting, a marketing site, and a realistic demo experience.

The current major engineering milestone is moving one coherent domain at a time from mock data to authenticated Supabase persistence with database-enforced tenant isolation.

## Current Priority

Prioritize:

1. authenticated Supabase persistence
2. secure tenant resolution
3. PostgreSQL RLS as the real authorization boundary
4. one complete vertical slice before broader migration
5. meaningful tests for persistence and tenant isolation
6. preserving demo mode

Do not expand product scope before the persistence path is proven.

## Architecture Rules

- Keep business logic and data access out of page components.
- Follow existing `features/*/queries.ts` patterns.
- Reuse existing Supabase client/server utilities.
- Use React Hook Form + Zod patterns already present.
- Use migrations for schema/RLS changes.
- Preserve server/client boundaries.
- Preserve strict TypeScript behavior.
- Preserve demo mode.
- Treat RLS as the security boundary, not frontend filtering.
- Never trust a client-provided tenant ID for authorization.
- Never expose Supabase service-role credentials to browser code.
- Prefer existing abstractions over introducing new ones.

Before changing architecture, inspect how the repository currently handles the concern.

## Engineering Style

Prefer:

- small, reviewable changes
- correctness over feature count
- explicit failure handling
- meaningful tests
- simple architecture
- secure defaults
- existing project conventions

Avoid:

- speculative abstractions
- broad refactors
- unnecessary dependencies
- infrastructure added for appearance
- feature expansion unrelated to the current milestone

Do not add Redis, queues, microservices, billing, analytics, messaging, or other SaaS infrastructure unless a future task explicitly requires it.

## Demo vs Production Data

Demo mode is intentional and must remain functional.

Demo mode:
- uses built-in mock data
- requires no external setup
- skips Supabase authentication
- clearly identifies itself as demo data

Production/authenticated mode should eventually:
- authenticate the user
- derive tenant context from trusted state
- read/write Supabase data
- persist changes
- enforce tenant isolation through RLS

Do not scatter demo-specific conditionals throughout unrelated UI when the existing data boundary can handle the distinction.

## Testing

Current validation commands:

```sh
npm run lint
npm test
npm run build
```

Run the relevant checks after implementation.

Do not weaken linting, tests, TypeScript, builds, authentication, or RLS to make a change pass.

Tests should prove meaningful behavior rather than increase test count.

For multi-tenant work, prioritize evidence for:

allowed same-tenant access
denied cross-tenant access
persistence
validation
failure behavior
demo-mode regression protection

## Git Workflow

The repository uses:

`main <- dev <- feature/*`

Keep changes scoped enough for focused review.

## Before Implementing
For substantial tasks:
1. inspect relevant existing code
2. state what already exists
3. distinguish implemented behavior from planned behavior
4. identify the smallest correct change
5. identify security/data implications
6. define non-goals
7. implement
8. run validation
9. report remaining limitations

Do not assume repository state from this file when the code can answer the question.