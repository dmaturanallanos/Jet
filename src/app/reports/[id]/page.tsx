import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PriorityBadge } from "@/components/common/badges";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/types/domain";

type ReportDetail = {
  id: string;
  title: string;
  description: string;
  observations: string | null;
  importance: TaskPriority | null;
  meeting_point_id: string | null;
  user_id: string | null;
  created_at: string;
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabaseEnv()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("id, title, description, observations, importance, meeting_point_id, user_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const report = data as ReportDetail;

  const [{ data: point }, { data: author }] = await Promise.all([
    report.meeting_point_id ? supabase.from("meeting_points").select("id, name").eq("id", report.meeting_point_id).maybeSingle() : Promise.resolve({ data: null }),
    report.user_id ? supabase.from("profiles").select("display_name").eq("id", report.user_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-4xl gap-5">
        <Link href="/reports" className="inline-flex items-center text-sm font-semibold text-cyan-600 dark:text-cyan-300">
          <ArrowLeft className="mr-2 size-4" />
          Volver a reportes
        </Link>
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">{report.title}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                {new Date(report.created_at).toLocaleString("es-CL")} - {author?.display_name ?? "Usuario"}
              </p>
            </div>
            <PriorityBadge priority={(report.importance ?? "medium") as TaskPriority} />
          </div>
          <div className="mt-5 grid gap-3">
            <Info label="Punto Jet" value={point?.name ?? "Sin Punto Jet"} href={point?.id ? `/points/${point.id}` : undefined} />
            <Info label="Descripcion" value={report.description} />
            {report.observations ? <Info label="Observaciones" value={report.observations} /> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = href ? <Link href={href} className="font-semibold text-cyan-600 dark:text-cyan-300">{value}</Link> : value;

  return (
    <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/5">
      <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-sm leading-6">{content}</p>
    </div>
  );
}
