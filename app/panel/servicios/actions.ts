"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Lee los campos del formulario de servicio en un objeto listo para la BD. */
function readServiceFields(formData: FormData) {
  const includes = String(formData.get("includes") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const gallery_urls = formData
    .getAll("gallery_urls")
    .map((v) => String(v))
    .filter(Boolean);

  const cover_url = String(formData.get("cover_url") || "") || null;

  return {
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || ""),
    description: String(formData.get("description") || ""),
    includes,
    price: parseFloat(String(formData.get("price") || "0")) || 0,
    delivery_days: parseInt(String(formData.get("delivery_days") || ""), 10) || null,
    revisions: parseInt(String(formData.get("revisions") || ""), 10) || null,
    city: String(formData.get("city") || "") || null,
    cover_url,
    // La portada también encabeza la galería si no está ya incluida.
    gallery_urls:
      cover_url && !gallery_urls.includes(cover_url)
        ? [cover_url, ...gallery_urls]
        : gallery_urls,
  };
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Necesita ficha profesional (FK). Si no existe, lo mandamos a completarla.
  const { data: pro } = await supabase
    .from("professionals")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!pro) redirect("/panel/perfil");

  await supabase.from("services").insert({
    professional_id: user.id,
    ...readServiceFields(formData),
    status: "activo",
  });

  revalidatePath("/panel/servicios");
  redirect("/panel/servicios?ok=1");
}

export async function updateService(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id"));

  // RLS ya restringe al dueño, pero filtramos también por professional_id.
  await supabase
    .from("services")
    .update(readServiceFields(formData))
    .eq("id", id)
    .eq("professional_id", user.id);

  revalidatePath("/panel/servicios");
  revalidatePath(`/servicio/${id}`);
  redirect("/panel/servicios?ok=1");
}

export async function toggleService(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const next = String(formData.get("next"));
  await supabase.from("services").update({ status: next }).eq("id", id);
  revalidatePath("/panel/servicios");
}
