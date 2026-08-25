import { redirect } from "next/navigation";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/activity/activity-timeline";
import { DailySummary } from "@/components/activity/daily-summary";
import { AppShell } from "@/components/app/app-shell";
import { appConfig } from "@/config/app";
import { MeetingPointQuickView } from "@/components/meeting-points/quick-view";
import { EmptyState } from "@/components/common/states";
import { TaskCard, type TaskCardData } from "@/components/tasks/task-card";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSignedStorageUrl } from "@/lib/supabase/storage";
import type { MeetingPointStatus, TaskPriority, TaskStatus } from "@/types/domain";

type DailySummaryRow = {
  points_updated?: number | string | null;
  tasks_created?: number | string | null;
  tasks_completed?: number | string | null;
  photos_added?: number | string | null;
  reports_created?: number | string | null;
  active_users?: number | string | null;
};

export default async function DashboardPage() {
  let userEmail = "sin-sesion";
  let profile: { display_name: string | null; role: string | null } | null = {
    display_name: "Sin sesion",
    role: "admin",
  };
  let stats = [
    { label: "Puntos actualizados", value: 0 },
    { label: "Tareas creadas", value: 0 },
    { label: "Tareas completadas", value: 0 },
    { label: "Fotografias agregadas", value: 0 },
    { label: "Reportes creados", value: 0 },
    { label: "Usuarios activos", value: 0 },
  ];
  let attentionTasks: TaskCardData[] = [];
  let activity: ActivityTimelineItem[] = [];
  let quickPoint: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: MeetingPointStatus;
    updatedBy: string;
    imageUrl?: string | null;
  } | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(appConfig.routes.login);
    }

    userEmail = user.email ?? user.id;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;

    const today = new Date().toISOString().slice(0, 10);
    const [{ data: summary }, { data: tasks }, { data: logs }, { data: point }] = await Promise.all([
      supabase.rpc("get_daily_summary", { target_date: today }).maybeSingle(),
      supabase.from("tasks").select("id, title, description, priority, status, due_date").in("status", ["pending", "in_progress"]).order("due_date", { ascending: true }).limit(3),
      supabase.from("activity_logs").select("id, title, description, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("meeting_points").select("id, name, address, latitude, longitude, status, main_image_url").is("deleted_at", null).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (summary) {
      const row = summary as DailySummaryRow;
      stats = [
        { label: "Puntos actualizados", value: Number(row.points_updated ?? 0) },
        { label: "Tareas creadas", value: Number(row.tasks_created ?? 0) },
        { label: "Tareas completadas", value: Number(row.tasks_completed ?? 0) },
        { label: "Fotografias agregadas", value: Number(row.photos_added ?? 0) },
        { label: "Reportes creados", value: Number(row.reports_created ?? 0) },
        { label: "Usuarios activos", value: Number(row.active_users ?? 0) },
      ];
    }

    attentionTasks = (tasks ?? []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
      dueDate: task.due_date,
      assignedTo: "Responsable",
      pointName: null,
    }));

    activity = (logs ?? []).map((log) => ({
      id: log.id,
      time: new Date(log.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      type: "system",
      title: log.title,
      description: log.description,
    }));

    if (point) {
      quickPoint = {
        id: point.id,
        name: point.name,
        address: point.address,
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        status: point.status as MeetingPointStatus,
        updatedBy: "Sistema",
        imageUrl: await createSignedStorageUrl(point.main_image_url),
      };
    }
  }

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">{appConfig.name}</p>
          <h1 className="mt-2 text-3xl font-semibold">Que esta ocurriendo hoy</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Fase 1 activa: arquitectura, autenticacion base, modelo de datos y seguridad inicial.
          </p>
        </div>
        <DailySummary stats={stats} />
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Atencion requerida</h2>
            <div className="grid gap-3">
              {attentionTasks.length ? attentionTasks.map((task) => <TaskCard key={task.id} task={task} />) : <EmptyState title="Sin tareas pendientes" description="No hay tareas que requieran atencion inmediata." />}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Actividad reciente</h2>
            <ActivityTimeline items={activity} />
          </section>
        </div>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Vista rapida de Punto Jet</h2>
          {quickPoint ? <MeetingPointQuickView point={quickPoint} /> : <EmptyState title="Sin Puntos Jet" description="Cuando crees un punto, aparecera aqui como acceso rapido." />}
        </section>
        <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold">Sesion</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {profile?.display_name ?? userEmail} · {profile?.role ?? "perfil pendiente"}
          </p>
        </section>
      </section>
    </AppShell>
  );
}
