-- ============================================================
-- ADMIN OPS V1 — bàn vận hành kích hoạt tay + sổ cái quyền (ledger)
-- Slice 1: CHỈ THÊM MỚI. KHÔNG đụng 3 RPC tiền đang chạy
-- (activate_from_payment / redeem_activation_code / grant_referral_bonus) —
-- việc hợp nhất chúng lên ledger để lại đợt sau khi có verify DB thật.
-- Run AFTER 20260716000004_fix_pgcrypto_search_path.sql.
-- Xem docs/PLAN_ADMIN_OPS.md.
-- ============================================================

-- ---------- 1. quyền admin (bật bằng SQL tay, không có UI cấp quyền) ----------
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Freeze is_admin against client self-promotion. Re-state the referral-era body
-- (0009) and add is_admin to the frozen set. The app.allow_plan_change bypass is
-- preserved so server RPCs can still legitimately move premium fields.
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
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

-- is_admin(): true iff the caller's profile is flagged. security definer so it
-- reads profiles regardless of RLS; every admin RPC calls it on line 1.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- 2. sổ cái quyền (append-only; thu hồi = void, không xoá) ----------
create table if not exists public.entitlement_grants (
  id            bigint generated always as identity primary key,
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  source        text not null check (source in ('sepay','code','referral','admin','migration','provisional')),
  source_ref    text not null,                 -- tx id | mã | referee | uuid thao tác
  days          int  not null,
  amount_vnd    numeric not null default 0,     -- tiền thực nhận (0 với tặng/referral)
  granted_by    uuid references public.profiles (id),
  reason        text,
  status        text not null default 'active' check (status in ('active','voided')),
  voided_by     uuid references public.profiles (id),
  voided_reason text,
  voided_at     timestamptz,
  created_at    timestamptz not null default now(),
  unique (source, source_ref)                   -- ⭐ idempotency ở tầng dữ liệu
);
create index if not exists entitlement_grants_profile_idx on public.entitlement_grants (profile_id);

alter table public.entitlement_grants enable row level security;
-- Chủ tài khoản đọc được sổ của chính mình (minh bạch); client KHÔNG ghi.
drop policy if exists entitlement_grants_select_own on public.entitlement_grants;
create policy entitlement_grants_select_own on public.entitlement_grants
  for select using (auth.uid() = profile_id);

-- ---------- 3. nhật ký thao tác admin (audit — append-only) ----------
create table if not exists public.admin_actions (
  id                bigint generated always as identity primary key,
  actor_id          uuid not null references public.profiles (id),
  target_profile_id uuid references public.profiles (id),
  action            text not null,
  before            jsonb,
  after             jsonb,
  note              text,
  created_at        timestamptz not null default now()
);
alter table public.admin_actions enable row level security;
-- Không policy client nào → chỉ definer/service đọc. Chặn sửa/xoá kể cả grant trực tiếp.
revoke update, delete on public.admin_actions from public, anon, authenticated;

-- ---------- 4. payments: thêm trạng thái 'manual' (kích hoạt tay) ----------
alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check
  check (status in ('received','activated','unmatched','ignored','manual'));

-- ============================================================
-- 5. RPC ADMIN — mọi hàm: security definer + gate is_admin() dòng đầu.
--    Cấp/sửa hạn PHẢI set_config('app.allow_plan_change','on') nếu không
--    trigger protect_profile_columns sẽ ÂM THẦM nuốt thay đổi.
-- ============================================================

create or replace function public.admin_stats()
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select json_build_object(
    'active_premium',     (select count(*) from public.profiles where plan='premium' and coalesce(premium_until,'epoch') > now()),
    'expiring_30d',       (select count(*) from public.profiles where plan='premium' and premium_until between now() and now() + interval '30 days'),
    'revenue_30d',        (select coalesce(sum(amount),0) from public.payments where status in ('activated','manual') and created_at > now() - interval '30 days'),
    'new_families_7d',    (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'unmatched_payments', (select count(*) from public.payments where status='unmatched')
  ) into v;
  return v;
end;
$$;

create or replace function public.admin_search_families(p_q text)
returns table (
  id uuid, email text, display_name text, plan text, premium_until timestamptz,
  payment_code text, referral_code text, referred_by uuid, child_count bigint, created_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_q is null or length(trim(p_q)) < 2 then return; end if;
  return query
    select p.id, p.email, p.display_name, p.plan, p.premium_until,
           p.payment_code, p.referral_code, p.referred_by,
           (select count(*) from public.children c where c.parent_id = p.id),
           p.created_at
    from public.profiles p
    where p.email ilike '%'||trim(p_q)||'%'
       or p.payment_code ilike '%'||trim(p_q)||'%'
       or p.referral_code ilike '%'||trim(p_q)||'%'
       or coalesce(p.display_name,'') ilike '%'||trim(p_q)||'%'
    order by p.created_at desc
    limit 25;
end;
$$;

create or replace function public.admin_grant_premium(
  p_profile_id uuid, p_days int, p_reason text, p_amount numeric default 0, p_tx_ref text default null
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := auth.uid();
  v_before timestamptz;
  v_after timestamptz;
  v_ref text;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_days is null or p_days < 1 or p_days > 400 then raise exception 'INVALID_DAYS'; end if;
  if p_reason is null or length(trim(p_reason)) = 0 then raise exception 'REASON_REQUIRED'; end if;

  select premium_until into v_before from public.profiles where id = p_profile_id;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

  -- A real bank tx ref makes this idempotent via unique(source,source_ref):
  -- a double-click re-inserting the same ref aborts the whole tx, no double grant.
  v_ref := coalesce(nullif(trim(p_tx_ref), ''), 'admin-' || gen_random_uuid()::text);

  perform set_config('app.allow_plan_change', 'on', true);
  update public.profiles
    set plan = 'premium',
        premium_until = greatest(coalesce(premium_until, now()), now()) + (p_days || ' days')::interval
    where id = p_profile_id
    returning premium_until into v_after;

  insert into public.entitlement_grants (profile_id, source, source_ref, days, amount_vnd, granted_by, reason)
    values (p_profile_id, 'admin', v_ref, p_days, coalesce(p_amount, 0), v_actor, p_reason);

  if coalesce(p_amount, 0) > 0 then
    insert into public.payments (sepay_tx_id, profile_id, amount, transfer_content, status, raw)
      values ('MANUAL-' || v_ref, p_profile_id, p_amount, p_reason, 'manual',
              json_build_object('by', v_actor, 'days', p_days)::jsonb)
      on conflict (sepay_tx_id) do nothing;
  end if;

  insert into public.admin_actions (actor_id, target_profile_id, action, before, after, note)
    values (v_actor, p_profile_id, 'grant_premium',
            json_build_object('premium_until', v_before)::jsonb,
            json_build_object('premium_until', v_after, 'days', p_days, 'amount', p_amount)::jsonb, p_reason);

  return json_build_object('success', true, 'premium_until', v_after);
end;
$$;

create or replace function public.admin_set_premium_until(p_profile_id uuid, p_until timestamptz, p_reason text)
returns json language plpgsql security definer set search_path = public as $$
declare v_actor uuid := auth.uid(); v_before timestamptz;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_reason is null or length(trim(p_reason)) = 0 then raise exception 'REASON_REQUIRED'; end if;
  select premium_until into v_before from public.profiles where id = p_profile_id;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

  perform set_config('app.allow_plan_change', 'on', true);
  update public.profiles
    set premium_until = p_until,
        plan = case when p_until is not null and p_until > now() then 'premium' else 'free' end
    where id = p_profile_id;

  insert into public.admin_actions (actor_id, target_profile_id, action, before, after, note)
    values (v_actor, p_profile_id, 'set_premium_until',
            json_build_object('premium_until', v_before)::jsonb,
            json_build_object('premium_until', p_until)::jsonb, p_reason);
  return json_build_object('success', true, 'premium_until', p_until);
end;
$$;

create or replace function public.admin_revoke_premium(p_profile_id uuid, p_reason text)
returns json language plpgsql security definer set search_path = public as $$
declare v_actor uuid := auth.uid(); v_before timestamptz;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_reason is null or length(trim(p_reason)) = 0 then raise exception 'REASON_REQUIRED'; end if;
  select premium_until into v_before from public.profiles where id = p_profile_id;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

  perform set_config('app.allow_plan_change', 'on', true);
  update public.profiles set plan = 'free', premium_until = now() where id = p_profile_id;

  update public.entitlement_grants
    set status = 'voided', voided_by = v_actor, voided_reason = p_reason, voided_at = now()
    where profile_id = p_profile_id and status = 'active';

  insert into public.admin_actions (actor_id, target_profile_id, action, before, after, note)
    values (v_actor, p_profile_id, 'revoke_premium',
            json_build_object('premium_until', v_before)::jsonb,
            json_build_object('premium_until', now())::jsonb, p_reason);
  return json_build_object('success', true);
end;
$$;

create or replace function public.admin_list_payments(p_status text default 'unmatched', p_limit int default 50)
returns setof public.payments language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  return query
    select * from public.payments
    where (p_status is null or status = p_status)
    order by created_at desc
    limit least(coalesce(p_limit, 50), 200);
end;
$$;

-- Sinh mã kích hoạt server-side (thay scripts/generate-codes.mjs — không cần
-- service-role key trên máy). Bảng chữ cái không mơ hồ (bỏ 0/O/1/I).
create or replace function public.admin_create_codes(p_count int, p_days int, p_note text)
returns setof text language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := auth.uid();
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_len int := length(v_alphabet);
  v_code text;
  v_seg text;
  i int; j int; k int;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_count is null or p_count < 1 or p_count > 100 then raise exception 'INVALID_COUNT'; end if;
  if p_days is null or p_days < 1 or p_days > 400 then raise exception 'INVALID_DAYS'; end if;

  for i in 1..p_count loop
    v_code := 'LUKID-';
    for k in 1..2 loop
      v_seg := '';
      for j in 1..4 loop
        v_seg := v_seg || substr(v_alphabet, 1 + floor(random() * v_len)::int, 1);
      end loop;
      v_code := v_code || v_seg || case when k = 1 then '-' else '' end;
    end loop;

    insert into public.activation_codes (code, plan, duration_days, note)
      values (v_code, 'premium', p_days, coalesce(nullif(trim(p_note), ''), 'admin ' || to_char(now(), 'YYYY-MM-DD')))
      on conflict (code) do nothing;
    if not found then continue; end if;  -- rare collision → skip, don't emit a code that wasn't stored

    insert into public.admin_actions (actor_id, action, after, note)
      values (v_actor, 'create_code', json_build_object('code', v_code, 'days', p_days)::jsonb, p_note);
    return next v_code;
  end loop;
end;
$$;

-- ---------- lock down: gate is is_admin() INSIDE each fn; grant execute broadly ----------
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_search_families(text) to authenticated;
grant execute on function public.admin_grant_premium(uuid, int, text, numeric, text) to authenticated;
grant execute on function public.admin_set_premium_until(uuid, timestamptz, text) to authenticated;
grant execute on function public.admin_revoke_premium(uuid, text) to authenticated;
grant execute on function public.admin_list_payments(text, int) to authenticated;
grant execute on function public.admin_create_codes(int, int, text) to authenticated;
