"use client";

import dynamic from "next/dynamic";
import type { MeetingPointQuickViewData } from "./quick-view";

const PointsMap = dynamic(() => import("@/components/meeting-points/points-map").then((mod) => mod.PointsMap), {
  ssr: false,
  loading: () => <div className="grid h-[72dvh] place-items-center rounded-lg border border-black/10 dark:border-white/10">Cargando mapa</div>,
});

export function MapClient({ points }: { points: MeetingPointQuickViewData[] }) {
  return <PointsMap points={points} />;
}
