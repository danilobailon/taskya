import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Encabezado estándar de cada página del panel. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-green">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-mute">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/** Estado vacío reutilizable. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/50 p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint">
        <Icon className="h-6 w-6 text-green" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-mute">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Tarjeta blanca contenedora. */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-[var(--line)] bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/** Botón-enlace primario (oscuro) y secundario. */
export function ButtonLink({
  href,
  children,
  variant = "dark",
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "amber" | "ghost";
  icon?: LucideIcon;
}) {
  const styles = {
    dark: "bg-ink text-white hover:bg-green-deep",
    amber: "bg-amber text-ink hover:brightness-105",
    ghost: "border border-[var(--line-strong)] text-ink hover:bg-paper",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${styles}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}

/** Insignia de estado de contrato/servicio. */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    solicitado: "bg-amber-bg text-amber",
    aceptado: "bg-mint text-green-deep",
    en_progreso: "bg-mint text-green-deep",
    entregado: "bg-mint text-green-deep",
    completado: "bg-green text-white",
    cancelado: "bg-paper-2 text-ink-mute",
    disputa: "bg-red-100 text-red-700",
    activo: "bg-mint text-green-deep",
    pausado: "bg-paper-2 text-ink-mute",
    borrador: "bg-paper-2 text-ink-mute",
  };
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] ?? "bg-paper-2 text-ink-mute"}`}
    >
      {label}
    </span>
  );
}
