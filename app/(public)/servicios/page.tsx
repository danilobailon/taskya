import Link from "next/link";
import { SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";
import { ServiceCard, type ServiceCardData } from "../_components/ServiceCard";

const input =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";

type Params = {
  q?: string;
  cat?: string;
  city?: string;
  max?: string;
  sort?: string;
};

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { q, cat, city, max, sort } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("services")
    .select("id, title, category, description, price, city, cover_url, professional_id")
    .eq("status", "activo")
    .limit(60);

  if (q) query = query.ilike("title", `%${q}%`);
  if (cat) query = query.eq("category", cat);
  if (city) query = query.ilike("city", `%${city}%`);
  if (max) query = query.lte("price", Number(max));

  if (sort === "precio_asc") query = query.order("price", { ascending: true });
  else if (sort === "precio_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: services } = await query;

  const ids = [...new Set((services ?? []).map((s) => s.professional_id))];
  const [{ data: pros }, { data: profiles }] =
    ids.length > 0
      ? await Promise.all([
          supabase.from("professionals").select("id, rating, reviews_count").in("id", ids),
          supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids),
        ])
      : [{ data: [] }, { data: [] }];

  const proMap = new Map((pros ?? []).map((p) => [p.id, p]));
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const cards: ServiceCardData[] = (services ?? []).map((s) => {
    const pro = proMap.get(s.professional_id);
    const profile = nameMap.get(s.professional_id);
    return {
      id: s.id,
      title: s.title,
      category: s.category,
      description: s.description,
      price: Number(s.price),
      city: s.city,
      coverUrl: s.cover_url,
      proName: profile?.full_name ?? "Profesional",
      proAvatarUrl: profile?.avatar_url,
      rating: Number(pro?.rating ?? 0),
      reviewsCount: pro?.reviews_count ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          {cat ? cat : q ? `Resultados para “${q}”` : "Todos los servicios"}
        </h1>
        <p className="mt-1 text-ink-mute">
          {cards.length} {cards.length === 1 ? "servicio" : "servicios"} disponibles.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
        {/* ---------- Filtros ---------- */}
        <form className="rounded-card border border-[var(--line)] bg-white p-5 lg:sticky lg:top-20">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink-soft">Buscar</label>
            <input name="q" defaultValue={q ?? ""} placeholder="Palabra clave" className={input} />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-sm font-semibold text-ink-soft">Categoría</label>
            <select name="cat" defaultValue={cat ?? ""} className={input}>
              <option value="">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-sm font-semibold text-ink-soft">Ciudad</label>
            <input name="city" defaultValue={city ?? ""} placeholder="Ej: Manta" className={input} />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-sm font-semibold text-ink-soft">Precio máximo (USD)</label>
            <input name="max" type="number" min="0" defaultValue={max ?? ""} placeholder="Sin límite" className={input} />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-sm font-semibold text-ink-soft">Ordenar por</label>
            <select name="sort" defaultValue={sort ?? ""} className={input}>
              <option value="">Más recientes</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>

          <button className="mt-5 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep">
            Aplicar filtros
          </button>
          <Link
            href="/servicios"
            className="mt-2 block text-center text-sm font-medium text-ink-mute transition hover:text-ink"
          >
            Limpiar
          </Link>
        </form>

        {/* ---------- Resultados ---------- */}
        {cards.length === 0 ? (
          <div className="rounded-card border border-dashed border-[var(--line-strong)] bg-white/50 p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint">
              <SearchX className="h-6 w-6 text-green" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">Sin resultados</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-mute">
              No encontramos servicios con esos criterios. Prueba con otra búsqueda
              o limpia los filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {cards.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
