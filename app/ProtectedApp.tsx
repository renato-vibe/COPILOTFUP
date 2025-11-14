"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import App from "./App";
import { useSession } from "@/hooks/useSession";

export default function ProtectedApp() {
  const { status } = useSession();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-white/70">Validando acceso…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-white/70">Redireccionando al login…</p>
      </div>
    );
  }

  return <App />;
}
