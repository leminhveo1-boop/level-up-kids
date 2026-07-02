-- ============================================================
-- V1.1 — Funnel analytics events (write-only from clients)
-- Run AFTER 0002_paid_only.sql.
-- ============================================================

create table if not exists public.events (
  id bigint generated always as identity primary key,
  name text not null,
  session_id text,
  user_id uuid references public.profiles (id) on delete set null,
  props jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_name_created_idx on public.events (name, created_at);

alter table public.events enable row level security;

-- Clients (even anonymous) may INSERT events, but never read them back.
create policy "events_insert_any" on public.events
  for insert to anon, authenticated with check (true);
-- No select/update/delete policies → dashboard/SQL editor (service role) only.
