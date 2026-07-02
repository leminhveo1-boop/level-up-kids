-- ============================================================
-- Level Up Kids — Production schema V1
-- Run in Supabase SQL Editor (or `supabase db push`)
-- ============================================================

-- ---------- PROFILES (parent accounts) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  -- freemium plan: 'free' | 'premium'
  plan text not null default 'free' check (plan in ('free', 'premium')),
  premium_until timestamptz,
  -- unique code the parent puts in bank-transfer content for SePay auto-activation
  payment_code text not null unique default ('LUK' || upper(substr(md5(random()::text), 1, 8))),
  locale text not null default 'vi' check (locale in ('vi', 'en')),
  created_at timestamptz not null default now()
);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- CHILDREN (hero profiles, many per family) ----------
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  char_class text not null default 'Warrior' check (char_class in ('Warrior', 'Mage', 'Druid')),
  created_at timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children (parent_id);

-- ---------- GAME STATES (whole game state as JSONB per child) ----------
create table if not exists public.game_states (
  child_id uuid primary key references public.children (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- ACTIVATION CODES (manual premium activation) ----------
create table if not exists public.activation_codes (
  code text primary key,
  plan text not null default 'premium',
  duration_days int not null default 365,
  redeemed_by uuid references public.profiles (id),
  redeemed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- PAYMENTS (SePay webhook log) ----------
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  sepay_tx_id text unique,
  profile_id uuid references public.profiles (id),
  amount numeric not null default 0,
  transfer_content text,
  status text not null default 'received' check (status in ('received', 'activated', 'unmatched', 'ignored')),
  raw jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.game_states enable row level security;
alter table public.activation_codes enable row level security;
alter table public.payments enable row level security;

-- profiles: owner read/update (plan fields protected by column-level trigger below)
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- prevent client from self-upgrading plan/premium_until/payment_code
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer as $$
begin
  if auth.uid() = new.id and current_setting('request.jwt.claims', true) is not null then
    new.plan := old.plan;
    new.premium_until := old.premium_until;
    new.payment_code := old.payment_code;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_columns_trg on public.profiles;
create trigger protect_profile_columns_trg
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- children: parent full CRUD on own children
create policy "children_all_own" on public.children
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- game_states: via child ownership
create policy "game_states_all_own" on public.game_states
  for all using (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  ) with check (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

-- activation_codes & payments: NO client policies (service-role only).

-- ============================================================
-- FREE PLAN LIMIT: 1 child (enforced server-side)
-- ============================================================
create or replace function public.enforce_child_limit()
returns trigger language plpgsql security definer as $$
declare
  child_count int;
  parent_plan text;
  parent_premium_until timestamptz;
begin
  select plan, premium_until into parent_plan, parent_premium_until
  from public.profiles where id = new.parent_id;

  select count(*) into child_count from public.children where parent_id = new.parent_id;

  if (parent_plan <> 'premium' or coalesce(parent_premium_until, 'epoch') < now())
     and child_count >= 1 then
    raise exception 'FREE_PLAN_CHILD_LIMIT';
  end if;

  if child_count >= 6 then
    raise exception 'MAX_CHILDREN_REACHED';
  end if;

  return new;
end;
$$;
drop trigger if exists enforce_child_limit_trg on public.children;
create trigger enforce_child_limit_trg
  before insert on public.children
  for each row execute function public.enforce_child_limit();

-- ============================================================
-- RPC: redeem activation code (called by logged-in client)
-- ============================================================
create or replace function public.redeem_activation_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_code record;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_code from public.activation_codes
  where code = upper(trim(p_code)) for update;

  if not found then
    return json_build_object('success', false, 'error', 'CODE_NOT_FOUND');
  end if;
  if v_code.redeemed_by is not null then
    return json_build_object('success', false, 'error', 'CODE_ALREADY_USED');
  end if;

  update public.activation_codes
  set redeemed_by = v_uid, redeemed_at = now()
  where code = v_code.code;

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + (v_code.duration_days || ' days')::interval
  where id = v_uid;

  return json_build_object('success', true, 'plan', 'premium', 'duration_days', v_code.duration_days);
end;
$$;

-- ============================================================
-- RPC: activate premium from SePay payment (service role calls this)
-- ============================================================
create or replace function public.activate_from_payment(
  p_payment_code text, p_amount numeric, p_tx_id text, p_content text, p_raw jsonb, p_min_amount numeric, p_days_per_period int
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_profile record;
  v_periods int;
begin
  -- idempotency: skip already-processed transaction
  if exists (select 1 from public.payments where sepay_tx_id = p_tx_id) then
    return json_build_object('success', true, 'status', 'duplicate');
  end if;

  select * into v_profile from public.profiles where payment_code = upper(p_payment_code);

  if not found then
    insert into public.payments (sepay_tx_id, amount, transfer_content, status, raw)
    values (p_tx_id, p_amount, p_content, 'unmatched', p_raw);
    return json_build_object('success', false, 'error', 'PAYMENT_CODE_NOT_FOUND');
  end if;

  if p_amount < p_min_amount then
    insert into public.payments (sepay_tx_id, profile_id, amount, transfer_content, status, raw)
    values (p_tx_id, v_profile.id, p_amount, p_content, 'ignored', p_raw);
    return json_build_object('success', false, 'error', 'AMOUNT_TOO_LOW');
  end if;

  v_periods := floor(p_amount / p_min_amount);

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + (v_periods * p_days_per_period || ' days')::interval
  where id = v_profile.id;

  insert into public.payments (sepay_tx_id, profile_id, amount, transfer_content, status, raw)
  values (p_tx_id, v_profile.id, p_amount, p_content, 'activated', p_raw);

  return json_build_object('success', true, 'status', 'activated', 'profile_id', v_profile.id, 'periods', v_periods);
end;
$$;

-- lock down RPC execution
revoke all on function public.activate_from_payment(text, numeric, text, text, jsonb, numeric, int) from public, anon, authenticated;
grant execute on function public.redeem_activation_code(text) to authenticated;
