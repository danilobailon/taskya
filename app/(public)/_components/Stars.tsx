import { Star } from "lucide-react";

/** Muestra una valoración con estrellas ámbar y, opcionalmente, el conteo. */
export function Stars({
  value,
  count,
  size = 14,
  showvalue = true,
}: {
  value: number;
  count?: number;
  size?: number;
  showvalue?: boolean;
}) {
  const v = Math.round(value * 2) / 2; // medios incluidos
  return (
    <span className="inline-flex items-center gap-1 text-amber">
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = v - i >= 1;
          const half = !filled && v - i >= 0.5;
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className={
                filled
                  ? "fill-amber text-amber"
                  : half
                    ? "fill-amber/50 text-amber"
                    : "fill-transparent text-mint-2"
              }
            />
          );
        })}
      </span>
      {showvalue && value > 0 && (
        <span className="text-xs font-bold text-ink">{value.toFixed(1)}</span>
      )}
      {typeof count === "number" && count > 0 && (
        <span className="text-xs font-medium text-ink-mute">({count})</span>
      )}
    </span>
  );
}
