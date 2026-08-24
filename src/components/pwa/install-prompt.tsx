"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (installEvent: Event) => {
      installEvent.preventDefault();
      setEvent(installEvent as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!event) return null;

  return (
    <button
      type="button"
      onClick={() => event.prompt()}
      className="inline-flex h-10 items-center rounded-lg bg-[#16c8ff] px-3 text-sm font-semibold text-[#07111f] shadow-sm transition hover:bg-cyan-300"
    >
      <Download className="mr-2 size-4" />
      Instalar aplicacion
    </button>
  );
}
