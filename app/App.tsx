"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { WORKFLOW_ID } from "@/lib/config";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [panelStatus, setPanelStatus] = useState("Inicializando ChatKit…");
  const [lastEvent, setLastEvent] = useState("Esperando interacción");

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    setLastEvent(`Hecho guardado (${action.factId.slice(0, 6)}…)`);
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLastEvent(`Respuesta generada · ${timestamp}`);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.25),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Image src="/logo-fup.png" alt="Logo FUP Watermark" width={280} height={160} priority />
        </div>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 pt-12 sm:px-6">
        <header className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/95 p-2 shadow-[0_20px_35px_rgba(15,23,42,0.35)]">
            <Image
              src="/logo-fup.png"
              alt="Logo FUP"
              width={48}
              height={30}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.5em] text-white/50">
            FOLLOWUP COPILOT
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-[2.75rem]">
            Chat limpio, listo para actuar.
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Workflow
            <span className="mx-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 font-mono text-[11px] text-teal-200">
              {WORKFLOW_ID || "wf_config"}
            </span>
            ejecutándose sobre ChatKit + AgentKit.
          </p>
        </header>

        <section className="mt-8 w-full" id="panel">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-4 shadow-[0_35px_80px_rgba(8,15,40,0.45)] backdrop-blur">
            <div className="mb-3 flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                {panelStatus}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-900/40 px-3 py-1">
                {lastEvent}
              </span>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-black/50 p-2 sm:p-3">
              <ChatKitPanel
                theme={scheme}
                onWidgetAction={handleWidgetAction}
                onResponseEnd={handleResponseEnd}
                onThemeRequest={setScheme}
                onStatusChange={setPanelStatus}
                className="min-h-[60vh] sm:min-h-[520px]"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
