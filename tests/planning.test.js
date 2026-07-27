import { describe, expect, test } from "vitest";
import {
  createTomorrowPlan,
  dateKey,
  getPlanPhase,
  shouldOfferTomorrowPlanning,
  selectDefaultFocusTask,
  selectMicroChoiceCandidates,
} from "@/lib/game/planning";

const tasks = [
  { id: "done", title: "Gấp chăn", completed: true, isMandatory: false },
  { id: "must", title: "Soạn cặp", completed: false, isMandatory: true },
  { id: "read", title: "Đọc sách", completed: false, isMandatory: false },
];

describe("planning — kế hoạch ngày mai", () => {
  test("dateKey dùng ngày địa phương, không lệch vì UTC", () => {
    const lateInVietnam = new Date(2026, 6, 27, 23, 30);
    expect(dateKey(lateInVietnam)).toBe("2026-07-27");
  });

  test("focus mặc định là nghĩa vụ chưa xong đầu tiên", () => {
    expect(selectDefaultFocusTask(tasks)?.id).toBe("must");
  });

  test("vẫn có fallback khi hôm nay mọi việc đã xong", () => {
    const allDone = tasks.map((task) => ({ ...task, completed: true }));
    expect(selectDefaultFocusTask(allDone)?.id).toBe("must");
  });

  test("kế hoạch giữ TOÀN BỘ danh sách, không cắt xuống 3–5 việc", () => {
    const now = new Date(2026, 6, 27, 21, 0);
    const plan = createTomorrowPlan(tasks, {
      now,
      focusTaskId: "read",
      firstStep: "Mở sách ở trang đang đọc",
      anchor: "Sau khi ăn tối",
    });

    expect(plan.targetDate).toBe("2026-07-28");
    expect(plan.items).toEqual([
      { taskId: "done", title: "Gấp chăn", isMandatory: false },
      { taskId: "must", title: "Soạn cặp", isMandatory: true },
      { taskId: "read", title: "Đọc sách", isMandatory: false },
    ]);
    expect(plan.focusTaskId).toBe("read");
    expect(plan.firstStep).toBe("Mở sách ở trang đang đọc");
    expect(plan.anchor).toBe("Sau khi ăn tối");
  });

  test("focus id không hợp lệ → fallback an toàn", () => {
    const plan = createTomorrowPlan(tasks, {
      now: new Date(2026, 6, 27, 21, 0),
      focusTaskId: "missing",
    });
    expect(plan.focusTaskId).toBe("must");
  });

  test("trim và giới hạn dữ liệu nhập tự do", () => {
    const plan = createTomorrowPlan(tasks, {
      now: new Date(2026, 6, 27, 21, 0),
      firstStep: `  ${"a".repeat(240)}  `,
      anchor: `  ${"b".repeat(120)}  `,
    });
    expect(plan.firstStep).toHaveLength(160);
    expect(plan.anchor).toHaveLength(80);
  });

  test("phân biệt kế hoạch hôm nay / ngày mai / cũ", () => {
    const now = new Date(2026, 6, 27, 10, 0);
    expect(getPlanPhase({ targetDate: "2026-07-27" }, now)).toBe("today");
    expect(getPlanPhase({ targetDate: "2026-07-28" }, now)).toBe("tomorrow");
    expect(getPlanPhase({ targetDate: "2026-07-26" }, now)).toBe("stale");
    expect(getPlanPhase(null, now)).toBe("none");
  });

  test("chỉ mời lập kế hoạch vào buổi tối hoặc khi đã xong toàn bộ việc", () => {
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 18, 59),
        allTasksCompleted: false,
      })
    ).toBe(false);
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 19, 0),
        allTasksCompleted: false,
      })
    ).toBe(true);
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 15, 0),
        allTasksCompleted: true,
      })
    ).toBe(true);
  });

  test("kế hoạch hôm nay/ngày mai vẫn luôn nhìn thấy để dùng", () => {
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 10, 0),
        plan: { targetDate: "2026-07-27" },
      })
    ).toBe(true);
  });
});

describe("selectMicroChoiceCandidates (A0.3 — micro-choice 1 chạm)", () => {
  const rich = [
    { id: "done", title: "Gấp chăn", completed: true, isMandatory: false },
    { id: "must", title: "Soạn cặp", completed: false, isMandatory: true },
    { id: "imp", title: "Đọc sách", completed: false, isMandatory: false, importance: true },
    { id: "plain", title: "Tưới cây", completed: false, isMandatory: false },
  ];

  test("focus được chỉ định luôn đứng đầu để pre-select", () => {
    const r = selectMicroChoiceCandidates(rich, { focusId: "plain" });
    expect(r[0].id).toBe("plain");
  });

  test("mặc định: việc quan trọng chưa xong lên trước việc thường", () => {
    const r = selectMicroChoiceCandidates(rich); // không focusId → default focus = 'must'
    const ids = r.map((t) => t.id);
    // 'imp' (quan trọng) đứng trước 'plain' (thường)
    expect(ids.indexOf("imp")).toBeLessThan(ids.indexOf("plain"));
  });

  test("việc đã xong bị đẩy xuống cuối", () => {
    const r = selectMicroChoiceCandidates(rich, { focusId: "must", limit: 4 });
    expect(r[r.length - 1].id).toBe("done");
  });

  test("tôn trọng limit", () => {
    expect(selectMicroChoiceCandidates(rich, { limit: 2 })).toHaveLength(2);
  });

  test("mặc định tối đa 4 ứng viên", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ id: `x${i}`, title: `V${i}`, completed: false }));
    expect(selectMicroChoiceCandidates(many)).toHaveLength(4);
  });

  test("bỏ item thiếu id/title; đầu vào lạ → []", () => {
    expect(selectMicroChoiceCandidates(null)).toEqual([]);
    const dirty = [{ id: "a" }, { title: "no id" }, { id: "ok", title: "OK", completed: false }];
    const r = selectMicroChoiceCandidates(dirty);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("ok");
  });

  test("trả bản sao gọn {id,title,isMandatory,importance}, không mutate", () => {
    const snap = JSON.stringify(rich);
    const r = selectMicroChoiceCandidates(rich, { focusId: "imp" });
    expect(r[0]).toEqual({ id: "imp", title: "Đọc sách", isMandatory: false, importance: true });
    expect(JSON.stringify(rich)).toBe(snap);
  });
});
