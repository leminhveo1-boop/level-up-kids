/**
 * Payment helpers shared by the SePay webhook and (later) admin reconciliation.
 * Kept pure and free of Supabase so it's unit-testable in the node vitest env.
 */

// A parent's payment code is "LUK" + 8 unambiguous alphanumerics, placed in the
// bank-transfer memo so SePay can route the money to the right family.
const PAYMENT_CODE_RE = /LUK[A-Z0-9]{8}/;

/**
 * Extract the first LUK payment code from a bank-transfer memo, or null.
 * Case-insensitive because banks frequently normalise memo casing.
 *
 * @param {string|null|undefined} content
 * @returns {string|null}
 */
export function parsePaymentCode(content) {
  if (!content) return null;
  const match = String(content).toUpperCase().match(PAYMENT_CODE_RE);
  return match ? match[0] : null;
}

/**
 * Poll `onCheck` on an interval until a caller stops it or `maxMs` elapses.
 *
 * The SePay webhook activates premium SILENTLY server-side (no email/push, and
 * the client has no realtime subscription), so a parent waiting on the paywall
 * after a bank transfer would otherwise see nothing until a manual reload. This
 * lets the paywall re-fetch the account so the UI flips to "activated" on its
 * own. Kept as pure timer glue (no React/Supabase) so the stop/timeout/cleanup
 * logic is unit-testable in the node vitest env.
 *
 * ponytail: interval polling (ceiling = up to `intervalMs` latency + one query
 * per tick). Upgrade path = Supabase realtime on `profiles`, deliberately
 * deferred: realtime streams the full replicated row, which would leak the
 * column-grant-hidden `parent_pin_hash` to the client.
 *
 * @param {object} opts
 * @param {() => void | Promise<void>} opts.onCheck  runs each tick (e.g. refetch)
 * @param {number} opts.intervalMs  delay between ticks
 * @param {number} opts.maxMs  stop polling once this much time has elapsed
 * @returns {() => void} stop  clears the timer (call on unmount / activation)
 */
export function startActivationPoll({ onCheck, intervalMs, maxMs }) {
  let elapsed = 0;
  const id = setInterval(() => {
    elapsed += intervalMs;
    onCheck();
    if (elapsed >= maxMs) clearInterval(id);
  }, intervalMs);
  return () => clearInterval(id);
}
