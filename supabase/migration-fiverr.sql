-- ============================================================
--  TASKYA — Migración "estilo Fiverr"
--  Añade: Supabase Storage (imágenes), galería + FAQ + revisiones
--  en servicios, idiomas/habilidades en profesionales, portafolio
--  y favoritos.
--
--  Es IDEMPOTENTE (se puede correr varias veces sin romper nada).
--  Ejecutar en: Supabase -> SQL Editor -> New query.
--  IMPORTANTE: correr ANTES de desplegar el código de la Fase B/C,
--  o el panel dará error al leer/escribir las columnas nuevas.
-- ============================================================

-- ---------- 1) Storage: bucket público "media" ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes del bucket
drop policy if exists "media lectura publica" on storage.objects;
create policy "media lectura publica"
  on storage.objects for select
  using (bucket_id = 'media');

-- Cada usuario solo puede subir/editar/borrar dentro de SU carpeta
-- (el primer segmento de la ruta debe ser su uid: "<uid>/...").
drop policy if exists "media subir propio" on storage.objects;
create policy "media subir propio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media actualizar propio" on storage.objects;
create policy "media actualizar propio"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media borrar propio" on storage.objects;
create policy "media borrar propio"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 2) Servicios: galería, FAQ y revisiones ----------
alter table public.services
  add column if not exists gallery_urls text[] default '{}',
  add column if not exists revisions     int,
  add column if not exists faq           jsonb default '[]'::jsonb;

-- ---------- 3) Profesionales: idiomas y habilidades ----------
alter table public.professionals
  add column if not exists languages text[] default '{}',
  add column if not exists skills    text[] default '{}';

-- ---------- 4) Portafolio del profesional ----------
create table if not exists public.portfolio_items (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  title           text,
  description     text,
  image_url       text not null,
  created_at      timestamptz not null default now()
);
create index if not exists portfolio_pro_idx on public.portfolio_items(professional_id);

alter table public.portfolio_items enable row level security;

drop policy if exists "portfolio lectura publica" on public.portfolio_items;
create policy "portfolio lectura publica"
  on public.portfolio_items for select using (true);

drop policy if exists "portfolio dueno gestiona" on public.portfolio_items;
create policy "portfolio dueno gestiona"
  on public.portfolio_items for all
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

-- ---------- 5) Favoritos (servicios guardados) ----------
create table if not exists public.favorites (
  client_id  uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, service_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favoritos propios" on public.favorites;
create policy "favoritos propios"
  on public.favorites for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);
