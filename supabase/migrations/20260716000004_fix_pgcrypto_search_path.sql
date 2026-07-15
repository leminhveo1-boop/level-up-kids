-- ============================================================
-- HOTFIX: parent-PIN functions couldn't resolve crypt()/gen_salt().
--
-- pgcrypto lives in the `extensions` schema on Supabase, but verify_parent_pin,
-- set_parent_pin and reset_parent_pin were all declared `set search_path =
-- public` — which shadows the DB default that includes `extensions`. So every
-- call raised `42883 function crypt(text, text) does not exist`, meaning:
--   - cloud parents entering the CORRECT PIN were told "PIN không khớp" (locked
--     out of the parent room entirely),
--   - set_parent_pin / reset_parent_pin (forgot-PIN) errored too.
-- This was latent since 20260703000013 (same search_path) and NOT caught because
-- earlier "verification" only checked the functions existed, never ran them.
--
-- Fix: pin the search_path to `public, extensions` so crypt/gen_salt resolve
-- while keeping public first for profiles. Bodies are otherwise unchanged from
-- 20260716000002 / 20260716000003. CREATE OR REPLACE preserves existing grants.
--
-- ponytail: reset_parent_pin still shares the PIN lockout (a parent locked out
-- by 5 wrong PINs waits up to 5 min before forgot-PIN works). Acceptable for v1
-- (short, and the shared counter also throttles password-guessing on reset). If
-- that wait becomes a real complaint, give reset its own separate lockout field.
-- ============================================================

create or replace function public.verify_parent_pin(p_pin text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
  v_locked_until timestamptz;
  v_ok boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  select parent_pin_hash, pin_locked_until into v_hash, v_locked_until
    from public.profiles where id = auth.uid();

  if v_locked_until is not null and v_locked_until > now() then
    return false;
  end if;

  v_ok := v_hash is not null and v_hash = crypt(p_pin, v_hash);
  perform public.record_pin_attempt(v_ok);
  return v_ok;
end;
$$;

create or replace function public.set_parent_pin(p_new_pin text, p_old_pin text default null)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
  v_locked_until timestamptz;
  v_ok boolean;
begin
  if auth.uid() is null or length(coalesce(p_new_pin, '')) < 4 then
    return false;
  end if;

  select parent_pin_hash, pin_locked_until into v_hash, v_locked_until
    from public.profiles where id = auth.uid();

  if v_locked_until is not null and v_locked_until > now() then
    return false;
  end if;

  -- first-time onboarding (no hash yet) needs no old PIN -> always "ok"
  v_ok := v_hash is null or (p_old_pin is not null and v_hash = crypt(p_old_pin, v_hash));
  if v_hash is not null then
    perform public.record_pin_attempt(v_ok);
  end if;
  if not v_ok then
    return false;
  end if;

  update public.profiles set parent_pin_hash = crypt(p_new_pin, gen_salt('bf')) where id = auth.uid();
  return true;
end;
$$;

create or replace function public.reset_parent_pin(p_account_password text, p_new_pin text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v_enc text;
  v_locked_until timestamptz;
  v_ok boolean;
begin
  if auth.uid() is null or length(coalesce(p_new_pin, '')) < 4 then
    return false;
  end if;

  select pin_locked_until into v_locked_until from public.profiles where id = auth.uid();
  if v_locked_until is not null and v_locked_until > now() then
    return false;
  end if;

  select encrypted_password into v_enc from auth.users where id = auth.uid();
  v_ok := v_enc is not null and v_enc = crypt(p_account_password, v_enc);
  perform public.record_pin_attempt(v_ok);
  if not v_ok then
    return false;
  end if;

  update public.profiles set parent_pin_hash = crypt(p_new_pin, gen_salt('bf')) where id = auth.uid();
  return true;
end;
$$;
