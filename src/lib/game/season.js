/**
 * D7 "Mùa" — fixed multi-week seasons that create a Fresh Start effect
 * (SCIENTIFIC_UPGRADE P3): a countdown that reframes a slump as "next season
 * is a clean slate." PURE derivation from the current time + a fixed anchor.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

// Anchor of season 1 (local midnight-ish). Seasons roll every 8 weeks from here.
export const SEASON_ANCHOR_MS = Date.parse("2026-06-01T00:00:00");
export const SEASON_LENGTH_WEEKS = 8;
export const SEASON_LENGTH_DAYS = SEASON_LENGTH_WEEKS * 7;
export const SEASON_ENDING_SOON_DAYS = 5; // "mùa sắp kết thúc" nudge window

/**
 * @param {number} [now] epoch ms
 * @returns {{ index: number, weekIndex: number, weeksTotal: number,
 *             dayOfSeason: number, daysLeft: number, progressPct: number, endingSoon: boolean }}
 */
export function computeSeason(now = Date.now()) {
  const elapsedDays = Math.floor((now - SEASON_ANCHOR_MS) / DAY_MS);
  const safeElapsed = Math.max(0, elapsedDays); // before the anchor → treat as season 1 day 1

  const index = Math.floor(safeElapsed / SEASON_LENGTH_DAYS) + 1;
  const dayZeroBased = safeElapsed % SEASON_LENGTH_DAYS;
  const weekIndex = Math.floor(dayZeroBased / 7) + 1;
  const daysLeft = SEASON_LENGTH_DAYS - dayZeroBased;
  const progressPct = Math.round((dayZeroBased / SEASON_LENGTH_DAYS) * 100);

  return {
    index,
    weekIndex,
    weeksTotal: SEASON_LENGTH_WEEKS,
    dayOfSeason: dayZeroBased + 1, // 1-based for display
    daysLeft,
    progressPct,
    endingSoon: daysLeft <= SEASON_ENDING_SOON_DAYS,
  };
}
