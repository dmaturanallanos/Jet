import Link from "next/link";
import type React from "react";
import {
  ClipboardList,
  FileText,
  Home,
  Map,
  MapPin,
  MoreHorizontal,
  Settings,
  User,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OnlineIndicator } from "@/components/pwa/online-indicator";

const primaryNav = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/points", label: "Puntos", icon: MapPin },
  { href: "/tasks", label: "Tareas", icon: ClipboardList },
  { href: "/reports", label: "Reportes", icon: FileText },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/settings", label: "Config", icon: Settings },
];

const mobileNav = primaryNav.slice(0, 4).concat([{ href: "/settings", label: "Mas", icon: MoreHorizontal }]);

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f4f7fb] text-slate-950 dark:bg-[#07111f] dark:text-white">
      <OnlineIndicator />

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-white/10 dark:bg-[#0a1728] lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg p-1">
          <span className="grid size-11 place-items-center rounded-lg bg-[#16c8ff] text-lg font-black text-[#07111f] shadow-sm shadow-cyan-500/20">
            J
          </span>
          <span>
            <span className="block text-base font-semibold">Jet Scooter</span>
            <span className="block text-xs font-medium text-slate-500 dark:text-cyan-100/70">
              Centro operativo
            </span>
          </span>
        </Link>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400">Operacion</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">America/Santiago</p>
        </div>

        <nav className="mt-6 grid gap-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-cyan-300/10 dark:hover:text-white"
              >
                <Icon className="size-4 text-cyan-600 dark:text-cyan-300" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#07111f]/90">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-cyan-700 dark:text-cyan-300">Jet Ops</p>
              <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                Gestion operativa conectada a Supabase
              </p>
            </div>
            <div className="flex items-center gap-2">
              <InstallPrompt />
              <NotificationsBell />
              <ThemeToggle />
              <Link
                href="/profile"
                aria-label="Perfil"
                className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
              >
                <User className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-8px_28px_rgb(15_23_42/0.08)] backdrop-blur dark:border-white/10 dark:bg-[#07111f]/95 lg:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="grid justify-items-center gap-1 rounded-lg px-1 py-2 text-xs font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-cyan-300/10"
            >
              <Icon className="size-5 text-cyan-600 dark:text-cyan-300" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
