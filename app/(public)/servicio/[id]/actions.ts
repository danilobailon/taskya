"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { commission } from "@/lib/utils";

export async function contratar(formData: FormData) {
  const serviceId = String(formData.get("serviceId"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/servicio/${serviceId}`);

  const { data: service } = await supabase
    .from("services")
    .select("id, professional_id, title, price, status")
    .eq("id", serviceId)
    .single();

  if (!service || service.status !== "activo") {
    redirect(`/servicio/${serviceId}?error=nodisponible`);
  }
  // No puedes contratarte a ti mismo
  if (service.professional_id === user.id) {
    redirect(`/servicio/${serviceId}?error=propio`);
  }

  const amount = Number(service.price);
  const { data: contract } = await supabase
    .from("contracts")
    .insert({
      client_id: user.id,
      professional_id: service.professional_id,
      service_id: service.id,
      title: service.title,
      amount,
      commission: commission(amount),
      status: "solicitado",
    })
    .select("id")
    .single();

  redirect(`/panel/contrato/${contract?.id}`);
}
