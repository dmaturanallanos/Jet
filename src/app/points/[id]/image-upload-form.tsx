"use client";

import { useActionState } from "react";
import { Camera } from "lucide-react";
import { uploadReferenceImage, type PointFormState } from "../actions";

const initialState: PointFormState = {};

export function ImageUploadForm({ pointId }: { pointId: string }) {
  const [state, action, pending] = useActionState(uploadReferenceImage, initialState);

  return (
    <form action={action} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <input type="hidden" name="pointId" value={pointId} />
      <h2 className="flex items-center gap-2 font-semibold">
        <Camera className="size-4 text-cyan-500" />
        Imagen referencial
      </h2>
      <input name="images" required multiple type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 block w-full text-sm" />
      {state.error ? <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{state.error}</p> : null}
      <button disabled={pending} className="mt-4 h-10 rounded-lg bg-[#16c8ff] px-4 text-sm font-semibold text-[#07111f] disabled:opacity-60">
        {pending ? "Subiendo..." : "Agregar imagenes"}
      </button>
    </form>
  );
}
