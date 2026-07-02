import { describe, test, expect } from "vitest";
import { normalizeReferralCode, isValidReferralCode, buildReferralLink } from "@/lib/referral";

describe("normalizeReferralCode", () => {
  test("trims, uppercases, strips inner spaces", () => {
    expect(normalizeReferralCode("  ref abc123 ")).toBe("REFABC123");
  });
  test("null/undefined → empty string", () => {
    expect(normalizeReferralCode(null)).toBe("");
    expect(normalizeReferralCode(undefined)).toBe("");
  });
});

describe("isValidReferralCode", () => {
  test.each([
    ["REFAB12CD", true],
    ["ref ab12cd", true], // normalized before checking
    ["REF12345", false], // too short (needs 6 after REF)
    ["REFABC1234", false], // too long
    ["XYZABC123", false], // wrong prefix
    ["", false],
  ])("%s → %s", (code, expected) => {
    expect(isValidReferralCode(code)).toBe(expected);
  });
});

describe("buildReferralLink", () => {
  test("builds a /premium?ref= deep link with normalized code", () => {
    expect(buildReferralLink("https://levelupkids.vn", " ref abc123 ")).toBe(
      "https://levelupkids.vn/premium?ref=REFABC123"
    );
  });
  test("strips a trailing slash on origin", () => {
    expect(buildReferralLink("https://x.vn/", "REFABC123")).toBe("https://x.vn/premium?ref=REFABC123");
  });
  test("empty code → empty string (nothing to share)", () => {
    expect(buildReferralLink("https://x.vn", "")).toBe("");
  });
});
