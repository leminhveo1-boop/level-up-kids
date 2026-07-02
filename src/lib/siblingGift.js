/**
 * D3: cross-sibling gift delivery — CLIENT-ONLY, side-effecting.
 * Not part of lib/game/* (which stays pure): a gift must read + write a
 * SIBLING's state, not the active child's, so it can't run through the
 * normal single-active-child GameState reducer. The whole family shares one
 * Supabase Auth session (parent's), so this is allowed under the existing
 * `game_states_all_own` RLS policy — no new backend policy needed.
 */

import { migrateState } from "@/lib/game/migrate";
import { applyGiftToRecipient } from "@/lib/game/gifting";

const stateKeyFor = (childId) => `luk_state_${childId}`;

/**
 * Deliver a gift to a sibling's saved state (local + cloud), reusing the
 * same self-healing migration and cloud-newest-wins merge as the normal load.
 * @param {{ toChildId: string, giftId: string, fromName: string, supabase: object|null, cloudEnabled: boolean }} opts
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deliverGiftToSibling({ toChildId, giftId, fromName, supabase, cloudEnabled }) {
  if (!toChildId) return { success: false, error: "NO_RECIPIENT" };

  let localData = null;
  try {
    const raw = localStorage.getItem(stateKeyFor(toChildId));
    if (raw) localData = JSON.parse(raw);
  } catch {
    localData = null;
  }

  let cloudData = null;
  const canUseCloud = cloudEnabled && supabase && !String(toChildId).startsWith("local_");
  if (canUseCloud) {
    const { data } = await supabase
      .from("game_states")
      .select("state, updated_at")
      .eq("child_id", toChildId)
      .maybeSingle();
    if (data?.state) cloudData = { ...data.state, savedAt: new Date(data.updated_at).getTime() };
  }

  const chosen =
    localData && cloudData
      ? (cloudData.savedAt || 0) > (localData.savedAt || 0)
        ? cloudData
        : localData
      : cloudData || localData;

  const currentState = migrateState(chosen);
  const nextState = applyGiftToRecipient(currentState, giftId, fromName);
  const toSave = { ...nextState, savedAt: Date.now() };

  try {
    localStorage.setItem(stateKeyFor(toChildId), JSON.stringify(toSave));
  } catch {
    /* storage full/unavailable — cloud write still covers delivery */
  }

  if (canUseCloud) {
    const { error } = await supabase
      .from("game_states")
      .upsert({ child_id: toChildId, state: toSave, updated_at: new Date().toISOString() });
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}
