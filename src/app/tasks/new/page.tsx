import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { CreateTaskForm } from "../create-task-form";

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ pointId?: string }> }) {
  const { pointId = "" } = await searchParams;
  const supabase = await createClient();
  const [{ data: points }, { data: assignees }] = await Promise.all([
    supabase.from("meeting_points").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("profiles").select("id, display_name").eq("status", "active").order("display_name"),
  ]);

  return (
    <AppShell>
      <PageHeader title="Crear tarea" description="Asigna una tarea general o personal. Si viene desde un Punto Jet, queda asociada automaticamente." />
      <CreateTaskForm points={points ?? []} assignees={assignees ?? []} selectedPointId={pointId} />
    </AppShell>
  );
}
