import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { ThemeToggle } from "@/components/app/theme-toggle";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Configuracion" description="Preferencias y accesos de administracion." />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="font-semibold">Tema</h2>
          <div className="mt-3"><ThemeToggle /></div>
        </section>
        <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="font-semibold">Mas</h2>
          <div className="mt-3 grid gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-300">
            <Link href="/reports">Reportes</Link>
            <Link href="/users">Usuarios</Link>
            <Link href="/profile">Perfil</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
