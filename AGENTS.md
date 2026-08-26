
### `AGENTS.md`

I’d make this the more general coding-agent contract, so Claude or another coding agent doesn't wander into portfolio-driven overengineering.

```md
# AGENTS.md

## Purpose

This file defines repository-wide instructions for coding agents working on SalonFlow.

Read the relevant implementation before making changes. Repository code is authoritative when this document becomes stale.

## Product Direction

SalonFlow should become a credible, maintainable multi-tenant salon-management application.

Engineering maturity matters more than adding surface-area features.

The current strategic priority is proving the production data path:

```text
authenticate
    ->
resolve tenant securely
    ->
read/mutate domain data
    ->
persist to PostgreSQL
    ->
enforce tenant boundaries with RLS
    ->
reload with correct state
```

Work toward this incrementally through coherent vertical slices.

Scope Discipline

Prefer completing one existing workflow end-to-end over starting several partial migrations.

Unless explicitly requested, do not add:

- billing/subscriptions
- email or SMS systems
- queues
- Redis
- microservices
- analytics infrastructure
- social functionality
- new marketing sections
- unrelated dashboard features
- speculative abstractions
- broad dependency upgrades

Do not introduce technology merely to make the architecture appear more sophisticated.

## Existing Technical Direction

Core stack:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui / Base UI
- React Hook Form
- Zod
- Supabase PostgreSQL + Auth
- @supabase/ssr
- Vitest
- ESLint

Follow existing repository conventions rather than replacing them.

Repository Structure

Important areas include:
```text
src/
  app/          routes and page composition
  components/   reusable/domain UI
  features/     domain queries, constants, builders
  lib/          clients, validation, mock data, utilities
  types/        shared domain types

supabase/
  migrations/   schema, multi-tenancy, RLS
```

Pages should compose functionality. They should not become the primary location for data-access or business logic.

## Data Access

When implementing persistent behavior:

- inspect existing feature query modules first
- keep data access outside page components
- reuse Supabase utilities
- handle database errors explicitly
- preserve useful type information
- avoid unnecessary data-fetching abstractions

Do not silently fall back from failed production data access to mock data.

Mock/demo behavior and authenticated persistent behavior should remain intentionally distinguishable.

## Multi-Tenancy and Security

Security requirements are non-negotiable.

Never treat frontend filtering as tenant authorization.

Never trust arbitrary tenant identifiers supplied by the browser.

Tenant access must be derived from authenticated identity and trusted database relationships.

RLS should independently prevent unauthorized cross-tenant reads and mutations.

Never:

disable RLS to simplify implementation
expose service-role credentials client-side
use privileged database access to bypass ordinary application authorization without a justified server-only administrative use case
weaken policies just to make tests pass

When changing tenant-sensitive behavior, inspect both application logic and database policies.

## Database Changes

Use Supabase migrations for persistent schema, constraints, indexes, functions, triggers, or RLS changes.

Prefer database constraints for invariants that genuinely belong to the data model.

Keep migrations focused and understandable.

Do not rewrite migration history casually.

## Forms and Validation

Reuse existing React Hook Form and Zod conventions.

Keep validation logic reusable rather than embedding domain rules directly in pages.

Client-side validation improves UX but must not be treated as the sole integrity or authorization boundary.

## UX

Preserve the existing visual system unless the task specifically concerns design.

Persistent workflows should represent:

- loading
- empty state
- success
- query failure
- mutation failure

Avoid unrelated visual cleanup while implementing backend behavior.

## Testing Philosophy

Test important claims and failure boundaries.

High-value tests include:

- tenant isolation
-  authentication-dependent behavior
- persistence
- validation
- query/mutation failures
- domain invariants
- demo-mode regressions

Prefer a smaller number of meaningful tests over test-count inflation.

Do not heavily mock away the exact boundary a test is supposed to prove.

## Validation

Inspect `package.json` and CI before assuming commands.

Current primary checks are:
```bash
npm run lint
npm test
npm run build
```

Run relevant checks before declaring work complete.

Do not alter configuration merely to hide failures.

## Change Quality

A good change should be:

- scoped
- reviewable
- consistent with existing architecture
- secure
- tested at the appropriate boundary
- explicit about limitations

Avoid drive-by refactoring.

If unrelated problems are discovered, report them rather than automatically expanding scope.

## Completion Report

For substantial work, summarize:

1. what existed before
2. what changed
3. architectural/security decisions
4. migrations
5. tests
6. validation results
7. remaining limitations
8. intentional non-goals