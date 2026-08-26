import Link from "next/link";
import { ChevronLeft, ChevronRight, FilePlus2 } from "lucide-react";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/activity/activity-timeline";
import { DailySummary } from "@/components/activity/daily-summary";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { generateAutomaticDailyReport } from "../../actions";

type DailySummaryRow = {
  points_updated?: number | string | null;
  tasks_created?: number | string | null;
  tasks_completed?: number | string | null;
  tasks_pending?: number | string | null;
  photos_added?: number | string | null;
  reports_created?: number | string | null;
  active_users?: number | string | null;
};

type DailyActivityRow = {
  id: string;
  source: string;
  title: string;
  description: string | null;
  created_at: string;
};

export default async function DailyReportDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const currentDate = new Date(`${date}T12:00:00`);
  const previousDate = shiftDate(currentDate, -1);
  const nextDate = shiftDate(currentDate, 1);
  const today = new Date().toISOString().slice(0, 10);
  let stats = buildStats({});
  let activity: ActivityTimelineItem[] = [];
  let automaticReportId: string | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [{ data: summary }, { data: rows }, { data: automaticReport }] = await Promise.all([
      supabase.rpc("get_daily_summary", { target_date: date }).maybeSingle(),
      supabase.rpc("get_daily_activity", { target_date: date }).limit(30),
      supabase
        .from("reports")
        .select("id")
        .eq("report_type", "automatic")
        .eq("report_date", date)
        .maybeSingle(),
    ]);

    stats = buildStats((summary ?? {}) as DailySummaryRow);
    automaticReportId = automaticReport?.id ?? null;
    activity = ((rows ?? []) as DailyActivityRow[]).map((item) => ({
      id: item.id,
      time: new Date(item.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      type: item.source === "manual_report" ? "manual" : "system",
      title: item.title,
      description: item.description,
    }));
  }

  return (
    <AppShell>
      <PageHeader
        title={`Actividad ${date}`}
        description="Resumen calculado automaticamente desde actividad, tareas, fotos y reportes manuales."
        action={
          <form action={generateAutomaticDailyReport}>
            <input type="hidden" name="date" value={date} />
            <button className="inline-flex h-11 items-center rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-zinc-950">
              <FilePlus2 className="mr-2 size-4" />
              {automaticReportId ? "Actualizar automatico" : "Generar automatico"}
            </button>
          </form>
        }
      />
      <div className="mb-5 flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <Link href={`/reports/daily/${previousDate}`} className="inline-flex items-center text-sm font-semibold"><ChevronLeft className="mr-1 size-4" />Dia anterior</Link>
        {automaticReportId ? <Link href={`/reports/${automaticReportId}`} className="text-sm font-semibold text-cyan-600 dark:text-cyan-300">Ver reporte guardado</Link> : <Link href={`/reports/daily/${today}`} className="text-sm font-semibold text-cyan-600 dark:text-cyan-300">Hoy</Link>}
        <Link href={`/reports/daily/${nextDate}`} className="inline-flex items-center text-sm font-semibold">Dia siguiente<ChevronRight className="ml-1 size-4" /></Link>
      </div>
      <DailySummary stats={stats} />
      <div className="mt-5">
        <ActivityTimeline items={activity} />
      </div>
    </AppShell>
  );
}

function buildStats(row: DailySummaryRow) {
  return [
    { label: "Puntos actualizados", value: Number(row.points_updated ?? 0) },
    { label: "Tareas creadas", value: Number(row.tasks_created ?? 0) },
    { label: "Tareas completadas", value: Number(row.tasks_completed ?? 0) },
    { label: "Tareas pendientes", value: Number(row.tasks_pending ?? 0) },
    { label: "Fotografias agregadas", value: Number(row.photos_added ?? 0) },
    { label: "Usuarios activos", value: Number(row.active_users ?? 0) },
  ];
}

function shiftDate(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}
