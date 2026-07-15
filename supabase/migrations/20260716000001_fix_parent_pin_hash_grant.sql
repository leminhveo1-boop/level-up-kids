-- ============================================================
-- Fix R2 regression: 20260703000013's `revoke select (parent_pin_hash)
-- on public.profiles from anon, authenticated` was a no-op. anon/authenticated
-- already hold table-wide `grant select on public.profiles` (Supabase default
-- exposure) — Postgres column-level REVOKE cannot narrow a role that already
-- has table-level SELECT, so the bcrypt hash was still shipping in every
-- `select("*")` response (verified live: information_schema.column_privileges
-- showed anon/authenticated with SELECT on parent_pin_hash after the push).
-- Fix: drop the blanket table grant and re-grant an explicit column list
-- that omits parent_pin_hash — the only way Postgres actually restricts a
-- single column while keeping the rest of the table readable.
-- ============================================================

revoke select on public.profiles from anon, authenticated;

grant select (
  id, email, display_name, plan, premium_until, payment_code,
  locale, created_at, referral_code, referred_by, premium_since
) on public.profiles to anon, authenticated;
