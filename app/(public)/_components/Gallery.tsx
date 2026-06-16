"use client";

import { useState } from "react";

/** Visor de galería: imagen principal + miniaturas clicables. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safe = images.filter(Boolean);
  if (safe.length === 0) return null;

  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-card border border-[var(--line)] bg-mint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={safe[active]} alt={alt} className="h-full w-full object-cover" />
      </div>

      {safe.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {safe.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-green" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
