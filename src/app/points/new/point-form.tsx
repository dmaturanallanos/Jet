"use client";

import { useActionState } from "react";
import { MapPin, Save, Upload } from "lucide-react";
import { createMeetingPoint, type PointFormState } from "../actions";

const initialState: PointFormState = {};

export function PointForm() {
  const [state, action, pending] = useActionState(createMeetingPoint, initialState);

  return (
    <form action={action} className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="flex items-center gap-2 font-semibold">
          <MapPin className="size-4 text-cyan-500" />
          Ubicacion
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300">
            Nombre
            <input name="name" required className="Input" placeholder="Ej: Metro Escuela Militar" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300">
            Estado
            <select name="status" defaultValue="review" className="Input">
              <option value="active">Activo</option>
              <option value="review">En revision</option>
              <option value="temporary">Temporal</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300 md:col-span-2">
            Direccion
            <input name="address" className="Input" placeholder="Av. Apoquindo 4501, Las Condes" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300 md:col-span-2">
            Link de Google Maps
            <input name="mapsLink" className="Input" placeholder="https://maps.google.com/..." />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300">
            Latitud
            <input name="latitude" inputMode="decimal" className="Input" placeholder="-33.413100" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300">
            Longitud
            <input name="longitude" inputMode="decimal" className="Input" placeholder="-70.585200" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-zinc-300 md:col-span-2">
            Referencia
            <input name="reference" className="Input" placeholder="Salida principal, estacionamiento, acceso norte..." />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="font-semibold">Informacion operativa</h2>
        <div className="mt-4 grid gap-3">
          <textarea name="description" className="Input min-h-28" placeholder="Descripcion del punto" />
          <textarea name="internalNotes" className="Input min-h-28" placeholder="Notas internas" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="flex items-center gap-2 font-semibold">
          <Upload className="size-4 text-cyan-500" />
          Imagen referencial inicial
        </h2>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 block w-full text-sm" />
      </section>

      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{state.error}</p> : null}

      <button disabled={pending} className="inline-flex h-12 items-center justify-center rounded-lg bg-[#16c8ff] px-5 text-sm font-semibold text-[#07111f] shadow-sm transition hover:bg-cyan-300 disabled:opacity-60">
        <Save className="mr-2 size-4" />
        {pending ? "Guardando..." : "Guardar Punto Jet"}
      </button>
    </form>
  );
}
