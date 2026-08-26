"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { canManageOperations, getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import { createReportSchema } from "@/schemas/reports";

export type ReportState = {
  error?: string;
};

export async function createReport(_state: ReportState, formData: FormData): Promise<ReportState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Debes iniciar sesion." };

  const parsed = createReportSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    observations: formData.get("observations"),
    importance: formData.get("importance") || "medium",
    meetingPointId: formData.get("meetingPointId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa el reporte." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      organization_id: profile.organization_id,
      meeting_point_id: parsed.data.meetingPointId || null,
      user_id: profile.id,
      title: parsed.data.title,
      description: parsed.data.description,
      observations: parsed.data.observations || null,
      importance: parsed.data.importance ?? "medium",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "No fue posible crear el reporte." };

  await supabase.from("activity_logs").insert({
    organization_id: profile.organization_id,
    user_id: profile.id,
    meeting_point_id: parsed.data.meetingPointId || null,
    report_id: data.id,
    action_type: "report_created",
    entity_type: "report",
    entity_id: data.id,
    title: "Reporte creado",
    description: parsed.data.title,
  });

  revalidatePath("/reports");
  redirect(parsed.data.meetingPointId ? `/points/${parsed.data.meetingPointId}` : "/reports");
}

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
  meeting_point_id: string | null;
  user_id: string | null;
  created_at: string;
};

export async function generateAutomaticDailyReport(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || !canManageOperations(profile.role)) return;

  const date = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

  const supabase = await createClient();
  const [{ data: summary }, { data: activity }, { data: existing }] = await Promise.all([
    supabase.rpc("get_daily_summary", { target_date: date }).maybeSingle(),
    supabase.rpc("get_daily_activity", { target_date: date }).limit(20),
    supabase
      .from("reports")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("report_type", "automatic")
      .eq("report_date", date)
      .maybeSingle(),
  ]);

  const row = (summary ?? {}) as DailySummaryRow;
  const stats = {
    points_updated: Number(row.points_updated ?? 0),
    tasks_created: Number(row.tasks_created ?? 0),
    tasks_completed: Number(row.tasks_completed ?? 0),
    tasks_pending: Number(row.tasks_pending ?? 0),
    photos_added: Number(row.photos_added ?? 0),
    manual_reports_created: Number(row.reports_created ?? 0),
    active_users: Number(row.active_users ?? 0),
  };
  const activityItems = ((activity ?? []) as DailyActivityRow[]).map((item) => ({
    id: item.id,
    source: item.source,
    title: item.title,
    description: item.description,
    meeting_point_id: item.meeting_point_id,
    user_id: item.user_id,
    created_at: item.created_at,
  }));
  const title = `Reporte automatico ${date}`;
  const description = [
    `${stats.points_updated} puntos actualizados`,
    `${stats.tasks_created} tareas creadas`,
    `${stats.tasks_completed} tareas completadas`,
    `${stats.photos_added} fotografias agregadas`,
    `${stats.active_users} usuarios activos`,
  ].join(" - ");

  const payload = {
    organization_id: profile.organization_id,
    user_id: profile.id,
    title,
    description,
    observations: activityItems.length ? `Generado con ${activityItems.length} movimientos recientes.` : "Generado sin actividad registrada para el dia.",
    importance: "medium",
    report_type: "automatic",
    report_date: date,
    summary: { stats, activity: activityItems },
  };

  if (existing?.id) {
    await supabase.from("reports").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("reports").insert(payload);
  }

  revalidatePath("/reports");
  revalidatePath(`/reports/daily/${date}`);
}
