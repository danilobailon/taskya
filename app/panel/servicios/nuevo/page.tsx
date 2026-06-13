import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Card } from "../../_components/ui";
import { createService } from "../actions";

const input =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";
const label = "text-sm font-semibold text-ink-soft";

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
  "Otro",
];

export default function NuevoServicioPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/panel/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis servicios
      </Link>

      <PageHeader
        eyebrow="Nuevo servicio"
        title="Publica un servicio"
        subtitle="Describe claramente qué ofreces. Mientras más completo, mejor."
      />

      <form action={createService}>
        <Card className="space-y-4">
          <div className="space-y-1.5">
            <label className={label}>Título del servicio</label>
            <input
              name="title"
              required
              className={input}
              placeholder="Ej: Diseño arquitectónico de vivienda"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label}>Categoría</label>
              <select name="category" required className={input} defaultValue="">
                <option value="" disabled>
                  Selecciona
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={label}>Ciudad</label>
              <input name="city" className={input} placeholder="Ej: Manta" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={label}>Descripción</label>
            <textarea
              name="description"
              className={`${input} min-h-28`}
              placeholder="Explica el alcance del servicio, qué resuelve y para quién es..."
            />
          </div>

          <div className="space-y-1.5">
            <label className={label}>¿Qué incluye? (una línea por ítem)</label>
            <textarea
              name="includes"
              className={`${input} min-h-24`}
              placeholder={"Plantas arquitectónicas\nFachadas\nModelo 3D"}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label}>Precio (USD)</label>
              <input
                name="price"
                type="number"
                min="1"
                step="0.01"
                required
                className={input}
                placeholder="600"
              />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Tiempo de entrega (días)</label>
              <input
                name="delivery_days"
                type="number"
                min="1"
                className={input}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              Publicar servicio
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
