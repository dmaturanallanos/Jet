"use client";

import { useActionState } from "react";
import { FilePlus2 } from "lucide-react";
import { createReport, type ReportState } from "../actions";

const initialState: ReportState = {};

export function ReportForm({
  points,
  selectedPointId = "",
}: {
  points: { id: string; name: string }[];
  selectedPointId?: string;
}) {
  const [state, action, pending] = useActionState(createReport, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <input name="title" required className="Input" placeholder="Titulo del reporte" />
      <select name="meetingPointId" defaultValue={selectedPointId} className="Input">
        <option value="">Sin Punto Jet</option>
        {points.map((point) => <option key={point.id} value={point.id}>{point.name}</option>)}
      </select>
      <select name="importance" defaultValue="medium" className="Input">
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
        <option value="urgent">Urgente</option>
      </select>
      <textarea name="description" required className="Input min-h-28" placeholder="Descripcion" />
      <textarea name="observations" className="Input min-h-24" placeholder="Observaciones" />
      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{state.error}</p> : null}
      <button disabled={pending} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f] disabled:opacity-60">
        <FilePlus2 className="mr-2 size-4" />
        {pending ? "Creando..." : "Crear reporte"}
      </button>
    </form>
  );
}
