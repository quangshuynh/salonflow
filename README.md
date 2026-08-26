<p align="center">
  <img
    src="docs/images/logo.png"
    alt="SalonFlow logo"
    width="600"
  />
</p>

# SalonFlow

<p align="center">
  <a href="https://github.com/quangshuynh/salonflow/actions/workflows/ci.yml">
    <img
      src="https://github.com/quangshuynh/salonflow/actions/workflows/ci.yml/badge.svg"
      alt="CI"
    />
  </a>
  <img
    src="https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js"
    alt="Next.js 16.2.10"
  />
</p>

SalonFlow is a salon-management SaaS application for scheduling appointments,
managing customers, staff, and services, and tracking business performance from
one dashboard.

**Status:** The full product UI and workflows are implemented, and run either
on realistic demo data or on authenticated Supabase persistence with
tenant isolation enforced by PostgreSQL row-level security. Customers is the
slice with automated proof of that boundary; see
[docs/supabase-setup.md](docs/supabase-setup.md).

## Features

- Dashboard with daily scheduling and business metrics
- Calendar and appointment management
- Customer profiles and visit history
- Staff and service management
- Revenue and service-performance reporting
- Responsive marketing and application interfaces
- Built-in demo mode with realistic, date-aware mock data
- Supabase schema groundwork for multi-tenant persistence and row-level security

## Stack

- [Next.js 16](https://nextjs.org) — App Router and Turbopack
- TypeScript
- Tailwind CSS 4
- [shadcn/ui](https://ui.shadcn.com) — Nova style, built on Base UI
- React Hook Form + Zod
- Recharts
- Supabase — PostgreSQL and authentication
- Vitest

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open `http://localhost:3000` for the marketing site or
`http://localhost:3000/dashboard` for the application.

The application runs on built-in mock data by default, so no external
services or environment configuration are required to explore the
current product.

### Demo mode

To explicitly use the demo experience while keeping Supabase configured,
add the following to `.env.local`:

``` env
NEXT_PUBLIC_DEMO_MODE=true
```

Demo mode uses the built-in mock data and skips Supabase authentication.
The dashboard header shows a "Demo data" badge while it is active, so the
interface makes clear up front that changes are not persisted.

Remove the setting or change it to `false` to use the configured
Supabase integration.

Mock dates are generated relative to the current day so the dashboard
and screenshots continue to show a realistic schedule.

## Screenshots

### Marketing site

<p align="center"> <img src="docs/images/marketing-home.png" alt="SalonFlow marketing homepage" width="900" /> </p> <p align="center"> <em>Public marketing homepage</em> </p>

### Dashboard

<p align="center"> <img src="docs/images/dashboard-overview.png" alt="SalonFlow dashboard overview with today's schedule and top services" width="900" /> </p> <p align="center"> <em>Dashboard with today's schedule and business overview</em> </p>

### Calendar

<p align="center"> <img src="docs/images/calendar-week.png" alt="SalonFlow calendar showing scheduled appointments" width="900" /> </p> <p align="center"> <em>Weekly calendar and appointment planning</em> </p>

### Customers

<p align="center"> <img src="docs/images/customers-list.png" alt="SalonFlow customer management screen" width="900" /> </p> <p align="center"> <em>Customer management</em> </p>

### Reports

<p align="center"> <img src="docs/images/reports-overview.png" alt="SalonFlow reports showing revenue and service performance" width="900" /> </p> <p align="center"> <em>Revenue and service-performance reporting</em> </p>

## Architecture

SalonFlow separates page composition, reusable UI, domain logic,
validation, and data access so the application can move from demo data
to persistent storage without coupling business logic directly to page
components.

``` text
src/
  app/
    (marketing)/    Public marketing site
    (dashboard)/    Dashboard, calendar, appointments,
                    customers, staff, services, reports, settings

  components/       UI organized by domain
    ui/             Generated shadcn/ui components

  features/         Domain queries, constants, and builders
  lib/              Clients, validation, mock data, and utilities
  types/            Shared domain types

supabase/
  migrations/       PostgreSQL schema, multi-tenancy, and RLS
```

Pages compose the application using domain components and
`features/*/queries.ts`; data-access and business logic stay outside
page components.

### Data layer

Each `features/*/queries.ts` module decides its data source once, at the
boundary: deterministic mock data when Supabase is unconfigured or demo
mode is on, and live Supabase otherwise. Domain components never see the
difference, and a failed production read is never quietly replaced with
mock data.

With Supabase configured, the production path runs end to end:

``` text
authenticate
    ↓
resolve tenant from the caller's own profile row
    ↓
read / mutate domain data
    ↓
persist to PostgreSQL
    ↓
enforce tenant boundaries with RLS
    ↓
reload with the same correct state
```

Tenant resolution never trusts a client-supplied identifier — it is read
from the signed-in user's `profiles` row, which RLS restricts to
`auth.uid()`. Cross-tenant reads and writes are rejected by PostgreSQL,
not by application filtering, and appointments reference their customer,
staff member, and service by `(business_id, id)` so a cross-tenant link
cannot be created even by a caller that bypasses RLS entirely.

## Validation

Forms use React Hook Form and Zod for structured input handling and
validation.

Keeping validation separate from page components makes domain rules
easier to reuse as the persistent Supabase data path is completed.

## Testing and CI

The project uses Vitest for application-level tests, and plain SQL suites
for anything that claims a database guarantee.

Tenant isolation is not asserted against a mock. `npm run test:db` starts
a throwaway PostgreSQL container, applies the real migrations in order,
and runs the policies through both tenants as the `authenticated` role —
covering scoped reads, refused cross-tenant writes, the derived
`customer_stats` view, unauthenticated access, and the invariants that
must hold even for a caller RLS does not constrain. The container is
removed afterwards. Docker is the only requirement; set `DATABASE_URL` to
run against an existing database instead.

Run the checks locally with:

``` sh
npm run lint
npm test
npm run build
npm run test:db
```

## Scripts

  Command                What it does
  ---------------------- ----------------------------------------------
  `npm run dev`          Start the development server with hot reload
  `npm run build`        Create the production build
  `npm run lint`         Run ESLint
  `npm test`             Run automated tests
  `npm run test:watch`   Run tests in watch mode
  `npm run test:db`      Run the SQL/RLS suites against real PostgreSQL

## Current limitations

SalonFlow is not presented as a production-ready SaaS product yet.

Authentication, persistence, and RLS-enforced tenant isolation are
implemented across the domains, but Customers is the only slice with
automated evidence behind those claims end to end, including a
query-failure state and mutation results that distinguish a blocked
cross-tenant write from a successful one. The other domains share the
same schema, policies, and query conventions; they have not been
verified to the same standard.

Extending that standard one domain at a time is the next milestone,
rather than expanding the product with additional surface-area features.

## Development workflow

Development follows:

``` text
main ← dev ← feature/*
```

Feature work is developed on focused branches and merged through pull
requests into `dev` before reaching `main`.
