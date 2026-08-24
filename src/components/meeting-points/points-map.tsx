"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MeetingPointQuickView, type MeetingPointQuickViewData } from "./quick-view";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function PointsMap({ points }: { points: MeetingPointQuickViewData[] }) {
  if (!points.length) {
    return (
      <div className="grid h-[72dvh] place-items-center rounded-lg border border-dashed border-black/10 bg-white text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
        Aun no hay Puntos Jet para mostrar en el mapa.
      </div>
    );
  }

  return (
    <div className="h-[72dvh] overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
      <MapContainer center={[-33.425, -70.604]} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((point) => (
          <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon}>
            <Popup minWidth={280}>
              <div className="text-slate-950">
                <MeetingPointQuickView point={point} />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
