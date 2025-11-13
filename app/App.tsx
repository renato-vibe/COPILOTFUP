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
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-4 pb-12 pt-12 sm:px-6">
        <header className="w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 p-2">
            <Image src="/logo-fup.png" alt="Logo FUP" width={48} height={30} priority />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.5em] text-white/50">
            FOLLOWUP COPILOT
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-[2.5rem]">
            Entra, escribe y conversa.
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Workflow
            <span className="mx-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 font-mono text-[11px] text-teal-200">
              {WORKFLOW_ID || "wf_config"}
            </span>
            ejecutando ChatKit + AgentKit.
          </p>
        </header>

        <section className="mt-8 w-full" id="panel">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_25px_60px_rgba(5,10,30,0.4)] backdrop-blur">
            <div className="mb-3 flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
              <span>{panelStatus}</span>
              <span>{lastEvent}</span>
            </div>
            <ChatKitPanel
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
              onStatusChange={setPanelStatus}
              className="min-h-[70vh] sm:min-h-[560px]"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
