"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  email: string;
  password: string;
};

export function LoginForm() {
  const [form, setForm] = useState<FormState>({
    email: "op_team@fupbi.com",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "No se pudo iniciar sesión");
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_25px_70px_rgba(7,12,25,0.6)]"
    >
      <div className="space-y-1">
        <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-white/60">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          required
          autoComplete="username"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-xs uppercase tracking-[0.2em] text-white/60">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-2xl bg-emerald-400/80 px-4 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Validando…" : "Ingresar"}
      </button>

      <p className="text-center text-[11px] text-white/50">
        Acceso restringido al equipo FUP. Contacta a soporte si necesitas tu contraseña.
      </p>
    </form>
  );
}
