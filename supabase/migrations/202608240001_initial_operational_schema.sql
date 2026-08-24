create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'operator');
create type public.profile_status as enum ('active', 'inactive');
create type public.meeting_point_status as enum ('active', 'inactive', 'review', 'temporary');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.task_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
create type public.notification_status as enum ('unread', 'read', 'archived');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'America/Santiago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
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

create table public.meeting_points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  slug text not null,
  address text not null,
  latitude numeric(9,6) not null check (latitude >= -90 and latitude <= 90),
  longitude numeric(9,6) not null check (longitude >= -180 and longitude <= 180),
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

create table public.meeting_point_images (
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

create table public.tasks (
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

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.task_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  task_id uuid not null references public.tasks(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.reports (
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

create table public.report_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  report_id uuid not null references public.reports(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.activity_logs (
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

create table public.meeting_point_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  meeting_point_id uuid not null references public.meeting_points(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  field_name text not null,
  previous_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create table public.notifications (
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

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger meeting_points_set_updated_at before update on public.meeting_points for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger task_comments_set_updated_at before update on public.task_comments for each row execute function public.set_updated_at();
create trigger reports_set_updated_at before update on public.reports for each row execute function public.set_updated_at();

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
  select coalesce(public.current_role() = 'admin', false);
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

create policy "members can read their organization" on public.organizations for select using (id = public.current_organization_id());
create policy "members can read profiles in organization" on public.profiles for select using (organization_id = public.current_organization_id());
create policy "users can update their own profile basics" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and organization_id = public.current_organization_id());
create policy "admins can update organization profiles" on public.profiles for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());
create policy "admins can insert profiles in organization" on public.profiles for insert with check (organization_id = public.current_organization_id() and public.is_admin());

create policy "members can read meeting points" on public.meeting_points for select using (organization_id = public.current_organization_id());
create policy "admins can insert meeting points" on public.meeting_points for insert with check (organization_id = public.current_organization_id() and public.is_admin());
create policy "admins can update meeting points" on public.meeting_points for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());

create policy "members can read meeting point images" on public.meeting_point_images for select using (organization_id = public.current_organization_id());
create policy "members can add meeting point images" on public.meeting_point_images for insert with check (organization_id = public.current_organization_id());
create policy "admins can update meeting point images" on public.meeting_point_images for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());

create policy "members can read tasks" on public.tasks for select using (organization_id = public.current_organization_id());
create policy "admins can insert tasks" on public.tasks for insert with check (organization_id = public.current_organization_id() and public.is_admin());
create policy "admins can update tasks" on public.tasks for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());
create policy "operators can update assigned tasks" on public.tasks for update using (organization_id = public.current_organization_id() and assigned_to = auth.uid()) with check (organization_id = public.current_organization_id() and assigned_to = auth.uid());

create policy "members can read task comments" on public.task_comments for select using (organization_id = public.current_organization_id());
create policy "members can insert task comments" on public.task_comments for insert with check (organization_id = public.current_organization_id() and user_id = auth.uid());
create policy "members can read task images" on public.task_images for select using (organization_id = public.current_organization_id());
create policy "members can insert task images" on public.task_images for insert with check (organization_id = public.current_organization_id() and uploaded_by = auth.uid());

create policy "members can read reports" on public.reports for select using (organization_id = public.current_organization_id());
create policy "members can insert reports" on public.reports for insert with check (organization_id = public.current_organization_id() and user_id = auth.uid());
create policy "admins can update reports" on public.reports for update using (organization_id = public.current_organization_id() and public.is_admin()) with check (organization_id = public.current_organization_id() and public.is_admin());
create policy "members can read report images" on public.report_images for select using (organization_id = public.current_organization_id());
create policy "members can insert report images" on public.report_images for insert with check (organization_id = public.current_organization_id() and uploaded_by = auth.uid());

create policy "members can read activity logs" on public.activity_logs for select using (organization_id = public.current_organization_id());
create policy "members can insert activity logs" on public.activity_logs for insert with check (organization_id = public.current_organization_id() and user_id = auth.uid());
create policy "members can read meeting point history" on public.meeting_point_history for select using (organization_id = public.current_organization_id());
create policy "admins can insert meeting point history" on public.meeting_point_history for insert with check (organization_id = public.current_organization_id() and public.is_admin());
create policy "users can read their notifications" on public.notifications for select using (organization_id = public.current_organization_id() and user_id = auth.uid());
create policy "users can update their notifications" on public.notifications for update using (organization_id = public.current_organization_id() and user_id = auth.uid()) with check (organization_id = public.current_organization_id() and user_id = auth.uid());

create index profiles_organization_id_idx on public.profiles(organization_id);
create index meeting_points_organization_status_idx on public.meeting_points(organization_id, status) where deleted_at is null;
create index meeting_points_updated_at_idx on public.meeting_points(updated_at desc);
create index meeting_point_images_point_idx on public.meeting_point_images(meeting_point_id) where deleted_at is null;
create index tasks_organization_status_idx on public.tasks(organization_id, status);
create index tasks_meeting_point_idx on public.tasks(meeting_point_id);
create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index tasks_priority_due_date_idx on public.tasks(priority, due_date);
create index task_comments_task_idx on public.task_comments(task_id) where deleted_at is null;
create index reports_organization_created_at_idx on public.reports(organization_id, created_at desc);
create index reports_meeting_point_idx on public.reports(meeting_point_id);
create index activity_logs_organization_created_at_idx on public.activity_logs(organization_id, created_at desc);
create index activity_logs_meeting_point_idx on public.activity_logs(meeting_point_id);
create index activity_logs_task_idx on public.activity_logs(task_id);
create index activity_logs_report_idx on public.activity_logs(report_id);
create index meeting_point_history_point_idx on public.meeting_point_history(meeting_point_id, created_at desc);
create index notifications_user_status_idx on public.notifications(user_id, status);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('jet-operations', 'jet-operations', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "members can read organization storage objects" on storage.objects for select using (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1]
);

create policy "members can upload organization storage objects" on storage.objects for insert with check (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1]
);

create policy "admins can update organization storage objects" on storage.objects for update using (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1] and public.is_admin()
) with check (
  bucket_id = 'jet-operations' and public.current_organization_id()::text = (storage.foldername(name))[1] and public.is_admin()
);
