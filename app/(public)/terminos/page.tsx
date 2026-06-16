import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — TaskYa",
};

const updated = "16 de junio de 2026";

export default function TerminosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
        Términos y Condiciones
      </h1>
      <p className="mt-2 text-sm text-ink-mute">Última actualización: {updated}</p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink-soft [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
        <section className="space-y-2">
          <h2>1. Qué es TaskYa</h2>
          <p>
            TaskYa es un marketplace que conecta a clientes con profesionales
            independientes en Ecuador. TaskYa es un producto de <strong>Initec
            Studio</strong> y actúa únicamente como <strong>intermediario</strong>:
            no presta directamente los servicios publicados ni es empleador de los
            profesionales.
          </p>
        </section>

        <section className="space-y-2">
          <h2>2. Cuentas</h2>
          <p>
            Para contratar o publicar servicios debes crear una cuenta con
            información veraz y mantenerla actualizada. Eres responsable de la
            actividad realizada desde tu cuenta. Debes ser mayor de edad.
          </p>
        </section>

        <section className="space-y-2">
          <h2>3. Para profesionales</h2>
          <p>
            Como profesional, eres responsable de la calidad, legalidad y
            cumplimiento de los servicios que ofreces, así como de las
            obligaciones tributarias que correspondan. La información de tu perfil
            y servicios debe ser real y no engañosa.
          </p>
        </section>

        <section className="space-y-2">
          <h2>4. Para clientes</h2>
          <p>
            Al contratar un servicio aceptas su alcance, precio y plazo según lo
            publicado y acordado en el chat del contrato. El pago se realiza a
            través de TaskYa y se mantiene en custodia hasta que confirmes la
            entrega.
          </p>
        </section>

        <section className="space-y-2">
          <h2>5. Pagos, custodia y comisión</h2>
          <p>
            El cliente paga el valor del servicio a TaskYa, que lo mantiene en
            <strong> custodia</strong>. Al confirmarse la entrega, TaskYa libera el
            pago al profesional <strong>descontando una comisión del 15%</strong>
            sobre el valor del trabajo. Los precios se expresan en dólares de los
            Estados Unidos (USD).
          </p>
        </section>

        <section className="space-y-2">
          <h2>6. Cancelaciones y disputas</h2>
          <p>
            Cualquiera de las partes puede cancelar un contrato antes de que sea
            confirmado, según el estado en que se encuentre. En caso de desacuerdo,
            las partes pueden abrir una disputa y TaskYa podrá mediar de buena fe
            para alcanzar una solución razonable.
          </p>
        </section>

        <section className="space-y-2">
          <h2>7. Conducta prohibida</h2>
          <p>
            No está permitido publicar contenido ilegal, fraudulento u ofensivo,
            suplantar identidades, ni intentar evadir la plataforma para no pagar la
            comisión correspondiente. TaskYa puede suspender cuentas que incumplan
            estos términos.
          </p>
        </section>

        <section className="space-y-2">
          <h2>8. Limitación de responsabilidad</h2>
          <p>
            TaskYa no garantiza resultados específicos de los servicios contratados
            entre usuarios. Nuestra responsabilidad se limita, en la medida que
            permita la ley, al valor de la comisión cobrada por la transacción
            correspondiente.
          </p>
        </section>

        <section className="space-y-2">
          <h2>9. Cambios y contacto</h2>
          <p>
            Podemos actualizar estos términos; los cambios relevantes se comunicarán
            en la plataforma. Para consultas escríbenos a{" "}
            <a href="mailto:contacto@taskya.net" className="font-semibold text-green hover:underline">
              contacto@taskya.net
            </a>
            .
          </p>
        </section>

        <p className="rounded-xl bg-amber-bg p-4 text-sm text-ink-soft">
          Este documento es una base general y no constituye asesoría legal. Antes
          de operar con pagos reales conviene revisarlo con un profesional del
          derecho en Ecuador.
        </p>
      </div>
    </article>
  );
}
