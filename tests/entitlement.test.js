import { describe, test, expect } from "vitest";
import { computeExpiry, isValidGrantDays, MAX_GRANT_DAYS } from "@/lib/entitlement";

const DAY = 86400000;

describe("computeExpiry — stacking premium math (oracle for the SQL RPC)", () => {
  const now = "2026-07-25T00:00:00.000Z";

  test("no current expiry → now + days", () => {
    expect(computeExpiry(null, 365, now)).toBe("2027-07-25T00:00:00.000Z");
  });

  test("expiry in the PAST → stacks from now, not from the stale date", () => {
    // customer lapsed months ago; a fresh 365 must start today
    expect(computeExpiry("2026-01-01T00:00:00.000Z", 365, now)).toBe("2027-07-25T00:00:00.000Z");
  });

  test("expiry in the FUTURE → stacks on top of remaining time", () => {
    const future = "2027-07-25T00:00:00.000Z"; // exactly 1 year out
    // +180 days on top of the future date
    expect(computeExpiry(future, 180, now)).toBe(new Date(Date.parse(future) + 180 * DAY).toISOString());
  });

  test("exactly-now boundary counts as not-yet-expired (>= now keeps base)", () => {
    expect(computeExpiry(now, 30, now)).toBe(new Date(Date.parse(now) + 30 * DAY).toISOString());
  });
});

describe("isValidGrantDays — fat-finger guard on money-touching grants", () => {
  test("rejects zero and negatives", () => {
    expect(isValidGrantDays(0)).toBe(false);
    expect(isValidGrantDays(-5)).toBe(false);
  });
  test("accepts normal periods", () => {
    expect(isValidGrantDays(30)).toBe(true);
    expect(isValidGrantDays(365)).toBe(true);
    expect(isValidGrantDays(MAX_GRANT_DAYS)).toBe(true);
  });
  test("rejects above the ceiling (accidental 10-year grant)", () => {
    expect(isValidGrantDays(MAX_GRANT_DAYS + 1)).toBe(false);
    expect(isValidGrantDays(4000)).toBe(false);
  });
  test("rejects non-integers and NaN", () => {
    expect(isValidGrantDays(30.5)).toBe(false);
    expect(isValidGrantDays(NaN)).toBe(false);
    expect(isValidGrantDays("365")).toBe(false);
  });
});
