"use client";

import Image from "next/image";
import { WorkflowEmbed } from "@/components/WorkflowEmbed";
import { useColorScheme } from "@/hooks/useColorScheme";
import { WORKFLOW_ID } from "@/lib/config";

export default function App() {
  const { scheme } = useColorScheme();

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
            <WorkflowEmbed scheme={scheme} />
          </div>
        </section>
        <footer className="mt-6 w-full text-right">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium tracking-widest text-white/70">
            Build {process.env.NEXT_PUBLIC_BUILD_ID ?? "dev"}
          </span>
        </footer>
      </div>
    </div>
  );
}
