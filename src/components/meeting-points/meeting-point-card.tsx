import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { MeetingPointStatusBadge } from "@/components/common/badges";
import type { MeetingPointStatus } from "@/types/domain";

export type MeetingPointCardData = {
  id: string;
  name: string;
  address: string;
  status: MeetingPointStatus;
  pendingTasks: number;
  urgentTasks: number;
  targetScooters?: number | null;
  updatedBy: string;
  imageUrl?: string | null;
};

export function MeetingPointCard({ point }: { point: MeetingPointCardData }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className="aspect-[16/9] bg-slate-200 bg-cover bg-center dark:bg-zinc-800"
        style={point.imageUrl ? { backgroundImage: `url(${point.imageUrl})` } : undefined}
      />
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-semibold">{point.name}</h2>
            <p className="mt-1 flex min-w-0 items-start text-sm text-slate-500 dark:text-zinc-400">
              <MapPin className="mr-1 mt-0.5 size-4 shrink-0" />
              {point.address}
            </p>
          </div>
          <MeetingPointStatusBadge status={point.status} />
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <span className="rounded-lg bg-slate-100 p-2 dark:bg-white/5">{point.targetScooters ?? 0} scooters objetivo</span>
          <span className="rounded-lg bg-slate-100 p-2 dark:bg-white/5">{point.pendingTasks} pendientes</span>
          <span className="rounded-lg bg-slate-100 p-2 dark:bg-white/5">{point.urgentTasks} urgentes</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>Actualizado por {point.updatedBy}</span>
          <Link href={`/points/${point.id}`} className="inline-flex items-center font-semibold text-cyan-600 dark:text-cyan-300">
            Ver <ExternalLink className="ml-1 size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
