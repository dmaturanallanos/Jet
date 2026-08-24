import type { MeetingPointStatus, TaskPriority, TaskStatus } from "@/types/domain";
import { cn } from "@/utils/cn";

const statusLabels: Record<MeetingPointStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  review: "En revision",
  temporary: "Temporal",
};

const taskStatusLabels: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export function MeetingPointStatusBadge({ status }: { status: MeetingPointStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "active" && "bg-emerald-400/15 text-emerald-200",
        status === "review" && "bg-amber-400/15 text-amber-200",
        status === "temporary" && "bg-cyan-400/15 text-cyan-200",
        status === "inactive" && "bg-zinc-400/15 text-zinc-300",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        priority === "urgent" && "bg-red-400/15 text-red-200",
        priority === "high" && "bg-orange-400/15 text-orange-200",
        priority === "medium" && "bg-cyan-400/15 text-cyan-200",
        priority === "low" && "bg-zinc-400/15 text-zinc-300",
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-200">{taskStatusLabels[status]}</span>;
}
