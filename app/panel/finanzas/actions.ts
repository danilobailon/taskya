"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "../_components/admin";

/** Admin marca un contrato como pagado (dinero recibido, en custodia). */
export async function markPaid(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id"));
  const ref = String(formData.get("ref") || "") || null;
  const admin = createServiceClient();
  await admin
    .from("contracts")
    .update({
      payment_status: "pagado",
      payment_method: "manual",
      payment_ref: ref,
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/panel/finanzas");
  revalidatePath(`/panel/contrato/${id}`);
}

/** Admin marca el pago como liberado al profesional. */
export async function markReleased(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id"));
  const admin = createServiceClient();
  await admin
    .from("contracts")
    .update({
      payment_status: "liberado",
      released_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/panel/finanzas");
  revalidatePath(`/panel/contrato/${id}`);
}
