import Link from "next/link";
import { Navigation } from "lucide-react";
import { MeetingPointStatusBadge } from "@/components/common/badges";
import type { MeetingPointStatus } from "@/types/domain";

export type MeetingPointQuickViewData = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: MeetingPointStatus;
  updatedBy: string;
  imageUrl?: string | null;
};

export function MeetingPointQuickView({ point }: { point: MeetingPointQuickViewData }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex gap-3">
        <div
          className="size-16 shrink-0 rounded-lg bg-slate-200 bg-cover bg-center dark:bg-zinc-800"
          style={point.imageUrl ? { backgroundImage: `url(${point.imageUrl})` } : undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{point.name}</h3>
            <MeetingPointStatusBadge status={point.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{point.address}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">Ultima actividad: {point.updatedBy}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/points/${point.id}`} className="grid h-10 place-items-center rounded-lg bg-cyan-300 text-sm font-semibold text-zinc-950">Ver punto</Link>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-lg border border-black/10 text-sm font-semibold dark:border-white/10">
          <Navigation className="mr-2 size-4" />
          Abrir mapa
        </a>
      </div>
    </article>
  );
}
