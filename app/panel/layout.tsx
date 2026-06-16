import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";
import SidebarNav, { type NavItem } from "./_components/SidebarNav";

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  cliente: [
    { href: "/panel", label: "Resumen", icon: "dashboard" },
    { href: "/servicios", label: "Buscar servicios", icon: "search" },
    { href: "/panel/contrataciones", label: "Mis contrataciones", icon: "briefcase" },
    { href: "/panel/mensajes", label: "Mensajes", icon: "message" },
    { href: "/panel/perfil", label: "Mi perfil", icon: "settings" },
  ],
  profesional: [
    { href: "/panel", label: "Resumen", icon: "dashboard" },
    { href: "/panel/servicios", label: "Mis servicios", icon: "briefcase" },
    { href: "/panel/portafolio", label: "Portafolio", icon: "image" },
    { href: "/panel/contratos", label: "Contratos", icon: "wallet" },
    { href: "/panel/mensajes", label: "Mensajes", icon: "message" },
    { href: "/panel/reputacion", label: "Reputación", icon: "star" },
    { href: "/panel/perfil", label: "Mi perfil", icon: "settings" },
  ],
  admin: [
    { href: "/panel", label: "Resumen", icon: "dashboard" },
    { href: "/panel/usuarios", label: "Usuarios", icon: "users" },
    { href: "/panel/servicios", label: "Servicios", icon: "briefcase" },
    { href: "/panel/finanzas", label: "Finanzas", icon: "wallet" },
    { href: "/panel/disputas", label: "Disputas", icon: "shield" },
  ],
};

function supabaseReady() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El panel necesita Supabase. Mientras no esté configurado, mostramos guía.
  if (!supabaseReady()) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <div className="max-w-md rounded-3xl border border-[var(--line)] bg-white p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-bg text-2xl">
            🔌
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">
            Conecta Supabase
          </h1>
          <p className="mt-2 text-sm text-ink-mute">
            El panel de control necesita las credenciales de Supabase. Agrega{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            y{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            en tu archivo{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            y reinicia el servidor.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "cliente";
  const name = profile?.full_name ?? user.email ?? "Usuario";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  const items = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.cliente;

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-[var(--line)] bg-white p-5">
        <Link href="/" className="flex items-center gap-2 px-2 text-xl font-bold font-display">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-green text-white text-base font-black">
            T
          </span>
          Task<span className="text-amber">Ya</span>
        </Link>

        <div className="mt-7 flex-1">
          <p className="px-3.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
            Menú
          </p>
          <SidebarNav items={items} />
        </div>

        <div className="mt-auto rounded-2xl border border-[var(--line)] bg-paper p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green text-sm font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              <p className="text-xs capitalize text-ink-mute">{role}</p>
            </div>
          </div>
          <form action={signOut}>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line-strong)] py-2 text-sm font-medium text-ink-soft transition hover:bg-white">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <main className="p-6 sm:p-10">{children}</main>
    </div>
  );
}
