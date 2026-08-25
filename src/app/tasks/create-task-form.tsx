"use client";

import { useActionState } from "react";
import { createTask, type CreateTaskState } from "./actions";

type Assignee = {
  id: string;
  display_name: string;
};

type PointOption = {
  id: string;
  name: string;
};

const initialState: CreateTaskState = {};

export function CreateTaskForm({
  points,
  assignees,
  selectedPointId = "",
}: {
  points: PointOption[];
  assignees: Assignee[];
  selectedPointId?: string;
}) {
  const [state, action, pending] = useActionState(createTask, initialState);

  return (
    <form action={action} className="mb-5 grid gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="font-semibold">Crear tarea</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <input name="title" required placeholder="Titulo" className="Input" />
        <select name="priority" defaultValue="medium" className="Input">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <select name="meetingPointId" defaultValue={selectedPointId} className="Input">
          <option value="">Tarea general</option>
          {points.map((point) => <option key={point.id} value={point.id}>{point.name}</option>)}
        </select>
        <select name="assignedTo" defaultValue="" className="Input">
          <option value="">Sin responsable personal</option>
          {assignees.map((person) => <option key={person.id} value={person.id}>{person.display_name}</option>)}
        </select>
        <input name="dueDate" type="datetime-local" className="Input" />
        <textarea name="description" placeholder="Descripcion" className="Input min-h-24 md:col-span-2" />
      </div>
      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-200">{state.error}</p> : null}
      {state.message ? <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-200">{state.message}</p> : null}
      <button disabled={pending} className="h-11 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-60">
        {pending ? "Creando..." : "Crear tarea"}
      </button>
    </form>
  );
}
