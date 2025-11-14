"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/session", { method: "DELETE", credentials: "include" });
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      router.replace("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white disabled:opacity-50"
    >
      {loading ? "Saliendo…" : "Logout"}
    </button>
  );
}
