import { describe, test, expect } from "vitest";
import { buildParentInsight } from "@/lib/game/insight";

// Ngày cố định để targetDate "tomorrow" xác định (test tất định, không new Date()).
const NOW = new Date(2026, 6, 27, 20, 0, 0); // 27/07/2026 20:00 local
const key = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const TOMORROW = key(new Date(2026, 6, 28));

// Một ngày lịch sử "mạnh": tự bắt đầu, làm hết việc quan trọng, có lập kế hoạch, có review.
const strongDay = (date) => ({
  date,
  completed: 5,
  total: 6,
  mandatoryDone: 2,
  mandatoryTotal: 2,
  remindersNeeded: 0,
  importantDone: 2,
  importantTotal: 2,
  plannedLastNight: true,
  reviewed: true,
  reviewMood: "good",
  streak: 4,
});

const planFor = (targetDate, items) => ({
  targetDate,
  items,
  focusTaskId: null,
  firstStep: "",
  anchor: "",
  createdAt: 0,
});

describe("buildParentInsight — card ngày mai", () => {
  test("đếm việc thường vs quan trọng từ tomorrowPlan cho ngày mai", () => {
    // Arrange
    const state = {
      charName: "Khoa",
      uiMode: "kid",
      history: [],
      tomorrowPlan: planFor(TOMORROW, [
        { taskId: "a", title: "Đọc sách", isMandatory: false },
        { taskId: "b", title: "Dọn phòng", isMandatory: false },
        { taskId: "c", title: "Tập thể dục", isMandatory: false },
        { taskId: "d", title: "Học Toán", isMandatory: true },
      ]),
    };

    // Act
    const out = buildParentInsight(state, NOW);

    // Assert
    expect(out.tomorrow).not.toBeNull();
    expect(out.tomorrow.ordinaryCount).toBe(3);
    expect(out.tomorrow.importantCount).toBe(1);
    expect(out.tomorrow.text).toContain("3 việc thường");
    expect(out.tomorrow.text).toContain("1 việc quan trọng");
    expect(out.tomorrow.text).toContain("Khoa");
  });

  test("không có kế hoạch cho ngày mai → tomorrow = null", () => {
    const state = { charName: "Khoa", uiMode: "kid", history: [], tomorrowPlan: null };
    const out = buildParentInsight(state, NOW);
    expect(out.tomorrow).toBeNull();
  });

  test("kế hoạch cũ (targetDate quá khứ) → tomorrow = null", () => {
    const state = {
      charName: "Khoa",
      uiMode: "kid",
      history: [],
      tomorrowPlan: planFor("2026-07-20", [{ taskId: "a", title: "x", isMandatory: false }]),
    };
    const out = buildParentInsight(state, NOW);
    expect(out.tomorrow).toBeNull();
  });
});

describe("buildParentInsight — insight điểm mạnh (ẩn %)", () => {
  test("mẫu tự-bắt-đầu ≥3 ngày → có câu khen tự giác", () => {
    // Arrange
    const history = ["2026-07-24", "2026-07-25", "2026-07-26"].map(strongDay);
    const state = { charName: "Khoa", uiMode: "kid", streak: 4, history };

    // Act
    const out = buildParentInsight(state, NOW);

    // Assert
    expect(out.insights.length).toBeGreaterThan(0);
    const joined = out.insights.join(" ");
    expect(joined).toContain("Khoa");
    expect(joined.toLowerCase()).toMatch(/tự giác|tự bắt đầu|không cần.*nhắc/);
  });

  test("KHÔNG lộ dấu % phán xét trong bất kỳ insight nào", () => {
    const history = ["2026-07-24", "2026-07-25", "2026-07-26"].map(strongDay);
    const state = { charName: "Khoa", uiMode: "kid", streak: 4, history };
    const out = buildParentInsight(state, NOW);
    for (const s of out.insights) {
      expect(s).not.toContain("%");
    }
    if (out.tomorrow) expect(out.tomorrow.text).not.toContain("%");
  });

  test("kid cap tối đa 2 insight dù nhiều mẫu đạt", () => {
    const history = ["2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26"].map(
      strongDay
    );
    const state = { charName: "Khoa", uiMode: "kid", streak: 5, history };
    const out = buildParentInsight(state, NOW);
    expect(out.insights.length).toBeLessThanOrEqual(2);
  });

  test("fallback không xấu hổ khi chưa đủ dữ liệu", () => {
    const state = { charName: "Khoa", uiMode: "kid", streak: 0, history: [], tomorrowPlan: null };
    const out = buildParentInsight(state, NOW);
    expect(out.insights.length).toBe(1);
    expect(out.insights[0]).not.toContain("%");
  });
});

describe("buildParentInsight — teen chỉ summary", () => {
  test("teen: tối đa 1 insight và không có mục review chi tiết theo ngày", () => {
    const history = ["2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26"].map(
      strongDay
    );
    const state = { charName: "Minh", uiMode: "teen", streak: 5, history };
    const out = buildParentInsight(state, NOW);
    expect(out.insights.length).toBeLessThanOrEqual(1);
    // không micromanage: không có câu "mỗi tối" (review theo ngày)
    const joined = out.insights.join(" ");
    expect(joined).not.toContain("mỗi tối");
  });
});
