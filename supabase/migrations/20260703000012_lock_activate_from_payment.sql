-- ============================================================
-- Defense-in-depth re-statement of activate_from_payment's lockdown.
--
-- Verified this is NOT currently exploitable: the function's privileges
-- were revoked from public/anon/authenticated in 20260702000001_init.sql
-- and again in 20260702000005_fix_plan_protect.sql. Its later redefinition
-- in 20260702000009_referral.sql used CREATE OR REPLACE FUNCTION with the
-- exact same signature (text, numeric, text, text, jsonb, numeric, int) —
-- Postgres preserves a function's ACL across CREATE OR REPLACE when the
-- signature is unchanged, so that redefinition did NOT reset the grants.
--
-- This migration just re-states the revoke explicitly so the lockdown is
-- self-documenting and doesn't silently depend on that CREATE OR REPLACE
-- nuance holding forever (e.g. a future migration that DROPs + recreates
-- the function instead would reset to default privileges).
-- ============================================================

revoke all on function public.activate_from_payment(text, numeric, text, text, jsonb, numeric, int) from public, anon, authenticated;
