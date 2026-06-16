import Link from "next/link";
import { ImageUploader } from "../../_components/ImageUploader";
import { CATEGORY_LABELS } from "@/lib/categories";
import { Card } from "../../_components/ui";

const input =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";
const label = "text-sm font-semibold text-ink-soft";

type ServiceValues = {
  id?: string;
  title?: string;
  category?: string;
  city?: string;
  description?: string;
  includes?: string[] | null;
  price?: number;
  delivery_days?: number | null;
  revisions?: number | null;
  cover_url?: string | null;
  gallery_urls?: string[] | null;
};

/** Formulario compartido para crear y editar un servicio. */
export function ServiceForm({
  action,
  userId,
  service,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
  service?: ServiceValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {service?.id && <input type="hidden" name="id" value={service.id} />}

      {/* Lo básico */}
      <Card className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">Lo básico</h2>
        <div className="space-y-1.5">
          <label className={label}>Título del servicio</label>
          <input
            name="title"
            required
            defaultValue={service?.title ?? ""}
            className={input}
            placeholder="Ej: Diseño arquitectónico de vivienda"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label}>Categoría</label>
            <select
              name="category"
              required
              className={input}
              defaultValue={service?.category ?? ""}
            >
              <option value="" disabled>
                Selecciona
              </option>
              {CATEGORY_LABELS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={label}>Ciudad</label>
            <input
              name="city"
              defaultValue={service?.city ?? ""}
              className={input}
              placeholder="Ej: Manta"
            />
          </div>
        </div>
      </Card>

      {/* Imágenes */}
      <Card className="space-y-5">
        <h2 className="font-display text-lg font-bold text-ink">Portada y galería</h2>
        <div className="space-y-2">
          <label className={label}>Imagen de portada</label>
          <ImageUploader
            name="cover_url"
            userId={userId}
            folder="servicios"
            shape="wide"
            defaultUrls={service?.cover_url ? [service.cover_url] : []}
            hint="Es la imagen principal que verán los clientes en el catálogo."
          />
        </div>
        <div className="space-y-2">
          <label className={label}>Galería (hasta 8 imágenes)</label>
          <ImageUploader
            name="gallery_urls"
            userId={userId}
            folder="servicios"
            multiple
            shape="square"
            max={8}
            defaultUrls={service?.gallery_urls ?? []}
            hint="Muestra ejemplos de tu trabajo, antes/después, detalles, etc."
          />
        </div>
      </Card>

      {/* Descripción */}
      <Card className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">Descripción</h2>
        <div className="space-y-1.5">
          <label className={label}>Describe tu servicio</label>
          <textarea
            name="description"
            defaultValue={service?.description ?? ""}
            className={`${input} min-h-28`}
            placeholder="Explica el alcance del servicio, qué resuelve y para quién es..."
          />
        </div>
        <div className="space-y-1.5">
          <label className={label}>¿Qué incluye? (una línea por ítem)</label>
          <textarea
            name="includes"
            defaultValue={(service?.includes ?? []).join("\n")}
            className={`${input} min-h-24`}
            placeholder={"Plantas arquitectónicas\nFachadas\nModelo 3D"}
          />
        </div>
      </Card>

      {/* Precio */}
      <Card className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">Precio y entrega</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className={label}>Precio (USD)</label>
            <input
              name="price"
              type="number"
              min="1"
              step="0.01"
              required
              defaultValue={service?.price ?? ""}
              className={input}
              placeholder="600"
            />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Entrega (días)</label>
            <input
              name="delivery_days"
              type="number"
              min="1"
              defaultValue={service?.delivery_days ?? ""}
              className={input}
              placeholder="30"
            />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Revisiones</label>
            <input
              name="revisions"
              type="number"
              min="0"
              defaultValue={service?.revisions ?? ""}
              className={input}
              placeholder="2"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Link
          href="/panel/servicios"
          className="rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
