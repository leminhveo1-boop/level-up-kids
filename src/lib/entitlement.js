/**
 * Entitlement (premium) math — the single JS source of truth AND the test
 * oracle for the SQL RPCs that touch money.
 *
 * The SQL side (admin_grant_premium et al.) mirrors `computeExpiry` with
 *   premium_until = greatest(coalesce(premium_until, now()), now()) + days
 * Keep the two in lockstep; `tests/entitlement.test.js` pins the behaviour so a
 * future edit to either side that drifts gets caught.
 */

const DAY_MS = 86400000;

/** Hard ceiling on a single grant — a fat-finger guard on money (see isValidGrantDays). */
export const MAX_GRANT_DAYS = 400;

/**
 * Stack `days` of premium on top of an existing expiry, never shortening it.
 * A lapsed (past) expiry restarts from `now`; a future one extends from itself.
 *
 * @param {string|null} currentUntilISO - existing premium_until, or null if none
 * @param {number} days - days to add (assumed already validated)
 * @param {string} nowISO - current instant as ISO string
 * @returns {string} new premium_until as an ISO string
 */
export function computeExpiry(currentUntilISO, days, nowISO) {
  const now = Date.parse(nowISO);
  const current = currentUntilISO ? Date.parse(currentUntilISO) : now;
  const base = Math.max(current, now);
  return new Date(base + days * DAY_MS).toISOString();
}

/**
 * A grant length is valid iff it's a positive integer within the ceiling.
 * Guards against 0/negative/NaN and accidental decade-long grants.
 *
 * @param {unknown} days
 * @returns {boolean}
 */
export function isValidGrantDays(days) {
  return Number.isInteger(days) && days >= 1 && days <= MAX_GRANT_DAYS;
}
