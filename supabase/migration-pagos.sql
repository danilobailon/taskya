-- ============================================================
--  TASKYA — Migración "pago manual" (puente antes de PayPhone)
--  Añade campos de pago a contracts para registrar la custodia
--  manualmente desde el panel de admin.
--  Idempotente. Ejecutar en: Supabase -> SQL Editor.
-- ============================================================

alter table public.contracts
  add column if not exists payment_status text not null default 'pendiente',
                            -- 'pendiente' | 'pagado' (en custodia) | 'liberado' | 'reembolsado'
  add column if not exists payment_method text,    -- 'manual' (luego 'payphone')
  add column if not exists payment_ref    text,    -- referencia/comprobante
  add column if not exists paid_at        timestamptz,
  add column if not exists released_at    timestamptz;
