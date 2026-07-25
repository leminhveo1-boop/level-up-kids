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
