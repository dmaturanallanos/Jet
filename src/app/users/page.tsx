import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/common/states";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { CreateUserForm } from "./create-user-form";

export default async function UsersPage() {
  let users: { id: string; name: string; role: string; status: string }[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, role, status")
      .order("display_name");

    users = (data ?? []).map((user) => ({
      id: user.id,
      name: user.display_name,
      role: user.role === "admin" ? "Administrador" : "Operador",
      status: user.status === "active" ? "Activo" : "Inactivo",
    }));
  }

  return (
    <AppShell>
      <PageHeader title="Usuarios" description="Profiles vinculados 1:1 a Supabase Auth. No se duplica la autenticacion." />
      <div className="mb-5">
        <CreateUserForm />
      </div>
      {users.length ? <div className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/[0.04]">
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-black/5 p-4 last:border-0 dark:border-white/10">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{user.role}</p>
            </div>
            <span className="self-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{user.status}</span>
          </div>
        ))}
      </div> : <EmptyState title="No hay usuarios operativos" description="Crea el primer perfil admin y luego administra operadores desde esta pantalla." />}
    </AppShell>
  );
}
