with target_user as (
  select id, email
  from auth.users
  where lower(email) = lower('admins@jet.cl')
  limit 1
),
target_org as (
  select organization_id
  from public.profiles
  where role::text = 'admin'
  order by created_at
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
  'Admin',
  'Jet',
  'Admin Jet',
  'admin',
  'active'
from target_user
cross join target_org
on conflict (id) do update
set email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    display_name = excluded.display_name,
    role = excluded.role,
    status = excluded.status;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where lower(email) = lower('admins@jet.cl');
