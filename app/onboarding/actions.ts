"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const csv = (key: string) =>
    String(formData.get(key) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const full_name = String(formData.get("full_name") || "");
  const city = String(formData.get("city") || "") || null;
  const phone = String(formData.get("phone") || "") || null;
  const avatar_url = String(formData.get("avatar_url") || "") || null;

  await supabase
    .from("profiles")
    .update({ full_name, city, phone, avatar_url, role: "profesional" })
    .eq("id", user.id);

  await supabase.from("professionals").upsert({
    id: user.id,
    profession: String(formData.get("profession") || "Profesional"),
    headline: String(formData.get("headline") || ""),
    experience: String(formData.get("experience") || ""),
    bio: String(formData.get("bio") || ""),
    categories: csv("categories"),
    languages: csv("languages"),
    skills: csv("skills"),
  });

  // Tras crear su perfil, lo llevamos a publicar su primer servicio.
  redirect("/panel/servicios/nuevo?welcome=1");
}
