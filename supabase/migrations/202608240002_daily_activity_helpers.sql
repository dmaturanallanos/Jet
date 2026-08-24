create or replace function public.organization_day_bounds(target_date date, organization_uuid uuid)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select
    (target_date::timestamp at time zone o.timezone) as starts_at,
    ((target_date + 1)::timestamp at time zone o.timezone) as ends_at
  from public.organizations o
  where o.id = organization_uuid;
$$;

create or replace function public.get_daily_summary(target_date date)
returns table (
  points_updated bigint,
  tasks_created bigint,
  tasks_completed bigint,
  tasks_pending bigint,
  photos_added bigint,
  reports_created bigint,
  active_users bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with org as (
    select public.current_organization_id() as id
  ),
  bounds as (
    select * from public.organization_day_bounds(target_date, (select id from org))
  )
  select
    (select count(distinct meeting_point_id) from public.activity_logs, bounds where organization_id = (select id from org) and created_at >= starts_at and created_at < ends_at and meeting_point_id is not null and action_type in ('meeting_point_created', 'meeting_point_updated', 'meeting_point_status_changed')) as points_updated,
    (select count(*) from public.tasks, bounds where organization_id = (select id from org) and created_at >= starts_at and created_at < ends_at) as tasks_created,
    (select count(*) from public.tasks, bounds where organization_id = (select id from org) and completed_at >= starts_at and completed_at < ends_at) as tasks_completed,
    (select count(*) from public.tasks where organization_id = (select id from org) and status in ('pending', 'in_progress')) as tasks_pending,
    (select count(*) from public.activity_logs, bounds where organization_id = (select id from org) and created_at >= starts_at and created_at < ends_at and action_type like '%image%') as photos_added,
    (select count(*) from public.reports, bounds where organization_id = (select id from org) and created_at >= starts_at and created_at < ends_at) as reports_created,
    (select count(distinct user_id) from public.activity_logs, bounds where organization_id = (select id from org) and created_at >= starts_at and created_at < ends_at and user_id is not null) as active_users;
$$;

create or replace function public.get_daily_activity(target_date date)
returns table (
  id uuid,
  source text,
  title text,
  description text,
  meeting_point_id uuid,
  user_id uuid,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with org as (
    select public.current_organization_id() as id
  ),
  bounds as (
    select * from public.organization_day_bounds(target_date, (select id from org))
  )
  select a.id, 'activity_log'::text, a.title, a.description, a.meeting_point_id, a.user_id, a.created_at
  from public.activity_logs a, bounds
  where a.organization_id = (select id from org)
    and a.created_at >= starts_at
    and a.created_at < ends_at
  union all
  select r.id, 'manual_report'::text, r.title, r.description, r.meeting_point_id, r.user_id, r.created_at
  from public.reports r, bounds
  where r.organization_id = (select id from org)
    and r.created_at >= starts_at
    and r.created_at < ends_at
  order by created_at desc;
$$;

create policy "admins can delete organization storage objects"
on storage.objects for delete
using (
  bucket_id = 'jet-operations'
  and public.current_organization_id()::text = (storage.foldername(name))[1]
  and public.is_admin()
);
