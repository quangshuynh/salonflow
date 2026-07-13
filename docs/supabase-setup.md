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
[`supabase/migrations/`](../supabase/migrations/) in filename order
(`0001_initial_schema.sql`, then `0002_signup_rpc.sql` — the signup flow
fails without 0002).

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
counters.

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
| Session refresh | `src/proxy.ts` | Next 16 uses `proxy.ts`, not `middleware.ts` |

Next steps after credentials exist: auth pages (sign in / sign up), a
signup flow that creates the `businesses` + `profiles` rows, and swapping
the query bodies in `src/features/*/queries.ts` from mock data to Supabase
calls.
