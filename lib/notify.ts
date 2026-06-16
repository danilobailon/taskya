import { createServiceClient } from "@/lib/supabase/server";
import { resend, FROM_EMAIL } from "@/lib/email";

/** URL pública de la app (para los botones de los correos). */
const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://leonardo-proyecto-taskya.vercel.app";

/** Obtiene el correo y nombre de un usuario por su id (vía service role). */
async function userContact(
  userId: string,
): Promise<{ email: string; name: string } | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const admin = createServiceClient();
    const { data } = await admin.auth.admin.getUserById(userId);
    const u = data?.user;
    if (!u || !u.email) return null;
    const name = (u.user_metadata?.full_name as string | undefined) || u.email;
    return { email: u.email, name };
  } catch {
    return null;
  }
}

/** Devuelve la otra parte del contrato (la que NO realizó la acción). */
export function otherParty(
  contract: { client_id: string; professional_id: string },
  actingUserId: string,
): string {
  return actingUserId === contract.client_id
    ? contract.professional_id
    : contract.client_id;
}

/**
 * Envía un correo de aviso a un usuario. Nunca lanza error (best-effort):
 * si falta Resend, el usuario no tiene correo, o el envío falla, simplemente
 * no notifica y deja seguir el flujo.
 */
export async function notifyUser(
  userId: string,
  {
    subject,
    title,
    message,
    ctaLabel,
    ctaPath,
  }: {
    subject: string;
    title: string;
    message: string;
    ctaLabel?: string;
    ctaPath?: string;
  },
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const who = await userContact(userId);
  if (!who) return;

  const button =
    ctaLabel && ctaPath
      ? `<a href="${APP_URL}${ctaPath}" style="display:inline-block;margin-top:20px;background:#FF8A1E;color:#0F1B28;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">${ctaLabel}</a>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:8px">
      <div style="font-size:22px;font-weight:800;color:#1E3A5F;margin-bottom:18px">Task<span style="color:#FF8A1E">Ya</span></div>
      <h1 style="font-size:20px;color:#0F1B28;margin:0 0 10px">${title}</h1>
      <p style="color:#3A4655;font-size:15px;line-height:1.5;margin:0">${message}</p>
      ${button}
      <p style="color:#6B7682;font-size:12px;margin-top:28px">Recibes este correo porque tienes actividad en TaskYa, el marketplace de servicios profesionales del Ecuador.</p>
    </div>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: who.email,
      subject,
      html,
    });
  } catch {
    /* no bloquear el flujo si el correo falla */
  }
}
