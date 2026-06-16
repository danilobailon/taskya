import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  MapPin,
  Clock,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatUSD, commission } from "@/lib/utils";
import { categoryIcon } from "@/lib/categories";
import { Stars } from "../../_components/Stars";
import { Gallery } from "../../_components/Gallery";
import { contratar } from "./actions";

export default async function ServicioPublicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (!service) notFound();

  const [{ data: pro }, { data: proProfile }] = await Promise.all([
    supabase
      .from("professionals")
      .select("profession, headline, bio, rating, reviews_count, jobs_done, verified")
      .eq("id", service.professional_id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name, city, avatar_url")
      .eq("id", service.professional_id)
      .single(),
  ]);

  // Reseñas recientes del profesional
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, created_at, client_id")
    .eq("professional_id", service.professional_id)
    .order("created_at", { ascending: false })
    .limit(8);

  const reviewerIds = [...new Set((reviews ?? []).map((r) => r.client_id))];
  const { data: reviewers } = reviewerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", reviewerIds)
    : { data: [] };
  const reviewerMap = new Map((reviewers ?? []).map((r) => [r.id, r.full_name]));

  const esPropio = user?.id === service.professional_id;
  const amount = Number(service.price);
  const proName = proProfile?.full_name ?? "Profesional";
  const Icon = categoryIcon(service.category);
  const rating = Number(pro?.rating ?? 0);
  const gallery: string[] =
    service.gallery_urls && service.gallery_urls.length > 0
      ? service.gallery_urls
      : service.cover_url
        ? [service.cover_url]
        : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Migas */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-ink-mute">
        <Link href="/" className="transition hover:text-ink">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/servicios?cat=${encodeURIComponent(service.category)}`}
          className="transition hover:text-ink"
        >
          {service.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* ---------- Columna principal ---------- */}
        <div>
          <h1 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {service.title}
          </h1>

          {/* Profesional */}
          <Link
            href={`/profesional/${service.professional_id}`}
            className="mt-4 inline-flex items-center gap-3"
          >
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-green text-sm font-bold text-white">
              {proProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proProfile.avatar_url} alt={proName} className="h-full w-full object-cover" />
              ) : (
                proName.slice(0, 1).toUpperCase()
              )}
            </span>
            <span>
              <span className="flex items-center gap-1.5 font-semibold text-ink hover:underline">
                {proName}
                {pro?.verified && <BadgeCheck className="h-4 w-4 text-green" />}
              </span>
              <span className="flex items-center gap-2 text-sm text-ink-mute">
                {pro?.profession}
                {rating > 0 && <Stars value={rating} count={pro?.reviews_count} size={13} />}
              </span>
            </span>
          </Link>

          {/* Galería / portada */}
          <div className="mt-6">
            {gallery.length > 0 ? (
              <Gallery images={gallery} alt={service.title} />
            ) : (
              <div className="grid aspect-[16/10] place-items-center overflow-hidden rounded-card border border-[var(--line)] bg-gradient-to-br from-mint to-mint-2">
                <Icon className="h-16 w-16 text-green/50" />
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink">Sobre este servicio</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
              {service.description || "Sin descripción."}
            </p>

            {service.includes && service.includes.length > 0 && (
              <>
                <h3 className="mt-7 font-display text-lg font-bold text-ink">¿Qué incluye?</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {service.includes.map((it: string, i: number) => (
                    <li key={i} className="flex items-center gap-2.5 text-ink-soft">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint">
                        <Check className="h-3 w-3 text-green" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Sobre el profesional */}
          {pro?.bio && (
            <div className="mt-8 rounded-card border border-[var(--line)] bg-white p-6">
              <h2 className="font-display text-xl font-bold text-ink">Sobre {proName}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{pro.bio}</p>
              <Link
                href={`/profesional/${service.professional_id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green transition hover:gap-2.5"
              >
                Ver perfil completo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Reseñas */}
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink">
              Valoraciones {pro?.reviews_count ? `(${pro.reviews_count})` : ""}
            </h2>
            {!reviews || reviews.length === 0 ? (
              <p className="mt-3 text-sm text-ink-mute">
                Este profesional aún no tiene valoraciones. ¡Sé el primero en contratarlo!
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
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
          </div>
        </div>

        {/* ---------- Caja de contratación (sticky) ---------- */}
        <aside className="lg:sticky lg:top-20">
          <div className="rounded-card border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-md)]">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-2.5 py-1 text-xs font-semibold text-green-deep">
              <Icon className="h-3.5 w-3.5" /> {service.category}
            </span>
            <p className="mt-4 text-sm text-ink-mute">Precio</p>
            <p className="font-display text-4xl font-bold text-ink">{formatUSD(amount)}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-soft">
              {service.delivery_days && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-green" /> {service.delivery_days} días
                </span>
              )}
              {service.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-green" /> {service.city}
                </span>
              )}
            </div>

            {error === "propio" && (
              <p className="mt-4 rounded-lg bg-amber-bg px-3 py-2 text-sm text-amber">
                No puedes contratar tu propio servicio.
              </p>
            )}
            {error === "nodisponible" && (
              <p className="mt-4 rounded-lg bg-amber-bg px-3 py-2 text-sm text-amber">
                Este servicio ya no está disponible.
              </p>
            )}

            {esPropio ? (
              <Link
                href="/panel/servicios"
                className="mt-5 block rounded-full border border-[var(--line-strong)] py-3 text-center text-sm font-semibold text-ink-soft transition hover:bg-paper"
              >
                Es tu servicio · gestionar
              </Link>
            ) : (
              <form action={contratar} className="mt-5">
                <input type="hidden" name="serviceId" value={service.id} />
                <button className="w-full rounded-full bg-amber py-3.5 font-semibold text-ink transition hover:brightness-105">
                  Contratar ahora
                </button>
              </form>
            )}

            <div className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-xs text-ink-mute">
              <p className="flex items-center gap-2 font-semibold text-ink-soft">
                <ShieldCheck className="h-4 w-4 text-green" /> Pago protegido en custodia
              </p>
              <p>
                El profesional recibe {formatUSD(amount - commission(amount))} al
                confirmar la entrega. TaskYa cobra 15% de comisión.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
