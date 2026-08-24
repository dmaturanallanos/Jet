import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";

export default function ProfilePage() {
  return (
    <AppShell>
      <PageHeader title="Perfil" description="Datos del usuario autenticado y preferencias personales." />
      <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="grid size-16 place-items-center rounded-lg bg-cyan-300 text-2xl font-black text-zinc-950">J</div>
        <h2 className="mt-4 text-lg font-semibold">Usuario Jet</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Perfil conectado a Supabase Auth en ambiente real.</p>
      </section>
    </AppShell>
  );
}
