"use server";

import { revalidatePath } from "next/cache";
import { canManageOperations, getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema } from "@/schemas/tasks";

export type CreateTaskState = {
  message?: string;
  error?: string;
};

export async function createTask(_state: CreateTaskState, formData: FormData): Promise<CreateTaskState> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || !canManageOperations(currentProfile.role)) {
    return { error: "Solo administradores o moderadores pueden crear y asignar tareas." };
  }

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    meetingPointId: formData.get("meetingPointId"),
    assignedTo: formData.get("assignedTo"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la tarea." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    organization_id: currentProfile.organization_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    priority: parsed.data.priority,
    status: "pending",
    meeting_point_id: parsed.data.meetingPointId || null,
    assigned_to: parsed.data.assignedTo || null,
    due_date: parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null,
    created_by: currentProfile.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return { message: parsed.data.assignedTo ? "Tarea creada y notificacion generada." : "Tarea general creada." };
}
