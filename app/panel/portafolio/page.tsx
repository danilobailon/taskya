import { CheckCircle2, UserCog, Trash2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "../_components/ui";
import { ImageUploader } from "../_components/ImageUploader";
import { addPortfolioItem, deletePortfolioItem } from "./actions";

const input =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";
const label = "text-sm font-semibold text-ink-soft";

export default async function PortafolioPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
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
        <PageHeader eyebrow="Portafolio" title="Mi portafolio" />
        <EmptyState
          icon={UserCog}
          title="Solo para profesionales"
          description="El portafolio es para quienes ofrecen servicios. Tu cuenta está como cliente."
        />
      </div>
    );
  }

  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("professional_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Portafolio"
        title="Mi portafolio"
        subtitle="Muestra tus mejores trabajos. Aparecen en tu perfil público."
      />

      {ok && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-medium text-green-deep">
          <CheckCircle2 className="h-4 w-4" /> Trabajo agregado al portafolio.
        </div>
      )}
      {error === "imagen" && (
        <div className="mb-6 rounded-xl bg-amber-bg px-4 py-3 text-sm font-medium text-amber">
          Sube una imagen antes de guardar el trabajo.
        </div>
      )}

      {/* Agregar nuevo trabajo */}
      <Card className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Agregar un trabajo</h2>
        <form action={addPortfolioItem} className="space-y-4">
          <ImageUploader
            name="image_url"
            userId={user!.id}
            folder="portafolio"
            shape="wide"
            hint="Sube una imagen del proyecto (máx. 5 MB)."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label}>Título (opcional)</label>
              <input name="title" className={input} placeholder="Ej: Casa moderna en Manta" />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Descripción (opcional)</label>
              <input name="description" className={input} placeholder="Breve detalle del proyecto" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep">
              Agregar al portafolio
            </button>
          </div>
        </form>
      </Card>

      {/* Trabajos existentes */}
      {!items || items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Aún no tienes trabajos"
          description="Agrega tus mejores proyectos para generar confianza en los clientes."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="group overflow-hidden rounded-card border border-[var(--line)] bg-white"
            >
              <div className="relative aspect-square overflow-hidden bg-mint">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image_url} alt={it.title ?? ""} className="h-full w-full object-cover" />
                <form action={deletePortfolioItem} className="absolute right-2 top-2">
                  <input type="hidden" name="id" value={it.id} />
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              {(it.title || it.description) && (
                <div className="p-3">
                  {it.title && <p className="truncate text-sm font-semibold text-ink">{it.title}</p>}
                  {it.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-mute">{it.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
