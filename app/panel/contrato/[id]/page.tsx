import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatUSD, commission } from "@/lib/utils";
import { Card, StatusBadge } from "../../_components/ui";
import {
  acceptContract,
  deliverContract,
  confirmContract,
  cancelContract,
  sendMessage,
  leaveReview,
} from "./actions";

const STEPS = ["solicitado", "en_progreso", "entregado", "completado"];

export default async function ContratoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();
  if (!contract || !user) notFound();

  const isClient = contract.client_id === user.id;
  const isPro = contract.professional_id === user.id;
  if (!isClient && !isPro) notFound();

  const otherId = isClient ? contract.professional_id : contract.client_id;
  const [{ data: otherProfile }, { data: messages }, { data: review }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", otherId).single(),
      supabase
        .from("messages")
        .select("*")
        .eq("contract_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("reviews").select("*").eq("contract_id", id).maybeSingle(),
    ]);

  const status = contract.status as string;
  const amount = Number(contract.amount);
  const stepIdx = STEPS.indexOf(status);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={isClient ? "/panel/contrataciones" : "/panel/contratos"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {contract.title}
          </h1>
          <p className="mt-1 text-ink-mute">
            {isClient ? "Profesional" : "Cliente"}:{" "}
            <strong className="text-ink">
              {otherProfile?.full_name ?? "Usuario"}
            </strong>
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Línea de progreso */}
      {status !== "cancelado" && (
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i <= stepIdx
                    ? "bg-green text-white"
                    : "bg-paper-2 text-ink-mute"
                }`}
              >
                {i < stepIdx ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 rounded-full ${
                    i < stepIdx ? "bg-green" : "bg-paper-2"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* Columna principal: acciones + chat */}
        <div className="space-y-6">
          {/* Acciones según estado y rol */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">
              {status === "completado"
                ? "Trabajo completado"
                : status === "cancelado"
                  ? "Contrato cancelado"
                  : "Siguiente paso"}
            </h2>

            {status === "solicitado" && isPro && (
              <div className="flex gap-3">
                <form action={acceptContract}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep">
                    Aceptar trabajo
                  </button>
                </form>
                <form action={cancelContract}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper">
                    Rechazar
                  </button>
                </form>
              </div>
            )}
            {status === "solicitado" && isClient && (
              <p className="text-sm text-ink-mute">
                Esperando que el profesional acepte la solicitud.
              </p>
            )}

            {status === "en_progreso" && isPro && (
              <form action={deliverContract}>
                <input type="hidden" name="id" value={id} />
                <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep">
                  Marcar como entregado
                </button>
              </form>
            )}
            {status === "en_progreso" && isClient && (
              <p className="text-sm text-ink-mute">
                El profesional está trabajando en tu proyecto.
              </p>
            )}

            {status === "entregado" && isClient && (
              <div>
                <p className="mb-3 text-sm text-ink-mute">
                  Revisa la entrega. Al confirmar, se libera el pago al profesional.
                </p>
                <form action={confirmContract}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-105">
                    Confirmar entrega y liberar pago
                  </button>
                </form>
              </div>
            )}
            {status === "entregado" && isPro && (
              <p className="text-sm text-ink-mute">
                Entregado. Esperando que el cliente confirme.
              </p>
            )}

            {status === "completado" && (
              <p className="flex items-center gap-2 text-sm font-medium text-green-deep">
                <CheckCircle2 className="h-5 w-5 text-green" />
                Pago liberado. ¡Gracias por usar TaskYa!
              </p>
            )}
            {status === "cancelado" && (
              <p className="text-sm text-ink-mute">
                Este contrato fue cancelado.
              </p>
            )}

            {/* Cancelar disponible en estados intermedios */}
            {["en_progreso", "entregado"].includes(status) && (
              <form action={cancelContract} className="mt-4">
                <input type="hidden" name="id" value={id} />
                <button className="text-xs font-semibold text-ink-mute underline transition hover:text-ink">
                  Cancelar contrato
                </button>
              </form>
            )}
          </Card>

          {/* Valoración */}
          {status === "completado" && (
            <Card>
              <h2 className="mb-3 font-display text-lg font-bold text-ink">
                Valoración
              </h2>
              {review ? (
                <div>
                  <div className="flex items-center gap-0.5 text-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "fill-amber" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-ink-soft">{review.comment}</p>
                  )}
                </div>
              ) : isClient ? (
                <form action={leaveReview} className="space-y-3">
                  <input type="hidden" name="id" value={id} />
                  <div>
                    <label className="text-sm font-semibold text-ink-soft">
                      Calificación
                    </label>
                    <select
                      name="rating"
                      defaultValue="5"
                      className="mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 outline-none focus:border-green"
                    >
                      <option value="5">★★★★★ Excelente</option>
                      <option value="4">★★★★ Muy bueno</option>
                      <option value="3">★★★ Bueno</option>
                      <option value="2">★★ Regular</option>
                      <option value="1">★ Malo</option>
                    </select>
                  </div>
                  <textarea
                    name="comment"
                    placeholder="Cuenta cómo fue tu experiencia..."
                    className="min-h-20 w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2.5 outline-none focus:border-green"
                  />
                  <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-deep">
                    Enviar valoración
                  </button>
                </form>
              ) : (
                <p className="text-sm text-ink-mute">
                  Esperando la valoración del cliente.
                </p>
              )}
            </Card>
          )}

          {/* Chat */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Chat</h2>
            <div className="mb-4 max-h-80 space-y-2 overflow-y-auto">
              {!messages || messages.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-mute">
                  Aún no hay mensajes. ¡Saluda para coordinar los detalles!
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                          mine
                            ? "bg-green text-white"
                            : "bg-paper text-ink border border-[var(--line)]"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {!["completado", "cancelado"].includes(status) && (
              <form action={sendMessage} className="flex gap-2">
                <input type="hidden" name="id" value={id} />
                <input
                  name="body"
                  autoComplete="off"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-full border border-[var(--line-strong)] bg-white px-4 py-2.5 text-sm outline-none focus:border-green"
                />
                <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:bg-green-deep">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </Card>
        </div>

        {/* Resumen de pago */}
        <Card className="lg:sticky lg:top-6">
          <h2 className="font-display text-lg font-bold text-ink">Resumen</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-mute">Monto del servicio</span>
              <span className="font-semibold text-ink">{formatUSD(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-mute">Comisión TaskYa (15%)</span>
              <span className="font-semibold text-ink">
                {formatUSD(Number(contract.commission))}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--line)] pt-2">
              <span className="text-ink-mute">
                {isClient ? "Total a pagar" : "Tú recibes"}
              </span>
              <span className="font-display text-lg font-bold text-green">
                {isClient
                  ? formatUSD(amount)
                  : formatUSD(amount - Number(contract.commission))}
              </span>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-mute">
            <ShieldCheck className="h-4 w-4 text-green" />
            {status === "completado"
              ? "Pago liberado al profesional."
              : "El pago se mantiene en custodia hasta confirmar la entrega."}
          </p>
        </Card>
      </div>
    </div>
  );
}
