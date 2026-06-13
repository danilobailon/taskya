import { Plus, Briefcase, UserCog, CheckCircle2, Pause, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { PageHeader, EmptyState, Card, ButtonLink, StatusBadge } from "../_components/ui";
import { toggleService } from "./actions";

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "profesional") {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader eyebrow="Catálogo" title="Mis servicios" />
        <EmptyState
          icon={UserCog}
          title="Solo para profesionales"
          description="Esta sección es para quienes ofrecen servicios. Tu cuenta está como cliente."
        />
      </div>
    );
  }

  const { data: pro } = await supabase
    .from("professionals")
    .select("id")
    .eq("id", user!.id)
    .single();

  const { data: services } = pro
    ? await supabase
        .from("services")
        .select("*")
        .eq("professional_id", user!.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Catálogo"
        title="Mis servicios"
        subtitle="Publica lo que ofreces para empezar a recibir contrataciones."
        action={
          pro ? (
            <ButtonLink href="/panel/servicios/nuevo" icon={Plus} variant="amber">
              Crear servicio
            </ButtonLink>
          ) : undefined
        }
      />

      {ok && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-medium text-green-deep">
          <CheckCircle2 className="h-4 w-4" />
          Servicio publicado.
        </div>
      )}

      {!pro ? (
        <EmptyState
          icon={UserCog}
          title="Completa tu perfil profesional primero"
          description="Necesitas tu profesión y datos profesionales antes de publicar servicios."
          action={
            <ButtonLink href="/panel/perfil" variant="dark">
              Completar perfil
            </ButtonLink>
          }
        />
      ) : !services || services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aún no tienes servicios"
          description="Crea tu primer servicio con un título claro, qué incluye y su precio."
          action={
            <ButtonLink href="/panel/servicios/nuevo" icon={Plus} variant="amber">
              Crear mi primer servicio
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="rounded-lg bg-mint px-2.5 py-1 text-xs font-semibold text-green-deep">
                  {s.category}
                </span>
                <StatusBadge status={s.status} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-mute">
                {s.description || "Sin descripción"}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
                <div>
                  <p className="font-display text-xl font-bold text-green">
                    {formatUSD(Number(s.price))}
                  </p>
                  {s.delivery_days && (
                    <p className="text-xs text-ink-mute">
                      Entrega: {s.delivery_days} días
                    </p>
                  )}
                </div>
                <form action={toggleService}>
                  <input type="hidden" name="id" value={s.id} />
                  <input
                    type="hidden"
                    name="next"
                    value={s.status === "activo" ? "pausado" : "activo"}
                  />
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-paper">
                    {s.status === "activo" ? (
                      <>
                        <Pause className="h-3.5 w-3.5" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> Activar
                      </>
                    )}
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
