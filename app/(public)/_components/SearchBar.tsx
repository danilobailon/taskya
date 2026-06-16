"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/** Buscador del marketplace. Envía a /servicios?q=... */
export function SearchBar({
  defaultValue = "",
  size = "md",
  placeholder = "¿Qué servicio necesitas? Ej: logo, electricista, abogado...",
}: {
  defaultValue?: string;
  size?: "md" | "lg";
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  const lg = size === "lg";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`/servicios${params}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white p-1.5 shadow-[var(--shadow-md)] ${
        lg ? "pl-5" : "pl-4"
      }`}
    >
      <Search className={`shrink-0 text-ink-mute ${lg ? "h-5 w-5" : "h-4 w-4"}`} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-mute ${
          lg ? "py-2 text-base" : "py-1.5 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-amber font-semibold text-ink transition hover:brightness-105 ${
          lg ? "px-6 py-2.5 text-base" : "px-5 py-2 text-sm"
        }`}
      >
        Buscar
      </button>
    </form>
  );
}
