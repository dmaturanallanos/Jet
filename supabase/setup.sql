create extension if not exists pgcrypto;

do $$
begin
  create type public.profile_role as enum ('admin', 'operator', 'moderator', 'scout');
exception when duplicate_object then null;
end $$;

alter type public.profile_role add value if not exists 'moderator';
alter type public.profile_role add value if not exists 'scout';

do $$
begin
  create type public.profile_status as enum ('active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.meeting_point_status as enum ('active', 'inactive', 'review', 'temporary');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_status as enum ('unread', 'read', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.shift_status as enum ('scheduled', 'active', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'America/Santiago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  email text,
  first_name text not null,
  last_name text not null,
  display_name text not null,
  avatar_url text,
  phone text,
  role public.profile_role not null default 'operator',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  slug text not null,
  address text not null,
  maps_url text,
  latitude numeric(9,6) check (latitude >= -90 and latitude <= 90),
  longitude numeric(9,6) check (longitude >= -180 and longitude <= 180),
  target_scooters integer check (target_scooters >= 0 and target_scooters <= 200),
  reference text,
  description text,
  status public.meeting_point_status not null default 'review',
  internal_notes text,
  main_image_url text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, slug)
);

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

alter table public.meeting_points
  add column if not exists maps_url text;

alter table public.meeting_points
  add column if not exists target_scooters integer;

alter table public.meeting_points
  drop constraint if exists meeting_points_target_scooters_range;

alter table public.meeting_points
  add constraint meeting_points_target_scooters_range
  check (target_scooters is null or (target_scooters >= 0 and target_scooters <= 200));

alter table public.meeting_points
  alter column latitude drop not null,
  alter column longitude drop not null;

alter table public.meeting_points
  drop constraint if exists meeting_points_location_required;

alter table public.meeting_points
  add constraint meeting_points_location_required
  check (
    nullif(trim(address), '') is not null
    or (latitude is not null and longitude is not null)
  );

create table if not exists public.meeting_point_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  meeting_point_id uuid not null references public.meeting_points(id) on delete cascade,
  storage_path text not null,
  public_url text,
  is_primary boolean not null default false,
  description text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  meeting_point_id uuid references public.meeting_points(id) on delete set null,
  title text not null,
  description text,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  due_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.task_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  task_id uuid not null references public.tasks(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  meeting_point_id uuid references public.meeting_points(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  observations text,
  importance public.task_priority,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  report_id uuid not null references public.reports(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  meeting_point_id uuid references public.meeting_points(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  action_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  title text not null,
  description text,
  previous_data jsonb,
  new_data jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.meeting_point_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  meeting_point_id uuid not null references public.meeting_points(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  field_name text not null,
  previous_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  status public.notification_status not null default 'unread',
  metadata jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  meeting_point_id uuid references public.meeting_points(id) on delete set null,
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  status public.shift_status not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists meeting_points_set_updated_at on public.meeting_points;
create trigger meeting_points_set_updated_at before update on public.meeting_points for each row execute function public.set_updated_at();
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists task_comments_set_updated_at on public.task_comments;
create trigger task_comments_set_updated_at before update on public.task_comments for each row execute function public.set_updated_at();
drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports for each row execute function public.set_updated_at();
drop trigger if exists shifts_set_updated_at on public.shifts;
create trigger shifts_set_updated_at before update on public.shifts for each row execute function public.set_updated_at();

create or replace function public.current_organization_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid() and status = 'active' limit 1;
$$;

create or replace function public.current_role()
returns public.profile_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and status = 'active' limit 1;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role()::text = 'admin', false);
$$;

create or replace function public.can_manage_operations()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role()::text in ('admin', 'moderator'), false);
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.meeting_points enable row level security;
alter table public.meeting_point_images enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_images enable row level security;
alter table public.reports enable row level security;
alter table public.report_images enable row level security;
alter table public.activity_logs enable row level security;
alter table public.meeting_point_history enable row level security;
alter table public.notifications enable row level security;
alter table public.shifts enable row level security;

drop policy if exists "members can read their organization" on public.organizations;
create policy "members can read their organization" on public.organizations for select using (id = public.current_organization_id());
drop policy if exists "members can read profiles in organization" on public.profiles;
create policy "members can read profiles in organization" on public.profiles for select using (organization_id = public.current_organization_id());
drop policy if exists "users can update their own profile basics" on public.profiles;
create policy "users can update their own profile basics" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and organization_id = public.current_organization_id());
drop policy if exists "admins can update organization profiles" on public.profiles;
create policy "admins can update organization profiles" on public.profiles for update using (organization_id = public.current_organization_id() and public.can_manage_operations()) with check (organization_id = public.current_organization_id() and public.can_manage_operations());
drop policy if exists "admins can insert profiles in organization" on public.profiles;
create policy "admins can insert profiles in organization" on public.profiles for insert with check (organization_id = public.current_organization_id() and public.can_manage_operations());

drop policy if exists "members can read meeting points" on public.meeting_points;
create policy "members can read meeting points" on public.meeting_points for select using (organization_id = public.current_organization_id());
drop policy if exists "admins can insert meeting points" on public.meeting_points;
create policy "admins can insert meeting points" on public.meeting_points for insert with check (organization_id = public.current_organization_id() and public.can_manage_operations());
drop policy if exists "admins can update meeting points" on public.meeting_points;
create policy "admins can update meeting points" on public.meeting_points for update using (organization_id = public.current_organization_id() and public.can_manage_operations()) with check (organization_id = public.current_organization_id() and public.can_manage_operations());

drop policy if exists "members can read meeting point images" on public.meeting_point_images;
create policy "members can read meeting point images" on public.meeting_point_images for select using (organization_id = public.current_organization_id());
drop policy if exists "members can add meeting point images" on public.meeting_point_images;
create policy "members can add meeting point images" on public.meeting_point_images for insert with check (organization_id = public.current_organization_id());
drop policy if exists "admins can update meeting point images" on public.meeting_point_images;
create policy "admins can update meeting point images" on public.meeting_point_images for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());

drop policy if exists "members can read tasks" on public.tasks;
create policy "members can read tasks" on public.tasks for select using (organization_id = public.current_organization_id());
drop policy if exists "admins can insert tasks" on public.tasks;
create policy "admins can insert tasks" on public.tasks for insert with check (organization_id = public.current_organization_id() and public.can_manage_operations());
drop policy if exists "admins can update tasks" on public.tasks;
create policy "admins can update tasks" on public.tasks for update using (organization_id = public.current_organization_id() and public.can_manage_operations()) with check (organization_id = public.current_organization_id() and public.can_manage_operations());
drop policy if exists "operators can update assigned tasks" on public.tasks;
create policy "operators can update assigned tasks" on public.tasks for update using (organization_id = public.current_organization_id() and assigned_to = auth.uid()) with check (organization_id = public.current_organization_id() and assigned_to = auth.uid());

drop policy if exists "members can read task comments" on public.task_comments;
create policy "members can read task comments" on public.task_comments for select using (organization_id = public.current_organization_id());
drop policy if exists "members can insert task comments" on public.task_comments;
create policy "members can insert task comments" on public.task_comments for insert with check (organization_id = public.current_organization_id() and user_id = auth.uid());
drop policy if exists "members can read task images" on public.task_images;
create policy "members can read task images" on public.task_images for select using (organization_id = public.current_organization_id());
drop policy if exists "members can insert task images" on public.task_images;
create policy "members can insert task images" on public.task_images for insert with check (organization_id = public.current_organization_id() and uploaded_by = auth.uid());

drop policy if exists "members can read reports" on public.reports;
create policy "members can read reports" on public.reports for select using (organization_id = public.current_organization_id());
drop policy if exists "members can insert reports" on public.reports;
create policy "members can insert reports" on public.reports for insert with check (organization_id = public.current_organization_id() and user_id = auth.uid());
drop policy if exists "admins can update reports" on public.reports;
create policy "admins can update reports" on public.reports for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());
drop policy if exists "members can read report images" on public.report_images;
create policy "members can read report images" on public.report_images for select using (organization_id = public.current_organization_id());
drop policy if exists "members can insert report images" on public.report_images;
create policy "members can insert report images" on public.report_images for insert with check (organization_id = public.current_organization_id() and uploaded_by = auth.uid());

drop policy if exists "members can read activity logs" on public.activity_logs;
create policy "members can read activity logs" on public.activity_logs for select using (organization_id = public.current_organization_id());
drop policy if exists "members can insert activity logs" on public.activity_logs;
create policy "members can insert activity logs" on public.activity_logs for insert with check (organization_id = public.current_organization_id() and user_id = auth.uid());
drop policy if exists "members can read meeting point history" on public.meeting_point_history;
create policy "members can read meeting point history" on public.meeting_point_history for select using (organization_id = public.current_organization_id());
drop policy if exists "admins can insert meeting point history" on public.meeting_point_history;
create policy "admins can insert meeting point history" on public.meeting_point_history for insert with check (organization_id = public.current_organization_id() and public.is_admin());
drop policy if exists "users can read their notifications" on public.notifications;
create policy "users can read their notifications" on public.notifications for select using (organization_id = public.current_organization_id() and user_id = auth.uid());
drop policy if exists "users can update their notifications" on public.notifications;
create policy "users can update their notifications" on public.notifications for update using (organization_id = public.current_organization_id() and user_id = auth.uid()) with check (organization_id = public.current_organization_id() and user_id = auth.uid());

drop policy if exists "members can read shifts" on public.shifts;
create policy "members can read shifts" on public.shifts for select using (organization_id = public.current_organization_id());
drop policy if exists "admins and moderators can insert shifts" on public.shifts;
create policy "admins and moderators can insert shifts" on public.shifts for insert with check (organization_id = public.current_organization_id() and public.can_manage_operations());
drop policy if exists "admins and moderators can update shifts" on public.shifts;
create policy "admins and moderators can update shifts" on public.shifts for update using (organization_id = public.current_organization_id() and public.can_manage_operations()) with check (organization_id = public.current_organization_id() and public.can_manage_operations());

create index if not exists profiles_organization_id_idx on public.profiles(organization_id);
create index if not exists meeting_points_organization_status_idx on public.meeting_points(organization_id, status) where deleted_at is null;
create index if not exists meeting_points_updated_at_idx on public.meeting_points(updated_at desc);
create index if not exists meeting_point_images_point_idx on public.meeting_point_images(meeting_point_id) where deleted_at is null;
create index if not exists tasks_organization_status_idx on public.tasks(organization_id, status);
create index if not exists tasks_meeting_point_idx on public.tasks(meeting_point_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_priority_due_date_idx on public.tasks(priority, due_date);
create index if not exists task_comments_task_idx on public.task_comments(task_id) where deleted_at is null;
create index if not exists reports_organization_created_at_idx on public.reports(organization_id, created_at desc);
create index if not exists reports_meeting_point_idx on public.reports(meeting_point_id);
create index if not exists activity_logs_organization_created_at_idx on public.activity_logs(organization_id, created_at desc);
create index if not exists activity_logs_meeting_point_idx on public.activity_logs(meeting_point_id);
create index if not exists activity_logs_task_idx on public.activity_logs(task_id);
create index if not exists activity_logs_report_idx on public.activity_logs(report_id);
create index if not exists meeting_point_history_point_idx on public.meeting_point_history(meeting_point_id, created_at desc);
create index if not exists notifications_user_status_idx on public.notifications(user_id, status);
create index if not exists shifts_organization_starts_at_idx on public.shifts(organization_id, starts_at);
create index if not exists shifts_assigned_to_idx on public.shifts(assigned_to, starts_at);
create index if not exists shifts_meeting_point_idx on public.shifts(meeting_point_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('jet-operations', 'jet-operations', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "members can read organization storage objects" on storage.objects;
create policy "members can read organization storage objects" on storage.objects for select using (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1]
);

drop policy if exists "members can upload organization storage objects" on storage.objects;
create policy "members can upload organization storage objects" on storage.objects for insert with check (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1]
);

drop policy if exists "admins can update organization storage objects" on storage.objects;
create policy "admins can update organization storage objects" on storage.objects for update using (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1] and public.is_admin()
) with check (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1] and public.is_admin()
);
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

drop policy if exists "admins can delete organization storage objects" on storage.objects;
create policy "admins can delete organization storage objects"
on storage.objects for delete
using (
  bucket_id = 'jet-operations'
  and public.current_organization_id()::text = (storage.foldername(name))[1]
  and public.is_admin()
);
create or replace function public.create_task_assignment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and (tg_op = 'INSERT' or old.assigned_to is distinct from new.assigned_to) then
    insert into public.notifications (
      organization_id,
      user_id,
      title,
      body,
      metadata
    )
    values (
      new.organization_id,
      new.assigned_to,
      'Nueva tarea asignada',
      new.title,
      jsonb_build_object(
        'task_id', new.id,
        'meeting_point_id', new.meeting_point_id,
        'priority', new.priority,
        'status', new.status
      )
    );

    insert into public.activity_logs (
      organization_id,
      user_id,
      meeting_point_id,
      task_id,
      action_type,
      entity_type,
      entity_id,
      title,
      description,
      new_data
    )
    values (
      new.organization_id,
      auth.uid(),
      new.meeting_point_id,
      new.id,
      'task_assigned',
      'task',
      new.id,
      'Tarea asignada',
      new.title,
      jsonb_build_object('assigned_to', new.assigned_to, 'priority', new.priority)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_assignment_notification on public.tasks;
create trigger tasks_assignment_notification
after insert or update of assigned_to on public.tasks
for each row execute function public.create_task_assignment_notification();

create or replace function public.create_shift_assignment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or old.assigned_to is distinct from new.assigned_to or old.starts_at is distinct from new.starts_at then
    insert into public.notifications (organization_id, user_id, title, body, metadata)
    values (
      new.organization_id,
      new.assigned_to,
      'Turno asignado',
      new.title || ' - ' || to_char(new.starts_at at time zone 'America/Santiago', 'DD/MM HH24:MI'),
      jsonb_build_object('shift_id', new.id, 'meeting_point_id', new.meeting_point_id, 'starts_at', new.starts_at, 'ends_at', new.ends_at)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists shifts_assignment_notification on public.shifts;
create trigger shifts_assignment_notification
after insert or update of assigned_to, starts_at on public.shifts
for each row execute function public.create_shift_assignment_notification();

create or replace function public.notify_team(
  notification_title text,
  notification_body text,
  notification_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_operations() then
    raise exception 'forbidden';
  end if;

  insert into public.notifications (organization_id, user_id, title, body, metadata)
  select public.current_organization_id(), p.id, notification_title, notification_body, notification_metadata
  from public.profiles p
  where p.organization_id = public.current_organization_id()
    and p.status = 'active';
end;
$$;

revoke execute on function public.notify_team(text, text, jsonb) from public;
grant execute on function public.notify_team(text, text, jsonb) to authenticated;

drop policy if exists "admins can insert notifications" on public.notifications;
create policy "admins can insert notifications"
on public.notifications for insert
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);
