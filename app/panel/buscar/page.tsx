import { Search, Star, MapPin, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { PageHeader, EmptyState, Card } from "../_components/ui";

const CATEGORIES = [
  "Arquitectura y construcción",
  "Desarrollo web / apps",
  "Diseño gráfico / branding",
  "Legal",
  "Contabilidad",
  "Fotografía",
  "Marketing digital",
  "Electricidad",
  "Plomería",
  "Consultoría",
];

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("services")
    .select("*")
    .eq("status", "activo")
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) query = query.ilike("title", `%${q}%`);
  if (cat) query = query.eq("category", cat);

  const { data: services } = await query;

  // Nombres y reputación de los profesionales
  const ids = [...new Set((services ?? []).map((s) => s.professional_id))];
  const [{ data: pros }, { data: profiles }] =
    ids.length > 0
      ? await Promise.all([
          supabase.from("professionals").select("id, rating, reviews_count").in("id", ids),
          supabase.from("profiles").select("id, full_name, city").in("id", ids),
        ])
      : [{ data: [] }, { data: [] }];

  const proMap = new Map((pros ?? []).map((p) => [p.id, p]));
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Catálogo"
        title="Buscar servicios"
        subtitle="Encuentra profesionales verificados para lo que necesitas."
      />

      {/* Buscador */}
      <form className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Ej: diseño de logo, electricista, abogado..."
            className="w-full rounded-full border border-[var(--line-strong)] bg-white py-3 pl-11 pr-4 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10"
          />
        </div>
        {cat && <input type="hidden" name="cat" value={cat} />}
        <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-deep">
          Buscar
        </button>
      </form>

      {/* Chips de categoría */}
      <div className="mb-7 flex flex-wrap gap-2">
        <a
          href="/panel/buscar"
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            !cat
              ? "border-green bg-green text-white"
              : "border-[var(--line-strong)] text-ink-soft hover:bg-paper"
          }`}
        >
          Todas
        </a>
        {CATEGORIES.map((c) => (
          <a
            key={c}
            href={`/panel/buscar?cat=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              cat === c
                ? "border-green bg-green text-white"
                : "border-[var(--line-strong)] text-ink-soft hover:bg-paper"
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      {!services || services.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados todavía"
          description={
            q || cat
              ? "No encontramos servicios con esos criterios. Prueba con otra búsqueda."
              : "Aún no hay servicios publicados. ¡Vuelve pronto o invita a profesionales!"
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const pro = proMap.get(s.professional_id);
            const name = nameMap.get(s.professional_id)?.full_name ?? "Profesional";
            const rating = Number(pro?.rating ?? 0);
            return (
              <Card key={s.id} className="flex flex-col">
                <span className="mb-2 inline-block w-fit rounded-lg bg-mint px-2.5 py-1 text-xs font-semibold text-green-deep">
                  {s.category}
                </span>
                <h3 className="font-display text-lg font-bold leading-snug text-ink">
                  {s.title}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-mute">
                  {s.description || "Sin descripción"}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-green text-[11px] font-bold text-white">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate font-medium">{name}</span>
                  {rating > 0 && (
                    <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-amber">
                      <Star className="h-3.5 w-3.5 fill-amber" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
                  <div>
                    <p className="text-xs text-ink-mute">Desde</p>
                    <p className="font-display text-xl font-bold text-green">
                      {formatUSD(Number(s.price))}
                    </p>
                  </div>
                  {s.city && (
                    <span className="flex items-center gap-1 text-xs text-ink-mute">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.city}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
