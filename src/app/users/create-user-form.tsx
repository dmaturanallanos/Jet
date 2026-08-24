"use client";

import { useActionState } from "react";
import { createUser, type CreateUserState } from "./actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="font-semibold">Crear usuario</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="firstName" required placeholder="Nombre" className="Input" />
        <input name="lastName" required placeholder="Apellido" className="Input" />
        <input name="email" required type="email" placeholder="correo@jetscooter.cl" className="Input" />
        <input name="password" required type="password" minLength={8} placeholder="Contrasena inicial" className="Input" />
        <input name="phone" placeholder="Telefono" className="Input" />
        <select name="role" required defaultValue="operator" className="Input">
          <option value="operator">Operador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      {state.error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-200">{state.error}</p> : null}
      {state.message ? <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-200">{state.message}</p> : null}
      <button disabled={pending} className="h-11 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-60">
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
