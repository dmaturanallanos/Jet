import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/common/states";
import { TaskCard, type TaskCardData } from "@/components/tasks/task-card";
import { CreateTaskForm } from "./create-task-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/types/domain";

export default async function TasksPage() {
  let points: { id: string; name: string }[] = [];
  let assignees: { id: string; display_name: string }[] = [];
  let tasks: TaskCardData[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [{ data: dbPoints }, { data: dbProfiles }, { data: dbTasks }] = await Promise.all([
      supabase.from("meeting_points").select("id, name").is("deleted_at", null).order("name"),
      supabase.from("profiles").select("id, display_name").eq("status", "active").order("display_name"),
      supabase.from("tasks").select("id, title, description, priority, status, due_date, assigned_to").order("created_at", { ascending: false }),
    ]);

    points = dbPoints ?? [];
    assignees = dbProfiles ?? [];
    tasks = (dbTasks ?? []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
      dueDate: task.due_date,
      assignedTo: assignees.find((person) => person.id === task.assigned_to)?.display_name ?? "Sin responsable",
      pointName: null,
    }));
  }

  return (
    <AppShell>
      <PageHeader title="Tareas" description="Crea, asigna, inicia, completa o cancela tareas operativas." action={<Link href="/tasks/new" className="inline-flex h-11 items-center rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f]"><Plus className="mr-2 size-4" />Crear tarea</Link>} />
      <CreateTaskForm points={points} assignees={assignees} />
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        {["Fecha", "Estado", "Prioridad", "Responsable", "Punto"].map((filter) => <select key={filter} className="h-11 rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"><option>{filter}</option></select>)}
      </div>
      {tasks.length ? <div className="grid gap-3">{tasks.map((task) => <TaskCard key={task.id} task={task} />)}</div> : <EmptyState title="No hay tareas" description="Crea una tarea general o asignala personalmente a un operador." />}
    </AppShell>
  );
}
