import Link from "next/link";
import { MapPin } from "lucide-react";
import { categoryIcon } from "@/lib/categories";
import { formatUSD } from "@/lib/utils";
import { Stars } from "./Stars";

export type ServiceCardData = {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  price: number;
  city?: string | null;
  coverUrl?: string | null;
  proName: string;
  proAvatarUrl?: string | null;
  rating?: number;
  reviewsCount?: number;
};

/** Tarjeta de servicio reutilizable (home, catálogo, perfil del profesional). */
export function ServiceCard({ s }: { s: ServiceCardData }) {
  const Icon = categoryIcon(s.category);
  const initial = s.proName.slice(0, 1).toUpperCase();

  return (
    <Link
      href={`/servicio/${s.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-[var(--line)] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-mint-2 hover:shadow-[var(--shadow-md)]"
    >
      {/* Portada */}
      <div className="relative aspect-[4/3] overflow-hidden bg-mint">
        {s.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.coverUrl}
            alt={s.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-mint to-mint-2">
            <Icon className="h-10 w-10 text-green/60" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-green-deep backdrop-blur">
          {s.category}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-sm">
          <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-[10px] font-bold text-white">
            {s.proAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.proAvatarUrl} alt={s.proName} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <span className="truncate font-medium text-ink-soft">{s.proName}</span>
        </div>

        <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink transition group-hover:text-green">
          {s.title}
        </h3>

        {(s.rating ?? 0) > 0 && (
          <div className="mt-1.5">
            <Stars value={s.rating ?? 0} count={s.reviewsCount} size={13} />
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-[var(--line)] pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-mute">Desde</p>
            <p className="font-display text-lg font-bold text-green">
              {formatUSD(s.price)}
            </p>
          </div>
          {s.city && (
            <span className="flex items-center gap-1 text-xs text-ink-mute">
              <MapPin className="h-3.5 w-3.5" />
              {s.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
