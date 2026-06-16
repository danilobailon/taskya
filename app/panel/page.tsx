import Link from "next/link";
import {
  Briefcase,
  Wallet,
  Star,
  MessageSquare,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <span
        className="grid h-11 w-11 place-items-center rounded-xl"
        style={{ background: tint }}
      >
        <Icon className="h-5 w-5 text-green" />
      </span>
      <p className="mt-4 font-display text-3xl font-bold text-ink">{value}</p>
      <p className="text-sm text-ink-mute">{label}</p>
    </div>
  );
}

export default async function PanelHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const role = profile?.role ?? "cliente";
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "👋";
  const esPro = role === "profesional";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green">
          Tu panel
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">
          Hola, {firstName}
        </h1>
        <p className="mt-1 text-ink-mute">
          {esPro
            ? "Aquí gestionas tus servicios, contratos y reputación."
            : "Aquí gestionas tus contrataciones y encuentras profesionales."}
        </p>
      </header>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {esPro ? (
          <>
            <StatCard icon={Briefcase} label="Servicios activos" value="0" tint="var(--mint)" />
            <StatCard icon={Wallet} label="Contratos en curso" value="0" tint="var(--amber-bg)" />
            <StatCard icon={Star} label="Calificación" value="—" tint="#E5EDFF" />
            <StatCard icon={MessageSquare} label="Mensajes" value="0" tint="#F3F0FF" />
          </>
        ) : (
          <>
            <StatCard icon={Briefcase} label="Contrataciones activas" value="0" tint="var(--mint)" />
            <StatCard icon={Wallet} label="En custodia" value="$0" tint="var(--amber-bg)" />
            <StatCard icon={Star} label="Favoritos" value="0" tint="#E5EDFF" />
            <StatCard icon={MessageSquare} label="Mensajes" value="0" tint="#F3F0FF" />
          </>
        )}
      </div>

      {/* Acción principal */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green to-green-dark p-7 text-white lg:col-span-2">
          <h2 className="font-display text-2xl font-bold">
            {esPro ? "Publica tu primer servicio" : "Encuentra al profesional ideal"}
          </h2>
          <p className="mt-2 max-w-md text-white/70">
            {esPro
              ? "Crea tu catálogo para empezar a recibir contrataciones. Sin cuota mensual: solo pagas el 15% cuando cobras."
              : "Explora el catálogo, compara perfiles y contrata con pago protegido."}
          </p>
          <Link
            href={esPro ? "/panel/servicios" : "/servicios"}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-3 font-semibold text-ink transition hover:brightness-105"
          >
            {esPro ? <Plus className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            {esPro ? "Crear servicio" : "Buscar servicios"}
          </Link>
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white p-7">
          <h3 className="font-display text-lg font-bold text-ink">
            Completa tu perfil
          </h3>
          <p className="mt-1 text-sm text-ink-mute">
            Un perfil completo genera más confianza y mejores resultados.
          </p>
          <Link
            href="/panel/perfil"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:gap-2.5 transition-all"
          >
            Ir a mi perfil <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Estado vacío de actividad */}
      <div className="mt-8 rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/50 p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint">
          <Briefcase className="h-6 w-6 text-green" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-ink">
          Aún no tienes actividad
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-mute">
          {esPro
            ? "Cuando recibas tu primer contrato, aparecerá aquí con su estado y chat."
            : "Cuando contrates tu primer servicio, lo verás aquí con seguimiento en tiempo real."}
        </p>
      </div>
    </div>
  );
}
