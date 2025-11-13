"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { WORKFLOW_ID } from "@/lib/config";

const WORKFLOW_VERSION = "1";

const baseMetrics = [
  { label: "Context pack", value: "vs_6914c9aa" },
  { label: "Herramientas", value: "file • web • code" },
  { label: "Workflow", value: WORKFLOW_ID || "Sin configurar" },
  { label: "Latencia media", value: "1.8 s" },
];

const highlights = [
  "Reescritura inteligente y clasificación de intención antes de responder",
  "Escalada automática a búsquedas en archivos, web o code interpreter",
  "Experiencia en vidrio con foco mobile-first y controles accesibles",
];

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

  const handleThemeToggle = useCallback(() => {
    setScheme(scheme === "dark" ? "light" : "dark");
  }, [scheme, setScheme]);

  const metrics = useMemo(
    () =>
      baseMetrics.map((metric) =>
        metric.label === "Workflow"
          ? { ...metric, value: WORKFLOW_ID || "wf_config" }
          : metric
      ),
    []
  );

  const statusVariant = useMemo(() => {
    if (/error/i.test(panelStatus)) {
      return {
        dot: "bg-rose-400",
        text: "text-rose-100",
        pill: "bg-rose-500/20 border border-rose-400/40",
      };
    }
    if (/inicializando/i.test(panelStatus)) {
      return {
        dot: "bg-amber-300",
        text: "text-amber-100",
        pill: "bg-amber-500/15 border border-amber-400/20",
      };
    }
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-50",
      pill: "bg-emerald-500/15 border border-emerald-400/20",
    };
  }, [panelStatus]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(34,197,94,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.25),transparent_55%)]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/70 px-4 py-4 backdrop-blur sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 p-2">
              <Image
                src="/logo-fup.png"
                alt="Logo FUP"
                width={64}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">FollowUP</p>
              <p className="text-base font-semibold text-white">Copilot · ChatKit + AgentKit</p>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              WF v{WORKFLOW_VERSION}
              <span className="font-mono text-[11px] text-white/70">{WORKFLOW_ID || "wf_config"}</span>
            </span>
            <button
              type="button"
              aria-pressed={scheme === "dark"}
              onClick={handleThemeToggle}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/40"
            >
              <span
                className="inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: scheme === "dark" ? "#38bdf8" : "#fcd34d" }}
              />
              {scheme === "dark" ? "Modo oscuro" : "Modo claro"}
            </button>
            <Link
              href="https://github.com/openai/openai-chatkit-advanced-samples"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white"
            >
              Docs avanzadas
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.5em] text-teal-200/80">
                  FollowUP copiloto
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Tablero responsive para conversaciones de seguimiento impecables.
                </h1>
                <p className="mt-3 text-base text-white/80">
                  Construido sobre ChatKit + AgentKit con el workflow
                  <span className="mx-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs text-emerald-200">
                    {WORKFLOW_ID || "wf_config"}
                  </span>
                  para reescritura, clasificación y ejecución de herramientas.
                </p>

                <ul className="mt-4 space-y-3 text-sm text-white/80">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <a
                    href="#panel"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Abrir panel
                  </a>
                  <Link
                    href="https://platform.openai.com/docs/guides/chatkit"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white/90 transition hover:border-white"
                  >
                    Guía ChatKit
                  </Link>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3 text-sm text-white/90 sm:grid-cols-4 lg:grid-cols-2">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="panel"
              className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/40 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${statusVariant.pill} ${statusVariant.text}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${statusVariant.dot}`} />
                  {panelStatus}
                </span>
                <span className="text-white/60">{lastEvent}</span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)]">
                <div className="min-h-[520px] rounded-[24px] border border-white/10 bg-black/20 p-2">
                  <ChatKitPanel
                    theme={scheme}
                    onWidgetAction={handleWidgetAction}
                    onResponseEnd={handleResponseEnd}
                    onThemeRequest={setScheme}
                    onStatusChange={setPanelStatus}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
