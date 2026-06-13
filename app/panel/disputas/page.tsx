import { ShieldCheck } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { PageHeader, EmptyState, Card, StatusBadge } from "../_components/ui";
import { isAdmin, NotAuthorized } from "../_components/admin";

export default async function DisputasPage() {
  if (!(await isAdmin())) return <NotAuthorized title="Disputas" />;

  const supabase = createServiceClient();
  const { data: disputes } = await supabase
    .from("contracts")
    .select("id, title, amount, status, created_at")
    .eq("status", "disputa")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Administración"
        title="Disputas"
        subtitle="Casos donde una de las partes abrió un reclamo. El pago queda retenido."
      />

      {!disputes || disputes.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No hay disputas abiertas"
          description="Todo en orden. Cuando se abra un reclamo, aparecerá aquí para mediar."
        />
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d.id} className="flex items-center gap-4 !p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-100 text-lg">
                ⚠️
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{d.title}</p>
                <p className="text-sm text-ink-mute">
                  {new Date(d.created_at).toLocaleDateString("es-EC")}
                </p>
              </div>
              <StatusBadge status={d.status} />
              <p className="font-display text-lg font-bold text-ink">
                {formatUSD(Number(d.amount))}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
