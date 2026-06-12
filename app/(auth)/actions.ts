"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const full_name = String(formData.get("full_name") || "");
  const role = String(formData.get("role") || "cliente");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/panel");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Correo o contraseña incorrectos")}`);
  }
  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
