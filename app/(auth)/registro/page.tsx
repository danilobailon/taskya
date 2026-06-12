import Link from "next/link";
import { AlertCircle, Search, Briefcase } from "lucide-react";
import { signUp } from "../actions";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tipo?: string }>;
}) {
  const { error, tipo } = await searchParams;
  const defaultPro = tipo === "profesional";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">
        Crea tu cuenta
      </h1>
      <p className="mt-2 text-ink-mute">Es gratis y toma menos de un minuto.</p>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form action={signUp} className="mt-8 space-y-4">
        {/* Selector de rol */}
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="cliente"
              defaultChecked={!defaultPro}
              className="peer sr-only"
            />
            <div className="flex flex-col items-start gap-1 rounded-2xl border-2 border-[var(--line)] bg-white p-4 transition peer-checked:border-green peer-checked:bg-mint/40">
              <Search className="h-5 w-5 text-green" />
              <span className="font-semibold text-ink">Busco servicios</span>
              <span className="text-xs text-ink-mute">Soy cliente</span>
            </div>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="profesional"
              defaultChecked={defaultPro}
              className="peer sr-only"
            />
            <div className="flex flex-col items-start gap-1 rounded-2xl border-2 border-[var(--line)] bg-white p-4 transition peer-checked:border-amber peer-checked:bg-amber-bg">
              <Briefcase className="h-5 w-5 text-amber" />
              <span className="font-semibold text-ink">Ofrezco servicios</span>
              <span className="text-xs text-ink-mute">Soy profesional</span>
            </div>
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-ink-soft">
            Nombre completo
          </label>
          <input
            type="text"
            name="full_name"
            required
            placeholder="Ej: María Fernanda Loor"
            className="w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-3 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-ink-soft">Correo</label>
          <input
            type="email"
            name="email"
            required
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-3 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-ink-soft">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-3 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-ink py-3.5 font-semibold text-white transition hover:bg-green-deep"
        >
          Crear cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-mute">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-green hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
