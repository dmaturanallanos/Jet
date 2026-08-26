import Link from "next/link";
import { LogOut, ShieldCheck, Users } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import { roleLabels, type ProfileRole } from "@/types/domain";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = profile?.role === "admin";

  return (
    <AppShell>
      <PageHeader title="Perfil" description="Datos del usuario autenticado y preferencias personales." />
      <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="grid size-16 place-items-center rounded-lg bg-cyan-300 text-2xl font-black text-zinc-950">J</div>
        <h2 className="mt-4 text-lg font-semibold">{profile?.display_name ?? "Usuario Jet"}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{user?.email ?? "Correo no disponible"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
            <ShieldCheck className="mr-2 size-4" />
            {profile?.role ? roleLabels[profile.role as ProfileRole] : "Perfil pendiente"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-zinc-300">
            {profile?.status === "active" ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {isAdmin ? (
            <Link href="/users" className="inline-flex h-10 items-center rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f]">
              <Users className="mr-2 size-4" />
              Administrar usuarios
            </Link>
          ) : null}
          <form action={signOut}>
            <button className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-zinc-200">
              <LogOut className="mr-2 size-4" />
              Cerrar sesion
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
