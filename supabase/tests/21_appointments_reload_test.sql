-- Persistence across sessions. The runner gives every file its own psql
-- process, so this reads what 20_appointments_test.sql committed from a
-- fresh connection with no session state carried over — the database-side
-- equivalent of a reload or a new sign-in.

\set USER_C   'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
\set USER_D   'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
\set APT_C    'a3333333-3333-4333-8333-333333333333'
\set APT_NEW  'a3333333-3333-4333-8333-000000000001'
\set APT_GONE 'a3333333-3333-4333-8333-000000000002'

set role authenticated;
select test.sign_in(:'USER_C');

select test.eq((select status::text from appointments where id = :'APT_NEW'), 'completed',
  'reload: the created appointment and its status update persisted');

select test.eq((select count(*) from appointments where id = :'APT_GONE'), 0::bigint,
  'reload: the deleted appointment stays deleted');

select test.eq((select status::text from appointments where id = :'APT_C'), 'confirmed',
  'reload: the rolled-back transaction left no trace');

select test.eq((select count(*) from appointments), 2::bigint,
  'reload: tenant C reads exactly what it committed');

select test.sign_in(:'USER_D');

select test.eq((select count(*) from appointments where id = :'APT_NEW'), 0::bigint,
  'reload: the persisted appointment is still invisible to tenant D');

reset role;

do $$
begin
  raise notice 'appointment reload: all assertions passed';
end
$$;
