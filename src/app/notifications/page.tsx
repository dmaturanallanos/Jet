import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  status: "unread" | "read" | "archived";
  created_at: string;
};

export default async function NotificationsPage() {
  let notifications: NotificationRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      notifications = (data ?? []) as NotificationRow[];
    }
  }

  return (
    <AppShell>
      <PageHeader title="Notificaciones" description="Las tareas asignadas personalmente generan una notificacion automatica para el responsable." />
      <div className="grid gap-3">
        {notifications.length ? notifications.map((notification) => (
          <article key={notification.id} className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{notification.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{notification.body}</p>
              </div>
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{notification.status}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-zinc-500">{new Date(notification.created_at).toLocaleString("es-CL")}</p>
          </article>
        )) : (
          <article className="rounded-lg border border-dashed border-black/10 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            No hay notificaciones para mostrar.
          </article>
        )}
      </div>
    </AppShell>
  );
}
