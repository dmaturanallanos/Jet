with target_user as (
  select id, email
  from auth.users
  where lower(email) = lower('nich.miranda98@gmail.com')
  limit 1
),
target_org as (
  select p.organization_id
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower('danimaturana23@gmail.com')
  limit 1
)
insert into public.profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  display_name,
  role,
  status
)
select
  target_user.id,
  target_org.organization_id,
  target_user.email,
  'Nich',
  'Miranda',
  'Nich Miranda',
  'admin',
  'active'
from target_user
cross join target_org
on conflict (id) do update
set role = 'admin',
    status = 'active',
    email = excluded.email;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where lower(email) = lower('nich.miranda98@gmail.com');
