import { Star, Award, Briefcase, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Card } from "../_components/ui";

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Star;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <Icon className="h-5 w-5 text-amber" />
      <p className="mt-3 font-display text-3xl font-bold text-ink">{value}</p>
      <p className="text-sm text-ink-mute">{label}</p>
    </Card>
  );
}

export default async function ReputacionPage() {
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
        <PageHeader eyebrow="Perfil" title="Reputación" />
        <EmptyState
          icon={UserCog}
          title="Solo para profesionales"
          description="La reputación se construye con las valoraciones de tus clientes."
        />
      </div>
    );
  }

  const { data: pro } = await supabase
    .from("professionals")
    .select("rating, reviews_count, jobs_done")
    .eq("id", user!.id)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("professional_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Perfil"
        title="Reputación"
        subtitle="Tu historial de valoraciones y desempeño en TaskYa."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={Star}
          value={pro?.rating ? Number(pro.rating).toFixed(1) : "—"}
          label="Calificación promedio"
        />
        <Stat icon={Award} value={String(pro?.reviews_count ?? 0)} label="Valoraciones" />
        <Stat icon={Briefcase} value={String(pro?.jobs_done ?? 0)} label="Trabajos completados" />
      </div>

      {!reviews || reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Aún no tienes valoraciones"
          description="Cuando completes tu primer trabajo, el cliente podrá calificarte y aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="mb-1 flex items-center gap-0.5 text-amber">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-amber" : "opacity-30"}`}
                  />
                ))}
              </div>
              <p className="text-ink-soft">{r.comment || "Sin comentario"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
