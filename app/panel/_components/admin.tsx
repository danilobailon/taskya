import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "./ui";

/** Verifica que el usuario sea admin. Devuelve true/false. */
export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

/** Pantalla de "no autorizado" para secciones admin. */
export function NotAuthorized({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Administración" title={title} />
      <EmptyState
        icon={ShieldAlert}
        title="Acceso restringido"
        description="Esta sección es solo para administradores de TaskYa."
      />
    </div>
  );
}
