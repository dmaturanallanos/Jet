"use server";

import { revalidatePath } from "next/cache";
import { canManageOperations, getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/types/domain";

const allowedStatuses = new Set<TaskStatus>(["pending", "in_progress", "completed", "cancelled"]);

export async function updateTaskStatus(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;
  if (!taskId || !allowedStatuses.has(status)) return;

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("id, organization_id, assigned_to, meeting_point_id, title")
    .eq("id", taskId)
    .maybeSingle();

  if (!task || task.organization_id !== profile.organization_id) return;
  if (!canManageOperations(profile.role) && task.assigned_to !== profile.id) return;

  const updates: { status: TaskStatus; started_at?: string; completed_at?: string | null } = { status };
  if (status === "in_progress") updates.started_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();
  if (status === "pending" || status === "cancelled") updates.completed_at = null;

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("organization_id", profile.organization_id);

  if (error) return;

  await supabase.from("activity_logs").insert({
    organization_id: profile.organization_id,
    user_id: profile.id,
    meeting_point_id: task.meeting_point_id,
    task_id: task.id,
    action_type: "task_status_changed",
    entity_type: "task",
    entity_id: task.id,
    title: "Estado de tarea actualizado",
    description: `${task.title}: ${status}`,
    new_data: { status },
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
}
