import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function supabaseReady() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Cabecera del sitio público. Muestra acceso al panel si hay sesión. */
export async function SiteHeader() {
  let userInitial: string | null = null;
  let signedIn = false;

  if (supabaseReady()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      signedIn = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const name = profile?.full_name ?? user.email ?? "U";
      userInitial = name.slice(0, 1).toUpperCase();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-green text-base font-black text-white">
            T
          </span>
          Task<span className="text-amber">Ya</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link
            href="/servicios"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-mint/50 hover:text-ink"
          >
            Explorar servicios
          </Link>
          <Link
            href="/#como-funciona"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-mint/50 hover:text-ink"
          >
            Cómo funciona
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {signedIn ? (
            <Link
              href="/panel"
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-deep"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-[11px] font-bold">
                {userInitial}
              </span>
              Mi panel
            </Link>
          ) : (
            <>
              <Link
                href="/registro?tipo=profesional"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:text-ink sm:block"
              >
                Ofrecer servicios
              </Link>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-105"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
