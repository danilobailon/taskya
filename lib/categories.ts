import {
  Building2,
  Code2,
  Palette,
  Scale,
  Calculator,
  Camera,
  Megaphone,
  Zap,
  Wrench,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/**
 * Fuente única de categorías del marketplace.
 *
 * `label` es lo que se guarda en la columna `services.category`, así que
 * cambiarlo rompería el filtrado de servicios ya publicados. Por eso filtramos
 * por la etiqueta (no por un slug) y solo le añadimos un icono para la UI.
 */
export type Category = {
  label: string;
  Icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  { label: "Arquitectura y construcción", Icon: Building2 },
  { label: "Desarrollo web / apps", Icon: Code2 },
  { label: "Diseño gráfico / branding", Icon: Palette },
  { label: "Legal", Icon: Scale },
  { label: "Contabilidad", Icon: Calculator },
  { label: "Fotografía", Icon: Camera },
  { label: "Marketing digital", Icon: Megaphone },
  { label: "Electricidad", Icon: Zap },
  { label: "Plomería", Icon: Wrench },
  { label: "Consultoría", Icon: Lightbulb },
];

/** Solo las etiquetas, para los selects de formularios (incluye "Otro"). */
export const CATEGORY_LABELS = [...CATEGORIES.map((c) => c.label), "Otro"];

/** Devuelve el icono de una categoría (o uno por defecto). */
export function categoryIcon(label: string): LucideIcon {
  return CATEGORIES.find((c) => c.label === label)?.Icon ?? Lightbulb;
}
