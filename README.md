# TaskYa

Marketplace de servicios profesionales para Ecuador. Conecta clientes con profesionales independientes y empresas: publica/encuentra servicios, compara perfiles, contrata y paga con protección. Comisión del 15% sobre cada trabajo completado.

Producto de **Initec Studio**.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — base de datos (PostgreSQL) + autenticación
- **Resend** — correos transaccionales / notificaciones de leads
- **Motion** + **lucide-react** — animaciones e iconos
- **Zod** — validación
- Deploy en **Vercel**

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

Abre http://localhost:3000

### Variables de entorno

Ver `.env.example`. Necesitas un proyecto de Supabase (URL + anon key + service role key), una API key de Resend y el número de WhatsApp de contacto.

### Base de datos

Ejecuta `supabase/schema.sql` en el **SQL Editor** de tu proyecto Supabase. Crea las tablas (profiles, professionals, services, contracts, messages, reviews, leads), el trigger de alta de usuarios y las políticas RLS.

## Estructura

```
app/
├── _landing/          Landing pública (diseño aprobado, portado a React)
├── (auth)/            Registro, login y server actions de sesión
├── panel/             Panel de control (cliente · profesional · admin)
├── api/lead/          Captura de leads (Supabase + Resend)
├── layout.tsx         Fuentes y metadata
└── globals.css        Sistema de diseño (tokens)
lib/
├── supabase/          Clientes (browser, server, proxy de sesión)
├── email.ts           Resend
└── utils.ts           Helpers (cn, formato USD, comisión)
supabase/schema.sql    Esquema de base de datos
legacy/                Landing original en HTML (referencia)
```

## Roadmap

- [x] Landing + captura de leads
- [x] Auth (cliente / profesional) + panel base
- [ ] Catálogo de servicios, búsqueda y filtros
- [ ] Perfiles públicos y portafolios
- [ ] Contratación + pago en custodia (PayPhone / Kushki)
- [ ] Chat interno y valoraciones
- [ ] Panel de administración
