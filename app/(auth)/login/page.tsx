import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">
        Bienvenido de vuelta
      </h1>
      <p className="mt-2 text-ink-mute">
        Ingresa para gestionar tus proyectos y contrataciones.
      </p>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form action={signIn} className="mt-8 space-y-4">
        {redirect && <input type="hidden" name="redirect" value={redirect} />}
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
            placeholder="••••••••"
            className="w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-3 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-ink py-3.5 font-semibold text-white transition hover:bg-green-deep"
        >
          Ingresar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-mute">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-green hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
