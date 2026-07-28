import { describe, test, expect } from "vitest";
import {
  ageGroupFor,
  restitutionEnabled,
  pledgeEnabled,
  extinctionEnabled,
  AGE_RESTITUTION_MIN,
  AGE_PLEDGE_MIN,
  YOUNG_KID_MAX,
} from "@/lib/game/age";

// now cố định để test tất định (không dùng new Date() runtime).
const NOW = new Date(2026, 6, 28); // 2026-07-28

describe("age §13 — ageGroupFor: quy nhóm tuổi cho hệ quả xu", () => {
  describe("có birthYear → known:true, tính chính xác", () => {
    test("6 tuổi (2020) → young_kid", () => {
      const r = ageGroupFor({ birthYear: 2020 }, NOW);
      expect(r).toMatchObject({ group: "young_kid", known: true, age: 6 });
    });
    test("8 tuổi (2018) → young_kid (ranh trên ≤8)", () => {
      expect(ageGroupFor({ birthYear: 2018 }, NOW)).toMatchObject({ group: "young_kid", known: true, age: 8 });
    });
    test("9 tuổi (2017) → older_kid (ranh dưới, bật Restitution)", () => {
      expect(ageGroupFor({ birthYear: 2017 }, NOW)).toMatchObject({ group: "older_kid", known: true, age: 9 });
    });
    test("11 tuổi (2015) → older_kid", () => {
      expect(ageGroupFor({ birthYear: 2015 }, NOW)).toMatchObject({ group: "older_kid", known: true, age: 11 });
    });
    test("12 tuổi (2014) → teen (ranh dưới, bật Cọc)", () => {
      expect(ageGroupFor({ birthYear: 2014 }, NOW)).toMatchObject({ group: "teen", known: true, age: 12 });
    });
    test("13 tuổi (2013) → teen", () => {
      expect(ageGroupFor({ birthYear: 2013 }, NOW)).toMatchObject({ group: "teen", known: true, age: 13 });
    });
  });

  describe("thiếu birthYear → known:false, fallback theo uiMode (bảo thủ)", () => {
    test("kid không tuổi → older_kid nhưng known:false (KHÔNG cho young_kid extinction, KHÔNG bật Restitution)", () => {
      const r = ageGroupFor({ uiMode: "kid" }, NOW);
      expect(r.known).toBe(false);
      expect(r.group).toBe("older_kid");
      expect(r.age).toBeUndefined();
    });
    test("teen không tuổi → teen, known:false", () => {
      expect(ageGroupFor({ uiMode: "teen" }, NOW)).toMatchObject({ group: "teen", known: false });
    });
    test("không có gì → mặc định older_kid known:false", () => {
      expect(ageGroupFor({}, NOW)).toMatchObject({ group: "older_kid", known: false });
    });
    test("birthYear = null coi như thiếu", () => {
      expect(ageGroupFor({ birthYear: null, uiMode: "kid" }, NOW).known).toBe(false);
    });
  });

  describe("birthYear rác → coi như thiếu (fallback uiMode)", () => {
    test("năm tương lai (tuổi âm) → known:false", () => {
      expect(ageGroupFor({ birthYear: 2030, uiMode: "kid" }, NOW).known).toBe(false);
    });
    test("năm quá cổ (tuổi >120) → known:false", () => {
      expect(ageGroupFor({ birthYear: 1800, uiMode: "teen" }, NOW).known).toBe(false);
    });
    test("không phải số nguyên → known:false", () => {
      expect(ageGroupFor({ birthYear: "hai-nghìn", uiMode: "kid" }, NOW).known).toBe(false);
      expect(ageGroupFor({ birthYear: 2015.5, uiMode: "kid" }, NOW).known).toBe(false);
    });
  });
});

describe("age §13 — predicate hệ quả (gate an toàn khi thiếu tuổi)", () => {
  describe("restitutionEnabled: CHỈ khi known && age≥9", () => {
    test("9 tuổi có tuổi → bật", () => {
      expect(restitutionEnabled(ageGroupFor({ birthYear: 2017 }, NOW))).toBe(true);
    });
    test("8 tuổi có tuổi → tắt", () => {
      expect(restitutionEnabled(ageGroupFor({ birthYear: 2018 }, NOW))).toBe(false);
    });
    test("kid thiếu tuổi (older_kid nhưng known:false) → TẮT (phải nhập tuổi mới dùng)", () => {
      expect(restitutionEnabled(ageGroupFor({ uiMode: "kid" }, NOW))).toBe(false);
    });
    test("teen thiếu tuổi → TẮT (vẫn cần biết tuổi thật cho việc đụng xu)", () => {
      expect(restitutionEnabled(ageGroupFor({ uiMode: "teen" }, NOW))).toBe(false);
    });
  });

  describe("pledgeEnabled: (known && age≥12) HOẶC uiMode teen", () => {
    test("12 tuổi có tuổi → bật", () => {
      expect(pledgeEnabled(ageGroupFor({ birthYear: 2014 }, NOW), "kid")).toBe(true);
    });
    test("11 tuổi có tuổi → tắt", () => {
      expect(pledgeEnabled(ageGroupFor({ birthYear: 2015 }, NOW), "kid")).toBe(false);
    });
    test("uiMode teen dù thiếu tuổi → bật (Cọc là tự nguyện opt-in, mặc định Điểm ⭐ không rủi ro)", () => {
      expect(pledgeEnabled(ageGroupFor({ uiMode: "teen" }, NOW), "teen")).toBe(true);
    });
  });

  describe("extinctionEnabled: pet xìu mạnh CHỈ cho young_kid (biết chắc ≤8)", () => {
    test("6 tuổi có tuổi → bật", () => {
      expect(extinctionEnabled(ageGroupFor({ birthYear: 2020 }, NOW))).toBe(true);
    });
    test("10 tuổi có tuổi → tắt (dùng Khiên thay vì extinction)", () => {
      expect(extinctionEnabled(ageGroupFor({ birthYear: 2016 }, NOW))).toBe(false);
    });
    test("kid thiếu tuổi → TẮT (không hạ cấp trẻ có thể 11 tuổi thành 'pet chết')", () => {
      expect(extinctionEnabled(ageGroupFor({ uiMode: "kid" }, NOW))).toBe(false);
    });
  });
});

describe("age §13 — hằng số ranh giới khớp spec", () => {
  test("ranh giới đúng 9/12/8", () => {
    expect(AGE_RESTITUTION_MIN).toBe(9);
    expect(AGE_PLEDGE_MIN).toBe(12);
    expect(YOUNG_KID_MAX).toBe(8);
  });
});
