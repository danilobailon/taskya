import { Wallet, TrendingUp, Briefcase, Users } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { PageHeader, Card } from "../_components/ui";
import { isAdmin, NotAuthorized } from "../_components/admin";

export default async function FinanzasPage() {
  if (!(await isAdmin())) return <NotAuthorized title="Finanzas" />;

  const supabase = createServiceClient();
  const [{ data: contracts }, { count: usersCount }, { count: leadsCount }] =
    await Promise.all([
      supabase.from("contracts").select("amount, commission, status"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
    ]);

  const completed = (contracts ?? []).filter((c) => c.status === "completado");
  const gmv = completed.reduce((a, c) => a + Number(c.amount), 0);
  const revenue = completed.reduce((a, c) => a + Number(c.commission), 0);

  const stats = [
    { icon: TrendingUp, label: "Comisión TaskYa (15%)", value: formatUSD(revenue), tint: "var(--mint)" },
    { icon: Wallet, label: "Volumen transado (GMV)", value: formatUSD(gmv), tint: "var(--amber-bg)" },
    { icon: Briefcase, label: "Contratos completados", value: String(completed.length), tint: "#E5EDFF" },
    { icon: Users, label: "Usuarios · Leads", value: `${usersCount ?? 0} · ${leadsCount ?? 0}`, tint: "#F3F0FF" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Administración"
        title="Finanzas"
        subtitle="Resumen de ingresos por comisión y actividad de la plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <span
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{ background: s.tint }}
            >
              <s.icon className="h-5 w-5 text-green" />
            </span>
            <p className="mt-4 font-display text-2xl font-bold text-ink">
              {s.value}
            </p>
            <p className="text-sm text-ink-mute">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink">
          ¿Cómo se calcula?
        </h2>
        <p className="mt-2 text-sm text-ink-mute">
          TaskYa cobra el <strong className="text-ink">15%</strong> sobre cada
          contrato completado. La comisión solo se contabiliza cuando el cliente
          confirma la entrega y el pago se libera.
        </p>
      </Card>
    </div>
  );
}
