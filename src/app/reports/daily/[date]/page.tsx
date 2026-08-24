import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { DailySummary } from "@/components/activity/daily-summary";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";

export default async function DailyReportDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return (
    <AppShell>
      <PageHeader title={`Actividad ${date}`} description="Navegacion diaria preparada para calcular rangos por zona horaria de la organizacion." />
      <div className="mb-5 flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <Link href="/reports/daily/2026-08-23" className="inline-flex items-center text-sm font-semibold"><ChevronLeft className="mr-1 size-4" />Dia anterior</Link>
        <Link href="/reports/daily" className="text-sm font-semibold text-cyan-600 dark:text-cyan-300">Hoy</Link>
        <Link href="/reports/daily/2026-08-25" className="inline-flex items-center text-sm font-semibold">Dia siguiente<ChevronRight className="ml-1 size-4" /></Link>
      </div>
      <DailySummary stats={[
        { label: "Puntos actualizados", value: 0 },
        { label: "Tareas creadas", value: 0 },
        { label: "Tareas completadas", value: 0 },
        { label: "Fotografias agregadas", value: 0 },
        { label: "Reportes creados", value: 0 },
        { label: "Usuarios activos", value: 0 },
      ]} />
      <div className="mt-5">
        <ActivityTimeline items={[]} />
      </div>
    </AppShell>
  );
}
