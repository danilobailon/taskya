"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function getCtx(contractId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .single();
  if (!contract) redirect("/panel");

  const isClient = contract.client_id === user.id;
  const isPro = contract.professional_id === user.id;
  if (!isClient && !isPro) redirect("/panel");

  return { supabase, user, contract, isClient, isPro };
}

const refresh = (id: string) => revalidatePath(`/panel/contrato/${id}`);

/** Profesional acepta → en progreso */
export async function acceptContract(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase, contract, isPro } = await getCtx(id);
  if (isPro && contract.status === "solicitado") {
    await supabase.from("contracts").update({ status: "en_progreso" }).eq("id", id);
  }
  refresh(id);
}

/** Profesional marca como entregado */
export async function deliverContract(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase, contract, isPro } = await getCtx(id);
  if (isPro && contract.status === "en_progreso") {
    await supabase.from("contracts").update({ status: "entregado" }).eq("id", id);
  }
  refresh(id);
}

/** Cliente confirma la entrega → completado (libera pago + cuenta trabajo) */
export async function confirmContract(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase, contract, isClient } = await getCtx(id);
  if (isClient && contract.status === "entregado") {
    await supabase.from("contracts").update({ status: "completado" }).eq("id", id);
    // Efecto: sumar un trabajo completado al profesional (service role)
    const admin = createServiceClient();
    const { data: pro } = await admin
      .from("professionals")
      .select("jobs_done")
      .eq("id", contract.professional_id)
      .single();
    await admin
      .from("professionals")
      .update({ jobs_done: (pro?.jobs_done ?? 0) + 1 })
      .eq("id", contract.professional_id);
  }
  refresh(id);
}

/** Cualquiera de las partes cancela (si no está completado/cancelado) */
export async function cancelContract(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase, contract } = await getCtx(id);
  if (!["completado", "cancelado"].includes(contract.status)) {
    await supabase.from("contracts").update({ status: "cancelado" }).eq("id", id);
  }
  refresh(id);
}

/** Enviar mensaje en el chat del contrato */
export async function sendMessage(formData: FormData) {
  const id = String(formData.get("id"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const { supabase, user } = await getCtx(id);
  await supabase
    .from("messages")
    .insert({ contract_id: id, sender_id: user.id, body });
  refresh(id);
}

/** Cliente deja una valoración (solo si está completado) → recalcula rating */
export async function leaveReview(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase, user, contract, isClient } = await getCtx(id);
  if (!isClient || contract.status !== "completado") {
    refresh(id);
    return;
  }
  const rating = Math.min(5, Math.max(1, parseInt(String(formData.get("rating")), 10) || 5));
  const comment = String(formData.get("comment") || "");

  await supabase.from("reviews").insert({
    contract_id: id,
    client_id: user.id,
    professional_id: contract.professional_id,
    rating,
    comment,
  });

  // Recalcular promedio y conteo (service role)
  const admin = createServiceClient();
  const { data: rs } = await admin
    .from("reviews")
    .select("rating")
    .eq("professional_id", contract.professional_id);
  const count = rs?.length ?? 0;
  const avg = count ? rs!.reduce((a, r) => a + r.rating, 0) / count : 0;
  await admin
    .from("professionals")
    .update({ rating: Math.round(avg * 10) / 10, reviews_count: count })
    .eq("id", contract.professional_id);

  refresh(id);
}
