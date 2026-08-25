alter table public.profiles
  alter column role set default 'scout';

update public.profiles
set role = 'scout'
where role::text = 'operator';
