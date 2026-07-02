-- ============================================================
-- FIX: protect_profile_columns blocked the redeem RPC itself
-- (RPC runs under the caller's JWT → auth.uid() = new.id → plan reverted,
--  burning the activation code without granting premium).
-- Solution: transaction-local escape hatch set ONLY inside trusted
-- security-definer functions.
-- ============================================================

create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer as $$
begin
  -- Trusted server-side paths (redeem RPC, payment RPC) set this flag
  if current_setting('app.allow_plan_change', true) = 'on' then
    return new;
  end if;

  if auth.uid() = new.id and current_setting('request.jwt.claims', true) is not null then
    new.plan := old.plan;
    new.premium_until := old.premium_until;
    new.payment_code := old.payment_code;
  end if;
  return new;
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

  -- transaction-local flag lets the protect trigger through
  perform set_config('app.allow_plan_change', 'on', true);

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + (v_code.duration_days || ' days')::interval
  where id = v_uid;

  return json_build_object('success', true, 'plan', 'premium', 'duration_days', v_code.duration_days);
end;
$$;

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

  return json_build_object('success', true, 'status', 'activated', 'profile_id', v_profile.id, 'periods', v_periods);
end;
$$;

revoke all on function public.activate_from_payment(text, numeric, text, text, jsonb, numeric, int) from public, anon, authenticated;
grant execute on function public.redeem_activation_code(text) to authenticated;
