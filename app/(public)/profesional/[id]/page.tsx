import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "../../_components/Stars";
import { ServiceCard, type ServiceCardData } from "../../_components/ServiceCard";

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pro }, { data: profile }] = await Promise.all([
    supabase.from("professionals").select("*").eq("id", id).single(),
    supabase.from("profiles").select("full_name, city, avatar_url, created_at").eq("id", id).single(),
  ]);

  if (!pro || !profile) notFound();

  const name = profile.full_name ?? "Profesional";
  const initial = name.slice(0, 1).toUpperCase();
  const since = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;
  const rating = Number(pro.rating ?? 0);

  // Servicios activos del profesional
  const { data: services } = await supabase
    .from("services")
    .select("id, title, category, description, price, city, cover_url")
    .eq("professional_id", id)
    .eq("status", "activo")
    .order("created_at", { ascending: false });

  const cards: ServiceCardData[] = (services ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    description: s.description,
    price: Number(s.price),
    city: s.city,
    coverUrl: s.cover_url,
    proName: name,
    proAvatarUrl: profile.avatar_url,
    rating,
    reviewsCount: pro.reviews_count ?? 0,
  }));

  // Portafolio (la tabla puede no existir aún antes de la migración: si falla,
  // data viene null y simplemente no mostramos la sección).
  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("id, title, description, image_url")
    .eq("professional_id", id)
    .order("created_at", { ascending: false });

  // Reseñas
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, created_at, client_id")
    .eq("professional_id", id)
    .order("created_at", { ascending: false })
    .limit(12);

  const reviewerIds = [...new Set((reviews ?? []).map((r) => r.client_id))];
  const { data: reviewers } = reviewerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", reviewerIds)
    : { data: [] };
  const reviewerMap = new Map((reviewers ?? []).map((r) => [r.id, r.full_name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* ---------- Cabecera ---------- */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-3xl font-bold text-white">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>

          <div className="flex-1">
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-ink">
              {name}
              {pro.verified && <BadgeCheck className="h-6 w-6 text-green" />}
            </h1>
            <p className="mt-1 text-lg text-ink-soft">{pro.headline || pro.profession}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-mute">
              {rating > 0 && <Stars value={rating} count={pro.reviews_count} />}
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {pro.jobs_done ?? 0} trabajos
              </span>
              {profile.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {profile.city}
                </span>
              )}
              {since && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Desde {since}
                </span>
              )}
            </div>

            {pro.categories && pro.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {pro.categories.map((c: string) => (
                  <Link
                    key={c}
                    href={`/servicios?cat=${encodeURIComponent(c)}`}
                    className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-green-deep transition hover:bg-mint-2"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* ---------- Columna principal ---------- */}
        <div>
          {pro.bio && (
            <section>
              <h2 className="font-display text-xl font-bold text-ink">Sobre mí</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{pro.bio}</p>
            </section>
          )}

          {/* Portafolio */}
          {portfolio && portfolio.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold text-ink">Portafolio</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolio.map((p) => (
                  <figure
                    key={p.id}
                    className="group overflow-hidden rounded-card border border-[var(--line)] bg-white"
                  >
                    <div className="aspect-square overflow-hidden bg-mint">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt={p.title ?? ""}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    {p.title && (
                      <figcaption className="truncate p-2.5 text-xs font-semibold text-ink">
                        {p.title}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Servicios */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-ink">
              Servicios de {name.split(" ")[0]}
            </h2>
            {cards.length === 0 ? (
              <p className="mt-3 text-sm text-ink-mute">
                Este profesional aún no tiene servicios publicados.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cards.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            )}
          </section>

          {/* Reseñas */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-ink">
              Valoraciones {pro.reviews_count ? `(${pro.reviews_count})` : ""}
            </h2>
            {!reviews || reviews.length === 0 ? (
              <p className="mt-3 text-sm text-ink-mute">Aún no tiene valoraciones.</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {reviews.map((r, i) => {
                  const who = reviewerMap.get(r.client_id) ?? "Cliente";
                  return (
                    <li key={i} className="rounded-card border border-[var(--line)] bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-xs font-bold text-green-deep">
                          {who.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink">{who}</p>
                          <Stars value={r.rating} size={12} showvalue={false} />
                        </div>
                      </div>
                      {r.comment && <p className="mt-3 text-sm text-ink-soft">{r.comment}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* ---------- Barra lateral ---------- */}
        <aside className="lg:sticky lg:top-20 space-y-4">
          <div className="rounded-card border border-[var(--line)] bg-white p-5">
            <h3 className="font-display text-base font-bold text-ink">Información</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-mute">Profesión</dt>
                <dd className="text-right font-medium text-ink">{pro.profession}</dd>
              </div>
              {pro.experience && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-mute">Experiencia</dt>
                  <dd className="text-right font-medium text-ink">{pro.experience}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-ink-mute">Trabajos</dt>
                <dd className="text-right font-medium text-ink">{pro.jobs_done ?? 0}</dd>
              </div>
            </dl>

            {pro.languages && pro.languages.length > 0 && (
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">Idiomas</p>
                <p className="mt-1 text-sm text-ink">{pro.languages.join(", ")}</p>
              </div>
            )}

            {pro.skills && pro.skills.length > 0 && (
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">Habilidades</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pro.skills.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-full bg-mint px-2.5 py-1 text-xs font-medium text-green-deep"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pro.portfolio_url && (
              <a
                href={pro.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper"
              >
                <ExternalLink className="h-4 w-4" /> Ver portafolio externo
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
