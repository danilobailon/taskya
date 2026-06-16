import { Wallet, TrendingUp, Briefcase, Lock } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { PageHeader, Card } from "../_components/ui";
import { isAdmin, NotAuthorized } from "../_components/admin";
import { markPaid, markReleased } from "./actions";

const PAY = {
  pendiente: { label: "Pendiente", cls: "bg-amber-bg text-amber" },
  pagado: { label: "En custodia", cls: "bg-mint text-green-deep" },
  liberado: { label: "Liberado", cls: "bg-green text-white" },
  reembolsado: { label: "Reembolsado", cls: "bg-paper-2 text-ink-mute" },
} as const;

export default async function FinanzasPage() {
  if (!(await isAdmin())) return <NotAuthorized title="Finanzas" />;

  const supabase = createServiceClient();
  const [{ data: contracts }, { count: usersCount }] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, title, amount, commission, status, payment_status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const rows = contracts ?? [];
  const completed = rows.filter((c) => c.status === "completado");
  const gmv = completed.reduce((a, c) => a + Number(c.amount), 0);
  const revenue = completed.reduce((a, c) => a + Number(c.commission), 0);
  const custodia = rows
    .filter((c) => c.payment_status === "pagado")
    .reduce((a, c) => a + Number(c.amount), 0);

  const stats = [
    { icon: TrendingUp, label: "Comisión TaskYa (15%)", value: formatUSD(revenue), tint: "var(--mint)" },
    { icon: Wallet, label: "Volumen transado (GMV)", value: formatUSD(gmv), tint: "var(--amber-bg)" },
    { icon: Lock, label: "En custodia", value: formatUSD(custodia), tint: "#E5EDFF" },
    { icon: Briefcase, label: "Contratos · Usuarios", value: `${rows.length} · ${usersCount ?? 0}`, tint: "#F3F0FF" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Administración"
        title="Finanzas"
        subtitle="Ingresos por comisión, custodia y registro manual de pagos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: s.tint }}>
              <s.icon className="h-5 w-5 text-green" />
            </span>
            <p className="mt-4 font-display text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-ink-mute">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Registro manual de pagos */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="font-display text-lg font-bold text-ink">Pagos (registro manual)</h2>
          <p className="mt-1 text-sm text-ink-mute">
            Marca cuándo el cliente pagó (queda en custodia) y cuándo se liberó al
            profesional. Esto es el puente hasta integrar PayPhone.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="p-5 text-sm text-ink-mute">Aún no hay contratos.</p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {rows.slice(0, 40).map((c) => {
              const pay = PAY[(c.payment_status as keyof typeof PAY) ?? "pendiente"] ?? PAY.pendiente;
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{c.title}</p>
                    <p className="text-xs text-ink-mute">
                      {formatUSD(Number(c.amount))} · contrato {c.status.replace("_", " ")}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pay.cls}`}>
                    {pay.label}
                  </span>

                  {c.payment_status === "pendiente" && (
                    <form action={markPaid} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        name="ref"
                        placeholder="Ref. (opcional)"
                        className="w-28 rounded-lg border border-[var(--line-strong)] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-green"
                      />
                      <button className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-deep">
                        Marcar pagado
                      </button>
                    </form>
                  )}
                  {c.payment_status === "pagado" && (
                    <form action={markReleased}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="rounded-full bg-amber px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:brightness-105">
                        Marcar liberado
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink">¿Cómo se calcula?</h2>
        <p className="mt-2 text-sm text-ink-mute">
          TaskYa cobra el <strong className="text-ink">15%</strong> sobre cada
          contrato completado. "En custodia" es el dinero recibido de clientes que
          aún no se ha liberado a profesionales.
        </p>
      </Card>
    </div>
  );
}
