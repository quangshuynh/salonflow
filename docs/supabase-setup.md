# Supabase setup

SalonFlow runs entirely on mock data until these steps are done. Nothing
breaks without them — the Supabase plumbing is a no-op when the environment
variables are missing.

## 1. Create the project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard) and
   create a new project (any region; note the database password somewhere
   safe).
2. Wait for provisioning to finish.

## 2. Apply the schema

Open the project's **SQL Editor** and run each migration in
[`supabase/migrations/`](../supabase/migrations/) in filename order:
`0001_initial_schema.sql`, then `0002_signup_rpc.sql` (the signup flow
fails without it), then `0003_tenant_scoped_references.sql`.

`0003` refuses to apply if any existing appointment already references a
customer, staff member, or service from another business; it prints the
query that lists the offending rows so they can be reassigned or removed
first. On a fresh project there is nothing to fix.

Alternatively, with the Supabase CLI:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

The schema is multi-tenant: every table carries a `business_id`, and
row-level security restricts each signed-in user to the business their
`profiles` row points at. Money is stored as integer cents
(`services.price_cents`), and customer stats (visits, spend, last visit)
are a `customer_stats` view derived from appointments rather than stored
counters — declared `security_invoker`, so it inherits the caller's
policies instead of the view owner's.

Appointments reference their customer, staff member, and service by
`(business_id, id)` rather than by id alone. RLS only checks the row's own
`business_id`, so without the composite key a caller could book an
appointment in their own business against another tenant's customer — and
that tenant's `on delete cascade` would then reach across the boundary.
The foreign key makes it impossible for any caller, including one holding
the service-role key.

## 3. Configure the environment

Copy `.env.example` to `.env.local` and fill in both values from
**Settings → API** in the Supabase dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

(The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` name also works.)

Restart `npm run dev` afterwards — Next.js only reads env files at startup.

## 4. What's wired where

| Piece | File | Notes |
| --- | --- | --- |
| Browser client | `src/lib/db/client.ts` | For Client Components |
| Server client | `src/lib/db/server.ts` | Per-request; never cache it |
| Session refresh + route guard | `src/proxy.ts` | Next 16 uses `proxy.ts`, not `middleware.ts` |
| Data-source boundary | `src/lib/db/env.ts` | Returns `null` for demo mode or missing credentials |
| Tenant resolution | `src/lib/db/context.ts` | Reads `business_id` from the caller's own profile |
| Auth flows | `src/features/auth/actions.ts` | Sign in, sign up, onboarding, sign out |
| Reads / writes | `src/features/*/queries.ts`, `actions.ts` | Mock in demo mode, Supabase otherwise |

Only the publishable (anon) key is ever used. There is no service-role
key in the application, and nothing in `src/` accepts a `business_id`
from the browser — inserts take it from `getBusinessId()`, and RLS
`with check` rejects anything else.

## 5. Verifying tenant isolation

The security claims have a test suite that runs against real PostgreSQL
rather than a mock:

```sh
npm run test:db
```

It starts a throwaway `postgres:17-alpine` container, applies
[`supabase/tests/00_auth_shim.sql`](../supabase/tests/00_auth_shim.sql),
then every migration in order, then the suites in
[`supabase/tests/`](../supabase/tests/), and removes the container
afterwards. Set `DATABASE_URL` to run against an existing database
instead (this is what CI does).

The shim is test-only and never applied to a real project: it recreates
the `auth` schema, `auth.uid()`, the `anon`/`authenticated` roles, and the
default `public` grants that Supabase provides for you. Reproducing the
grants matters — without them the assertions would pass because of
`permission denied` rather than because of RLS.
