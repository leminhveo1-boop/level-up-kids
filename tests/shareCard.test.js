import { describe, test, expect } from "vitest";
import { buildShareCard } from "@/lib/game/shareCard";

const wc = (over = {}) => ({ status: "flat", thisWeek: 0, deltaPct: 0, ...over });

describe("buildShareCard — chọn nội dung thẻ chia sẻ", () => {
  describe("milestone (peak-end: chỉ bung tại đỉnh)", () => {
    test("streak bội 7 → milestone kiểu streak", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 14, weekCompare: wc() });
      expect(r.milestone).toEqual({ type: "streak", reason: "Chuỗi 14 ngày liên tiếp!" });
    });

    test("streak lẻ (không bội 7) → không streak-milestone", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 5, weekCompare: wc() });
      expect(r.milestone).toBeNull();
    });

    test("tiến bộ ≥20% → milestone kiểu progress khi không có streak milestone", () => {
      const r = buildShareCard({ charName: "Na", level: 2, streak: 0, weekCompare: wc({ status: "up", thisWeek: 30, deltaPct: 25 }) });
      expect(r.milestone).toEqual({ type: "progress", reason: "Tiến bộ +25% so với tuần trước" });
    });

    test("tiến bộ <20% → không milestone", () => {
      const r = buildShareCard({ charName: "Na", level: 2, streak: 3, weekCompare: wc({ status: "up", thisWeek: 22, deltaPct: 10 }) });
      expect(r.milestone).toBeNull();
    });

    test("streak-milestone ưu tiên hơn progress-milestone", () => {
      const r = buildShareCard({ charName: "Na", level: 5, streak: 7, weekCompare: wc({ status: "up", thisWeek: 30, deltaPct: 40 }) });
      expect(r.milestone.type).toBe("streak");
    });
  });

  describe("hero — MỘT con số duy nhất", () => {
    test("streak ≥7 → hero là số ngày", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 9, weekCompare: wc({ thisWeek: 20 }) });
      expect(r.hero).toEqual({ value: "9", label: "ngày liên tiếp" });
    });

    test("streak <7 nhưng tiến bộ → hero là % tiến bộ", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 2, weekCompare: wc({ status: "up", thisWeek: 25, deltaPct: 30 }) });
      expect(r.hero).toEqual({ value: "+30%", label: "so với tuần trước" });
    });

    test("không streak, không tiến bộ → hero là số việc tuần này", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 1, weekCompare: wc({ thisWeek: 18 }) });
      expect(r.hero).toEqual({ value: "18", label: "việc hoàn thành tuần này" });
    });
  });

  describe("title/subtitle — title case, khung kỷ niệm, không IN HOA", () => {
    test("có milestone → 'Cột mốc của <tên>'", () => {
      const r = buildShareCard({ charName: "Na", level: 4, streak: 7, weekCompare: wc() });
      expect(r.title).toBe("Cột mốc của Na");
    });

    test("không milestone → 'Tuần này của <tên>'", () => {
      const r = buildShareCard({ charName: "Na", level: 4, streak: 1, weekCompare: wc({ thisWeek: 5 }) });
      expect(r.title).toBe("Tuần này của Na");
    });

    test("subtitle có cấp", () => {
      const r = buildShareCard({ charName: "Na", level: 4, streak: 1, weekCompare: wc() });
      expect(r.subtitle).toBe("Cấp 4");
    });

    test("title không IN HOA (không toàn chữ hoa)", () => {
      const r = buildShareCard({ charName: "Na", level: 4, streak: 7, weekCompare: wc() });
      expect(r.title).not.toBe(r.title.toUpperCase());
    });
  });

  describe("evidence — tối đa 2 dòng, so-với-chính-mình", () => {
    test("hero đã là % → evidence KHÔNG lặp lại dòng %, chỉ còn dòng việc", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 2, weekCompare: wc({ status: "up", thisWeek: 20, deltaPct: 30 }) });
      expect(r.evidence).toContain("✅ 20 việc hoàn thành tuần này");
      expect(r.evidence.some((e) => e.includes("%"))).toBe(false);
      expect(r.evidence.length).toBeLessThanOrEqual(2);
    });

    test("hero là streak (không phải %) + tuần tăng → evidence có cả ✅ lẫn 📈", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 8, weekCompare: wc({ status: "up", thisWeek: 20, deltaPct: 30 }) });
      expect(r.evidence).toContain("✅ 20 việc hoàn thành tuần này");
      expect(r.evidence).toContain("📈 +30% so với chính mình tuần trước");
      expect(r.evidence.length).toBeLessThanOrEqual(2);
    });

    test("thisWeek = 0 → không có dòng việc", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 8, weekCompare: wc({ thisWeek: 0 }) });
      expect(r.evidence.every((e) => !e.includes("việc hoàn thành"))).toBe(true);
    });
  });

  describe("narrative — 1 câu cụ thể", () => {
    test("streak dài → câu về chuỗi ngày", () => {
      const r = buildShareCard({ charName: "Na", level: 3, streak: 10, weekCompare: wc() });
      expect(r.narrative).toBe("Na không bỏ lỡ ngày nào suốt 10 ngày qua.");
    });

    test("mandatoryAllDone → câu tự giác", () => {
      const r = buildShareCard({ charName: "Na", level: 2, streak: 1, weekCompare: wc({ thisWeek: 4 }), mandatoryAllDone: true });
      expect(r.narrative).toContain("tự giác");
    });

    test("fallback khi không có tín hiệu mạnh", () => {
      const r = buildShareCard({ charName: "Na", level: 1, streak: 0, weekCompare: wc() });
      expect(r.narrative).toContain("đang lớn lên");
    });
  });

  describe("phòng thủ đầu vào", () => {
    test("thiếu charName → 'Con'", () => {
      const r = buildShareCard({ level: 1, streak: 0, weekCompare: wc() });
      expect(r.title).toContain("Con");
    });

    test("thiếu weekCompare → không vỡ, hero mặc định 0 việc", () => {
      const r = buildShareCard({ charName: "Na", level: 1, streak: 0 });
      expect(r.hero).toEqual({ value: "0", label: "việc hoàn thành tuần này" });
    });
  });
});
