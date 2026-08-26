-- TEST-ONLY reproduction of the Supabase platform primitives.
--
-- This file is deliberately *not* a migration. On a real Supabase project
-- the `auth` schema, `auth.uid()`, the `anon`/`authenticated` roles, and the
-- default grants on `public` are provided by the platform. Recreating the
-- minimum here is what lets the RLS suite run the *real* migrations and the
-- *real* policies against real PostgreSQL, instead of asserting against a
-- mock of the boundary under test.
--
-- Nothing below is loaded by the application, and no migration depends on it.
-- It must run before the migrations, because the default privileges it sets
-- only apply to tables created afterwards — exactly as on Supabase.

create schema if not exists auth;

create table auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

-- Supabase resolves the caller from the verified JWT, exposed to SQL as a
-- request-scoped setting. Tests set the same setting to "sign in" as a user.
create function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ),
    ''
  )::uuid
$$;

-- The two roles PostgREST switches into. `nologin` matches Supabase: they are
-- assumed via SET ROLE, never connected to directly.
do $$
begin
  create role anon nologin;
exception when duplicate_object then null;
end
$$;

do $$
begin
  create role authenticated nologin;
exception when duplicate_object then null;
end
$$;

grant usage on schema auth   to anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on auth.users   to authenticated;

-- Supabase grants full table privileges to both roles and relies on RLS —
-- not on GRANT — to decide what each caller may actually touch. Reproducing
-- that is essential: if the roles had no privileges, the assertions below
-- would pass for the wrong reason (permission denied instead of RLS).
alter default privileges in schema public
  grant all on tables to anon, authenticated;
alter default privileges in schema public
  grant all on sequences to anon, authenticated;
