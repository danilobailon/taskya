import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Lee un CV (PDF o imagen) con Claude y devuelve los campos del perfil
 * profesional en JSON, para autocompletar el onboarding.
 */

// Esquema de salida estructurada: garantiza JSON válido y con esta forma.
const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    full_name: { type: "string" },
    profession: { type: "string" },
    headline: { type: "string" },
    experience: { type: "string" },
    bio: { type: "string" },
    city: { type: "string" },
    categories: { type: "array", items: { type: "string" } },
    skills: { type: "array", items: { type: "string" } },
    languages: { type: "array", items: { type: "string" } },
  },
  required: [
    "full_name",
    "profession",
    "headline",
    "experience",
    "bio",
    "city",
    "categories",
    "skills",
    "languages",
  ],
} as const;

const SYSTEM = `Eres un asistente que extrae información de un CV o perfil profesional
para una plataforma de servicios profesionales en Ecuador (estilo Fiverr).
Devuelve los datos en español. Reglas:
- full_name: nombre completo de la persona.
- profession: su profesión u oficio principal (ej: "Arquitecto", "Diseñador gráfico").
- headline: una frase corta y atractiva que resuma su especialidad.
- experience: resumen breve de años/experiencia (ej: "8 años en diseño de viviendas").
- bio: 2-4 frases en primera persona presentándose a posibles clientes.
- city: ciudad donde reside, si aparece.
- categories: 1-3 categorías de servicio relevantes.
- skills: lista de habilidades/herramientas (ej: AutoCAD, Photoshop).
- languages: idiomas que domina.
Si un dato no aparece en el documento, usa "" para textos o [] para listas. No inventes datos.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en el servidor." },
      { status: 503 },
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo debe pesar menos de 8 MB." }, { status: 400 });
  }

  const mediaType = file.type;
  const isPdf = mediaType === "application/pdf";
  const isImage = mediaType.startsWith("image/");
  if (!isPdf && !isImage) {
    return NextResponse.json(
      { error: "Sube un PDF o una imagen de tu CV." },
      { status: 400 },
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  // Bloque de documento (PDF) o imagen, según el tipo de archivo.
  const fileBlock = isPdf
    ? {
        type: "document" as const,
        source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: base64,
        },
      };

  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      // Haiku: más barato para la fase de pruebas. Para máxima calidad de
      // extracción, cambiar a "claude-opus-4-8".
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema } },
      messages: [
        {
          role: "user",
          content: [
            fileBlock,
            {
              type: "text",
              text: "Extrae los datos de este CV/perfil profesional siguiendo el esquema.",
            },
          ],
        },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      // Por si el modelo envuelve el JSON: extraemos el primer objeto {...}.
      const match = text.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : null;
    }

    if (!data) {
      return NextResponse.json(
        { error: "No pudimos leer el documento. Rellena tu perfil manualmente." },
        { status: 422 },
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error("parse-cv Anthropic error", err.status, err.message);
    } else {
      console.error("parse-cv error", err);
    }
    return NextResponse.json(
      { error: "Hubo un problema al leer el CV. Intenta de nuevo o rellena manualmente." },
      { status: 500 },
    );
  }
}
