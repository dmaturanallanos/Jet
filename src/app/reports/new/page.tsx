import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "./report-form";

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ pointId?: string }> }) {
  const { pointId = "" } = await searchParams;
  const supabase = await createClient();
  const { data: points } = await supabase.from("meeting_points").select("id, name").is("deleted_at", null).order("name");

  return (
    <AppShell>
      <PageHeader title="Crear reporte" description="Registra una observacion manual y asociala a un Punto Jet cuando corresponda." />
      <div className="mx-auto max-w-2xl">
        <ReportForm points={points ?? []} selectedPointId={pointId} />
      </div>
    </AppShell>
  );
}
