"use server";

import { revalidatePath } from "next/cache";
import { canManageOperations, getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import { createShiftSchema } from "@/schemas/shifts";

export type ShiftState = {
  error?: string;
  message?: string;
};

export async function createShift(_state: ShiftState, formData: FormData): Promise<ShiftState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageOperations(profile.role)) {
    return { error: "Solo administradores o moderadores pueden asignar turnos." };
  }

  const parsed = createShiftSchema.safeParse({
    title: formData.get("title"),
    assignedTo: formData.get("assignedTo"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    meetingPointId: formData.get("meetingPointId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa el turno." };

  const supabase = await createClient();
  const { error } = await supabase.from("shifts").insert({
    organization_id: profile.organization_id,
    meeting_point_id: parsed.data.meetingPointId || null,
    assigned_to: parsed.data.assignedTo,
    title: parsed.data.title,
    notes: parsed.data.notes || null,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    created_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/shifts");
  return { message: "Turno asignado y notificacion creada." };
}

export async function notifyWholeTeam(_state: ShiftState, formData: FormData): Promise<ShiftState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageOperations(profile.role)) {
    return { error: "Solo administradores o moderadores pueden avisar al equipo." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { error: "Ingresa titulo y mensaje." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("notify_team", {
    notification_title: title,
    notification_body: body,
    notification_metadata: { created_by: profile.id, source: "team_notice" },
  });

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { message: "Aviso enviado al equipo." };
}
