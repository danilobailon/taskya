"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Sube imágenes a Supabase Storage (bucket "media", carpeta del usuario) y
 * deja las URL públicas en inputs ocultos para enviarlas con el formulario.
 *
 * - single: una sola imagen (avatar, portada).
 * - multiple: varias (galería, portafolio).
 */
export function ImageUploader({
  name,
  userId,
  folder,
  multiple = false,
  defaultUrls = [],
  shape = "wide",
  max = 8,
  hint,
}: {
  name: string;
  userId: string;
  folder: string;
  multiple?: boolean;
  defaultUrls?: string[];
  shape?: "wide" | "square" | "avatar";
  max?: number;
  hint?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultUrls.filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setErr(null);
    setBusy(true);
    try {
      const next: string[] = [];
      for (const file of files) {
        if (!multiple && urls.length + next.length >= 1) break;
        if (urls.length + next.length >= max) break;
        if (!file.type.startsWith("image/")) {
          setErr("Solo se permiten imágenes.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErr("Cada imagen debe pesar menos de 5 MB.");
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          setErr("No se pudo subir la imagen. Intenta de nuevo.");
          continue;
        }
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        next.push(data.publicUrl);
      }
      setUrls((prev) => (multiple ? [...prev, ...next] : next.slice(0, 1)));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  const canAddMore = multiple ? urls.length < max : urls.length < 1;
  const previewClass =
    shape === "avatar"
      ? "h-24 w-24 rounded-full"
      : shape === "square"
        ? "aspect-square w-full rounded-xl"
        : "aspect-video w-full rounded-xl";

  return (
    <div>
      {/* inputs ocultos con las URL (uno por imagen) */}
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}

      <div
        className={
          multiple
            ? "grid grid-cols-3 gap-3 sm:grid-cols-4"
            : shape === "avatar"
              ? "flex items-center gap-4"
              : ""
        }
      >
        {urls.map((u) => (
          <div key={u} className={`group relative overflow-hidden border border-[var(--line)] ${previewClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(u)}
              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Quitar imagen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={`grid place-items-center border border-dashed border-[var(--line-strong)] bg-paper text-ink-mute transition hover:border-green hover:text-green disabled:opacity-60 ${previewClass}`}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs font-medium">
                <ImagePlus className="h-5 w-5" />
                Subir
              </span>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={onPick}
        className="hidden"
      />

      {hint && <p className="mt-2 text-xs text-ink-mute">{hint}</p>}
      {err && <p className="mt-2 text-xs font-medium text-red-600">{err}</p>}
    </div>
  );
}
