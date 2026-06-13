import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Card } from "../_components/ui";

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, title, status, client_id, professional_id")
    .or(`client_id.eq.${user!.id},professional_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Conversaciones"
        title="Mensajes"
        subtitle="Coordina los detalles con la otra parte, dentro de la plataforma."
      />

      {!contracts || contracts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin conversaciones aún"
          description="El chat se habilita cuando hay una contratación en curso, para que todo quede registrado y seguro."
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <Card
              key={c.id}
              className="flex items-center gap-4 !p-4 transition hover:border-mint-2"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint">
                <MessageSquare className="h-5 w-5 text-green" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{c.title}</p>
                <p className="text-sm text-ink-mute">Toca para abrir el chat</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
