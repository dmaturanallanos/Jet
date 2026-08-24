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
