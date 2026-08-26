alter table public.reports
  add column if not exists report_type text not null default 'manual',
  add column if not exists report_date date,
  add column if not exists summary jsonb;

alter table public.reports
  drop constraint if exists reports_type_check;

alter table public.reports
  add constraint reports_type_check
  check (report_type in ('manual', 'automatic'));

create unique index if not exists reports_one_automatic_per_day_idx
on public.reports(organization_id, report_date)
where report_type = 'automatic';

drop policy if exists "admins can update reports" on public.reports;
create policy "admins can update reports"
on public.reports for update
using (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
)
with check (
  organization_id = public.current_organization_id()
  and public.can_manage_operations()
);
