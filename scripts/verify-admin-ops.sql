-- ============================================================
-- VERIFY admin-ops RPCs — chạy hàm THẬT, mô phỏng JWT claims, rồi ROLLBACK.
-- KHÔNG persist gì. Chạy SAU khi đã apply 20260725000001 + 000002.
--
-- Cách chạy (Supabase SQL Editor hoặc psql tới DB prod):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/verify-admin-ops.sql
-- Kỳ vọng: in "✅ ALL ADMIN-OPS TESTS PASSED" rồi ROLLBACK. Bất kỳ assert nào
-- sai → EXCEPTION dừng ngay (không có dòng PASSED).
-- ============================================================

begin;

-- Ba tài khoản nháp; trigger handle_new_user tự tạo profiles tương ứng.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-0000000000a1','authenticated','authenticated','admin@verify.local','', now(), now(), now(),'{}','{"display_name":"Admin"}'),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-0000000000b2','authenticated','authenticated','target@verify.local','', now(), now(), now(),'{}','{"display_name":"Target"}'),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-0000000000c3','authenticated','authenticated','normal@verify.local','', now(), now(), now(),'{}','{"display_name":"Normal"}');

update public.profiles set is_admin = true where id = '00000000-0000-0000-0000-0000000000a1';

do $$
declare
  v_admin  uuid := '00000000-0000-0000-0000-0000000000a1';
  v_target uuid := '00000000-0000-0000-0000-0000000000b2';
  v_normal uuid := '00000000-0000-0000-0000-0000000000c3';
  v_res json;
  v_until timestamptz;
  v_cnt int;
begin
  -- ---- become the NORMAL (non-admin) user ----
  perform set_config('request.jwt.claims', json_build_object('sub', v_normal)::text, true);

  -- 1) non-admin must be FORBIDDEN on every admin RPC
  begin
    perform public.admin_grant_premium(v_target, 365, 'hack');
    raise exception 'FAIL 1a: non-admin grant should be FORBIDDEN';
  exception when others then
    if sqlerrm not like '%FORBIDDEN%' then raise exception 'FAIL 1a wrong error: %', sqlerrm; end if;
  end;
  begin
    perform public.admin_stats();
    raise exception 'FAIL 1b: non-admin stats should be FORBIDDEN';
  exception when others then
    if sqlerrm not like '%FORBIDDEN%' then raise exception 'FAIL 1b wrong error: %', sqlerrm; end if;
  end;
  begin
    perform public.admin_create_codes(1, 365, 'hack');
    raise exception 'FAIL 1c: non-admin create_codes should be FORBIDDEN';
  exception when others then
    if sqlerrm not like '%FORBIDDEN%' then raise exception 'FAIL 1c wrong error: %', sqlerrm; end if;
  end;

  -- 2) non-admin CANNOT self-promote (protect_profile_columns freezes is_admin)
  update public.profiles set is_admin = true where id = v_normal;
  if (select is_admin from public.profiles where id = v_normal) then
    raise exception 'FAIL 2: normal user self-promoted to admin!';
  end if;

  -- ---- become the ADMIN ----
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin)::text, true);

  -- 3) grant 365 days to a fresh target → premium_until ≈ now()+365
  v_res := public.admin_grant_premium(v_target, 365, 'verify grant', 199000, 'BANK-TX-1');
  select premium_until into v_until from public.profiles where id = v_target;
  if v_until is null or v_until < now() + interval '364 days' or v_until > now() + interval '366 days' then
    raise exception 'FAIL 3: premium_until off: %', v_until;
  end if;
  if (select plan from public.profiles where id = v_target) <> 'premium' then
    raise exception 'FAIL 3: plan not premium';
  end if;
  -- ledger + audit + manual payment rows written
  if (select count(*) from public.entitlement_grants where profile_id = v_target and source='admin') <> 1 then
    raise exception 'FAIL 3: expected exactly 1 ledger grant';
  end if;
  if (select count(*) from public.admin_actions where target_profile_id = v_target and action='grant_premium') <> 1 then
    raise exception 'FAIL 3: expected 1 audit row';
  end if;
  if (select count(*) from public.payments where profile_id = v_target and status='manual') <> 1 then
    raise exception 'FAIL 3: expected 1 manual payment row';
  end if;

  -- 4) idempotency: same bank tx ref again → aborts (unique), no double grant
  begin
    perform public.admin_grant_premium(v_target, 365, 'verify grant dup', 199000, 'BANK-TX-1');
    raise exception 'FAIL 4: duplicate tx ref should have raised unique violation';
  exception when unique_violation then
    null;  -- expected
  end;

  -- 5) fat-finger guard: 4000 days rejected
  begin
    perform public.admin_grant_premium(v_target, 4000, 'oops');
    raise exception 'FAIL 5: 4000-day grant should be INVALID_DAYS';
  exception when others then
    if sqlerrm not like '%INVALID_DAYS%' then raise exception 'FAIL 5 wrong error: %', sqlerrm; end if;
  end;

  -- 6) reason required
  begin
    perform public.admin_grant_premium(v_target, 30, '   ');
    raise exception 'FAIL 6: blank reason should be REASON_REQUIRED';
  exception when others then
    if sqlerrm not like '%REASON_REQUIRED%' then raise exception 'FAIL 6 wrong error: %', sqlerrm; end if;
  end;

  -- 7) revoke → free + all active grants voided
  perform public.admin_revoke_premium(v_target, 'refund');
  if (select plan from public.profiles where id = v_target) <> 'free' then
    raise exception 'FAIL 7: plan should be free after revoke';
  end if;
  if (select count(*) from public.entitlement_grants where profile_id = v_target and status='active') <> 0 then
    raise exception 'FAIL 7: active grants should be voided';
  end if;

  -- 8) create codes → rows land in activation_codes with the LUKID- shape
  select count(*) into v_cnt from public.admin_create_codes(3, 180, 'verify batch');
  if v_cnt <> 3 then raise exception 'FAIL 8: expected 3 codes, got %', v_cnt; end if;
  if (select count(*) from public.activation_codes where note='verify batch' and code like 'LUKID-%') <> 3 then
    raise exception 'FAIL 8: codes not stored in expected shape';
  end if;

  -- 9) search finds the target by email fragment
  if (select count(*) from public.admin_search_families('target@verify')) < 1 then
    raise exception 'FAIL 9: search did not find target';
  end if;

  -- 10) expire_premium hạ plan của nhà đã hết hạn
  perform set_config('app.allow_plan_change','on',true);
  update public.profiles set plan='premium', premium_until = now() - interval '1 day' where id = v_target;
  perform public.expire_premium();
  if (select plan from public.profiles where id = v_target) <> 'free' then
    raise exception 'FAIL 10: expire_premium did not downgrade lapsed family';
  end if;

  raise notice '✅ ALL ADMIN-OPS TESTS PASSED';
end
$$;

rollback;
