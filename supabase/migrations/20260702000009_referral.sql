-- ============================================================
-- Referral program — each family that refers a new paying family
-- gets +6 months (180 days) Premium, AND the new family gets +6 months too.
-- Two-sided reward, granted ONCE at the referee's first premium activation
-- (SePay payment OR activation code). Run AFTER 0005_fix_plan_protect.sql.
-- ============================================================

-- ---------- profiles: shareable referral_code + who referred this family ----------
-- Add nullable first, backfill per-row (volatile default would collide), then lock.
alter table public.profiles add column if not exists referral_code text;
update public.profiles
  set referral_code = 'REF' || upper(substr(md5(random()::text || id::text), 1, 6))
  where referral_code is null;
alter table public.profiles alter column referral_code set default ('REF' || upper(substr(md5(random()::text), 1, 6)));
alter table public.profiles alter column referral_code set not null;
create unique index if not exists profiles_referral_code_idx on public.profiles (referral_code);

alter table public.profiles add column if not exists referred_by uuid references public.profiles (id);

-- protect_profile_columns also freezes referred_by against client tampering
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer as $$
begin
  if current_setting('app.allow_plan_change', true) = 'on' then
    return new;
  end if;

  if auth.uid() = new.id and current_setting('request.jwt.claims', true) is not null then
    new.plan := old.plan;
    new.premium_until := old.premium_until;
    new.payment_code := old.payment_code;
    new.referral_code := old.referral_code;
    new.referred_by := old.referred_by;
  end if;
  return new;
end;
$$;

-- ---------- referrals ledger: one row per (referrer -> referee) ----------
create table if not exists public.referrals (
  id bigint generated always as identity primary key,
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referee_id uuid not null unique references public.profiles (id) on delete cascade,
  rewarded boolean not null default false,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint no_self_referral check (referrer_id <> referee_id)
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);

alter table public.referrals enable row level security;
drop policy if exists referrals_select_own on public.referrals;
create policy referrals_select_own on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- ---------- apply a referral code (called by the referee, before paying) ----------
create or replace function public.apply_referral_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_referrer record;
begin
  if v_uid is null then
    return json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  if exists (select 1 from public.referrals where referee_id = v_uid) then
    return json_build_object('success', false, 'error', 'ALREADY_REFERRED');
  end if;

  select id into v_referrer from public.profiles
  where referral_code = upper(trim(p_code));

  if not found then
    return json_build_object('success', false, 'error', 'CODE_NOT_FOUND');
  end if;
  if v_referrer.id = v_uid then
    return json_build_object('success', false, 'error', 'SELF_REFERRAL');
  end if;

  insert into public.referrals (referrer_id, referee_id) values (v_referrer.id, v_uid);

  perform set_config('app.allow_plan_change', 'on', true);
  update public.profiles set referred_by = v_referrer.id where id = v_uid;

  return json_build_object('success', true);
end;
$$;

-- ---------- grant the two-sided bonus at the referee's first activation ----------
create or replace function public.grant_referral_bonus(p_referee_id uuid, p_bonus_days int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_ref record;
begin
  select * into v_ref from public.referrals
  where referee_id = p_referee_id and rewarded = false
  for update;
  if not found then return; end if;

  perform set_config('app.allow_plan_change', 'on', true);

  -- referee (just became premium): stack the bonus on top
  update public.profiles
  set premium_until = greatest(coalesce(premium_until, now()), now()) + (p_bonus_days || ' days')::interval
  where id = p_referee_id;

  -- referrer: grant premium + bonus
  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + (p_bonus_days || ' days')::interval
  where id = v_ref.referrer_id;

  update public.referrals set rewarded = true, rewarded_at = now() where id = v_ref.id;
end;
$$;

-- ---------- hook the bonus into BOTH premium-activation paths ----------
create or replace function public.activate_from_payment(
  p_payment_code text, p_amount numeric, p_tx_id text, p_content text, p_raw jsonb, p_min_amount numeric, p_days_per_period int
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_profile record;
  v_periods int;
begin
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

  perform set_config('app.allow_plan_change', 'on', true);

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + (v_periods * p_days_per_period || ' days')::interval
  where id = v_profile.id;

  insert into public.payments (sepay_tx_id, profile_id, amount, transfer_content, status, raw)
  values (p_tx_id, v_profile.id, p_amount, p_content, 'activated', p_raw);

  -- Referral: +180 days (6 months) to BOTH families, once per referee
  perform public.grant_referral_bonus(v_profile.id, 180);

  return json_build_object('success', true, 'status', 'activated', 'profile_id', v_profile.id, 'periods', v_periods);
end;
$$;

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

  perform set_config('app.allow_plan_change', 'on', true);

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + (v_code.duration_days || ' days')::interval
  where id = v_uid;

  -- Referral bonus also applies when the referee activates via a code
  perform public.grant_referral_bonus(v_uid, 180);

  return json_build_object('success', true, 'plan', 'premium', 'duration_days', v_code.duration_days);
end;
$$;

-- ---------- grants ----------
revoke all on function public.grant_referral_bonus(uuid, int) from public, anon, authenticated;
grant execute on function public.apply_referral_code(text) to authenticated;
grant execute on function public.redeem_activation_code(text) to authenticated;
