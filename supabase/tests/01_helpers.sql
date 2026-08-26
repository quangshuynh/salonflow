-- Assertion helpers for the SQL suites. Test-only, like the auth shim.
--
-- Every helper is SECURITY INVOKER (the plpgsql default) so it executes with
-- the privileges and RLS context of whichever role called it. A security
-- definer helper would run as the table owner and silently bypass the very
-- policies these suites exist to verify.

create schema if not exists test;
grant usage on schema test to anon, authenticated;

-- Signs the session in as `user_id` by setting the claim `auth.uid()` reads.
-- Session-scoped rather than transaction-scoped: psql runs each statement in
-- its own transaction, and the identity has to outlive them.
create function test.sign_in(user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims',
                     json_build_object('sub', user_id)::text,
                     false);
end
$$;

create function test.sign_out()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '', false);
end
$$;

create function test.ok(passed boolean, description text)
returns void
language plpgsql
as $$
begin
  if passed is not true then
    raise exception 'not ok - %', description;
  end if;
  raise notice 'ok     - %', description;
end
$$;

create function test.eq(actual anyelement, expected anyelement, description text)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception 'not ok - % (expected %, got %)',
      description, coalesce(expected::text, 'null'), coalesce(actual::text, 'null');
  end if;
  raise notice 'ok     - %', description;
end
$$;

-- Asserts that `stmt` fails with a specific SQLSTATE. Used for the cases
-- where the database is expected to actively refuse a write — an RLS
-- `with check` violation (42501) or a foreign key violation (23503) — as
-- opposed to the cases where it silently filters rows out.
create function test.raises(stmt text, expected_sqlstate text, description text)
returns void
language plpgsql
as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate = expected_sqlstate then
      raise notice 'ok     - % [%]', description, sqlstate;
      return;
    end if;
    raise exception 'not ok - % (expected SQLSTATE %, got %: %)',
      description, expected_sqlstate, sqlstate, sqlerrm;
  end;
  raise exception 'not ok - % (statement succeeded but should have been rejected)',
    description;
end
$$;

-- Row count an UPDATE/DELETE actually touched. RLS does not raise on rows the
-- caller cannot see — it removes them from the statement's scope — so "zero
-- rows affected" is the shape a blocked cross-tenant mutation really takes.
create function test.affected(stmt text)
returns bigint
language plpgsql
as $$
declare
  n bigint;
begin
  execute stmt;
  get diagnostics n = row_count;
  return n;
end
$$;
