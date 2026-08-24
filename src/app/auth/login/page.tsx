import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-cyan-950/20">
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-300">Jet Scooter</p>
          <h1 className="mt-2 text-2xl font-semibold">Operaciones</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Ingresa para administrar Puntos Jet, tareas y actividad operativa.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
