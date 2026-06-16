import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "../../_components/ui";
import { ServiceForm } from "../_components/ServiceForm";
import { createService } from "../actions";

export default async function NuevoServicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/panel/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis servicios
      </Link>

      <PageHeader
        eyebrow="Nuevo servicio"
        title="Publica un servicio"
        subtitle="Mientras más completo y con buenas imágenes, más clientes atraerás."
      />

      <ServiceForm action={createService} userId={user.id} submitLabel="Publicar servicio" />
    </div>
  );
}
