import { describe, test, expect } from "vitest";
import { computeSeason, SEASON_ANCHOR_MS, SEASON_LENGTH_DAYS } from "@/lib/game/season";

const day = 24 * 60 * 60 * 1000;

describe("computeSeason (D7 Mùa — Fresh Start)", () => {
  test("đúng ngày mốc → Mùa 1, tuần 1, ngày đầu", () => {
    const s = computeSeason(SEASON_ANCHOR_MS);
    expect(s.index).toBe(1);
    expect(s.weekIndex).toBe(1);
    expect(s.dayOfSeason).toBe(1);
    expect(s.daysLeft).toBe(SEASON_LENGTH_DAYS);
  });

  test("giữa mùa → tuần & ngày còn lại tính đúng", () => {
    const s = computeSeason(SEASON_ANCHOR_MS + 10 * day); // ngày 11
    expect(s.index).toBe(1);
    expect(s.weekIndex).toBe(2); // ngày 11 → tuần 2
    expect(s.daysLeft).toBe(SEASON_LENGTH_DAYS - 10);
  });

  test("qua hết 1 mùa → sang Mùa 2", () => {
    const s = computeSeason(SEASON_ANCHOR_MS + SEASON_LENGTH_DAYS * day);
    expect(s.index).toBe(2);
    expect(s.weekIndex).toBe(1);
    expect(s.dayOfSeason).toBe(1);
  });

  test("gần cuối mùa → endingSoon", () => {
    const near = computeSeason(SEASON_ANCHOR_MS + (SEASON_LENGTH_DAYS - 3) * day);
    expect(near.endingSoon).toBe(true);
    const early = computeSeason(SEASON_ANCHOR_MS + 5 * day);
    expect(early.endingSoon).toBe(false);
  });

  test("trước ngày mốc → an toàn về Mùa 1 tuần 1", () => {
    const s = computeSeason(SEASON_ANCHOR_MS - 5 * day);
    expect(s.index).toBe(1);
    expect(s.weekIndex).toBe(1);
  });

  test("progressPct trong 0..100", () => {
    const s = computeSeason(SEASON_ANCHOR_MS + 28 * day);
    expect(s.progressPct).toBeGreaterThanOrEqual(0);
    expect(s.progressPct).toBeLessThanOrEqual(100);
  });
});
