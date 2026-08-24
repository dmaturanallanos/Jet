import { CalendarClock } from "lucide-react";
import { PriorityBadge, TaskStatusBadge } from "@/components/common/badges";
import type { TaskPriority, TaskStatus } from "@/types/domain";

export type TaskCardData = {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  dueDate?: string | null;
  pointName?: string | null;
};

export function TaskCard({ task }: { task: TaskCardData }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{task.description}</p>
        </div>
        <div className="flex gap-2">
          <PriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-zinc-400">
        <span>{task.pointName ?? "Tarea general"}</span>
        <span>Responsable: {task.assignedTo}</span>
        {task.dueDate ? <span className="inline-flex items-center"><CalendarClock className="mr-1 size-4" />{new Date(task.dueDate).toLocaleString("es-CL")}</span> : null}
      </div>
    </article>
  );
}
