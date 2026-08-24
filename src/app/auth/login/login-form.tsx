"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2 text-sm text-zinc-300">
        Correo
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-lg border border-white/10 bg-white/5 px-4 text-base text-white outline-none transition focus:border-cyan-300"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-300">
        Contrasena
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="h-12 rounded-lg border border-white/10 bg-white/5 px-4 text-base text-white outline-none transition focus:border-cyan-300"
        />
      </label>
      {state.error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg bg-cyan-300 px-4 font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
