"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

/**
 * Botón para autocompletar el formulario de perfil a partir de un CV o del
 * perfil de LinkedIn en PDF. Usa /api/parse-cv (Claude) y rellena los campos
 * del formulario por su `name` (los inputs son no controlados, así que basta
 * con asignar su .value y se enviarán al guardar).
 */
export function CvImporter() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  function setField(form: HTMLFormElement, name: string, value?: string) {
    if (!value) return;
    const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${name}"]`,
    );
    if (el) el.value = value;
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setErr(null);
    setDone(false);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || "No pudimos leer el archivo.");
        return;
      }
      const d = json.data ?? {};
      const form = rootRef.current?.closest("form");
      if (form) {
        setField(form, "full_name", d.full_name);
        setField(form, "city", d.city);
        setField(form, "profession", d.profession);
        setField(form, "experience", d.experience);
        setField(form, "headline", d.headline);
        setField(form, "bio", d.bio);
        setField(form, "categories", (d.categories ?? []).join(", "));
        setField(form, "languages", (d.languages ?? []).join(", "));
        setField(form, "skills", (d.skills ?? []).join(", "));
      }
      setDone(true);
    } catch {
      setErr("No pudimos leer el archivo. Intenta de nuevo.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-3 rounded-3xl border border-mint-2 bg-mint/40 p-5 sm:flex-row sm:items-center"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-green">
        <Sparkles className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-display text-base font-bold text-ink">
          Autocompletar con tu CV o LinkedIn
        </p>
        <p className="text-sm text-ink-mute">
          Sube tu CV (PDF) o tu perfil de LinkedIn exportado en PDF y rellenamos los
          campos por ti. Luego revisa y guarda.
        </p>
        {done && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-green-deep">
            <CheckCircle2 className="h-4 w-4" /> ¡Campos rellenados! Revisa y guarda
            los cambios.
          </p>
        )}
        {err && <p className="mt-1.5 text-sm font-medium text-red-600">{err}</p>}
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Leyendo...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Subir CV / PDF
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
