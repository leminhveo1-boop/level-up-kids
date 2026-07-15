-- ============================================================
-- Forgot-PIN self-service reset (product gap found 2026-07-16).
--
-- Problem: a parent who forgets the PIN was locked out of the parent room
-- with no in-app recovery — set_parent_pin (20260703000013) requires the OLD
-- pin, and the rate-limit lockout (20260716000002) makes a forgotten PIN feel
-- permanent. The naive fix ("an RPC that resets without the old PIN") is unsafe
-- here: the THREAT is the child, who already holds the shared family session,
-- so any authenticated-callable reset RPC could be called straight from the
-- browser console by the child, defeating the PIN entirely.
--
-- Fix: verify the ACCOUNT PASSWORD *inside* the RPC (SECURITY DEFINER), against
-- auth.users.encrypted_password. The child shares the session but not the
-- password, so this is the one secret they don't have. Reuses record_pin_attempt
-- so this RPC can't double as an unthrottled password-guessing oracle.
--
-- ponytail: depends on GoTrue storing the password as a bcrypt hash that
-- pgcrypto's crypt() can verify (true today). If Supabase migrates auth to a
-- different KDF (e.g. argon2), this crypt() comparison stops matching and the
-- reset would always fail — revisit then (Supabase would likely expose a
-- native reauthentication RPC to replace this).
-- ============================================================

create or replace function public.reset_parent_pin(p_account_password text, p_new_pin text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_enc text;
  v_locked_until timestamptz;
  v_ok boolean;
begin
  if auth.uid() is null or length(coalesce(p_new_pin, '')) < 4 then
    return false;
  end if;

  -- Honour the same lockout as verify/set so this path can't bypass the throttle.
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

revoke all on function public.reset_parent_pin(text, text) from public, anon;
grant execute on function public.reset_parent_pin(text, text) to authenticated;
