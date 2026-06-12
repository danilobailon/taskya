import { NextResponse } from "next/server";
import { z } from "zod";
import { resend, NOTIFY_EMAIL, FROM_EMAIL } from "@/lib/email";
import { createServiceClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  type: z.enum(["cliente", "profesional"]),
  nombre: z.string().min(1).max(120),
  whatsapp: z.string().min(5).max(40),
  ciudad: z.string().max(80).optional().default(""),
  categoria: z.string().max(120).optional().default(""),
  profesion: z.string().max(120).optional().default(""),
  detalle: z.string().max(2000).optional().default(""),
  experiencia: z.string().max(120).optional().default(""),
  portafolio: z.string().max(300).optional().default(""),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });
  }
  const d = parsed.data;
  const esCliente = d.type === "cliente";

  // 1) Guardar en Supabase (si está configurado)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createServiceClient();
      await supabase.from("leads").insert({
        type: d.type,
        name: d.nombre,
        whatsapp: d.whatsapp,
        city: d.ciudad || null,
        category: esCliente ? d.categoria || null : d.profesion || null,
        detail: d.detalle || null,
        portfolio: d.portafolio || null,
      });
    } catch {
      /* no bloquear el flujo si la BD aún no existe */
    }
  }

  // 2) Notificar por correo (si Resend está configurado)
  if (process.env.RESEND_API_KEY) {
    const filas = esCliente
      ? [
          ["Tipo", "Cliente busca servicio"],
          ["Nombre", d.nombre],
          ["WhatsApp", d.whatsapp],
          ["Ciudad", d.ciudad],
          ["Categoría", d.categoria],
          ["Detalle", d.detalle],
        ]
      : [
          ["Tipo", "Profesional se inscribe"],
          ["Nombre", d.nombre],
          ["Profesión", d.profesion],
          ["Ciudad", d.ciudad],
          ["WhatsApp", d.whatsapp],
          ["Experiencia", d.experiencia],
          ["Portafolio", d.portafolio],
        ];

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px">
        <h2 style="color:#1E3A5F;margin:0 0 4px">Nuevo lead en TaskYa</h2>
        <p style="color:#6E7A74;margin:0 0 16px">${esCliente ? "Un cliente busca un servicio." : "Un profesional quiere inscribirse."}</p>
        <table style="width:100%;border-collapse:collapse">
          ${filas
            .filter(([, v]) => v)
            .map(
              ([k, v]) =>
                `<tr><td style="padding:8px 0;color:#6E7A74;width:120px;vertical-align:top">${k}</td><td style="padding:8px 0;color:#0F1D17;font-weight:600">${v}</td></tr>`,
            )
            .join("")}
        </table>
      </div>`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        subject: `Nuevo lead TaskYa (${esCliente ? "Cliente" : "Profesional"}): ${d.nombre}`,
        html,
      });
    } catch {
      /* no bloquear si el correo falla */
    }
  }

  return NextResponse.json({ ok: true });
}
