"use client";

/**
 * Game SFX player — plays pre-generated WAVs (public/sounds/*, synthesized
 * in-house via scripts/generate-sounds.mjs, zero licensing concerns).
 * Falls back silently when audio is unavailable. Mute state persists.
 */

const MUTE_KEY = "luk_muted";

const SOUND_FILES = {
  "complete": "/sounds/complete.wav",
  "uncomplete": "/sounds/uncomplete.wav",
  "level-up": "/sounds/levelup.wav",
  "mine": "/sounds/mine.wav",
  "coin": "/sounds/coin.wav",
  "hatch": "/sounds/hatch.wav",
  "reward": "/sounds/reward.wav",
};

/** @type {Record<string, HTMLAudioElement>} */
const cache = {};

export function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

/** @returns {boolean} the new muted state */
export function toggleMuted() {
  const next = !isMuted();
  try {
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
  return next;
}

/**
 * @param {"complete"|"uncomplete"|"level-up"|"mine"|"coin"|"hatch"|"reward"} type
 */
export function playSound(type) {
  if (typeof window === "undefined") return;
  if (isMuted()) return;

  const src = SOUND_FILES[type];
  if (!src) return;

  try {
    if (!cache[src]) {
      cache[src] = new Audio(src);
      cache[src].preload = "auto";
    }
    // cloneNode allows overlapping plays (rapid mining clicks)
    const node = /** @type {HTMLAudioElement} */ (cache[src].cloneNode());
    node.volume = 0.6;
    node.play().catch(() => {});
  } catch {
    /* audio unavailable — non-critical */
  }
}
