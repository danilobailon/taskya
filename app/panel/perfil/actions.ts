"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const full_name = String(formData.get("full_name") || "");
  const phone = String(formData.get("phone") || "");
  const city = String(formData.get("city") || "");

  await supabase
    .from("profiles")
    .update({ full_name, phone, city })
    .eq("id", user.id);

  // Si es profesional, guardamos/creamos su ficha profesional
  if (String(formData.get("role")) === "profesional") {
    const categories = String(formData.get("categories") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await supabase.from("professionals").upsert({
      id: user.id,
      profession: String(formData.get("profession") || "Profesional"),
      headline: String(formData.get("headline") || ""),
      bio: String(formData.get("bio") || ""),
      experience: String(formData.get("experience") || ""),
      portfolio_url: String(formData.get("portfolio_url") || ""),
      categories,
    });
  }

  revalidatePath("/panel/perfil");
  redirect("/panel/perfil?ok=1");
}
