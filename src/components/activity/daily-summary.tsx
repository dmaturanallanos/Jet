export type DailySummaryStat = {
  label: string;
  value: number;
};

export function DailySummary({ stats }: { stats: DailySummaryStat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm text-slate-500 dark:text-zinc-400">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
        </article>
      ))}
    </div>
  );
}
