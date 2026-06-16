import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

/** Pie del sitio público. */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex w-fit items-center gap-2 font-display text-xl font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-green text-base font-black text-white">
              T
            </span>
            Task<span className="text-amber">Ya</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-mute">
            El marketplace de servicios profesionales del Ecuador. Contrata con
            confianza: pago protegido y reputación transparente.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-ink">Categorías</p>
          <ul className="mt-3 space-y-2">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.label}>
                <Link
                  href={`/servicios?cat=${encodeURIComponent(c.label)}`}
                  className="text-sm text-ink-mute transition hover:text-green"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-ink">TaskYa</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/servicios" className="text-sm text-ink-mute transition hover:text-green">
                Explorar servicios
              </Link>
            </li>
            <li>
              <Link
                href="/registro?tipo=profesional"
                className="text-sm text-ink-mute transition hover:text-green"
              >
                Ofrecer mis servicios
              </Link>
            </li>
            <li>
              <Link href="/registro" className="text-sm text-ink-mute transition hover:text-green">
                Crear cuenta
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-sm text-ink-mute transition hover:text-green">
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-mute sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} TaskYa · un producto de Initec Studio.</p>
          <p>Hecho en Ecuador 🇪🇨</p>
        </div>
      </div>
    </footer>
  );
}
