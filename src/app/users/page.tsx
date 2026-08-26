import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/common/states";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { CreateUserForm } from "./create-user-form";
import { roleLabels, type ProfileRole } from "@/types/domain";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { updateUserPermissions } from "./actions";

export default async function UsersPage() {
  let users: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: ProfileRole;
    roleLabel: string;
    status: "active" | "inactive";
    statusLabel: string;
  }[] = [];
  const currentProfile = await getCurrentProfile();
  const canEditPermissions = currentProfile?.role === "admin";

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, display_name, email, phone, role, status")
      .order("display_name");

    users = (data ?? []).map((user) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      name: user.display_name,
      email: user.email,
      phone: user.phone,
      role: user.role as ProfileRole,
      roleLabel: roleLabels[user.role as ProfileRole] ?? user.role,
      status: user.status as "active" | "inactive",
      statusLabel: user.status === "active" ? "Activo" : "Inactivo",
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
          <div key={user.id} className="grid gap-3 border-b border-black/5 p-4 last:border-0 dark:border-white/10 xl:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{user.email ?? "Sin correo registrado"} - {user.roleLabel}</p>
            </div>
            {canEditPermissions ? (
              <form action={updateUserPermissions} className="grid gap-2 md:grid-cols-2 xl:grid-cols-[130px_130px_220px_130px_140px_120px_auto]">
                <input type="hidden" name="userId" value={user.id} />
                <input name="firstName" required defaultValue={user.firstName} className="Input h-10" placeholder="Nombre" />
                <input name="lastName" required defaultValue={user.lastName} className="Input h-10" placeholder="Apellido" />
                <input name="email" type="email" defaultValue={user.email ?? ""} className="Input h-10" placeholder="Correo" />
                <input name="phone" defaultValue={user.phone ?? ""} className="Input h-10" placeholder="Telefono" />
                <select name="role" defaultValue={user.role} className="Input h-10">
                  <option value="scout">Scout</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Admin</option>
                </select>
                <select name="status" defaultValue={user.status} className="Input h-10">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
                <button className="h-10 rounded-lg bg-[#16c8ff] px-3 text-sm font-semibold text-[#07111f]">Guardar</button>
              </form>
            ) : (
              <span className="self-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{user.statusLabel}</span>
            )}
          </div>
        ))}
      </div> : <EmptyState title="No hay usuarios operativos" description="Crea el primer perfil admin y luego administra operadores desde esta pantalla." />}
    </AppShell>
  );
}
