import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Acceso | FollowUp Copilot",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-12">
      <div className="mb-6 text-center text-white">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">FollowUp</p>
        <h1 className="text-2xl font-semibold">Panel privado</h1>
        <p className="text-sm text-white/60">Ingresa tus credenciales para continuar</p>
      </div>
      <LoginForm />
    </div>
  );
}
