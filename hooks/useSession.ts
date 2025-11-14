"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionResponse = {
  email?: string;
  error?: string;
};

export const useSession = () => {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateState = useCallback(
    (nextStatus: SessionStatus, nextEmail: string | null) => {
      if (!mountedRef.current) {
        return;
      }
      setStatus(nextStatus);
      setEmail(nextEmail);
    },
    []
  );

  const fetchSession = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        updateState("unauthenticated", null);
        return;
      }
      const payload = (await response.json()) as SessionResponse;
      if (payload.email) {
        updateState("authenticated", payload.email);
      } else {
        updateState("unauthenticated", null);
      }
    } catch (error) {
      console.error("Session fetch error", error);
      updateState("unauthenticated", null);
    }
  }, [updateState]);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  return {
    status,
    email,
    refresh: fetchSession,
  };
};
