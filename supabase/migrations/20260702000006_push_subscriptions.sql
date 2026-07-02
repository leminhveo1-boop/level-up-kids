-- ============================================================
-- V1.2 — Web Push subscriptions (parent & child devices)
-- ============================================================

create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- 'parent' | 'child' — which audience this device belongs to
  audience text not null default 'parent' check (audience in ('parent', 'child')),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Owners manage their own device subscriptions
create policy "push_subs_own" on public.push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
