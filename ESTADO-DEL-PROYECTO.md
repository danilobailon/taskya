# TaskYa — Estado del proyecto

> Documento de continuidad. Resume todo lo construido para retomar el trabajo en
> otra máquina o sesión sin perder contexto. **No contiene secretos** (repo público).

Última actualización: 2026-06-12

---

## 1. Resumen

**TaskYa** es un marketplace de servicios profesionales para Ecuador (estilo
Fiverr/Workana adaptado). Modelo: comisión del **15%** sobre cada trabajo
completado. Producto de **Initec Studio**.

Estado actual: **MVP funcional de punta a punta** — landing + registro/login +
panel por rol + catálogo + flujo de contratación completo (custodia simulada),
chat y valoraciones. Falta integrar pagos reales.

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
```

Estas mismas están cargadas en **Vercel** (Production). Si las editas, sube los
valores **sin BOM** (ver gotcha en sección 9).

## 6. Estructura del proyecto

```
app/
├── _landing/            Landing pública (diseño aprobado, isla de CSS global)
│   ├── Landing.tsx      Componente cliente (interacciones + inyecta el HTML)
│   ├── markup.ts        HTML del landing (generado, no editar a mano)
│   └── landing.css      Estilos del landing
├── (auth)/              Registro, login, layout y server actions de sesión
│   ├── actions.ts       signUp / signIn / signOut
│   ├── login/ registro/
├── panel/               Panel privado (protegido por proxy.ts)
│   ├── layout.tsx       Sidebar + navegación por rol + cerrar sesión
│   ├── page.tsx         Resumen (dashboard)
│   ├── perfil/          Editar perfil + ficha profesional
│   ├── servicios/       Lista + crear servicio (profesional)
│   ├── servicio/[id]/   Detalle de servicio + botón Contratar
│   ├── buscar/          Catálogo con búsqueda y filtros (cliente)
│   ├── contratos/       Lista de contratos (profesional)
│   ├── contrataciones/  Lista de contrataciones (cliente)
│   ├── contrato/[id]/   Detalle: estados + chat + valoración
│   ├── mensajes/ reputacion/
│   ├── usuarios/ finanzas/ disputas/   (admin)
│   └── _components/      ui.tsx (PageHeader, EmptyState, Card...), admin.tsx, SidebarNav
├── api/lead/            Captura de leads (Zod + Resend + Supabase)
├── layout.tsx           Fuentes + metadata
└── globals.css          Sistema de diseño (tokens navy/ámbar)
lib/
├── supabase/            client.ts (browser), server.ts (server + service role), middleware.ts
├── email.ts             Resend
└── utils.ts             cn, formatUSD, commission (15%)
proxy.ts                 Refresca sesión + protege /panel (antes "middleware")
supabase/schema.sql      Esquema completo de la base de datos
scripts/extract-landing.mjs   Extrae CSS+HTML del landing original
legacy/                  Landing original en HTML + PDF de validación (referencia)
```

## 7. Base de datos (Supabase)

El esquema está en `supabase/schema.sql`. **Ya fue aplicado** en el proyecto
actual. Si se recrea el proyecto, ejecutarlo en *Supabase > SQL Editor*.

Tablas: `profiles` (extiende auth.users, con rol), `professionals`, `services`,
`contracts`, `messages`, `reviews`, `leads`. Incluye:
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

## 9. Lecciones / gotchas importantes (¡leer!)

1. **Variables de entorno en Vercel sin BOM:** subir secretos por *pipe* de
   PowerShell les mete un BOM (U+FEFF) invisible que rompe los headers HTTP
   (`ByteString ... 65279`). Subirlas con archivo limpio + `cmd /c "vercel env
   add NAME production < archivo"` o con `printf`/Bash. Verificar con la longitud.
2. **El landing es una "isla" de CSS global** (`landing.css` tiene reglas como
   `button{}`). Por eso la navegación del landing al registro usa `href` nativo
   (carga completa), NO `router.push`, para que no se filtren estilos.
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
- [ ] **Perfil público** del profesional (página visible para clientes).
- [ ] Notificaciones (correo cuando hay nueva propuesta/mensaje/contrato).
- [ ] Hacer a **Leonardo admin** (cambiar su `role` a `admin` en Supabase).

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
