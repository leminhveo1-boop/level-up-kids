-- ============================================================
-- V1.1 — Paid-only model: free accounts are DEMO-ONLY (0 real children)
-- Premium (199k/year) unlocks up to 6 children.
-- Run AFTER 0001_init.sql.
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

  -- Paid-only: creating ANY real child requires an active premium plan
  if parent_plan <> 'premium' or coalesce(parent_premium_until, 'epoch') < now() then
    raise exception 'PREMIUM_REQUIRED';
  end if;

  select count(*) into child_count from public.children where parent_id = new.parent_id;
  if child_count >= 6 then
    raise exception 'MAX_CHILDREN_REACHED';
  end if;

  return new;
end;
$$;
