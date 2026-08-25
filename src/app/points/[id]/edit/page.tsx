import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { EditPointForm } from "./edit-point-form";

export default async function EditPointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: point } = await supabase
    .from("meeting_points")
    .select("id, name, address, maps_url, latitude, longitude, reference, description, status, internal_notes")
    .eq("id", id)
    .maybeSingle();

  if (!point) notFound();

  return (
    <AppShell>
      <PageHeader title="Editar Punto Jet" description="Actualiza direccion, coordenadas, link de Maps, estado y notas operativas." />
      <div className="mx-auto max-w-3xl">
        <EditPointForm point={point} />
      </div>
    </AppShell>
  );
}
