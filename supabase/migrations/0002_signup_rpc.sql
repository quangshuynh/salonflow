-- Creates a business and the caller's profile in one atomic step.
-- Security definer because the base tables have no insert policies:
-- this function is the only door, and it always writes auth.uid().

create function create_business_with_owner(
  business_name text,
  owner_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_business_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Profile already exists';
  end if;

  insert into businesses (name)
  values (business_name)
  returning id into new_business_id;

  insert into profiles (id, business_id, full_name)
  values (auth.uid(), new_business_id, owner_name);

  return new_business_id;
end;
$$;

revoke execute on function create_business_with_owner(text, text) from public, anon;
grant execute on function create_business_with_owner(text, text) to authenticated;
