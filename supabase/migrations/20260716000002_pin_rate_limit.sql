-- ============================================================
-- Rate-limit parent PIN verification (security-audit 2026-07-16, finding 2.2).
--
-- `verify_parent_pin`/`set_parent_pin` (20260703000013) had no attempt limit:
-- the kid's own authenticated session (shared family login — the exact
-- session the PIN gate exists to restrict) could call either RPC in a loop
-- and brute-force a 4-6 digit PIN in well under 10,000 tries. Closing the
-- hash-disclosure hole (R2) didn't close this — the PIN was still guessable
-- online. Adds a simple counter + short lockout, shared by both RPCs.
-- ============================================================

alter table public.profiles add column if not exists pin_fail_count int not null default 0;
alter table public.profiles add column if not exists pin_locked_until timestamptz;

-- 5 wrong attempts -> 5 minute lockout. Loose enough not to lock a parent out
-- over fat-fingering, tight enough that a 10,000-combination brute force
-- (4-digit PIN) takes over 8 days instead of seconds.
create or replace function public.record_pin_attempt(p_ok boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_ok then
    update public.profiles set pin_fail_count = 0, pin_locked_until = null where id = auth.uid();
  else
    update public.profiles
    set pin_fail_count = pin_fail_count + 1,
        pin_locked_until = case when pin_fail_count + 1 >= 5 then now() + interval '5 minutes' else pin_locked_until end
    where id = auth.uid();
  end if;
end;
$$;

create or replace function public.verify_parent_pin(p_pin text)
returns boolean language plpgsql security definer set search_path = public as $$
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
returns boolean language plpgsql security definer set search_path = public as $$
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

revoke all on function public.record_pin_attempt(boolean) from public, anon, authenticated;
revoke all on function public.verify_parent_pin(text) from public, anon;
revoke all on function public.set_parent_pin(text, text) from public, anon;
grant execute on function public.verify_parent_pin(text) to authenticated;
grant execute on function public.set_parent_pin(text, text) to authenticated;
