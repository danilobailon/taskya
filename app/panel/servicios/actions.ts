"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const includes = String(formData.get("includes") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await supabase.from("services").insert({
    professional_id: user.id,
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || ""),
    description: String(formData.get("description") || ""),
    includes,
    price: parseFloat(String(formData.get("price") || "0")) || 0,
    delivery_days:
      parseInt(String(formData.get("delivery_days") || ""), 10) || null,
    city: String(formData.get("city") || "") || null,
    status: "activo",
  });

  revalidatePath("/panel/servicios");
  redirect("/panel/servicios?ok=1");
}

export async function toggleService(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const next = String(formData.get("next"));
  await supabase.from("services").update({ status: next }).eq("id", id);
  revalidatePath("/panel/servicios");
}
