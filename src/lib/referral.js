/**
 * Referral helpers — PURE, framework-free. The reward logic itself lives in the
 * Supabase RPCs (apply_referral_code / grant_referral_bonus); these just format
 * and validate the shareable code on the client.
 */

const CODE_RE = /^REF[A-Z0-9]{6}$/;

/** Uppercase, trim, and remove all inner whitespace. */
export function normalizeReferralCode(input) {
  if (!input) return "";
  return String(input).toUpperCase().replace(/\s+/g, "");
}

/** True when the (normalized) code matches the REF + 6 alphanumerics format. */
export function isValidReferralCode(input) {
  return CODE_RE.test(normalizeReferralCode(input));
}

/** Deep link that prefills the referral input on the premium page. */
export function buildReferralLink(origin, code) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return "";
  const base = String(origin || "").replace(/\/+$/, "");
  return `${base}/premium?ref=${normalized}`;
}
