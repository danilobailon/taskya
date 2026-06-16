"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const full_name = String(formData.get("full_name") || "");
  const role = String(formData.get("role") || "cliente");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }
  // Si la confirmación por correo está activada, no hay sesión todavía:
  // mostramos la pantalla de "revisa tu correo".
  if (!data.session) {
    redirect(`/registro?check=${encodeURIComponent(email)}`);
  }
  // Los profesionales pasan por el onboarding para armar su perfil.
  redirect(role === "profesional" ? "/onboarding" : "/panel");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Correo o contraseña incorrectos")}`);
  }
  const dest = String(formData.get("redirect") || "");
  if (dest.startsWith("/")) redirect(dest);

  // Profesional sin ficha completa -> onboarding; el resto -> panel.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "profesional") {
      const { data: pro } = await supabase
        .from("professionals")
        .select("profession")
        .eq("id", user.id)
        .maybeSingle();
      if (!pro?.profession) redirect("/onboarding");
    }
  }
  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
