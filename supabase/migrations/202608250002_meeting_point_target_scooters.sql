alter table public.meeting_points
  add column if not exists target_scooters integer;

alter table public.meeting_points
  drop constraint if exists meeting_points_target_scooters_range;

alter table public.meeting_points
  add constraint meeting_points_target_scooters_range
  check (target_scooters is null or (target_scooters >= 0 and target_scooters <= 200));
