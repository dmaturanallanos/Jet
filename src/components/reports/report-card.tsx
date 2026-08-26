import Link from "next/link";
import { PriorityBadge } from "@/components/common/badges";
import type { TaskPriority } from "@/types/domain";

export type ReportCardData = {
  id: string;
  title: string;
  description: string;
  pointName?: string | null;
  author: string;
  importance: TaskPriority;
  createdAt: string;
  type?: "manual" | "automatic";
  reportDate?: string | null;
};

export function ReportCard({ report }: { report: ReportCardData }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{report.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{report.description}</p>
        </div>
        <PriorityBadge priority={report.importance} />
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-zinc-400">
        {report.type === "automatic" ? `Automatico ${report.reportDate ?? ""}` : report.pointName ?? "Sin Punto Jet"} - {report.author} - {new Date(report.createdAt).toLocaleString("es-CL")}
      </p>
      <Link href={`/reports/${report.id}`} className="mt-4 inline-flex h-9 items-center rounded-lg border border-black/10 px-3 text-sm font-semibold dark:border-white/10">
        Abrir reporte
      </Link>
    </article>
  );
}
