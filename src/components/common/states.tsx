import { AlertTriangle, Loader2, Search } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <Search className="mx-auto size-8 text-cyan-300" />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300">
      <Loader2 className="mr-2 size-5 animate-spin" />
      Cargando
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-red-100">
      <AlertTriangle className="mb-2 size-5" />
      {message}
    </div>
  );
}
