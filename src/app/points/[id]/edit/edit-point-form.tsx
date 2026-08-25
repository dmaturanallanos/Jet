"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateMeetingPoint, type PointFormState } from "../../actions";
import type { MeetingPointStatus } from "@/types/domain";

type EditPoint = {
  id: string;
  name: string;
  address: string;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  target_scooters: number | null;
  reference: string | null;
  description: string | null;
  status: MeetingPointStatus;
  internal_notes: string | null;
};

const initialState: PointFormState = {};

export function EditPointForm({ point }: { point: EditPoint }) {
  const [state, action, pending] = useActionState(updateMeetingPoint, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <input type="hidden" name="pointId" value={point.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="name" required defaultValue={point.name} className="Input" placeholder="Nombre" />
        <select name="status" defaultValue={point.status} className="Input">
          <option value="active">Activo</option>
          <option value="review">En revision</option>
          <option value="temporary">Temporal</option>
          <option value="inactive">Inactivo</option>
        </select>
        <input name="address" defaultValue={point.address} className="Input md:col-span-2" placeholder="Direccion" />
        <input name="mapsLink" defaultValue={point.maps_url ?? ""} className="Input md:col-span-2" placeholder="Link de Google Maps" />
        <input name="latitude" defaultValue={point.latitude ?? ""} className="Input" placeholder="Latitud" />
        <input name="longitude" defaultValue={point.longitude ?? ""} className="Input" placeholder="Longitud" />
        <input name="targetScooters" type="number" min="0" max="200" defaultValue={point.target_scooters ?? ""} className="Input" placeholder="Scooters objetivo" />
        <input name="reference" defaultValue={point.reference ?? ""} className="Input md:col-span-2" placeholder="Referencia" />
        <textarea name="description" defaultValue={point.description ?? ""} className="Input min-h-28 md:col-span-2" placeholder="Descripcion" />
        <textarea name="internalNotes" defaultValue={point.internal_notes ?? ""} className="Input min-h-28 md:col-span-2" placeholder="Notas internas" />
      </div>
      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{state.error}</p> : null}
      <button disabled={pending} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f] disabled:opacity-60">
        <Save className="mr-2 size-4" />
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
