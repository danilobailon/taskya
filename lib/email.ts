import { Resend } from "resend";

// El valor de relleno evita que el SDK lance error al construirse durante el
// build cuando aún no hay key. El envío real está protegido en cada ruta por
// la verificación de `process.env.RESEND_API_KEY`.
export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_build_placeholder",
);

/** Correo de destino para notificaciones de leads/avisos internos. */
export const NOTIFY_EMAIL = process.env.LEAD_NOTIFY_EMAIL ?? "hola@taskya.ec";

/** Remitente verificado en Resend. */
export const FROM_EMAIL = process.env.RESEND_FROM ?? "TaskYa <onboarding@resend.dev>";
