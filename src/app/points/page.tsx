import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/common/states";
import { MeetingPointCard, type MeetingPointCardData } from "@/components/meeting-points/meeting-point-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createSignedStorageUrl } from "@/lib/supabase/storage";
import type { MeetingPointStatus } from "@/types/domain";

export default async function PointsPage() {
  let points: MeetingPointCardData[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("meeting_points")
      .select("id, name, address, status, main_image_url, updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    points = await Promise.all((data ?? []).map(async (point) => ({
      id: point.id,
      name: point.name,
      address: point.address,
      status: point.status as MeetingPointStatus,
      pendingTasks: 0,
      urgentTasks: 0,
      updatedBy: "Sistema",
      imageUrl: await createSignedStorageUrl(point.main_image_url),
    })));
  }

  return (
    <AppShell>
      <PageHeader
        title="Puntos Jet"
        description="Gestiona ubicaciones operativas, estado, tareas pendientes y ultima actividad."
        action={<Link href="/points/new" className="inline-flex h-11 items-center rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f] shadow-sm transition hover:bg-cyan-300"><Plus className="mr-2 size-4" />Agregar Punto</Link>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
        <input className="h-11 rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5" placeholder="Buscar por nombre, direccion o referencia" />
        <select className="h-11 rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5">
          <option>Todos los estados</option>
          <option>Activo</option>
          <option>En revision</option>
          <option>Temporal</option>
          <option>Inactivo</option>
        </select>
      </div>
      {points.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {points.map((point) => <MeetingPointCard key={point.id} point={point} />)}
        </div>
      ) : (
        <EmptyState title="No hay Puntos Jet" description="Crea el primer punto operativo para comenzar a gestionar tareas, reportes y actividad." />
      )}
    </AppShell>
  );
}
