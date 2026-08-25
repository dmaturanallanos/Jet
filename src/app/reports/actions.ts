"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
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
