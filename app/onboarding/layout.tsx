import Link from "next/link";

/** Layout del onboarding: pantalla completa, sin sidebar (estilo Fiverr). */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex h-16 items-center justify-between border-b border-[var(--line)] bg-white px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-green text-base font-black text-white">
            T
          </span>
          Task<span className="text-amber">Ya</span>
        </Link>
        <Link href="/panel" className="text-sm font-semibold text-ink-mute transition hover:text-ink">
          Salir
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
