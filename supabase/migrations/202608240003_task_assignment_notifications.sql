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

create policy "admins can insert notifications"
on public.notifications for insert
with check (
  organization_id = public.current_organization_id()
  and public.is_admin()
);
