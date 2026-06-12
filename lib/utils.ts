import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como dólares (Ecuador). */
export function formatUSD(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Comisión de TaskYa sobre el valor de un servicio. */
export const COMMISSION_RATE = 0.15;

export function commission(amount: number) {
  return Math.round(amount * COMMISSION_RATE * 100) / 100;
}
