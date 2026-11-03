-- Appointment tenant isolation and relationship integrity, against the real
-- migrations and policies. An appointment is the one row that references
-- three other tenant-owned rows, so beyond "who can see it" this suite
-- proves the references themselves cannot cross a tenant boundary — on
-- insert, on update, and never partially.
--
-- Uses its own two tenants so it does not depend on what 10_ left behind.
-- 21_appointments_reload_test.sql re-reads the rows written here from a
-- separate connection.

\set BIZ_C    '33333333-3333-4333-8333-333333333333'
\set BIZ_D    '44444444-4444-4444-8444-444444444444'
\set USER_C   'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
\set USER_D   'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
\set USER_N   'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
\set CUST_C   'c3333333-3333-4333-8333-333333333333'
\set CUST_D   'c4444444-4444-4444-8444-444444444444'
\set STAFF_C  'd3333333-3333-4333-8333-333333333333'
\set STAFF_D  'd4444444-4444-4444-8444-444444444444'
\set SVC_C    'e3333333-3333-4333-8333-333333333333'
\set SVC_D    'e4444444-4444-4444-8444-444444444444'
\set APT_C    'a3333333-3333-4333-8333-333333333333'
\set APT_D    'a4444444-4444-4444-8444-444444444444'
\set APT_NEW  'a3333333-3333-4333-8333-000000000001'
\set APT_GONE 'a3333333-3333-4333-8333-000000000002'
\set NOWHERE  'f0000000-0000-4000-8000-000000000000'

-- ── Fixtures (superuser, RLS bypassed) ───────────────────────────────────

insert into auth.users (id, email) values
  (:'USER_C', 'owner@salon-c.example'),
  (:'USER_D', 'owner@salon-d.example'),
  (:'USER_N', 'no-profile@example.com');

insert into businesses (id, name) values
  (:'BIZ_C', 'Salon C'),
  (:'BIZ_D', 'Salon D');

-- USER_N is deliberately left without a profile: signed in, no tenant.
insert into profiles (id, business_id, full_name) values
  (:'USER_C', :'BIZ_C', 'Owner C'),
  (:'USER_D', :'BIZ_D', 'Owner D');

insert into customers (id, business_id, name) values
  (:'CUST_C', :'BIZ_C', 'Cora Cole'),
  (:'CUST_D', :'BIZ_D', 'Dana Dale');

insert into staff (id, business_id, name, role) values
  (:'STAFF_C', :'BIZ_C', 'Stylist C', 'stylist'),
  (:'STAFF_D', :'BIZ_D', 'Stylist D', 'stylist');

insert into services (id, business_id, name, category, duration_min, price_cents) values
  (:'SVC_C', :'BIZ_C', 'Cut C', 'hair', 45, 5000),
  (:'SVC_D', :'BIZ_D', 'Cut D', 'hair', 60, 8000);

insert into appointments
  (id, business_id, customer_id, staff_id, service_id, starts_at, ends_at, status)
values
  (:'APT_C', :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_C',
   '2026-05-04 10:00+00', '2026-05-04 10:45+00', 'confirmed'),
  (:'APT_D', :'BIZ_D', :'CUST_D', :'STAFF_D', :'SVC_D',
   '2026-05-04 11:00+00', '2026-05-04 12:00+00', 'confirmed');

-- ═════════════════════════════════════════════════════════════════════════
-- Signed in as tenant C
-- ═════════════════════════════════════════════════════════════════════════

set role authenticated;
select test.sign_in(:'USER_C');

-- ── Reads ────────────────────────────────────────────────────────────────

select test.eq((select count(*) from appointments), 1::bigint,
  'appointments: tenant C reads exactly its own appointment');

select test.eq((select count(*) from appointments where id = :'APT_D'), 0::bigint,
  'appointments: tenant D''s appointment is invisible even by exact id');

select test.eq((select count(*) from appointments where business_id = :'BIZ_D'), 0::bigint,
  'appointments: filtering on tenant D''s business_id cannot widen the read');

-- The shape the app's joined query reads: every relation resolves inside
-- the caller's own tenant.
select test.eq(
  (select c.name || ' / ' || s.name || ' / ' || v.name
     from appointments a
     join customers c on c.id = a.customer_id
     join staff     s on s.id = a.staff_id
     join services  v on v.id = a.service_id
    where a.id = :'APT_C'),
  'Cora Cole / Stylist C / Cut C',
  'appointments: the joined read resolves customer, staff and service');

-- ── Mutating tenant D's appointment silently affects nothing ─────────────

select test.eq(
  test.affected(format('update appointments set status = %L where id = %L',
                       'cancelled', :'APT_D')),
  0::bigint,
  'appointments: updating tenant D''s status affects zero rows');

select test.eq(
  test.affected(format('update appointments set starts_at = starts_at + interval ''1 day'',
                                                ends_at   = ends_at   + interval ''1 day''
                         where id = %L', :'APT_D')),
  0::bigint,
  'appointments: rescheduling tenant D''s appointment affects zero rows');

select test.eq(
  test.affected(format('delete from appointments where id = %L', :'APT_D')),
  0::bigint,
  'appointments: deleting tenant D''s appointment affects zero rows');

-- ── Writing into tenant D is actively refused ────────────────────────────

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_D', :'CUST_D', :'STAFF_D', :'SVC_D',
         '2026-06-01 10:00+00', '2026-06-01 11:00+00'),
  '42501',
  'appointments: booking into tenant D with a client-chosen business_id violates RLS');

select test.raises(
  format('update appointments set business_id = %L where id = %L', :'BIZ_D', :'APT_C'),
  '42501',
  'appointments: re-parenting an own appointment into tenant D is refused');

select test.raises(
  format('update appointments
             set business_id = %L, customer_id = %L, staff_id = %L, service_id = %L
           where id = %L',
         :'BIZ_D', :'CUST_D', :'STAFF_D', :'SVC_D', :'APT_C'),
  '42501',
  'appointments: moving an own appointment wholesale into tenant D is refused');

-- ── References into tenant D are rejected (composite FKs, 0003) ──────────
-- Each of these rows carries the caller's own business_id, so it passes the
-- RLS with check. Only the (business_id, id) foreign key stops it.

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_D', :'STAFF_C', :'SVC_C',
         '2026-06-01 10:00+00', '2026-06-01 10:45+00'),
  '23503',
  'insert: tenant D''s customer is rejected');

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_C', :'STAFF_D', :'SVC_C',
         '2026-06-01 10:00+00', '2026-06-01 10:45+00'),
  '23503',
  'insert: tenant D''s staff member is rejected');

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_D',
         '2026-06-01 10:00+00', '2026-06-01 10:45+00'),
  '23503',
  'insert: tenant D''s service is rejected');

-- Same SQLSTATE for an id that exists nowhere: the error is no oracle for
-- whether another tenant owns a given id.
select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'NOWHERE', :'STAFF_C', :'SVC_C',
         '2026-06-01 10:00+00', '2026-06-01 10:45+00'),
  '23503',
  'insert: a nonexistent customer fails identically to a foreign one');

select test.raises(
  format('update appointments set customer_id = %L where id = %L', :'CUST_D', :'APT_C'),
  '23503',
  'update: re-pointing an own appointment at tenant D''s customer is rejected');

select test.raises(
  format('update appointments set staff_id = %L where id = %L', :'STAFF_D', :'APT_C'),
  '23503',
  'update: re-pointing at tenant D''s staff member is rejected');

select test.raises(
  format('update appointments set service_id = %L where id = %L', :'SVC_D', :'APT_C'),
  '23503',
  'update: re-pointing at tenant D''s service is rejected');

select test.eq(
  (select customer_id::text || staff_id::text || service_id::text
     from appointments where id = :'APT_C'),
  :'CUST_C' || :'STAFF_C' || :'SVC_C',
  'update: the rejected re-points left the appointment''s references intact');

-- ── Rejected writes never partially succeed ──────────────────────────────

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L),
                 (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_C', '2026-06-02 10:00+00', '2026-06-02 10:45+00',
         :'BIZ_C', :'CUST_D', :'STAFF_C', :'SVC_C', '2026-06-02 11:00+00', '2026-06-02 11:45+00'),
  '23503',
  'atomicity: a batch with one cross-tenant row is rejected as a whole');

-- A valid write followed by a refused one inside the same transaction: the
-- failure rolls the valid write back with it.
select test.raises(
  format($sql$do $body$
     begin
       insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
       values (%L, %L, %L, %L, '2026-06-03 10:00+00', '2026-06-03 10:45+00');
       update appointments set status = 'completed' where id = %L;
       insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
       values (%L, %L, %L, %L, '2026-06-03 11:00+00', '2026-06-03 11:45+00');
     end
   $body$$sql$,
   :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_C',
   :'APT_C',
   :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_D'),
  '23503',
  'atomicity: a transaction that ends in a cross-tenant reference fails');

select test.eq((select count(*) from appointments), 1::bigint,
  'atomicity: no appointment from the rejected batch or transaction landed');

select test.eq((select status::text from appointments where id = :'APT_C'), 'confirmed',
  'atomicity: the status update inside the failed transaction was rolled back');

select test.raises(
  format('update appointments set customer_id = %L', :'CUST_D'),
  '23503',
  'atomicity: an unfiltered re-point across tenants fails without touching any row');

-- ── Other schema constraints still hold ──────────────────────────────────

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_C',
         '2026-06-04 10:45+00', '2026-06-04 10:00+00'),
  '23514',
  'constraints: an appointment cannot end before it starts');

select test.raises(
  format('delete from services where id = %L', :'SVC_C'),
  '23503',
  'constraints: a service with booking history cannot be deleted');

-- ── Same-tenant create, update, delete ───────────────────────────────────

insert into appointments
  (id, business_id, customer_id, staff_id, service_id, starts_at, ends_at, status)
values
  (:'APT_NEW',  current_business_id(), :'CUST_C', :'STAFF_C', :'SVC_C',
   '2026-07-01 10:00+00', '2026-07-01 10:45+00', 'confirmed'),
  (:'APT_GONE', current_business_id(), :'CUST_C', :'STAFF_C', :'SVC_C',
   '2026-07-02 10:00+00', '2026-07-02 10:45+00', 'pending');

select test.eq((select count(*) from appointments), 3::bigint,
  'same tenant: new appointments land and are visible on re-read');

select test.eq(
  test.affected(format('update appointments set status = %L where id = %L and status = %L',
                       'completed', :'APT_NEW', 'confirmed')),
  1::bigint,
  'same tenant: a guarded status update affects exactly one row');

select test.eq(
  test.affected(format('update appointments set status = %L where id = %L and status = %L',
                       'cancelled', :'APT_NEW', 'confirmed')),
  0::bigint,
  'same tenant: a status update validated against a stale status affects nothing');

select test.eq(
  test.affected(format('delete from appointments where id = %L', :'APT_GONE')),
  1::bigint,
  'same tenant: deleting an own appointment affects exactly one row');

-- ═════════════════════════════════════════════════════════════════════════
-- Missing tenant context
-- ═════════════════════════════════════════════════════════════════════════

-- Authenticated, but no profile: current_business_id() is null, and null
-- matches no policy.
select test.sign_in(:'USER_N');

select test.ok(current_business_id() is null,
  'no profile: the caller resolves to no tenant');

select test.eq((select count(*) from appointments), 0::bigint,
  'no profile: reads no appointments');

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_C',
         '2026-06-05 10:00+00', '2026-06-05 10:45+00'),
  '42501',
  'no profile: cannot book into a business by naming its id');

select test.eq(
  test.affected(format('update appointments set status = %L where id = %L',
                       'cancelled', :'APT_C')),
  0::bigint,
  'no profile: cannot update any appointment');

-- The authenticated role with no subject at all.
select test.sign_out();

select test.eq((select count(*) from appointments), 0::bigint,
  'no subject: reads no appointments');

select test.eq(
  test.affected(format('delete from appointments where id = %L', :'APT_C')),
  0::bigint,
  'no subject: cannot delete any appointment');

-- ═════════════════════════════════════════════════════════════════════════
-- Signed in as tenant D — the mirror image
-- ═════════════════════════════════════════════════════════════════════════

select test.sign_in(:'USER_D');

select test.eq((select count(*) from appointments), 1::bigint,
  'tenant D: reads exactly its own appointment');

select test.ok(
  (select status = 'confirmed' and starts_at = '2026-05-04 11:00+00'
     from appointments where id = :'APT_D'),
  'tenant D: its appointment was not cancelled, moved, or deleted by tenant C');

select test.eq((select count(*) from appointments where id = :'APT_NEW'), 0::bigint,
  'tenant D: cannot see tenant C''s new appointment');

-- ═════════════════════════════════════════════════════════════════════════
-- Anonymous
-- ═════════════════════════════════════════════════════════════════════════

set role anon;
select test.sign_out();

select test.eq((select count(*) from appointments), 0::bigint,
  'anon: reads no appointments');

select test.raises(
  format('insert into appointments (business_id, customer_id, staff_id, service_id, starts_at, ends_at)
          values (%L, %L, %L, %L, %L, %L)',
         :'BIZ_C', :'CUST_C', :'STAFF_C', :'SVC_C',
         '2026-06-06 10:00+00', '2026-06-06 10:45+00'),
  '42501',
  'anon: cannot book an appointment');

reset role;

do $$
begin
  raise notice 'appointments: all assertions passed';
end
$$;
