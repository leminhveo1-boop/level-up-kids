-- ============================================================
-- Move parent PIN verification server-side (R2 fix).
--
-- Today `parentPin` lives inside game_states.state (JSONB), which the
-- client reads/writes wholesale (`select("*")`-style loads, see
-- src/context/GameState.js). Any authenticated session — including the
-- kid, on the family's shared login — can read the plaintext PIN straight
-- out of the Supabase response/devtools, defeating the whole point of the
-- PIN gate. This adds a hashed PIN column on profiles plus two RPCs
-- (verify/set) that never return the hash to the client, and the app now
-- calls them for any "cloud child" (see AuthContext.js's isCloudChild).
-- Local-only children (id starts with "local_" — no children/profiles row
-- to hang a hash off) have no server to call, so they keep the old
-- client-side comparison as an offline fallback (approved default; no
-- cloud data at risk there).
-- ============================================================

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists parent_pin_hash text;

-- Backfill: carry over each family's existing PIN so upgrading doesn't
-- silently reset anyone's mã PIN. A parent PIN is per-family but was
-- stored redundantly per child — pick whichever child's copy was written
-- most recently as the source of truth (that's the one the parent most
-- recently confirmed via SystemTab/onboarding).
update public.profiles p
set parent_pin_hash = crypt(pin_data.pin, gen_salt('bf'))
from (
  select distinct on (c.parent_id) c.parent_id, (gs.state ->> 'parentPin') as pin
  from public.children c
  join public.game_states gs on gs.child_id = c.id
  where gs.state ->> 'parentPin' is not null
  order by c.parent_id, gs.updated_at desc
) pin_data
where p.id = pin_data.parent_id
  and p.parent_pin_hash is null;

-- Any profile still without a hash (no children yet, or no PIN ever saved)
-- gets the same "1234" default the client used to seed into game state.
update public.profiles set parent_pin_hash = crypt('1234', gen_salt('bf')) where parent_pin_hash is null;

-- Strip the now-redundant plaintext copy from every already-synced state row
-- (it's been backfilled into parent_pin_hash above; the client no longer
-- reads or writes state.parentPin for cloud children going forward — see
-- GameState.js's isCloudChild branches). Without this, existing families'
-- real PINs would keep sitting in plaintext in game_states.state forever.
update public.game_states set state = state - 'parentPin' where state ? 'parentPin';

-- ============================================================
-- RPC: verify_parent_pin — returns true/false only, never the hash.
-- ============================================================
create or replace function public.verify_parent_pin(p_pin text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_hash text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select parent_pin_hash into v_hash from public.profiles where id = auth.uid();
  return v_hash is not null and v_hash = crypt(p_pin, v_hash);
end;
$$;

-- ============================================================
-- RPC: set_parent_pin — requires the current PIN, unless none is set yet
-- (first-time onboarding). Re-checking here (not just at room entry)
-- matters because the room-level gate is client-side React state.
-- ============================================================
create or replace function public.set_parent_pin(p_new_pin text, p_old_pin text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_hash text;
begin
  if auth.uid() is null or length(coalesce(p_new_pin, '')) < 4 then
    return false;
  end if;
  select parent_pin_hash into v_hash from public.profiles where id = auth.uid();
  if v_hash is not null and (p_old_pin is null or v_hash <> crypt(p_old_pin, v_hash)) then
    return false;
  end if;
  update public.profiles set parent_pin_hash = crypt(p_new_pin, gen_salt('bf')) where id = auth.uid();
  return true;
end;
$$;

revoke all on function public.verify_parent_pin(text) from public, anon;
revoke all on function public.set_parent_pin(text, text) from public, anon;
grant execute on function public.verify_parent_pin(text) to authenticated;
grant execute on function public.set_parent_pin(text, text) to authenticated;

-- Column-level lockdown: profiles is read via `select("*")` from the client
-- (src/context/AuthContext.js refreshAccount) — without this, the bcrypt
-- hash would ship straight to the browser, and a 4-6 digit PIN is cheap
-- enough to brute-force offline even hashed. PostgREST honors column
-- grants, so parent_pin_hash is simply omitted from `select=*` responses.
revoke select (parent_pin_hash) on public.profiles from anon, authenticated;
