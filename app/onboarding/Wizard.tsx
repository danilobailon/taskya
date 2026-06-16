"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  PencilLine,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { ImageUploader } from "../panel/_components/ImageUploader";
import { completeOnboarding } from "./actions";

const input =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 text-ink outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";
const label = "text-sm font-semibold text-ink-soft";

type Data = {
  full_name: string;
  city: string;
  phone: string;
  avatar_url: string;
  profession: string;
  headline: string;
  experience: string;
  bio: string;
  languages: string;
  skills: string;
};

const STEP_META = [
  { title: "Sobre ti", subtitle: "Cómo te verán los clientes." },
  { title: "Tu profesión", subtitle: "Qué haces y tu especialidad." },
  { title: "Categorías y habilidades", subtitle: "Para que te encuentren más fácil." },
  { title: "Preséntate", subtitle: "Cuenta quién eres en pocas frases." },
  { title: "¡Listo!", subtitle: "Revisa y crea tu perfil." },
];

const TOTAL = STEP_META.length; // 5 pasos de contenido

export function Wizard({
  userId,
  initial,
}: {
  userId: string;
  initial: Data & { categories: string[] };
}) {
  const [step, setStep] = useState(0); // 0 = elección; 1..5 = contenido
  const [data, setData] = useState<Data>({
    full_name: initial.full_name,
    city: initial.city,
    phone: initial.phone,
    avatar_url: initial.avatar_url,
    profession: initial.profession,
    headline: initial.headline,
    experience: initial.experience,
    bio: initial.bio,
    languages: initial.languages,
    skills: initial.skills,
  });
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof Data, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (label: string) =>
    setCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    );

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImporting(true);
    setImportError(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error || "No pudimos leer el archivo.");
        return;
      }
      const d = json.data ?? {};
      setData((prev) => ({
        ...prev,
        full_name: d.full_name || prev.full_name,
        city: d.city || prev.city,
        profession: d.profession || prev.profession,
        headline: d.headline || prev.headline,
        experience: d.experience || prev.experience,
        bio: d.bio || prev.bio,
        languages: (d.languages ?? []).join(", ") || prev.languages,
        skills: (d.skills ?? []).join(", ") || prev.skills,
      }));
      const known = new Set(CATEGORIES.map((c) => c.label));
      const cats = (d.categories ?? []).filter((c: string) => known.has(c));
      if (cats.length) setCategories(cats);
      setStep(1);
    } catch {
      setImportError("No pudimos leer el archivo. Rellena tu perfil manualmente.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Bloqueamos "Siguiente" en pasos con un campo obligatorio vacío.
  const blocked =
    (step === 1 && !data.full_name.trim()) ||
    (step === 2 && !data.profession.trim());

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      {/* Input de archivo (siempre montado: se usa en el paso 0 y en el paso 1) */}
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* ---------- Paso 0: elección ---------- */}
      {step === 0 ? (
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Crea tu perfil profesional
          </h1>
          <p className="mt-3 text-ink-mute">
            Empieza con un perfil que te haga destacar y atraiga clientes.
          </p>

          <div className="mt-8 space-y-3 text-left">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="group flex w-full items-center gap-4 rounded-card border-2 border-[var(--line)] bg-white p-5 text-left transition hover:border-green hover:bg-mint/30 disabled:opacity-60"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint text-green">
                {importing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  Importar mi CV
                  <span className="rounded-full bg-green px-2 py-0.5 text-[11px] font-semibold text-white">
                    Recomendado
                  </span>
                </span>
                <span className="block text-sm text-ink-mute">
                  {importing
                    ? "Leyendo tu CV con IA..."
                    : "Sube tu CV (PDF) o el perfil de LinkedIn en PDF y lo completamos por ti."}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex w-full items-center gap-4 rounded-card border-2 border-[var(--line)] bg-white p-5 text-left transition hover:border-green hover:bg-mint/30"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-paper-2 text-ink-soft">
                <PencilLine className="h-6 w-6" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg font-bold text-ink">
                  Rellenar manualmente
                </span>
                <span className="block text-sm text-ink-mute">
                  Completa tu perfil paso a paso (unos 3 minutos).
                </span>
              </span>
            </button>
          </div>

          {importError && (
            <p className="mt-4 rounded-lg bg-amber-bg px-3 py-2 text-sm text-amber">{importError}</p>
          )}
        </div>
      ) : (
        // ---------- Pasos 1..5 ----------
        <>
          {/* Progreso */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">{STEP_META[step - 1].title}</span>
              <span className="text-ink-mute">Paso {step} de {TOTAL}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
              <div
                className="h-full rounded-full bg-green transition-all duration-300"
                style={{ width: `${(step / TOTAL) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-ink-mute">{STEP_META[step - 1].subtitle}</p>
          </div>

          <form action={completeOnboarding}>
            {/* Paso 1: datos personales */}
            <div className={step === 1 ? "space-y-5" : "hidden"}>
              <div className="flex items-center gap-4">
                <ImageUploader
                  name="avatar_url"
                  userId={userId}
                  folder="avatar"
                  shape="avatar"
                  defaultUrls={data.avatar_url ? [data.avatar_url] : []}
                />
                <div>
                  <p className="text-sm font-semibold text-ink-soft">Foto de perfil</p>
                  <p className="text-xs text-ink-mute">Una foto real genera más confianza.</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={label}>Nombre completo</label>
                <input
                  name="full_name"
                  value={data.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={input}
                  placeholder="Ej: María Fernanda Loor"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={label}>Ciudad</label>
                  <input
                    name="city"
                    value={data.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={input}
                    placeholder="Ej: Manta"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={label}>Teléfono / WhatsApp</label>
                  <input
                    name="phone"
                    value={data.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={input}
                    placeholder="099 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Paso 2: profesión */}
            <div className={step === 2 ? "space-y-5" : "hidden"}>
              <div className="space-y-1.5">
                <label className={label}>Profesión u oficio</label>
                <input
                  name="profession"
                  value={data.profession}
                  onChange={(e) => set("profession", e.target.value)}
                  className={input}
                  placeholder="Ej: Arquitecto"
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Titular / especialidad</label>
                <input
                  name="headline"
                  value={data.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  className={input}
                  placeholder="Ej: Diseño de viviendas modernas"
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Experiencia</label>
                <input
                  name="experience"
                  value={data.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  className={input}
                  placeholder="Ej: 8 años en proyectos residenciales"
                />
              </div>
            </div>

            {/* Paso 3: categorías + idiomas + habilidades */}
            <div className={step === 3 ? "space-y-5" : "hidden"}>
              <div className="space-y-2">
                <label className={label}>Categorías (elige las que apliquen)</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(({ label: cat }) => {
                    const active = categories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                          active
                            ? "border-green bg-green text-white"
                            : "border-[var(--line-strong)] text-ink-soft hover:bg-paper"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="categories" value={categories.join(",")} />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Idiomas (separados por coma)</label>
                <input
                  name="languages"
                  value={data.languages}
                  onChange={(e) => set("languages", e.target.value)}
                  className={input}
                  placeholder="Español, Inglés"
                />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Habilidades (separadas por coma)</label>
                <input
                  name="skills"
                  value={data.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  className={input}
                  placeholder="AutoCAD, Revit, SketchUp"
                />
              </div>
            </div>

            {/* Paso 4: bio */}
            <div className={step === 4 ? "space-y-5" : "hidden"}>
              <div className="space-y-1.5">
                <label className={label}>Sobre ti</label>
                <textarea
                  name="bio"
                  value={data.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  className={`${input} min-h-36`}
                  placeholder="Cuéntales a tus clientes quién eres, qué ofreces y por qué confiar en ti..."
                />
              </div>
            </div>

            {/* Paso 5: resumen */}
            <div className={step === 5 ? "" : "hidden"}>
              <div className="rounded-card border border-[var(--line)] bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-lg font-bold text-white">
                    {data.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (data.full_name || "?").slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-ink">
                      {data.full_name || "Tu nombre"}
                    </p>
                    <p className="text-sm text-ink-mute">
                      {data.headline || data.profession || "Tu profesión"}
                    </p>
                  </div>
                </div>
                {categories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <span key={c} className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-green-deep">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {data.bio && <p className="mt-4 text-sm text-ink-soft">{data.bio}</p>}
              </div>
              <p className="mt-4 text-center text-sm text-ink-mute">
                Al finalizar te llevaremos a publicar tu primer servicio.
              </p>
            </div>

            {/* Navegación */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper-2 ${
                  step === 1 ? "invisible" : ""
                }`}
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>

              {step < TOTAL ? (
                <button
                  type="button"
                  onClick={() => !blocked && setStep((s) => s + 1)}
                  disabled={blocked}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep disabled:opacity-50"
                >
                  Siguiente <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-105"
                >
                  <Check className="h-4 w-4" /> Crear mi perfil
                </button>
              )}
            </div>
          </form>

          {/* Botón para reintentar importación desde el paso 1 */}
          {step === 1 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="mx-auto mt-6 flex items-center gap-1.5 text-sm font-medium text-green transition hover:underline disabled:opacity-60"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? "Leyendo CV..." : "Importar desde un CV"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
