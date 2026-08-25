import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/common/states";
import { ReportCard, type ReportCardData } from "@/components/reports/report-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/types/domain";

export default async function ReportsPage() {
  let reports: ReportCardData[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reports")
      .select("id, title, description, importance, created_at")
      .order("created_at", { ascending: false });

    reports = (data ?? []).map((report) => ({
      id: report.id,
      title: report.title,
      description: report.description,
      importance: (report.importance ?? "medium") as TaskPriority,
      createdAt: report.created_at,
      author: "Usuario",
      pointName: null,
    }));
  }

  return (
    <AppShell>
      <PageHeader title="Reportes manuales" description="Observaciones creadas explicitamente por usuarios, separadas de la actividad automatica." action={<Link href="/reports/new" className="inline-flex h-11 items-center rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f]"><Plus className="mr-2 size-4" />Crear reporte</Link>} />
      {reports.length ? <div className="grid gap-3">{reports.map((report) => <ReportCard key={report.id} report={report} />)}</div> : <EmptyState title="No hay reportes" description="Los reportes manuales creados por operadores apareceran aqui." />}
    </AppShell>
  );
}
