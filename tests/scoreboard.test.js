import { describe, test, expect } from "vitest";
import {
  GROUP_KEYS,
  GROUP_LABELS,
  CATEGORY_TO_GROUP,
  groupSignals,
  computeForm,
  formLevel,
  buildScoreboard,
  scoreboardTier,
  FORM_FLOOR,
  FORM_LEVELS,
} from "@/lib/game/scoreboard";

const task = (over = {}) => ({ id: Math.random().toString(36), title: "Việc", category: "help", ...over });

/** Snapshot ngày đóng CÓ groups, giống resetDailyTasks sau D3.3. */
const dayG = (date, groups, extra = {}) => ({ date, completed: 0, total: 0, ...extra, groups });
/** groups với 1 nhóm có `done` việc (total = done + remain). */
const g1 = (key, done, opts = {}) => ({
  [key]: { done, total: done + (opts.remain || 0), importantDone: opts.importantDone || 0, importantTotal: opts.importantTotal || 0 },
});

describe("scoreboard D3.2/D3.3 — nhóm loại việc + so con-với-chính-con", () => {
  describe("groupSignals — gộp việc theo 5 vùng", () => {
    test("connection map vào help; luôn trả đủ 5 nhóm dù rỗng", () => {
      const gs = groupSignals([]);
      expect(Object.keys(gs).sort()).toEqual([...GROUP_KEYS].sort());
      for (const k of GROUP_KEYS) {
        expect(gs[k]).toEqual({ done: 0, total: 0, importantDone: 0, importantTotal: 0 });
      }
    });

    test("undefined → 5 nhóm zero (tương thích ngược)", () => {
      const gs = groupSignals(undefined);
      expect(Object.keys(gs)).toHaveLength(5);
      expect(gs.help.total).toBe(0);
    });

    test("đếm đúng done/total/important theo nhóm; connection dồn vào help", () => {
      const tasks = [
        task({ category: "connection", completed: true }), // → help
        task({ category: "help", completed: false }), // → help
        task({ category: "strength", completed: true, importance: true }),
        task({ category: "strength", completed: false, importance: true }),
        task({ category: "intellect", completed: true }),
      ];
      const gs = groupSignals(tasks);
      expect(gs.help).toEqual({ done: 1, total: 2, importantDone: 0, importantTotal: 0 });
      expect(gs.strength).toEqual({ done: 1, total: 2, importantDone: 1, importantTotal: 2 });
      expect(gs.intellect).toEqual({ done: 1, total: 1, importantDone: 0, importantTotal: 0 });
      expect(gs.creative).toEqual({ done: 0, total: 0, importantDone: 0, importantTotal: 0 });
    });

    test("category lạ → bỏ qua, không bịa nhóm mới", () => {
      const gs = groupSignals([task({ category: "space-lasers", completed: true })]);
      const totalCounted = GROUP_KEYS.reduce((s, k) => s + gs[k].total, 0);
      expect(totalCounted).toBe(0);
      expect(Object.keys(gs)).toHaveLength(5);
    });

    test("mỗi nhóm có nhãn tiếng Việt (nâu ấm UI dùng)", () => {
      for (const k of GROUP_KEYS) expect(typeof GROUP_LABELS[k]).toBe("string");
      expect(CATEGORY_TO_GROUP.connection).toBe("help");
    });
  });

  describe("computeForm — Độ bền Khiên: bền, có sàn, không về 0", () => {
    test("chuỗi toàn active > toàn nghỉ", () => {
      const up = computeForm(Array(10).fill(true));
      const down = computeForm(Array(10).fill(false));
      expect(up).toBeGreaterThan(down);
    });

    test("kẹp sàn > 0 dù nghỉ dài (không extinction cứng)", () => {
      const form = computeForm(Array(50).fill(false));
      expect(form).toBeGreaterThanOrEqual(FORM_FLOOR);
      expect(form).toBeGreaterThan(0);
    });

    test("kẹp trần ≤ 1", () => {
      expect(computeForm(Array(50).fill(true))).toBeLessThanOrEqual(1);
    });

    test("sụt (nghỉ) NHẸ hơn tăng (active) — chớm sụt, không sập", () => {
      const gain = computeForm([true]) - computeForm([]);
      const loss = computeForm([]) - computeForm([false]);
      expect(gain).toBeGreaterThan(loss);
    });

    test("formLevel là số nấc 1..N", () => {
      expect(formLevel(FORM_FLOOR)).toBeGreaterThanOrEqual(1);
      expect(formLevel(1)).toBe(FORM_LEVELS);
      expect(formLevel(0)).toBeGreaterThanOrEqual(1);
    });
  });

  describe("buildScoreboard — so tuần này vs tuần trước, tự-quy-chiếu", () => {
    test("không ngày nào có groups → không data, insufficient (không bịa quá khứ)", () => {
      const legacy = [{ date: "01/06", completed: 3, total: 10 }]; // snapshot cũ, không groups
      const sb = buildScoreboard(legacy, { uiMode: "kid" });
      expect(sb.hasData).toBe(false);
      expect(sb.visible).toBe(false);
      expect(sb.groups.help.trend).toBe("insufficient");
    });

    test("bỏ qua ngày thiếu groups, chỉ tính ngày có groups", () => {
      const history = [
        { date: "00/06", completed: 9, total: 10 }, // legacy, phải bị bỏ
        ...Array.from({ length: 7 }, (_, i) => dayG(`0${i}/06`, g1("strength", 2), { remindersNeeded: 0 })),
      ];
      const sb = buildScoreboard(history, { uiMode: "kid" });
      expect(sb.hasData).toBe(true);
      expect(sb.groups.strength.effort).toBe(14); // 7 ngày × 2
      expect(sb.groups.strength.activeDays).toBe(7);
    });

    test("trend up khi tuần này nỗ lực > tuần trước", () => {
      const history = [
        ...Array.from({ length: 7 }, (_, i) => dayG(`l${i}`, g1("intellect", 1))), // tuần trước
        ...Array.from({ length: 7 }, (_, i) => dayG(`t${i}`, g1("intellect", 3))), // tuần này
      ];
      const sb = buildScoreboard(history, { uiMode: "kid" });
      expect(sb.groups.intellect.trend).toBe("up");
      expect(sb.groups.intellect.trendDelta).toBe(14); // 21 - 7
    });

    test("trend insufficient khi tuần trước chưa đủ ngày (không so ẩu)", () => {
      const history = Array.from({ length: 7 }, (_, i) => dayG(`t${i}`, g1("creative", 2)));
      const sb = buildScoreboard(history, { uiMode: "kid" });
      expect(sb.groups.creative.trend).toBe("insufficient");
    });

    test("selfStart chỉ đếm importantDone ở ngày KHÔNG cần nhắc (North Star)", () => {
      const history = [
        dayG("d1", g1("strength", 1, { importantDone: 1, importantTotal: 1 }), { remindersNeeded: 0 }),
        dayG("d2", g1("strength", 1, { importantDone: 1, importantTotal: 1 }), { remindersNeeded: 2 }),
      ];
      const sb = buildScoreboard(history, { uiMode: "kid" });
      expect(sb.groups.strength.selfStart).toBe(1); // chỉ ngày remindersNeeded=0
    });

    test("teen → tier selfView; kid → tier form; dưới ngưỡng ẩn = tier từ uiMode", () => {
      const days = Array.from({ length: 3 }, (_, i) => dayG(`d${i}`, g1("help", 1)));
      expect(buildScoreboard(days, { uiMode: "teen" }).tier).toBe("selfView");
      expect(buildScoreboard(days, { uiMode: "kid" }).tier).toBe("form");
      expect(scoreboardTier("teen")).toBe("selfView");
      expect(scoreboardTier("kid")).toBe("form");
    });

    test("CẤM %: không chuỗi nào trong scoreboard chứa dấu %", () => {
      const history = [
        ...Array.from({ length: 7 }, (_, i) => dayG(`l${i}`, g1("discipline", 1))),
        ...Array.from({ length: 7 }, (_, i) => dayG(`t${i}`, g1("discipline", 3))),
      ];
      const sb = buildScoreboard(history, { uiMode: "kid" });
      expect(JSON.stringify(sb)).not.toContain("%");
    });

    test("chống so-kè: chỉ nhận 1 history, không tham số trẻ khác", () => {
      expect(buildScoreboard.length).toBeLessThanOrEqual(2); // (history, opts) — không có đối số 'trẻ khác'
    });

    test("history undefined → không nổ, hasData false", () => {
      const sb = buildScoreboard(undefined);
      expect(sb.hasData).toBe(false);
      expect(sb.groups.help.effort).toBe(0);
    });
  });
});
