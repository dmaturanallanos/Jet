import Link from "next/link";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { DailySummary } from "@/components/activity/daily-summary";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";

export default function DailyReportsPage() {
  return (
    <AppShell>
      <PageHeader title="Actividad diaria" description="Vista dinamica derivada de activity_logs y reportes manuales." action={<Link href={`/reports/daily/${new Date().toISOString().slice(0, 10)}`} className="grid h-11 place-items-center rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-zinc-950">Hoy</Link>} />
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
