/**
 * Text display helpers (pure).
 */

// Ranges covering emoji, symbols, flags, dingbats, variation selectors and ZWJ.
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu;

/**
 * Remove decorative emoji from a display string (big-app clean lists).
 * Kid UI strips emoji from task/reward titles; game-data keeps them elsewhere.
 * @param {string} s
 * @returns {string}
 */
export function stripEmoji(s) {
  return (s || "").replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}
