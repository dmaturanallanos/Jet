import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { MapClient } from "@/components/meeting-points/map-client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createSignedStorageUrl } from "@/lib/supabase/storage";
import type { MeetingPointStatus } from "@/types/domain";

export default async function MapPage() {
  let points: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: MeetingPointStatus;
    updatedBy: string;
    targetScooters?: number | null;
    imageUrl?: string | null;
  }[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("meeting_points")
      .select("id, name, address, latitude, longitude, status, target_scooters, main_image_url")
      .is("deleted_at", null);

    const pointIds = (data ?? []).map((point) => point.id);
    const { data: images } = pointIds.length
      ? await supabase
          .from("meeting_point_images")
          .select("meeting_point_id, storage_path, created_at")
          .in("meeting_point_id", pointIds)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
      : { data: [] };
    const fallbackImages = new Map<string, string>();

    for (const image of images ?? []) {
      if (!fallbackImages.has(image.meeting_point_id)) {
        fallbackImages.set(image.meeting_point_id, image.storage_path);
      }
    }

    points = (await Promise.all((data ?? []).map(async (point) => ({
      id: point.id,
      name: point.name,
      address: point.address,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      status: point.status as MeetingPointStatus,
      updatedBy: "Sistema",
      targetScooters: point.target_scooters,
      imageUrl: await createSignedStorageUrl(fallbackImages.get(point.id) ?? point.main_image_url),
    })))).filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  }

  return (
    <AppShell>
      <PageHeader title="Mapa" description="Visualiza todos los Puntos Jet, abre tarjetas rapidas y navega a la ubicacion." />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input className="h-11 rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5 md:col-span-2" placeholder="Buscar punto o zona" />
        <select className="h-11 rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"><option>Estado</option></select>
        <select className="h-11 rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"><option>Tareas pendientes</option></select>
      </div>
      <MapClient points={points} />
    </AppShell>
  );
}
