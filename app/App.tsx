"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LogoutButton } from "@/components/LogoutButton";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [status, setStatus] = useState("Inicializando asistente…");
  const buildLabel =
    process.env.NEXT_PUBLIC_BUILD_ID ??
    process.env.CF_PAGES_COMMIT_SHA?.slice(0, 8) ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ??
    process.env.CF_PAGES_DEPLOYMENT_ID?.slice(0, 8) ??
    "dev";

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (!action.factId) {
      return;
    }
    setStatus("Chat listo ✅");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between px-5 py-4 text-xs text-white/60">
        <div className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/90 p-1.5">
            <Image src="/logo-fup.png" alt="Logo FUP" width={32} height={20} priority />
          </div>
          <span className="tracking-[0.4em]">FOLLOWUP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70">
            Build {buildLabel}
          </span>
          <LogoutButton />
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 pb-6">
        <div className="w-full max-w-4xl rounded-[40px] border border-white/10 bg-white/5 p-4 shadow-[0_25px_70px_rgba(7,12,25,0.6)] backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className={`h-2.5 w-2.5 rounded-full ${status.includes("Error") ? "bg-rose-400" : "bg-emerald-300"}`} />
              {status}
            </span>
          </div>
          <ChatKitPanel
            theme={scheme}
            onWidgetAction={handleWidgetAction}
            onResponseEnd={() => setStatus("Chat listo ✅")}
            onThemeRequest={setScheme}
            onStatusChange={setStatus}
            className="min-h-[70vh] sm:min-h-[560px]"
          />
        </div>
      </main>
    </div>
  );
}
