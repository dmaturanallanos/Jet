import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/common/states";
import { createClient } from "@/lib/supabase/server";
import { ShiftForm, TeamNoticeForm } from "./shift-forms";

type ShiftRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

export default async function ShiftsPage() {
  const supabase = await createClient();
  const [{ data: people }, { data: points }, { data: shifts }] = await Promise.all([
    supabase.from("profiles").select("id, display_name").eq("status", "active").order("display_name"),
    supabase.from("meeting_points").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("shifts").select("id, title, starts_at, ends_at, status").order("starts_at", { ascending: true }).limit(20),
  ]);

  return (
    <AppShell>
      <PageHeader title="Turnos" description="Asigna horarios, revisa quien debe estar activo y envia avisos internos al equipo." />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid content-start gap-5">
          <ShiftForm people={people ?? []} points={points ?? []} />
          <TeamNoticeForm />
        </div>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Proximos turnos</h2>
          {shifts?.length ? (
            <div className="grid gap-3">
              {(shifts as ShiftRow[]).map((shift) => (
                <article key={shift.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{shift.title}</h3>
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{shift.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                    {new Date(shift.starts_at).toLocaleString("es-CL")} - {new Date(shift.ends_at).toLocaleString("es-CL")}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No hay turnos" description="Asigna el primer turno para comenzar a coordinar al equipo." />
          )}
        </section>
      </div>
    </AppShell>
  );
}
