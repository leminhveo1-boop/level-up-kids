import { describe, expect, test } from "vitest";
import {
  SCAFFOLD_WINDOW_DAYS,
  SCAFFOLD_MIN_DATA_DAYS,
  SCAFFOLD_COOLDOWN_DAYS,
  getScaffoldLevel,
  evaluateScaffoldLevel,
  confirmScaffoldPromotion,
  seedScaffoldLevel,
} from "@/lib/game/scaffolding";

/** Sinh 1 snapshot ngày với các tín hiệu North Star (A0.1). */
function snap(over = {}) {
  return {
    date: "2026-07-01",
    completed: 5,
    total: 6,
    mandatoryDone: 3,
    mandatoryTotal: 3,
    screenMinutes: 0,
    trustScore: 80,
    streak: 10,
    remindersNeeded: 0,
    importantDone: 3,
    importantTotal: 3,
    plannedLastNight: true,
    ...over,
  };
}
/** N snapshot giống nhau (đủ ngày dữ liệu). */
function days(n, over = {}) {
  return Array.from({ length: n }, () => snap(over));
}

describe("scaffolding — hằng số & selector", () => {
  test("hằng số cửa sổ/ngưỡng đúng spec A0.4", () => {
    expect(SCAFFOLD_WINDOW_DAYS).toBe(14);
    expect(SCAFFOLD_MIN_DATA_DAYS).toBe(7);
    expect(SCAFFOLD_COOLDOWN_DAYS).toBe(7);
  });

  test("getScaffoldLevel mặc định 1 khi thiếu config", () => {
    expect(getScaffoldLevel(undefined)).toBe(1);
    expect(getScaffoldLevel({})).toBe(1);
    expect(getScaffoldLevel({ parentConfig: {} })).toBe(1);
  });

  test("getScaffoldLevel đọc & kẹp giá trị hợp lệ", () => {
    expect(getScaffoldLevel({ parentConfig: { scaffoldLevel: 2 } })).toBe(2);
    expect(getScaffoldLevel({ parentConfig: { scaffoldLevel: 3 } })).toBe(3);
    expect(getScaffoldLevel({ parentConfig: { scaffoldLevel: 9 } })).toBe(3);
    expect(getScaffoldLevel({ parentConfig: { scaffoldLevel: 0 } })).toBe(1);
  });
});

describe("evaluateScaffoldLevel — đủ dữ liệu & manual/cooldown", () => {
  const today = "2026-07-20";

  test("thiếu dữ liệu (<7 ngày) → giữ nguyên, không đổi", () => {
    const r = evaluateScaffoldLevel({
      history: days(6),
      config: { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(1);
    expect(r.changed).toBe(false);
    expect(r.pending).toBeNull();
    expect(r.reason).toBe("insufficient_data");
  });

  test("manual mode → auto không đụng level", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { mandatoryDone: 0 }), // đáng lẽ giáng
      config: { scaffoldLevel: 3, scaffoldMode: "manual", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(3);
    expect(r.changed).toBe(false);
    expect(r.reason).toBe("manual");
  });

  test("cooldown → không đổi dù đủ điều kiện", () => {
    const r = evaluateScaffoldLevel({
      history: days(14), // thừa điều kiện thăng 1→2
      config: { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldChangedAt: "2026-07-16" }, // 4 ngày < 7
      today,
    });
    expect(r.changed).toBe(false);
    expect(r.pending).toBeNull();
    expect(r.reason).toBe("cooldown");
  });
});

describe("evaluateScaffoldLevel — THĂNG (đề xuất, không tự nhảy)", () => {
  const today = "2026-07-20";

  test("1→2 đủ điều kiện → pending=2, level giữ 1, changed=false", () => {
    const r = evaluateScaffoldLevel({
      history: days(14), // mandatoryRate 1, reminders 0, planned 1, streak 10
      config: { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(1);
    expect(r.pending).toBe(2);
    expect(r.changed).toBe(false);
    expect(r.reason).toBe("promote_ready");
  });

  test("2→3 đủ điều kiện (bỏ qua reviewedRate tới khi B1.1) → pending=3", () => {
    const r = evaluateScaffoldLevel({
      history: days(14), // importantRate 1, reminders 0, planned 1
      config: { scaffoldLevel: 2, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(2);
    expect(r.pending).toBe(3);
    expect(r.reason).toBe("promote_ready");
  });

  test("chưa đủ (planned thấp) → không pending, hold", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { plannedLastNight: false }),
      config: { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.pending).toBeNull();
    expect(r.reason).toBe("hold");
  });

  test("pending cũ hết đủ điều kiện → xoá pending (không treo thẻ lỗi thời)", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { plannedLastNight: false }),
      config: { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldPendingLevel: 2, scaffoldChangedAt: "" },
      today,
    });
    expect(r.pending).toBeNull();
  });

  test("Level 3 không có gì để thăng → hold", () => {
    const r = evaluateScaffoldLevel({
      history: days(14),
      config: { scaffoldLevel: 3, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.pending).toBeNull();
    expect(r.reason).toBe("hold");
  });
});

describe("evaluateScaffoldLevel — GIÁNG (auto, im lặng)", () => {
  const today = "2026-07-20";

  test("mandatoryRate < 0.5 → hạ 1 bậc, changed=true, xoá pending", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { mandatoryDone: 1, mandatoryTotal: 3 }), // 0.33
      config: { scaffoldLevel: 3, scaffoldMode: "auto", scaffoldPendingLevel: null, scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(2);
    expect(r.changed).toBe(true);
    expect(r.pending).toBeNull();
    expect(r.reason).toBe("demote:mandatory_low");
  });

  test("remindersAvg ≥ 3 → hạ 1 bậc", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { remindersNeeded: 4 }),
      config: { scaffoldLevel: 2, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(1);
    expect(r.reason).toBe("demote:reminders_high");
  });

  test("streak gãy ≥ 2 lần trong cửa sổ → hạ 1 bậc", () => {
    // xen kẽ streak 0 sau ngày >0 nhiều lần
    const hist = [];
    for (let i = 0; i < 14; i++) hist.push(snap({ streak: i % 3 === 0 ? 0 : 5 }));
    const r = evaluateScaffoldLevel({
      history: hist,
      config: { scaffoldLevel: 2, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(1);
    expect(r.reason).toBe("demote:streak_broken");
  });

  test("Level 1 không giáng thêm được → giữ 1", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { mandatoryDone: 0 }),
      config: { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(1);
    expect(r.changed).toBe(false);
  });
});

describe("evaluateScaffoldLevel — hysteresis & purity", () => {
  const today = "2026-07-20";

  test("vùng ở-giữa (không đủ thăng, chưa tới giáng) → hold", () => {
    const r = evaluateScaffoldLevel({
      history: days(14, { mandatoryDone: 2, mandatoryTotal: 3, remindersNeeded: 2, plannedLastNight: false }),
      config: { scaffoldLevel: 2, scaffoldMode: "auto", scaffoldChangedAt: "" },
      today,
    });
    expect(r.level).toBe(2);
    expect(r.changed).toBe(false);
    expect(r.reason).toBe("hold");
  });

  test("không mutate history/config đầu vào", () => {
    const history = days(14);
    const config = { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldChangedAt: "" };
    const snapHist = JSON.stringify(history);
    const snapCfg = JSON.stringify(config);
    evaluateScaffoldLevel({ history, config, today });
    expect(JSON.stringify(history)).toBe(snapHist);
    expect(JSON.stringify(config)).toBe(snapCfg);
  });
});

describe("confirmScaffoldPromotion", () => {
  test("áp pending → level lên, xoá pending, ghi ngày, immutable", () => {
    const config = { scaffoldLevel: 1, scaffoldMode: "auto", scaffoldPendingLevel: 2, scaffoldChangedAt: "2026-07-01", other: "giữ" };
    const next = confirmScaffoldPromotion(config, "2026-07-20");
    expect(next.scaffoldLevel).toBe(2);
    expect(next.scaffoldPendingLevel).toBeNull();
    expect(next.scaffoldChangedAt).toBe("2026-07-20");
    expect(next.other).toBe("giữ");
    expect(config.scaffoldLevel).toBe(1); // không mutate
  });

  test("không có pending → trả bản sao không đổi level", () => {
    const config = { scaffoldLevel: 2, scaffoldPendingLevel: null, scaffoldChangedAt: "" };
    const next = confirmScaffoldPromotion(config, "2026-07-20");
    expect(next.scaffoldLevel).toBe(2);
    expect(next.scaffoldPendingLevel).toBeNull();
  });
});

describe("seedScaffoldLevel — 3 câu onboarding → level khởi đầu (spec §5)", () => {
  test("mặc định L1 khi thiếu/ambiguous đầu vào", () => {
    expect(seedScaffoldLevel(undefined)).toBe(1);
    expect(seedScaffoldLevel({})).toBe(1);
    expect(seedScaffoldLevel({ ageBand: "7-9" })).toBe(1);
  });

  test("chỉ 1 trong 2 baseline mạnh → vẫn L1 (cần CẢ HAI)", () => {
    expect(seedScaffoldLevel({ ageBand: "10-12", selfStart: "many", selfPlan: "no" })).toBe(1);
    expect(seedScaffoldLevel({ ageBand: "10-12", selfStart: "none", selfPlan: "yes" })).toBe(1);
  });

  test("cả hai baseline mạnh + tuổi ≥10 → seed L2", () => {
    expect(seedScaffoldLevel({ ageBand: "10-12", selfStart: "many", selfPlan: "yes" })).toBe(2);
    expect(seedScaffoldLevel({ ageBand: "13-15", selfStart: "many", selfPlan: "yes" })).toBe(2);
  });

  test("cả hai mạnh nhưng tuổi nhỏ (<10) → giữ L1 (nghiêng nâng đỡ)", () => {
    expect(seedScaffoldLevel({ ageBand: "4-6", selfStart: "many", selfPlan: "yes" })).toBe(1);
    expect(seedScaffoldLevel({ ageBand: "7-9", selfStart: "many", selfPlan: "yes" })).toBe(1);
  });

  test("KHÔNG bao giờ seed thẳng L3 (dù input cực mạnh)", () => {
    expect(seedScaffoldLevel({ ageBand: "13-15", selfStart: "many", selfPlan: "yes" })).toBeLessThanOrEqual(2);
  });
});
