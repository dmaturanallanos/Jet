"use client";

import { useActionState } from "react";
import { Bell, CalendarPlus } from "lucide-react";
import { createShift, notifyWholeTeam, type ShiftState } from "./actions";

const initialState: ShiftState = {};

export function ShiftForm({
  people,
  points,
}: {
  people: { id: string; display_name: string }[];
  points: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createShift, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="flex items-center gap-2 font-semibold"><CalendarPlus className="size-4 text-cyan-500" />Asignar turno</h2>
      <input name="title" required className="Input" placeholder="Ej: Turno tarde Las Condes" />
      <select name="assignedTo" required className="Input">
        <option value="">Seleccionar trabajador</option>
        {people.map((person) => <option key={person.id} value={person.id}>{person.display_name}</option>)}
      </select>
      <select name="meetingPointId" className="Input">
        <option value="">Sin Punto Jet fijo</option>
        {points.map((point) => <option key={point.id} value={point.id}>{point.name}</option>)}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="startsAt" required type="datetime-local" className="Input" />
        <input name="endsAt" required type="datetime-local" className="Input" />
      </div>
      <textarea name="notes" className="Input min-h-24" placeholder="Notas del turno" />
      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{state.error}</p> : null}
      {state.message ? <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-200">{state.message}</p> : null}
      <button disabled={pending} className="h-11 rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f] disabled:opacity-60">
        {pending ? "Asignando..." : "Asignar turno"}
      </button>
    </form>
  );
}

export function TeamNoticeForm() {
  const [state, action, pending] = useActionState(notifyWholeTeam, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="flex items-center gap-2 font-semibold"><Bell className="size-4 text-cyan-500" />Avisar al equipo</h2>
      <input name="title" required className="Input" placeholder="Titulo del aviso" />
      <textarea name="body" required className="Input min-h-24" placeholder="Mensaje para todos los trabajadores activos" />
      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{state.error}</p> : null}
      {state.message ? <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-200">{state.message}</p> : null}
      <button disabled={pending} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold dark:border-white/10 disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar aviso"}
      </button>
    </form>
  );
}
