"use client";

import { useEffect, useRef } from "react";
import type { ColorScheme } from "@/hooks/useColorScheme";
import { WORKFLOW_ID, PLACEHOLDER_INPUT, GREETING, CREATE_SESSION_ENDPOINT } from "@/lib/config";

const WORKFLOW_VERSION = "1";

export function WorkflowEmbed({ scheme }: { scheme: ColorScheme }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    host.innerHTML = "";

    let cleanup: (() => void) | null = null;
    const render = () => {
      if (typeof window === "undefined") {
        return false;
      }
      const globalChatKit = (window as typeof window & {
        ChatKit?: {
          renderWorkflow?: (options: Record<string, unknown>) => () => void;
        };
      }).ChatKit;
      if (!globalChatKit?.renderWorkflow) {
        return false;
      }
      cleanup = globalChatKit.renderWorkflow({
        selector: host,
        workflowId: WORKFLOW_ID,
        version: WORKFLOW_VERSION,
        clientSecretEndpoint: CREATE_SESSION_ENDPOINT,
        theme: scheme,
        placeholder: PLACEHOLDER_INPUT,
        greeting: GREETING,
        composer: {
          placeholder: PLACEHOLDER_INPUT,
        },
      });
      return true;
    };

    if (!render()) {
      const interval = window.setInterval(() => {
        if (render()) {
          window.clearInterval(interval);
        }
      }, 250);
      return () => {
        window.clearInterval(interval);
        if (cleanup) {
          cleanup();
        }
      };
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [scheme]);

  return <div ref={hostRef} className="h-full w-full" />;
}
