import Link from "next/link";
import { Bell } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function NotificationsBell() {
  let unread = 0;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "unread");
      unread = count ?? 0;
    }
  }

  return (
    <Link href="/notifications" aria-label="Notificaciones" className="relative grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
      <Bell className="size-4" />
      {unread > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">{unread}</span> : null}
    </Link>
  );
}
