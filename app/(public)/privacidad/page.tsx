import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — TaskYa",
};

const updated = "16 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-ink-mute">Última actualización: {updated}</p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink-soft [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
        <section className="space-y-2">
          <h2>1. Responsable</h2>
          <p>
            TaskYa, producto de <strong>Initec Studio</strong>, es responsable del
            tratamiento de los datos personales que recopila a través de esta
            plataforma, conforme a la Ley Orgánica de Protección de Datos Personales
            del Ecuador.
          </p>
        </section>

        <section className="space-y-2">
          <h2>2. Qué datos recopilamos</h2>
          <p>
            Datos que nos proporcionas: nombre, correo, teléfono/WhatsApp, ciudad,
            foto, información profesional (profesión, experiencia, portafolio) y el
            contenido de tus servicios, mensajes y valoraciones. También datos
            técnicos básicos de uso para mantener el servicio seguro.
          </p>
        </section>

        <section className="space-y-2">
          <h2>3. Para qué los usamos</h2>
          <p>
            Para crear y gestionar tu cuenta, mostrar perfiles y servicios,
            permitir la contratación y el chat entre las partes, procesar pagos en
            custodia, enviar avisos relacionados con tu actividad y mejorar la
            plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2>4. Con quién los compartimos</h2>
          <p>
            Compartimos lo mínimo necesario con proveedores que nos ayudan a operar
            (por ejemplo, alojamiento y base de datos, envío de correos y
            procesamiento de pagos). No vendemos tus datos personales. Parte de tu
            información de perfil profesional es <strong>pública</strong> por la
            naturaleza del marketplace.
          </p>
        </section>

        <section className="space-y-2">
          <h2>5. Tus derechos</h2>
          <p>
            Puedes acceder, rectificar, actualizar o solicitar la eliminación de tus
            datos, así como oponerte a ciertos tratamientos, escribiéndonos a{" "}
            <a href="mailto:contacto@taskya.net" className="font-semibold text-green hover:underline">
              contacto@taskya.net
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2>6. Conservación y seguridad</h2>
          <p>
            Conservamos los datos mientras tu cuenta esté activa o mientras sean
            necesarios para cumplir obligaciones legales. Aplicamos medidas técnicas
            y organizativas razonables para protegerlos.
          </p>
        </section>

        <section className="space-y-2">
          <h2>7. Cambios</h2>
          <p>
            Podemos actualizar esta política; los cambios relevantes se comunicarán
            en la plataforma.
          </p>
        </section>

        <p className="rounded-xl bg-amber-bg p-4 text-sm text-ink-soft">
          Este documento es una base general y no constituye asesoría legal.
          Recomendamos revisarlo con un profesional del derecho antes de operar con
          pagos reales.
        </p>
      </div>
    </article>
  );
}
