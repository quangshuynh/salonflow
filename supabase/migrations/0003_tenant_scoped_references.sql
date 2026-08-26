-- Tenant-scoped foreign keys for appointments.
--
-- Until now `appointments.customer_id`, `staff_id`, and `service_id`
-- referenced their parents by id alone, while the RLS policy on
-- `appointments` only checks `business_id`. Nothing stopped a caller from
-- inserting an appointment into their *own* business that points at another
-- tenant's customer, staff member, or service — the row passed the `with
-- check`, and the plain foreign key was satisfied by any matching id.
--
-- That was a cross-tenant write: the other tenant's `on delete cascade`
-- would then reach across the boundary and delete the foreign appointment.
--
-- The fix is structural rather than procedural. Referencing
-- `(business_id, id)` makes PostgreSQL itself reject a parent that belongs
-- to a different business, so the invariant holds for every caller —
-- including one holding the service-role key, which RLS does not constrain.

-- ── Precondition ─────────────────────────────────────────────────────────
-- Fail loudly and specifically if the data already violates the invariant,
-- rather than surfacing an opaque constraint error from the ALTER below.

do $$
declare
  offending bigint;
begin
  select count(*)
    into offending
    from appointments a
    left join customers c on c.id = a.customer_id
    left join staff     s on s.id = a.staff_id
    left join services  v on v.id = a.service_id
   where c.business_id is distinct from a.business_id
      or s.business_id is distinct from a.business_id
      or v.business_id is distinct from a.business_id;

  if offending > 0 then
    raise exception
      'Cannot apply 0003: % appointment(s) reference a customer, staff member, or service belonging to a different business.',
      offending
      using
        errcode = 'integrity_constraint_violation',
        hint = 'List them with: select a.id, a.business_id, a.customer_id, a.staff_id, a.service_id from appointments a left join customers c on c.id = a.customer_id left join staff s on s.id = a.staff_id left join services v on v.id = a.service_id where c.business_id is distinct from a.business_id or s.business_id is distinct from a.business_id or v.business_id is distinct from a.business_id; then reassign or delete each row before re-running this migration.';
  end if;
end
$$;

-- ── Composite reference targets ──────────────────────────────────────────
-- `id` is already the primary key; these add the (business_id, id) pair a
-- composite foreign key needs to point at.

alter table customers add constraint customers_business_id_id_key unique (business_id, id);
alter table staff     add constraint staff_business_id_id_key     unique (business_id, id);
alter table services  add constraint services_business_id_id_key  unique (business_id, id);

-- ── Re-point the appointment foreign keys ────────────────────────────────
-- Delete behaviour is carried over unchanged: customers and staff cascade,
-- services still restrict so booking history can't be silently erased.

alter table appointments
  drop constraint appointments_customer_id_fkey,
  add  constraint appointments_customer_fkey
    foreign key (business_id, customer_id)
    references customers (business_id, id)
    on delete cascade;

alter table appointments
  drop constraint appointments_staff_id_fkey,
  add  constraint appointments_staff_fkey
    foreign key (business_id, staff_id)
    references staff (business_id, id)
    on delete cascade;

alter table appointments
  drop constraint appointments_service_id_fkey,
  add  constraint appointments_service_fkey
    foreign key (business_id, service_id)
    references services (business_id, id)
    on delete restrict;

-- ── Index cleanup ────────────────────────────────────────────────────────
-- The unique indexes created above lead with `business_id`, which makes the
-- single-column indexes from 0001 redundant. `services_business_idx` is kept:
-- it covers (business_id, category), which the new index does not.

drop index customers_business_idx;
drop index staff_business_idx;
