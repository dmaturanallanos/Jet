import { notFound } from "next/navigation";
import Link from "next/link";
import { Camera, ClipboardPlus, FilePlus2, Navigation, Pencil } from "lucide-react";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { AppShell } from "@/components/app/app-shell";
import { MeetingPointStatusBadge } from "@/components/common/badges";
import { EmptyState } from "@/components/common/states";
import { ReportCard, type ReportCardData } from "@/components/reports/report-card";
import { TaskCard, type TaskCardData } from "@/components/tasks/task-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createSignedStorageUrl } from "@/lib/supabase/storage";
import type { MeetingPointStatus, TaskPriority, TaskStatus } from "@/types/domain";
import { ImageUploadForm } from "./image-upload-form";
import { PointImagesCarousel, type PointCarouselImage } from "./point-images-carousel";

export default async function PointDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let point: {
    id: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    targetScooters: number | null;
    mapsUrl: string | null;
    reference: string | null;
    description: string | null;
    status: MeetingPointStatus;
    updatedAt: string;
    updatedBy: string;
    imageUrl?: string | null;
  } | null = null;
  let tasks: TaskCardData[] = [];
  let reports: ReportCardData[] = [];
  let images: PointCarouselImage[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("meeting_points")
      .select("id, name, address, maps_url, latitude, longitude, target_scooters, reference, description, status, updated_at, main_image_url")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (data) {
      point = {
        id: data.id,
        name: data.name,
        address: data.address,
        mapsUrl: data.maps_url,
        latitude: data.latitude === null ? null : Number(data.latitude),
        longitude: data.longitude === null ? null : Number(data.longitude),
        targetScooters: data.target_scooters,
        reference: data.reference,
        description: data.description,
        status: data.status as MeetingPointStatus,
        updatedAt: data.updated_at,
        updatedBy: "Sistema",
        imageUrl: await createSignedStorageUrl(data.main_image_url),
      };

      const [{ data: dbTasks }, { data: dbReports }, { data: dbImages }] = await Promise.all([
        supabase.from("tasks").select("id, title, description, priority, status, due_date").eq("meeting_point_id", data.id).order("created_at", { ascending: false }),
        supabase.from("reports").select("id, title, description, importance, created_at").eq("meeting_point_id", data.id).order("created_at", { ascending: false }),
        supabase
          .from("meeting_point_images")
          .select("id, storage_path, is_primary, created_at")
          .eq("meeting_point_id", data.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
      ]);

      tasks = (dbTasks ?? []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as TaskPriority,
        status: task.status as TaskStatus,
        dueDate: task.due_date,
        assignedTo: "Responsable",
        pointName: data.name,
      }));

      reports = (dbReports ?? []).map((report) => ({
        id: report.id,
        title: report.title,
        description: report.description,
        importance: (report.importance ?? "medium") as TaskPriority,
        createdAt: report.created_at,
        author: "Usuario",
        pointName: data.name,
      }));

      images = (await Promise.all((dbImages ?? []).map(async (image) => {
        const url = await createSignedStorageUrl(image.storage_path);
        if (!url) return null;

        return {
          id: image.id,
          url,
          isPrimary: image.is_primary,
          createdAt: image.created_at,
        };
      }))).filter((image): image is PointCarouselImage => image !== null);

      if (images[0]) {
        point.imageUrl = images[0].url;
      }
    }
  }

  if (!point) notFound();
  const hasCoordinates = point.latitude !== null && point.longitude !== null;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`
    : point.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}`;

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/[0.04]">
          <div className="aspect-[16/9] bg-slate-200 bg-cover bg-center dark:bg-zinc-800" style={point.imageUrl ? { backgroundImage: `url(${point.imageUrl})` } : undefined} />
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold">{point.name}</h1>
                <p className="mt-2 text-slate-500 dark:text-zinc-400">{point.address}</p>
              </div>
              <MeetingPointStatusBadge status={point.status} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info label="Referencia" value={point.reference ?? "Sin referencia"} />
              <Info label="Coordenadas" value={hasCoordinates ? `${point.latitude}, ${point.longitude}` : "Pendiente"} />
              <Info label="Scooters objetivo" value={point.targetScooters === null ? "No definido" : String(point.targetScooters)} />
              <Info label="Ultima actualizacion" value={new Date(point.updatedAt).toLocaleString("es-CL")} />
              <Info label="Modificado por" value={point.updatedBy} />
            </div>
            {point.description ? <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-zinc-300">{point.description}</p> : null}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="Action"><Navigation className="size-4" />Abrir</a>
              <Link href={`/tasks/new?pointId=${point.id}`} className="Action"><ClipboardPlus className="size-4" />Tarea</Link>
              <Link href={`/reports/new?pointId=${point.id}`} className="Action"><FilePlus2 className="size-4" />Reporte</Link>
              <a href="#imagenes" className="Action"><Camera className="size-4" />Foto</a>
              <Link href={`/points/${point.id}/edit`} className="Action"><Pencil className="size-4" />Editar</Link>
            </div>
          </div>
        </section>
        <aside className="grid content-start gap-5">
          <div id="imagenes">
            <ImageUploadForm pointId={point.id} />
          </div>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Imagenes referenciales</h2>
            {images.length ? (
              <PointImagesCarousel images={images} />
            ) : (
              <EmptyState title="Sin imagenes" description="Agrega fotos referenciales para reconocer mejor este punto." />
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Tareas relacionadas</h2>
            <div className="grid gap-3">{tasks.length ? tasks.map((task) => <TaskCard key={task.id} task={task} />) : <EmptyState title="Sin tareas" description="Este punto aun no tiene tareas relacionadas." />}</div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Reportes relacionados</h2>
            <div className="grid gap-3">{reports.length ? reports.slice(0, 3).map((report) => <ReportCard key={report.id} report={report} />) : <EmptyState title="Sin reportes" description="Este punto aun no tiene reportes manuales." />}</div>
          </section>
        </aside>
        <section className="xl:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Actividad e historial</h2>
          <ActivityTimeline items={[]} />
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/5">
      <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
