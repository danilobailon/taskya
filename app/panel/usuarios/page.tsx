import { createServiceClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "../_components/ui";
import { isAdmin, NotAuthorized } from "../_components/admin";

const roleStyle: Record<string, string> = {
  cliente: "bg-mint text-green-deep",
  profesional: "bg-amber-bg text-amber",
  admin: "bg-ink text-white",
};

export default async function UsuariosPage() {
  if (!(await isAdmin())) return <NotAuthorized title="Usuarios" />;

  const supabase = createServiceClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, city, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        subtitle={`${users?.length ?? 0} usuarios registrados`}
      />

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-ink-mute">
              <th className="px-5 py-3 font-semibold">Nombre</th>
              <th className="px-5 py-3 font-semibold">Rol</th>
              <th className="px-5 py-3 font-semibold">Ciudad</th>
              <th className="px-5 py-3 font-semibold">Registro</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr
                key={u.id}
                className="border-b border-[var(--line)] last:border-0"
              >
                <td className="px-5 py-3 font-medium text-ink">
                  {u.full_name || "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleStyle[u.role] ?? ""}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-soft">{u.city || "—"}</td>
                <td className="px-5 py-3 text-ink-mute">
                  {new Date(u.created_at).toLocaleDateString("es-EC")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
