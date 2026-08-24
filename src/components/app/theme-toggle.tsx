"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const items = [
    { value: "dark", icon: Moon, label: "Oscuro" },
    { value: "light", icon: Sun, label: "Claro" },
    { value: "system", icon: Monitor, label: "Sistema" },
  ];

  const activeTheme = theme ?? resolvedTheme ?? "dark";

  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => setTheme(item.value)}
            className={`rounded-md p-2 transition ${
              activeTheme === item.value
                ? "bg-[#16c8ff] text-[#07111f]"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
