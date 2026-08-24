export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-950 p-6 text-center text-white">
      <section className="max-w-md">
        <p className="text-sm font-semibold text-cyan-300">Jet Scooter</p>
        <h1 className="mt-3 text-3xl font-semibold">Sin conexion</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          La interfaz esencial esta disponible. Las acciones offline completas se sincronizaran en una fase posterior con cola local e IndexedDB.
        </p>
      </section>
    </main>
  );
}
