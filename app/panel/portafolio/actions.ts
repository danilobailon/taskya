"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addPortfolioItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const image_url = String(formData.get("image_url") || "");
  if (!image_url) {
    redirect("/panel/portafolio?error=imagen");
  }

  await supabase.from("portfolio_items").insert({
    professional_id: user.id,
    title: String(formData.get("title") || "") || null,
    description: String(formData.get("description") || "") || null,
    image_url,
  });

  revalidatePath("/panel/portafolio");
  revalidatePath(`/profesional/${user.id}`);
  redirect("/panel/portafolio?ok=1");
}

export async function deletePortfolioItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id"));
  await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", id)
    .eq("professional_id", user.id);

  revalidatePath("/panel/portafolio");
  revalidatePath(`/profesional/${user.id}`);
}
