-- ============================================================
--  TASKYA — Esquema de base de datos (Supabase / PostgreSQL)
--  Ejecuta este archivo en: Supabase -> SQL Editor -> New query
-- ============================================================

-- ---------- Tipos ----------
create type user_role as enum ('cliente', 'profesional', 'admin');
create type contract_status as enum ('solicitado', 'aceptado', 'en_progreso', 'entregado', 'completado', 'cancelado', 'disputa');
create type service_status as enum ('borrador', 'activo', 'pausado');
create type lead_type as enum ('cliente', 'profesional');

-- ============================================================
--  PROFILES — extiende auth.users
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'cliente',
  full_name   text,
  phone       text,
  city        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ============================================================
--  PROFESSIONALS — datos extra del perfil profesional
-- ============================================================
create table public.professionals (
  id            uuid primary key references public.profiles(id) on delete cascade,
  profession    text not null,
  headline      text,
  bio           text,
  experience    text,
  portfolio_url text,
  categories    text[] default '{}',
  languages     text[] default '{}',
  skills        text[] default '{}',
  verified      boolean not null default false,
  rating        numeric(2,1) default 0,
  reviews_count int default 0,
  jobs_done     int default 0,
  created_at    timestamptz not null default now()
);

-- ============================================================
--  SERVICES — catálogo publicado por profesionales
-- ============================================================
create table public.services (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  title           text not null,
  category        text not null,
  description     text,
  includes        text[],
  price           numeric(10,2) not null,
  delivery_days   int,
  revisions       int,
  city            text,
  cover_url       text,
  gallery_urls    text[] default '{}',
  faq             jsonb default '[]'::jsonb,
  status          service_status not null default 'activo',
  created_at      timestamptz not null default now()
);
create index services_category_idx on public.services(category);
create index services_city_idx on public.services(city);

-- ============================================================
--  CONTRACTS — contrataciones (con custodia de pago)
-- ============================================================
create table public.contracts (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  service_id      uuid references public.services(id) on delete set null,
  title           text not null,
  amount          numeric(10,2) not null,
  commission      numeric(10,2) not null,      -- 15%
  status          contract_status not null default 'solicitado',
  created_at      timestamptz not null default now()
);
create index contracts_client_idx on public.contracts(client_id);
create index contracts_pro_idx on public.contracts(professional_id);

-- ============================================================
--  MESSAGES — chat interno por contrato
-- ============================================================
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  attachment_url text,
  created_at  timestamptz not null default now()
);
create index messages_contract_idx on public.messages(contract_id);

-- ============================================================
--  REVIEWS — valoraciones (solo de contratos completados)
-- ============================================================
create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  contract_id     uuid not null references public.contracts(id) on delete cascade,
  client_id       uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  rating          int not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz not null default now(),
  unique(contract_id)
);

-- ============================================================
--  LEADS — captura de la landing (Fase 0 de validación)
-- ============================================================
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  type       lead_type not null,
  name       text not null,
  whatsapp   text not null,
  city       text,
  category   text,         -- cliente: qué busca · profesional: profesión
  detail     text,
  portfolio  text,
  created_at timestamptz not null default now()
);

-- ============================================================
--  TRIGGER — crea profile automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.professionals enable row level security;
alter table public.services      enable row level security;
alter table public.contracts     enable row level security;
alter table public.messages      enable row level security;
alter table public.reviews       enable row level security;
alter table public.leads         enable row level security;

-- PROFILES: cada quien ve/edita el suyo; lectura pública de lo básico
create policy "perfil propio lectura" on public.profiles for select using (true);
create policy "perfil propio update" on public.profiles for update using (auth.uid() = id);

-- PROFESSIONALS: lectura pública, edición del dueño
create policy "pros lectura publica" on public.professionals for select using (true);
create policy "pro update propio" on public.professionals for update using (auth.uid() = id);
create policy "pro insert propio" on public.professionals for insert with check (auth.uid() = id);

-- SERVICES: lectura pública de activos; el dueño gestiona los suyos
create policy "servicios activos publicos" on public.services for select using (status = 'activo' or auth.uid() = professional_id);
create policy "servicios dueno gestiona" on public.services for all using (auth.uid() = professional_id) with check (auth.uid() = professional_id);

-- CONTRACTS: solo las partes involucradas
create policy "contratos partes" on public.contracts for select
  using (auth.uid() = client_id or auth.uid() = professional_id);
create policy "contratos cliente crea" on public.contracts for insert with check (auth.uid() = client_id);
create policy "contratos partes update" on public.contracts for update
  using (auth.uid() = client_id or auth.uid() = professional_id);

-- MESSAGES: solo participantes del contrato
create policy "mensajes participantes" on public.messages for select
  using (exists (select 1 from public.contracts c
    where c.id = contract_id and (auth.uid() = c.client_id or auth.uid() = c.professional_id)));
create policy "mensajes enviar" on public.messages for insert with check (auth.uid() = sender_id);

-- REVIEWS: lectura pública, escribe el cliente del contrato
create policy "reviews lectura publica" on public.reviews for select using (true);
create policy "reviews cliente escribe" on public.reviews for insert with check (auth.uid() = client_id);

-- LEADS: nadie lee desde el cliente; se insertan vía service role en el server
create policy "leads sin lectura" on public.leads for select using (false);

-- ============================================================
--  PORTFOLIO_ITEMS — trabajos del portafolio del profesional
-- ============================================================
create table public.portfolio_items (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  title           text,
  description     text,
  image_url       text not null,
  created_at      timestamptz not null default now()
);
create index portfolio_pro_idx on public.portfolio_items(professional_id);

alter table public.portfolio_items enable row level security;
create policy "portfolio lectura publica" on public.portfolio_items for select using (true);
create policy "portfolio dueno gestiona" on public.portfolio_items for all
  using (auth.uid() = professional_id) with check (auth.uid() = professional_id);

-- ============================================================
--  FAVORITES — servicios guardados por el cliente
-- ============================================================
create table public.favorites (
  client_id  uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, service_id)
);
alter table public.favorites enable row level security;
create policy "favoritos propios" on public.favorites for all
  using (auth.uid() = client_id) with check (auth.uid() = client_id);

-- ============================================================
--  STORAGE — bucket público "media" para imágenes
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media lectura publica" on storage.objects for select
  using (bucket_id = 'media');
create policy "media subir propio" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media actualizar propio" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media borrar propio" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
