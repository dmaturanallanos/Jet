delete from public.activity_logs
where metadata ? 'demo'
  or title ilike '%DEMO%'
  or description ilike '%DEMO%';

delete from public.tasks
where title ilike '%DEMO%'
  or description ilike '%DEMO%';

delete from public.reports
where title ilike '%DEMO%'
  or description ilike '%DEMO%';

delete from public.meeting_points
where name ilike '%DEMO%'
  or slug ilike '%demo%'
  or internal_notes ilike '%DEMO%';

delete from public.organizations
where name ilike '%DEMO%'
  or slug ilike '%demo%';
