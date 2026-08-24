"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function OnlineIndicator() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (online) return null;

  return (
    <div className="fixed left-3 right-3 top-3 z-50 flex items-center justify-center rounded-lg border border-amber-300/30 bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 shadow-lg">
      <WifiOff className="mr-2 size-4" />
      Sin conexion
    </div>
  );
}
