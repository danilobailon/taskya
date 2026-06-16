import Link from "next/link";
import { ShieldCheck, Search, Star, ArrowRight, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";
import { SearchBar } from "./_components/SearchBar";
import { ServiceCard, type ServiceCardData } from "./_components/ServiceCard";

const POPULAR = [
  "Diseño de logo",
  "Página web",
  "Plano arquitectónico",
  "Electricista",
  "Contador",
];

async function getFeatured(): Promise<ServiceCardData[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, title, category, description, price, city, cover_url, professional_id")
    .eq("status", "activo")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!services || services.length === 0) return [];

  const ids = [...new Set(services.map((s) => s.professional_id))];
  const [{ data: pros }, { data: profiles }] = await Promise.all([
    supabase.from("professionals").select("id, rating, reviews_count").in("id", ids),
    supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids),
  ]);
  const proMap = new Map((pros ?? []).map((p) => [p.id, p]));
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return services.map((s) => {
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
}

export default async function Home() {
  const featured = await getFeatured();

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-green-deep text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-mint/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-mint">
            <ShieldCheck className="h-4 w-4" /> Pago protegido en custodia
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Encuentra al profesional ideal para{" "}
            <span className="text-amber">cualquier servicio</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-mint">
            Miles de profesionales verificados del Ecuador, listos para tu
            proyecto. Compara, contrata y paga con total confianza.
          </p>

          <div className="mt-8 max-w-2xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-mint">
            <span className="font-medium">Popular:</span>
            {POPULAR.map((p) => (
              <Link
                key={p}
                href={`/servicios?q=${encodeURIComponent(p)}`}
                className="rounded-full border border-white/20 px-3 py-1 transition hover:border-white/50 hover:text-white"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Categorías ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Explora por categoría
        </h2>
        <p className="mt-1 text-ink-mute">Elige el área y descubre profesionales cerca de ti.</p>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map(({ label, Icon }) => (
            <Link
              key={label}
              href={`/servicios?cat=${encodeURIComponent(label)}`}
              className="group flex flex-col gap-3 rounded-card border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-mint-2 hover:shadow-[var(--shadow-md)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-green transition group-hover:bg-green group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold leading-snug text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Servicios destacados ---------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Servicios destacados
              </h2>
              <p className="mt-1 text-ink-mute">Lo más reciente del marketplace.</p>
            </div>
            <Link
              href="/servicios"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-green transition hover:gap-2.5 sm:flex"
            >
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- Cómo funciona ---------- */}
      <section id="como-funciona" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            Cómo funciona TaskYa
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
            {[
              {
                icon: Search,
                title: "1. Busca y compara",
                text: "Explora servicios por categoría, revisa portafolios y valoraciones reales.",
              },
              {
                icon: ShieldCheck,
                title: "2. Contrata protegido",
                text: "Tu pago queda en custodia. El profesional recibe el dinero al entregar.",
              },
              {
                icon: Star,
                title: "3. Confirma y valora",
                text: "Apruebas el trabajo, se libera el pago y dejas tu reseña al profesional.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-green">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-mute">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA profesionales ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-lg bg-green px-8 py-14 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber/20 blur-3xl" />
          <div className="relative">
            <BadgeCheck className="mx-auto h-10 w-10 text-amber" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              ¿Ofreces un servicio?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-mint">
              Crea tu perfil, publica tus servicios y empieza a recibir clientes.
              Solo cobramos 15% cuando completas un trabajo.
            </p>
            <Link
              href="/registro?tipo=profesional"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber px-7 py-3.5 font-semibold text-ink transition hover:brightness-105"
            >
              Empezar a vender <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
