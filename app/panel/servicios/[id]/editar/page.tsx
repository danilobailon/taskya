import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "../../../_components/ui";
import { ServiceForm } from "../../_components/ServiceForm";
import { updateService } from "../../actions";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (!service) notFound();
  if (service.professional_id !== user.id) redirect("/panel/servicios");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/panel/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis servicios
      </Link>

      <PageHeader
        eyebrow="Editar servicio"
        title="Edita tu servicio"
        subtitle="Actualiza la información, las imágenes o el precio."
      />

      <ServiceForm
        action={updateService}
        userId={user.id}
        service={{
          id: service.id,
          title: service.title,
          category: service.category,
          city: service.city,
          description: service.description,
          includes: service.includes,
          price: Number(service.price),
          delivery_days: service.delivery_days,
          revisions: service.revisions,
          cover_url: service.cover_url,
          gallery_urls: service.gallery_urls,
        }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
