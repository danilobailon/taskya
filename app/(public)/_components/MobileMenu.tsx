"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

/** Menú desplegable para móvil (el header de escritorio se oculta en pantallas pequeñas). */
export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const linkClass =
    "block rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-mint/50";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink transition hover:bg-mint/50"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={close}
            className="fixed inset-0 top-16 z-30 bg-ink/20"
          />
          <nav className="fixed inset-x-0 top-16 z-40 border-b border-[var(--line)] bg-white p-3 shadow-[var(--shadow-md)]">
            <Link href="/servicios" onClick={close} className={linkClass}>
              Explorar servicios
            </Link>
            <Link href="/#como-funciona" onClick={close} className={linkClass}>
              Cómo funciona
            </Link>

            <div className="my-2 border-t border-[var(--line)]" />

            {signedIn ? (
              <Link href="/panel" onClick={close} className={linkClass}>
                Mi panel
              </Link>
            ) : (
              <>
                <Link href="/registro?tipo=profesional" onClick={close} className={linkClass}>
                  Ofrecer servicios
                </Link>
                <Link href="/login" onClick={close} className={linkClass}>
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={close}
                  className="mt-1 block rounded-xl bg-amber px-4 py-3 text-center text-base font-semibold text-ink transition hover:brightness-105"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
