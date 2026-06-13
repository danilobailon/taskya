import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Clock, Star, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatUSD, commission } from "@/lib/utils";
import { Card } from "../../_components/ui";
import { contratar } from "./actions";

export default async function ServicioDetallePage({
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
      .select("profession, headline, rating, reviews_count, jobs_done")
      .eq("id", service.professional_id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name, city")
      .eq("id", service.professional_id)
      .single(),
  ]);

  const esPropio = user?.id === service.professional_id;
  const amount = Number(service.price);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel/buscar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Detalle */}
        <div>
          <span className="inline-block rounded-lg bg-mint px-2.5 py-1 text-xs font-semibold text-green-deep">
            {service.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">
            {service.title}
          </h1>

          {/* Profesional */}
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green text-sm font-bold text-white">
              {(proProfile?.full_name ?? "P").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-ink">
                {proProfile?.full_name ?? "Profesional"}
              </p>
              <p className="text-sm text-ink-mute">
                {pro?.profession}
                {pro?.rating ? (
                  <span className="ml-2 inline-flex items-center gap-0.5 font-semibold text-amber">
                    <Star className="h-3.5 w-3.5 fill-amber" />
                    {Number(pro.rating).toFixed(1)} ({pro.reviews_count})
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <Card className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Descripción
            </h2>
            <p className="mt-2 whitespace-pre-line text-ink-soft">
              {service.description || "Sin descripción."}
            </p>

            {service.includes && service.includes.length > 0 && (
              <>
                <h3 className="mt-5 font-semibold text-ink">Incluye</h3>
                <ul className="mt-2 space-y-2">
                  {service.includes.map((it: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-ink-soft">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-mint">
                        <Check className="h-3 w-3 text-green" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-5 flex flex-wrap gap-4 border-t border-[var(--line)] pt-4 text-sm text-ink-mute">
              {service.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {service.city}
                </span>
              )}
              {service.delivery_days && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Entrega en {service.delivery_days} días
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Caja de contratación */}
        <Card className="lg:sticky lg:top-6">
          <p className="text-sm text-ink-mute">Precio</p>
          <p className="font-display text-4xl font-bold text-ink">
            {formatUSD(amount)}
          </p>

          {error === "propio" && (
            <p className="mt-3 rounded-lg bg-amber-bg px-3 py-2 text-sm text-amber">
              No puedes contratar tu propio servicio.
            </p>
          )}
          {error === "nodisponible" && (
            <p className="mt-3 rounded-lg bg-amber-bg px-3 py-2 text-sm text-amber">
              Este servicio ya no está disponible.
            </p>
          )}

          {esPropio ? (
            <div className="mt-5 rounded-xl bg-paper p-4 text-center text-sm text-ink-mute">
              Este es <strong className="text-ink">tu servicio</strong>.
            </div>
          ) : (
            <form action={contratar} className="mt-5">
              <input type="hidden" name="serviceId" value={service.id} />
              <button className="w-full rounded-full bg-amber py-3.5 font-semibold text-ink transition hover:brightness-105">
                Contratar ahora
              </button>
            </form>
          )}

          <div className="mt-4 space-y-2 text-xs text-ink-mute">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green" />
              Pago protegido en custodia
            </p>
            <p className="pl-6">
              El profesional recibe {formatUSD(amount - commission(amount))} al
              confirmar la entrega (comisión TaskYa 15%).
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
