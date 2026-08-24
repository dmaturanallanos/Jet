import { FileText, Zap } from "lucide-react";

export type ActivityTimelineItem = {
  id: string;
  time: string;
  type: "system" | "manual";
  title: string;
  description?: string | null;
  pointName?: string | null;
};

export function ActivityTimeline({ items }: { items: ActivityTimelineItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-black/10 bg-white p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
        Aun no hay actividad registrada.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const Icon = item.type === "manual" ? FileText : Zap;
        return (
          <article key={item.id} className="grid grid-cols-[56px_1fr] gap-3 rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <time className="text-sm font-semibold text-cyan-600 dark:text-cyan-300">{item.time}</time>
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <Icon className="size-4" />
                {item.title}
              </p>
              {item.description ? <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{item.description}</p> : null}
              {item.pointName ? <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">{item.pointName}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
