import Link from "next/link";
import { Wallet, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { PageHeader, EmptyState, Card, StatusBadge, ButtonLink } from "../_components/ui";

export default async function ContratosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("professional_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Trabajo"
        title="Contratos"
        subtitle="Los trabajos que te han contratado y su estado."
      />

      {!contracts || contracts.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aún no tienes contratos"
          description="Cuando un cliente contrate uno de tus servicios, aparecerá aquí para gestionarlo."
          action={
            <ButtonLink href="/panel/servicios" variant="amber">
              Ver mis servicios
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <Link key={c.id} href={`/panel/contrato/${c.id}`} className="block">
            <Card className="flex items-center gap-4 !p-4 transition hover:border-mint-2">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint">
                <Wallet className="h-5 w-5 text-green" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{c.title}</p>
                <p className="text-sm text-ink-mute">
                  Tú recibes {formatUSD(Number(c.amount) - Number(c.commission))}
                </p>
              </div>
              <StatusBadge status={c.status} />
              <p className="font-display text-lg font-bold text-ink">
                {formatUSD(Number(c.amount))}
              </p>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
