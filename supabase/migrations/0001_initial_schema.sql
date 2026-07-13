-- SalonFlow initial schema
-- Multi-tenant: every row belongs to a business, and access is enforced
-- with row-level security based on the signed-in user's profile.

-- ── Enums ────────────────────────────────────────────────────────────────

create type staff_role as enum (
  'stylist', 'barber', 'nail-tech', 'esthetician', 'manager'
);

create type service_category as enum (
  'hair', 'nails', 'spa', 'lashes', 'barber'
);

create type appointment_status as enum (
  'pending', 'confirmed', 'completed', 'cancelled', 'no-show'
);

-- ── Tables ───────────────────────────────────────────────────────────────

create table businesses (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  address    text,
  created_at timestamptz not null default now()
);

-- Links an auth user to the business they belong to.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

create table customers (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  created_at  timestamptz not null default now()
);

create table staff (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name        text not null,
  role        staff_role not null,
  created_at  timestamptz not null default now()
);

create table services (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses (id) on delete cascade,
  name         text not null,
  category     service_category not null,
  duration_min integer not null check (duration_min between 5 and 480),
  -- Money is stored as integer cents; the app formats for display.
  price_cents  integer not null check (price_cents >= 0),
  created_at   timestamptz not null default now()
);

create table appointments (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  staff_id    uuid not null references staff (id) on delete cascade,
  -- restrict: a service with booking history can't be silently deleted
  service_id  uuid not null references services (id) on delete restrict,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  status      appointment_status not null default 'pending',
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ── Indexes (the queries the app actually runs) ──────────────────────────

create index customers_business_idx    on customers (business_id);
create index staff_business_idx        on staff (business_id);
create index services_business_idx     on services (business_id, category);
create index appointments_day_idx      on appointments (business_id, starts_at);
create index appointments_customer_idx on appointments (customer_id);
create index appointments_staff_idx    on appointments (staff_id);

-- ── Derived customer stats ───────────────────────────────────────────────
-- The mock layer stored totalVisits/totalSpent/lastVisit on the customer;
-- in SQL they are derived so they can never drift out of sync.

create view customer_stats
  with (security_invoker = true) as
select
  c.id as customer_id,
  count(a.id) filter (where a.status = 'completed')                as total_visits,
  coalesce(sum(s.price_cents) filter (where a.status = 'completed'), 0)::integer
                                                                   as total_spent_cents,
  max(a.starts_at) filter (where a.status = 'completed')           as last_visit
from customers c
left join appointments a on a.customer_id = c.id
left join services s on s.id = a.service_id
group by c.id;

-- ── Row-level security ───────────────────────────────────────────────────

-- The business the current user belongs to.
create function current_business_id()
returns uuid
language sql
stable
as $$
  select business_id from profiles where id = auth.uid()
$$;

alter table businesses   enable row level security;
alter table profiles     enable row level security;
alter table customers    enable row level security;
alter table staff        enable row level security;
alter table services     enable row level security;
alter table appointments enable row level security;

create policy "read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "members read own business"
  on businesses for select
  using (id = current_business_id());

create policy "members update own business"
  on businesses for update
  using (id = current_business_id())
  with check (id = current_business_id());

create policy "members manage customers"
  on customers for all
  using (business_id = current_business_id())
  with check (business_id = current_business_id());

create policy "members manage staff"
  on staff for all
  using (business_id = current_business_id())
  with check (business_id = current_business_id());

create policy "members manage services"
  on services for all
  using (business_id = current_business_id())
  with check (business_id = current_business_id());

create policy "members manage appointments"
  on appointments for all
  using (business_id = current_business_id())
  with check (business_id = current_business_id());
