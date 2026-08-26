-- Tenant isolation, proven against the real schema, the real policies, and
-- real PostgreSQL. Nothing here is mocked: the migrations under test are the
-- same files applied to a Supabase project, and every assertion runs as the
-- `authenticated` role with an `auth.uid()` the database resolves itself.
--
-- Fixtures are seeded as the superuser, which bypasses RLS by design. Every
-- assertion afterwards runs under SET ROLE, where RLS is in force.

\set BIZ_A   '11111111-1111-1111-1111-111111111111'
\set BIZ_B   '22222222-2222-2222-2222-222222222222'
\set USER_A  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
\set USER_B  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
\set CUST_A1 'c1111111-1111-4111-8111-111111111111'
\set CUST_A2 'c1111111-1111-4111-8111-222222222222'
\set CUST_B1 'c2222222-2222-4222-8222-111111111111'
\set STAFF_A 'd1111111-1111-4111-8111-111111111111'
\set STAFF_B 'd2222222-2222-4222-8222-111111111111'
\set SVC_A   'e1111111-1111-4111-8111-111111111111'
\set SVC_B   'e2222222-2222-4222-8222-111111111111'

-- ── Fixtures: two unrelated salons ───────────────────────────────────────

insert into auth.users (id, email) values
  (:'USER_A', 'owner@salon-a.example'),
  (:'USER_B', 'owner@salon-b.example');

insert into businesses (id, name) values
  (:'BIZ_A', 'Salon A'),
  (:'BIZ_B', 'Salon B');

insert into profiles (id, business_id, full_name) values
  (:'USER_A', :'BIZ_A', 'Owner A'),
  (:'USER_B', :'BIZ_B', 'Owner B');

insert into customers (id, business_id, name, email, phone) values
  (:'CUST_A1', :'BIZ_A', 'Alice Anders',  'alice@example.com', '555-0100'),
  (:'CUST_A2', :'BIZ_A', 'Amir Aslan',    'amir@example.com',  '555-0101'),
  (:'CUST_B1', :'BIZ_B', 'Bianca Bloom',  'bianca@example.com','555-0200');

insert into staff (id, business_id, name, role) values
  (:'STAFF_A', :'BIZ_A', 'Stylist A', 'stylist'),
  (:'STAFF_B', :'BIZ_B', 'Stylist B', 'stylist');

insert into services (id, business_id, name, category, duration_min, price_cents) values
  (:'SVC_A', :'BIZ_A', 'Cut A', 'hair', 45, 5500),
  (:'SVC_B', :'BIZ_B', 'Cut B', 'hair', 45, 9000);

-- One completed appointment per tenant, so `customer_stats` has something
-- to derive and a leak would show up as the other tenant's numbers.
insert into appointments
  (business_id, customer_id, staff_id, service_id, starts_at, ends_at, status)
values
  (:'BIZ_A', :'CUST_A1', :'STAFF_A', :'SVC_A',
   '2026-01-05 10:00+00', '2026-01-05 10:45+00', 'completed'),
  (:'BIZ_B', :'CUST_B1', :'STAFF_B', :'SVC_B',
   '2026-01-06 10:00+00', '2026-01-06 10:45+00', 'completed');

-- ═════════════════════════════════════════════════════════════════════════
-- Signed in as tenant A
-- ═════════════════════════════════════════════════════════════════════════

set role authenticated;
select test.sign_in(:'USER_A');

-- ── Tenant resolution comes from trusted state, not from the caller ──────

select test.eq((select count(*) from profiles), 1::bigint,
  'profiles exposes exactly one row: the caller''s own');

select test.eq((select business_id from profiles), :'BIZ_A'::uuid,
  'tenant resolves to business A via the caller''s profile');

select test.eq(current_business_id(), :'BIZ_A'::uuid,
  'current_business_id() agrees, and is derived from auth.uid()');

-- ── Reads are scoped by the database, not by the application ─────────────

select test.eq((select count(*) from customers), 2::bigint,
  'customers returns tenant A''s two rows and nothing else');

select test.eq((select count(*) from customers where id = :'CUST_B1'), 0::bigint,
  'asking for tenant B''s customer by exact id returns nothing');

select test.eq((select count(*) from businesses), 1::bigint,
  'businesses exposes only the caller''s own salon');

select test.eq((select count(*) from staff),    1::bigint, 'staff is tenant-scoped');
select test.eq((select count(*) from services), 1::bigint, 'services is tenant-scoped');
select test.eq((select count(*) from appointments), 1::bigint,
  'appointments is tenant-scoped');

-- ── The derived stats view inherits RLS (security_invoker) ───────────────

select test.eq((select count(*) from customer_stats where customer_id = :'CUST_B1'),
  0::bigint,
  'customer_stats does not leak tenant B''s customer');

select test.eq((select total_spent_cents from customer_stats where customer_id = :'CUST_A1'),
  5500,
  'customer_stats derives tenant A''s spend from tenant A''s appointments only');

select test.eq((select total_visits from customer_stats where customer_id = :'CUST_A1'),
  1::bigint,
  'customer_stats counts only completed appointments');

-- ── Writes into another tenant are actively refused ──────────────────────

select test.raises(
  format('insert into customers (business_id, name) values (%L, %L)',
         :'BIZ_B', 'Planted By A'),
  '42501',
  'inserting a customer into tenant B violates the RLS with check');

select test.raises(
  format('update customers set business_id = %L where id = %L',
         :'BIZ_B', :'CUST_A1'),
  '42501',
  're-parenting an own customer into tenant B is refused');

-- ── Writes against another tenant's rows silently affect nothing ─────────
-- RLS removes invisible rows from the statement's scope rather than raising,
-- which is why the server actions check the affected row count.

select test.eq(
  test.affected(format('update customers set name = %L where id = %L',
                       'Renamed By A', :'CUST_B1')),
  0::bigint,
  'updating tenant B''s customer affects zero rows');

select test.eq(
  test.affected(format('delete from customers where id = %L', :'CUST_B1')),
  0::bigint,
  'deleting tenant B''s customer affects zero rows');

select test.eq(
  test.affected(format('update businesses set name = %L where id = %L',
                       'Owned By A', :'BIZ_B')),
  0::bigint,
  'updating tenant B''s business affects zero rows');

-- ── Cross-tenant references are structurally impossible (0003) ───────────
-- The appointments policy only checks business_id, so this row would have
-- passed RLS. The composite foreign key is what rejects it.

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_A', :'CUST_B1', :'STAFF_A', :'SVC_A',
         '2026-02-01 10:00+00', '2026-02-01 10:45+00'),
  '23503',
  'booking tenant A''s appointment against tenant B''s customer is rejected');

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_A', :'CUST_A1', :'STAFF_B', :'SVC_A',
         '2026-02-01 10:00+00', '2026-02-01 10:45+00'),
  '23503',
  'booking against tenant B''s staff member is rejected');

-- ── The happy path still works, and persists ─────────────────────────────

insert into customers (business_id, name, email, phone)
values (current_business_id(), 'Created By A', 'new@example.com', '555-0102');

insert into appointments
  (business_id, customer_id, staff_id, service_id, starts_at, ends_at, status)
values
  (current_business_id(), :'CUST_A1', :'STAFF_A', :'SVC_A',
   '2026-03-01 10:00+00', '2026-03-01 10:45+00', 'confirmed');

select test.eq((select count(*) from customers), 3::bigint,
  'a same-tenant insert lands and is visible on re-read');

select test.eq(
  test.affected(format('update customers set phone = %L where id = %L',
                       '555-9999', :'CUST_A1')),
  1::bigint,
  'a same-tenant update affects exactly one row');

-- ── Onboarding cannot be replayed to acquire a second tenant ─────────────

select test.raises(
  'select create_business_with_owner(''Second Salon'', ''Owner A'')',
  'P0001',
  'create_business_with_owner refuses a caller who already has a profile');

-- ═════════════════════════════════════════════════════════════════════════
-- Signed in as tenant B — the mirror image, so the assertions above cannot
-- be passing merely because one tenant happens to own everything.
-- ═════════════════════════════════════════════════════════════════════════

select test.sign_in(:'USER_B');

select test.eq((select business_id from profiles), :'BIZ_B'::uuid,
  'tenant B resolves to its own business');

select test.eq((select count(*) from customers), 1::bigint,
  'tenant B sees only its own customer, unaffected by tenant A''s inserts');

select test.eq((select name from customers where id = :'CUST_B1'), 'Bianca Bloom',
  'tenant B''s customer was never renamed by tenant A''s update');

select test.eq((select total_spent_cents from customer_stats where customer_id = :'CUST_B1'),
  9000,
  'tenant B''s stats reflect tenant B''s prices only');

-- ═════════════════════════════════════════════════════════════════════════
-- Unauthenticated
-- ═════════════════════════════════════════════════════════════════════════

set role anon;
select test.sign_out();

select test.eq((select count(*) from customers), 0::bigint,
  'anon reads no customers');
select test.eq((select count(*) from businesses), 0::bigint,
  'anon reads no businesses');
select test.eq((select count(*) from appointments), 0::bigint,
  'anon reads no appointments');

select test.raises(
  format('insert into customers (business_id, name) values (%L, %L)',
         :'BIZ_A', 'Planted By Anon'),
  '42501',
  'anon cannot insert a customer');

select test.raises(
  'select create_business_with_owner(''Anon Salon'', ''Nobody'')',
  '42501',
  'anon cannot execute create_business_with_owner');

-- ═════════════════════════════════════════════════════════════════════════
-- Privileged caller — the invariant that must not depend on RLS at all.
-- A service-role key bypasses every policy above; the composite foreign key
-- is the only thing standing between it and a cross-tenant row.
-- ═════════════════════════════════════════════════════════════════════════

reset role;
select test.sign_out();

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_A', :'CUST_B1', :'STAFF_A', :'SVC_A',
         '2026-04-01 10:00+00', '2026-04-01 10:45+00'),
  '23503',
  'even an RLS-exempt caller cannot link an appointment across tenants');

-- Because no cross-tenant reference can exist, `on delete cascade` can no
-- longer reach out of its own business: deleting tenant B's customer takes
-- tenant B's appointment and leaves tenant A's alone.

delete from customers where id = :'CUST_B1';

select test.eq((select count(*) from appointments where business_id = :'BIZ_B'),
  0::bigint,
  'deleting a customer cascades within its own tenant');

select test.eq((select count(*) from appointments where business_id = :'BIZ_A'),
  2::bigint,
  'tenant B''s cascade cannot delete tenant A''s appointments');

do $$
begin
  raise notice 'tenant isolation: all assertions passed';
end
$$;
