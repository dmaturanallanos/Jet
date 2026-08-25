import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PriorityBadge, TaskStatusBadge } from "@/components/common/badges";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/types/domain";
import { updateTaskStatus } from "./actions";

type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
  meeting_point_id: string | null;
  due_date: string | null;
  created_at: string;
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabaseEnv()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, title, description, priority, status, assigned_to, meeting_point_id, due_date, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const task = data as TaskDetail;

  const [{ data: point }, { data: assignee }] = await Promise.all([
    task.meeting_point_id ? supabase.from("meeting_points").select("id, name").eq("id", task.meeting_point_id).maybeSingle() : Promise.resolve({ data: null }),
    task.assigned_to ? supabase.from("profiles").select("display_name").eq("id", task.assigned_to).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-4xl gap-5">
        <Link href="/tasks" className="inline-flex items-center text-sm font-semibold text-cyan-600 dark:text-cyan-300">
          <ArrowLeft className="mr-2 size-4" />
          Volver a tareas
        </Link>
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">{task.title}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{task.description ?? "Sin descripcion."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Punto Jet" value={point?.name ?? "Tarea general"} href={point?.id ? `/points/${point.id}` : undefined} />
            <Info label="Responsable" value={assignee?.display_name ?? "Sin responsable personal"} />
            <Info label="Creada" value={new Date(task.created_at).toLocaleString("es-CL")} />
            <Info label="Vence" value={task.due_date ? new Date(task.due_date).toLocaleString("es-CL") : "Sin vencimiento"} />
          </div>
          <form action={updateTaskStatus} className="mt-5 flex flex-wrap gap-2">
            <input type="hidden" name="taskId" value={task.id} />
            <button name="status" value="pending" className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold dark:border-white/10">Pendiente</button>
            <button name="status" value="in_progress" className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold dark:border-white/10">Iniciar</button>
            <button name="status" value="completed" className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-white">
              <CalendarClock className="mr-2 size-4" />
              Completar
            </button>
            <button name="status" value="cancelled" className="h-10 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-600 dark:border-red-400/40 dark:text-red-200">Cancelar</button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = href ? <Link href={href} className="font-semibold text-cyan-600 dark:text-cyan-300">{value}</Link> : <span className="font-medium">{value}</span>;

  return (
    <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/5">
      <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-sm">{content}</p>
    </div>
  );
}
