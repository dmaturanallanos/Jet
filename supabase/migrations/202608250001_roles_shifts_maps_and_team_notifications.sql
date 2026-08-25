alter type public.profile_role add value if not exists 'moderator';
alter type public.profile_role add value if not exists 'scout';

alter table public.meeting_points
  add column if not exists maps_url text;

do $$
begin
  create type public.shift_status as enum ('scheduled', 'active', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

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

drop trigger if exists shifts_set_updated_at on public.shifts;
create trigger shifts_set_updated_at before update on public.shifts
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role()::text = 'admin', false);
$$;

create or replace function public.can_manage_operations()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role()::text in ('admin', 'moderator'), false);
$$;

alter table public.shifts enable row level security;

drop policy if exists "members can read shifts" on public.shifts;
create policy "members can read shifts"
on public.shifts for select
using (organization_id = public.current_organization_id());

drop policy if exists "admins and moderators can insert shifts" on public.shifts;
create policy "admins and moderators can insert shifts"
on public.shifts for insert
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins and moderators can update shifts" on public.shifts;
create policy "admins and moderators can update shifts"
on public.shifts for update
using (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
)
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins can insert profiles in organization" on public.profiles;
create policy "admins can insert profiles in organization"
on public.profiles for insert
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins can update organization profiles" on public.profiles;
create policy "admins can update organization profiles"
on public.profiles for update
using (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
)
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins can insert meeting points" on public.meeting_points;
create policy "admins can insert meeting points"
on public.meeting_points for insert
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins can update meeting points" on public.meeting_points;
create policy "admins can update meeting points"
on public.meeting_points for update
using (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
)
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins can insert tasks" on public.tasks;
create policy "admins can insert tasks"
on public.tasks for insert
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

drop policy if exists "admins can update tasks" on public.tasks;
create policy "admins can update tasks"
on public.tasks for update
using (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
)
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);

create index if not exists shifts_organization_starts_at_idx on public.shifts(organization_id, starts_at);
create index if not exists shifts_assigned_to_idx on public.shifts(assigned_to, starts_at);
create index if not exists shifts_meeting_point_idx on public.shifts(meeting_point_id);

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
