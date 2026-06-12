import Link from "next/link";
import { ShieldCheck, Star, Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      {/* Panel de marca */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-green via-green-deep to-green-dark p-12 text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,183,107,.45), transparent 70%)",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2 text-2xl font-bold font-display">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-green text-lg font-black">
            T
          </span>
          Task<span className="text-amber">Ya</span>
        </Link>

        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            El talento de Ecuador,
            <br />a un clic de distancia.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Únete a la comunidad de clientes y profesionales que ya trabajan con
            confianza, pagos protegidos y reputación transparente.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, t: "Identidad verificada" },
              { icon: Wallet, t: "Pago protegido en custodia" },
              { icon: Star, t: "Reputación 100% transparente" },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-amber-soft" />
                </span>
                <span className="text-white/90">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/50">
          © 2026 TaskYa · Un producto de Initec Studio
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
