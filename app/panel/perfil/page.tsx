import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "../_components/ui";
import { ImageUploader } from "../_components/ImageUploader";
import { CvImporter } from "./CvImporter";
import { saveProfile } from "./actions";

const input =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";
const label = "text-sm font-semibold text-ink-soft";

export default async function PerfilPage({
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
    .select("*")
    .eq("id", user!.id)
    .single();

  const role = profile?.role ?? "cliente";
  const esPro = role === "profesional";

  const { data: pro } = esPro
    ? await supabase.from("professionals").select("*").eq("id", user!.id).single()
    : { data: null };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        subtitle="Mantén tu información al día. Un perfil completo genera más confianza."
      />

      {ok && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-medium text-green-deep">
          <CheckCircle2 className="h-4 w-4" />
          Cambios guardados correctamente.
        </div>
      )}

      <form action={saveProfile} className="space-y-6">
        <input type="hidden" name="role" value={role} />

        {esPro && <CvImporter />}

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-ink">
            Datos personales
          </h2>

          <div className="mb-5 flex items-center gap-4">
            <ImageUploader
              name="avatar_url"
              userId={user!.id}
              folder="avatar"
              shape="avatar"
              defaultUrls={profile?.avatar_url ? [profile.avatar_url] : []}
            />
            <div>
              <p className="text-sm font-semibold text-ink-soft">Foto de perfil</p>
              <p className="text-xs text-ink-mute">
                Una foto real genera más confianza. Cuadrada se ve mejor.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className={label}>Nombre completo</label>
              <input
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                className={input}
                placeholder="Ej: Danilo Bailón"
              />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Teléfono / WhatsApp</label>
              <input
                name="phone"
                defaultValue={profile?.phone ?? ""}
                className={input}
                placeholder="099 123 4567"
              />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Ciudad</label>
              <input
                name="city"
                defaultValue={profile?.city ?? ""}
                className={input}
                placeholder="Ej: Manta"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className={label}>Correo</label>
              <input
                value={user?.email ?? ""}
                disabled
                className={`${input} cursor-not-allowed bg-paper text-ink-mute`}
              />
            </div>
          </div>
        </Card>

        {esPro && (
          <Card>
            <h2 className="mb-1 font-display text-lg font-bold text-ink">
              Información profesional
            </h2>
            <p className="mb-4 text-sm text-ink-mute">
              Esto aparece en tu perfil público y es necesario para publicar
              servicios.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={label}>Profesión</label>
                <input
                  name="profession"
                  defaultValue={pro?.profession ?? ""}
                  className={input}
                  placeholder="Ej: Arquitecto"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Años de experiencia</label>
                <input
                  name="experience"
                  defaultValue={pro?.experience ?? ""}
                  className={input}
                  placeholder="Ej: 5 años"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className={label}>Titular / especialidad</label>
                <input
                  name="headline"
                  defaultValue={pro?.headline ?? ""}
                  className={input}
                  placeholder="Ej: Diseño de viviendas modernas"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className={label}>Sobre ti</label>
                <textarea
                  name="bio"
                  defaultValue={pro?.bio ?? ""}
                  className={`${input} min-h-24`}
                  placeholder="Cuéntales a tus clientes quién eres y qué ofreces..."
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Categorías (separadas por coma)</label>
                <input
                  name="categories"
                  defaultValue={(pro?.categories ?? []).join(", ")}
                  className={input}
                  placeholder="Arquitectura, Diseño 3D"
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Portafolio / web</label>
                <input
                  name="portfolio_url"
                  defaultValue={pro?.portfolio_url ?? ""}
                  className={input}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Idiomas (separados por coma)</label>
                <input
                  name="languages"
                  defaultValue={(pro?.languages ?? []).join(", ")}
                  className={input}
                  placeholder="Español, Inglés"
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Habilidades (separadas por coma)</label>
                <input
                  name="skills"
                  defaultValue={(pro?.skills ?? []).join(", ")}
                  className={input}
                  placeholder="AutoCAD, Revit, SketchUp"
                />
              </div>
            </div>

            <Link
              href={`/profesional/${user!.id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green transition hover:gap-2.5"
            >
              <ExternalLink className="h-4 w-4" /> Ver mi perfil público
            </Link>
          </Card>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-green-deep"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
