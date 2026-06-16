# TaskYa — Estado del proyecto

> Documento de continuidad. Resume todo lo construido para retomar el trabajo en
> otra máquina o sesión sin perder contexto. **No contiene secretos** (repo público).

Última actualización: 2026-06-15

---

## 1. Resumen

**TaskYa** es un marketplace de servicios profesionales para Ecuador (estilo
Fiverr/Workana adaptado). Modelo: comisión del **15%** sobre cada trabajo
completado. Producto de **Initec Studio**.

Estado actual: **MVP funcional de punta a punta, reestructurado estilo Fiverr** —
home/marketplace **público** + registro/login + panel por rol + catálogo público
con filtros + página rica de servicio + **perfil público del profesional** +
**portafolio** + **subida de imágenes (Supabase Storage)** + flujo de
contratación completo (custodia simulada), chat y valoraciones. Falta integrar
pagos reales.

> ⚠️ **Antes de desplegar:** ejecutar `supabase/migration-fiverr.sql` en el SQL
> Editor de Supabase. Añade el bucket `media`, columnas nuevas (galería, FAQ,
> revisiones, idiomas, habilidades) y las tablas `portfolio_items` y `favorites`.
> Sin esa migración, el panel dará error al subir imágenes o guardar el perfil.

## 2. Enlaces

- **Producción:** https://leonardo-proyecto-taskya.vercel.app
- **GitHub:** https://github.com/danilobailon/taskya
- **Supabase:** proyecto `TaskYA-plataforma` (cuenta de Leonardo) — dashboard en supabase.com
- **Vercel:** proyecto `leonardo-proyecto-taskya` (cuenta de Danilo)

## 3. Stack (replicado de initec.studio)

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — base de datos (PostgreSQL) + autenticación
- **Resend** — correos (configurado, pendiente dominio propio)
- **Motion** + **lucide-react** — animaciones e iconos
- **Zod** — validación
- Deploy en **Vercel** (con `vercel.json` forzando framework Next.js)

Paleta: **navy `#1E3A5F`** + ámbar de acento (antes era verde; se hizo rebrand).
Fuentes: Bricolage Grotesque (display) + Instrument Sans (texto).

## 4. Cómo correr en local (en la laptop)

```bash
git clone https://github.com/danilobailon/taskya.git
cd taskya
npm install
# crear .env.local (ver sección 5) — NO está en el repo
npm run dev          # http://localhost:3000
```

Para traer las variables de entorno desde Vercel (más rápido que copiarlas):

```bash
npm i -g vercel
vercel login
vercel link          # elegir el proyecto leonardo-proyecto-taskya
vercel env pull .env.local --environment=production
```

## 5. Variables de entorno (`.env.local`)

El archivo `.env.local` está en `.gitignore` (no se sube). Ver `.env.example`.
Variables necesarias:

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase > Project Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # idem (anon public)
SUPABASE_SERVICE_ROLE_KEY=       # idem (service_role secret)
RESEND_API_KEY=                  # resend.com (opcional hasta tener dominio)
RESEND_FROM=TaskYa <onboarding@resend.dev>
LEAD_NOTIFY_EMAIL=leonardobailon64@gmail.com
NEXT_PUBLIC_WHATSAPP=593983596313
ANTHROPIC_API_KEY=               # console.anthropic.com — lee el CV en el onboarding
```

> El **onboarding del profesional** (`/onboarding`) usa `ANTHROPIC_API_KEY` para
> leer el CV/PDF con Claude y autocompletar el perfil. Si falta, el botón
> "Importar mi CV" muestra un aviso y el usuario puede rellenar manualmente (el
> resto del flujo funciona sin la key). **Hay que añadirla en Vercel** (Production)
> para que el import funcione en producción.

Estas mismas están cargadas en **Vercel** (Production). Si las editas, sube los
valores **sin BOM** (ver gotcha en sección 9).

## 6. Estructura del proyecto

```
app/
├── (public)/            MARKETPLACE PÚBLICO (sin login). Layout = header + footer.
│   ├── layout.tsx       SiteHeader + SiteFooter (colores TaskYa)
│   ├── page.tsx         Home estilo Fiverr (hero + buscador + categorías + destacados)
│   ├── servicios/       Catálogo público con filtros (categoría, ciudad, precio, orden)
│   ├── servicio/[id]/   Página rica del servicio: galería, descripción, reseñas, Contratar
│   ├── profesional/[id]/  Perfil público: bio, stats, portafolio, servicios, reseñas
│   └── _components/     SiteHeader, SiteFooter, SearchBar, ServiceCard, Stars, Gallery
├── (auth)/              Registro, login, layout y server actions de sesión
│   ├── actions.ts       signUp / signIn (respeta ?redirect=) / signOut
│   ├── login/ registro/
├── panel/               Panel privado (gestión, protegido por proxy.ts)
│   ├── layout.tsx       Sidebar + navegación por rol + cerrar sesión
│   ├── page.tsx         Resumen (dashboard)
│   ├── perfil/          Editar perfil + ficha pro (avatar, idiomas, habilidades)
│   ├── servicios/       Lista (con Editar/Pausar) + nuevo/ + [id]/editar/
│   │   └── _components/ServiceForm.tsx   Formulario compartido crear/editar (con galería)
│   ├── portafolio/      Subir/eliminar trabajos del portafolio (profesional)
│   ├── contratos/ contrataciones/ contrato/[id]/  Contratación + chat + valoración
│   ├── mensajes/ reputacion/
│   ├── usuarios/ finanzas/ disputas/   (admin)
│   └── _components/     ui.tsx, admin.tsx, SidebarNav, ImageUploader (Storage)
├── onboarding/          Wizard del profesional (importar CV con IA o manual)
│   ├── Wizard.tsx       Cliente: pasos, barra de progreso, subida de CV
│   ├── page.tsx actions.ts layout.tsx
├── _landing/            Landing antiguo (YA NO se usa; "/" ahora es el home Fiverr)
├── api/lead/            Captura de leads (Zod + Resend + Supabase)
├── api/parse-cv/        Lee el CV/PDF con Claude y devuelve JSON del perfil
├── layout.tsx           Fuentes + metadata (raíz)
└── globals.css          Sistema de diseño (tokens navy/ámbar + sombras)
lib/
├── supabase/            client.ts (browser), server.ts (server + service role), middleware.ts
├── categories.ts        Fuente única de categorías + iconos
├── email.ts             Resend
└── utils.ts             cn, formatUSD, commission (15%)
proxy.ts                 Refresca sesión + protege /panel (solo /panel es privado)
supabase/schema.sql      Esquema completo (fuente para proyectos nuevos)
supabase/migration-fiverr.sql   Migración para la BD ya aplicada (Storage + columnas + tablas)
legacy/                  Landing original en HTML + PDF de validación (referencia)
```

## 7. Base de datos (Supabase)

El esquema completo está en `supabase/schema.sql` (úsalo para proyectos nuevos).
Para la BD **ya aplicada**, ejecutar la migración incremental
`supabase/migration-fiverr.sql` en *Supabase > SQL Editor* (es idempotente).
Añade: bucket de Storage `media` + sus políticas, columnas nuevas en `services`
(`gallery_urls`, `revisions`, `faq`) y `professionals` (`languages`, `skills`),
y las tablas `portfolio_items` y `favorites`.

Tablas: `profiles` (extiende auth.users, con rol), `professionals`, `services`,
`contracts`, `messages`, `reviews`, `leads`, `portfolio_items`, `favorites`.
Incluye:
- **Trigger** `on_auth_user_created`: crea el `profile` automáticamente al registrarse.
- **RLS** activado en todas las tablas con políticas por rol/propiedad.

Roles: `cliente`, `profesional`, `admin`. El rol se elige en el registro y se
guarda en `profiles.role`. Para hacer admin a alguien: cambiar `role` a `admin`
en *Table Editor > profiles*.

## 8. Qué está construido

- ✅ **Landing** navy con animaciones; los CTA llevan a `/registro?tipo=...`
- ✅ **Auth** con Supabase: registro (cliente/profesional), login, logout,
  confirmación de correo ("revisa tu correo")
- ✅ **Panel** protegido, con menú adaptado al rol
- ✅ **Perfil** editable (datos + ficha profesional)
- ✅ **Servicios**: crear, listar, pausar/activar (profesional)
- ✅ **Buscar**: catálogo con búsqueda por texto y filtro por categoría (cliente)
- ✅ **Contratación completa**: detalle de servicio → Contratar → contrato con
  máquina de estados (solicitado → en_progreso → entregado → completado /
  cancelado) según rol, **chat** por contrato, **valoraciones** que recalculan
  el rating del profesional
- ✅ **Admin**: usuarios (tabla), finanzas (GMV + comisión), disputas
- ✅ **Captura de leads** (la landing antes mandaba a WhatsApp; ahora va al registro)
- ✅ **Marketplace público estilo Fiverr** (reestructuración 2026-06-15):
  - **Home** `/` con hero + buscador grande + categorías con iconos + destacados + "cómo funciona"
  - **Catálogo público** `/servicios` con filtros (categoría, ciudad, precio máx, orden)
  - **Página rica de servicio** `/servicio/[id]` con galería (visor + miniaturas),
    descripción, reseñas y caja de contratación (login solo al contratar)
  - **Perfil público del profesional** `/profesional/[id]` con stats, portafolio,
    idiomas/habilidades, sus servicios y reseñas
- ✅ **Subida de imágenes** (Supabase Storage, bucket `media`, carpeta por usuario):
  avatar de perfil, portada + galería de cada servicio, e imágenes del portafolio
- ✅ **Editar servicio** (`/panel/servicios/[id]/editar`) con formulario compartido
- ✅ **Portafolio** del profesional (`/panel/portafolio`: subir/eliminar trabajos)
- ✅ **Onboarding del profesional estilo Fiverr** (`/onboarding`, wizard multi-paso):
  al registrarse/iniciar sesión como profesional sin perfil completo, se le lleva
  a un asistente paso a paso (foto → profesión → categorías/idiomas/habilidades →
  bio → resumen). Primer paso: **importar el CV (PDF) y autocompletar con IA**
  (Claude lee el documento, ruta `app/api/parse-cv`) o rellenar manualmente.
  Al terminar, va a publicar su primer servicio. *(Login social Google/Facebook
  pendiente — se decidió "solo correo por ahora".)*
- ✅ **Avisos por correo** (Resend, `lib/notify.ts`): al profesional cuando hay
  nueva contratación / mensaje / reseña; al cliente en cambios de estado
  (aceptado, entregado) y cancelaciones. Best-effort: si falta `RESEND_API_KEY`
  no rompe el flujo.
- ✅ **Páginas legales** `/terminos` y `/privacidad` (base en español, enlazadas
  en el footer). Revisar con abogado antes de cobrar de verdad.
- ✅ **Menú móvil** en el header público (hamburguesa desplegable).

## 9. Lecciones / gotchas importantes (¡leer!)

1. **Variables de entorno en Vercel sin BOM:** subir secretos por *pipe* de
   PowerShell les mete un BOM (U+FEFF) invisible que rompe los headers HTTP
   (`ByteString ... 65279`). Subirlas con archivo limpio + `cmd /c "vercel env
   add NAME production < archivo"` o con `printf`/Bash. Verificar con la longitud.
2. **El landing antiguo (`app/_landing/`) YA NO se usa.** Desde 2026-06-15 la
   ruta `/` es el nuevo home estilo Fiverr (`app/(public)/page.tsx`), construido
   con los tokens de `globals.css` (no con la isla de CSS del landing). Los
   archivos de `_landing/` quedan como referencia; se pueden borrar.
   - **Solo `/panel` es privado** (lo fuerza `lib/supabase/middleware.ts`). El
     resto del marketplace es público; las políticas RLS ya permiten lectura
     anónima de servicios activos, profesionales y perfiles.
   - **Imágenes:** se suben desde el navegador a Supabase Storage (bucket
     `media`) y se guardan las URLs públicas en la BD. Requiere la migración.
3. **Supabase free = 2 proyectos POR USUARIO** (no por organización). Por eso la
   BD de TaskYa está en la cuenta de Leonardo (Danilo ya tenía 2: Initec + Mabel).
4. **"Confirm email" activado** (recomendado en producción). El registro muestra
   "revisa tu correo". El código maneja ambos casos (con/sin confirmación).
5. **Acciones admin** verifican el rol y usan `service_role` solo en el servidor.
6. **Next 16:** `middleware.ts` se renombró a `proxy.ts` (función `proxy`).

## 10. Pendientes / roadmap

- [ ] **Pagos reales** (PayPhone / Kushki). Hoy la custodia está *simulada* a
  nivel de estados. Modelo: cliente paga → dinero en cuenta de TaskYa (custodia)
  → al confirmar, 85% al profesional + 15% comisión. Requiere asesoría contable
  (TaskYa retiene dinero de terceros).
- [ ] **Auto-liberación por tiempo** (si el cliente no confirma en X días).
- [ ] **Admin enriquecido**: dashboard con KPIs (liquidez, activación), vista 360
  de usuario, moderación de servicios, verificación de profesionales.
- [ ] **Dominio propio** `taskya.net` (Namecheap): correo `contacto@taskya.net`
  con reenvío + verificar dominio en Resend + SMTP propio en Supabase Auth.
- [x] ~~**Perfil público** del profesional~~ ✅ hecho (`/profesional/[id]`).
- [ ] Notificaciones (correo cuando hay nueva propuesta/mensaje/contrato).
- [ ] Hacer a **Leonardo admin** (cambiar su `role` a `admin` en Supabase).
- [ ] **Favoritos / guardados**: la tabla `favorites` ya existe; falta la UI
  (botón de corazón en las tarjetas + página "Guardados" del cliente).
- [ ] **FAQ y revisiones en la página de servicio**: las columnas `faq` y
  `revisions` ya existen; falta el editor en el formulario y mostrarlas en el gig.
- [ ] **Wizard multi-paso** para crear servicio (hoy es un formulario por
  secciones en una sola página; funciona, pero se puede convertir en pasos).
- [ ] **Menú móvil** del header público (hoy se condensa; falta el desplegable).
- [ ] **Login social** (Google / Facebook): se decidió posponerlo; el wizard ya
  está listo y solo faltaría conectar `signInWithOAuth` + callback + apps OAuth.
- [ ] **Mejoras al import por IA**: hoy usa `claude-haiku-4-5` (barato, fase de
  pruebas). Para máxima calidad de extracción, cambiar a `claude-opus-4-8` en
  `app/api/parse-cv/route.ts`.

## 11. Cómo probar el flujo completo

Se necesitan **2 cuentas** (un cliente y un profesional), en navegadores
distintos o en incógnito:

1. **Profesional:** registro como "Ofrezco servicios" → Mi perfil (poner
   profesión) → Mis servicios → Crear servicio.
2. **Cliente:** registro como "Busco servicios" → Buscar servicios → abrir el
   servicio → Contratar.
3. **Profesional:** Contratos → Aceptar → Marcar como entregado.
4. **Cliente:** Mis contrataciones → Confirmar entrega → dejar valoración.
5. Chatear entre ambos dentro del contrato.

## 12. Comandos útiles

```bash
npm run dev                       # desarrollo local
npm run build                     # verificar que compila
git add -A && git commit -m "..." # commit
git push origin main              # push (Vercel redepliega solo)
vercel deploy --prod --yes        # deploy manual a producción
vercel env ls production          # ver variables de entorno
```
