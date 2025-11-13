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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-1 flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/90 p-2 shadow-[0_15px_40px_rgba(15,23,42,0.35)]">
            <Image
              src="/logo-fup.png"
              alt="Logo FUP"
              width={56}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.45em] text-white/60">
            FollowUP Copilot
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Conversaciones enfocadas, sin ruido.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65 sm:text-base">
            Interfaz monocromática optimizada para Chrome y Safari en iOS / Android.
            Ejecuta el workflow
            <span className="mx-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 font-mono text-[11px] text-teal-200">
              {WORKFLOW_ID || "wf_config"}
            </span>
            sobre ChatKit + AgentKit, manteniendo el foco solo en la conversación.
          </p>
        </header>

        <section className="mt-8 w-full" id="panel">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-4 grid gap-2 text-xs text-white/70 sm:grid-cols-2">
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-center sm:text-left">
                {panelStatus}
              </span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-center sm:text-right">
                {lastEvent}
              </span>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-black/40 p-2 sm:p-3">
              <ChatKitPanel
                theme={scheme}
                onWidgetAction={handleWidgetAction}
                onResponseEnd={handleResponseEnd}
                onThemeRequest={setScheme}
                onStatusChange={setPanelStatus}
                className="min-h-[65vh] sm:min-h-[540px]"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
