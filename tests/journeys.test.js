import { describe, test, expect } from "vitest";
import {
  JOURNEY_CATALOG,
  JOURNEY_AGE_BANDS,
  JOURNEY_STAGE_DAYS,
  JOURNEY_ERRORS,
  getJourneysForAge,
  getJourneyById,
  startJourney,
  cancelJourney,
  advanceJourneyDaily,
  getJourneyStatus,
} from "@/lib/game/journeys";
import { completeTask, resetDailyTasks } from "@/lib/game/economy";
import { createInitialState } from "@/lib/game/constants";
import { migrateState } from "@/lib/game/migrate";

const VERIFY_TYPES = ["trust", "parent", "focus"];

const freshState = () => createInitialState({ name: "Bé Test", charClass: "Warrior" });

/** Đánh dấu mọi nhiệm vụ lộ trình của stage hiện tại là đã xong. */
const completeJourneyTasks = (state) => ({
  ...state,
  tasks: state.tasks.map((t) => (t.journeyId ? { ...t, completed: true } : t)),
});

describe("JOURNEY_CATALOG — nội dung 12 lộ trình đầy đủ và hợp lệ", () => {
  test("đủ 12 lộ trình, mỗi nhóm tuổi đúng 3, id không trùng", () => {
    expect(JOURNEY_CATALOG).toHaveLength(12);
    const ids = JOURNEY_CATALOG.map((j) => j.id);
    expect(new Set(ids).size).toBe(12);
    for (const band of JOURNEY_AGE_BANDS) {
      expect(getJourneysForAge(band.id)).toHaveLength(3);
    }
  });

  test("mỗi lộ trình có goal/identity/icon và đúng 3 tuần nội dung", () => {
    for (const j of JOURNEY_CATALOG) {
      expect(j.goal.length).toBeGreaterThan(20);
      expect(j.identity.length).toBeGreaterThan(5);
      expect(j.icon.length).toBeGreaterThan(0);
      expect(j.weeks).toBe(3);
      expect(j.stages).toHaveLength(3);
    }
  });

  test("mỗi tuần có nhiệm vụ hợp lệ + mẹo bố mẹ + câu bình-thường-hoá", () => {
    for (const j of JOURNEY_CATALOG) {
      for (const stage of j.stages) {
        expect(stage.tasks.length).toBeGreaterThanOrEqual(1);
        expect(stage.tasks.length).toBeLessThanOrEqual(2); // không nhấn chìm bảng nhiệm vụ
        expect(stage.parentTip.length).toBeGreaterThan(60);
        expect(stage.expectation.length).toBeGreaterThan(40);
        for (const t of stage.tasks) {
          expect(t.title.length).toBeGreaterThan(5);
          expect(VERIFY_TYPES).toContain(t.verifyType);
          expect(t.exp).toBeGreaterThan(0);
          expect(t.points).toBeGreaterThan(0);
          expect(t.energy).toBeGreaterThan(0);
          if (t.verifyType === "focus") expect(t.durationMin).toBeGreaterThan(0);
        }
      }
    }
  });

  test("độ khó tăng dần: tuần 3 tự giác hơn tuần 1 (điểm không giảm)", () => {
    for (const j of JOURNEY_CATALOG) {
      const sumPoints = (stage) => stage.tasks.reduce((a, t) => a + t.points, 0);
      expect(sumPoints(j.stages[2])).toBeGreaterThanOrEqual(sumPoints(j.stages[0]));
    }
  });
});

describe("startJourney", () => {
  test("thêm nhiệm vụ tuần 1 có tag lộ trình + khởi tạo tiến độ", () => {
    const base = freshState();
    const { state, result } = startJourney(base, "school_bag_79", 1000);
    expect(result.success).toBe(true);
    expect(state.journey).toMatchObject({ id: "school_bag_79", stage: 0, dayInStage: 0, successDays: 0 });

    const jTasks = state.tasks.filter((t) => t.journeyId === "school_bag_79");
    expect(jTasks).toHaveLength(getJourneyById("school_bag_79").stages[0].tasks.length);
    expect(jTasks.every((t) => t.journeyStage === 0 && !t.completed && t.custom)).toBe(true);
    // nhiệm vụ nền không bị đụng
    expect(state.tasks.length).toBe(base.tasks.length + jTasks.length);
    // input không bị mutate
    expect(base.journey).toBeNull();
  });

  test("mỗi lúc chỉ 1 lộ trình (Fogg: một thói quen một lần)", () => {
    const { state } = startJourney(freshState(), "reading_79", 1000);
    const { result } = startJourney(state, "morning_79", 2000);
    expect(result.success).toBe(false);
    expect(result.error).toBe(JOURNEY_ERRORS.ACTIVE);
  });

  test("id không tồn tại → lỗi rõ ràng", () => {
    const { result } = startJourney(freshState(), "khong_co_that", 1000);
    expect(result.success).toBe(false);
    expect(result.error).toBe(JOURNEY_ERRORS.NOT_FOUND);
  });
});

describe("cancelJourney", () => {
  test("gỡ nhiệm vụ lộ trình, giữ nhiệm vụ thường", () => {
    const base = freshState();
    const { state } = startJourney(base, "tidy_toys_46", 1000);
    const { state: cancelled, result } = cancelJourney(state);
    expect(result.success).toBe(true);
    expect(cancelled.journey).toBeNull();
    expect(cancelled.tasks.filter((t) => t.journeyId)).toHaveLength(0);
    expect(cancelled.tasks).toHaveLength(base.tasks.length);
  });

  test("không có lộ trình → lỗi NONE", () => {
    const { result } = cancelJourney(freshState());
    expect(result.error).toBe(JOURNEY_ERRORS.NONE);
  });
});

describe("advanceJourneyDaily — đếm ngày, sang tuần, tốt nghiệp lộ trình", () => {
  test("ngày làm đủ nhiệm vụ lộ trình = ngày thành công; thiếu = không", () => {
    let s = startJourney(freshState(), "brush_teeth_46", 1000).state;

    const successDay = advanceJourneyDaily(completeJourneyTasks(s));
    expect(successDay.journey).toMatchObject({ dayInStage: 1, totalDays: 1, successDays: 1, stageSuccessDays: 1 });

    const missDay = advanceJourneyDaily(s); // chưa tick gì
    expect(missDay.journey).toMatchObject({ dayInStage: 1, totalDays: 1, successDays: 0 });
  });

  test("hết 7 ngày → sang tuần 2: swap nhiệm vụ stage cũ lấy stage mới", () => {
    let s = startJourney(freshState(), "brush_teeth_46", 1000).state;
    for (let d = 0; d < JOURNEY_STAGE_DAYS; d++) {
      s = advanceJourneyDaily(completeJourneyTasks(s));
    }
    expect(s.journey.stage).toBe(1);
    expect(s.journey.dayInStage).toBe(0);
    expect(s.journey.stageSuccessDays).toBe(0); // reset theo tuần
    expect(s.journey.successDays).toBe(7); // tích lũy toàn lộ trình

    const stageTasks = s.tasks.filter((t) => t.journeyId === "brush_teeth_46");
    const expected = getJourneyById("brush_teeth_46").stages[1].tasks.length;
    expect(stageTasks).toHaveLength(expected);
    expect(stageTasks.every((t) => t.journeyStage === 1 && !t.completed)).toBe(true);
  });

  test("hết 3 tuần → hoàn thành: lễ + sổ thành tích + nhiệm vụ tuần cuối ở lại làm việc thường", () => {
    let s = startJourney(freshState(), "money_1315", 1000).state;
    const finalStageCount = getJourneyById("money_1315").stages[2].tasks.length;

    for (let d = 0; d < JOURNEY_STAGE_DAYS * 3; d++) {
      s = advanceJourneyDaily(completeJourneyTasks(s));
    }

    expect(s.journey).toBeNull();
    expect(s.journeysCompleted).toHaveLength(1);
    expect(s.journeysCompleted[0]).toMatchObject({ id: "money_1315", successDays: 21, totalDays: 21, weeks: 3 });
    expect(s.lastJourneyCompleted.id).toBe("money_1315");

    // nhiệm vụ tuần cuối được giữ lại, gỡ tag → tiếp tục sống để tốt nghiệp 🎓 sau 30 ngày
    const kept = s.tasks.filter((t) => String(t.id).startsWith("j_money_1315_s2_"));
    expect(kept).toHaveLength(finalStageCount);
    expect(kept.every((t) => t.journeyId === undefined)).toBe(true);
  });

  test("ngày trượt vẫn được đếm vào totalDays (lộ trình không bao giờ kẹt)", () => {
    let s = startJourney(freshState(), "fitness_1315", 1000).state;
    for (let d = 0; d < JOURNEY_STAGE_DAYS * 3; d++) {
      s = advanceJourneyDaily(d % 2 === 0 ? completeJourneyTasks(s) : s);
    }
    expect(s.journey).toBeNull();
    expect(s.journeysCompleted[0].totalDays). toBe(21);
    expect(s.journeysCompleted[0].successDays).toBeLessThan(21);
  });

  test("save cũ trỏ tới lộ trình đã bị gỡ khỏi catalog → tự dọn, không crash", () => {
    const base = freshState();
    const s = {
      ...base,
      journey: { id: "da_bi_xoa", stage: 0, dayInStage: 0, successDays: 0, totalDays: 0, stageSuccessDays: 0, seed: "x" },
      tasks: [...base.tasks, { id: "j_da_bi_xoa_s0_0_x", title: "cũ", exp: 1, points: 1, energy: 1, journeyId: "da_bi_xoa", journeyStage: 0 }],
    };
    const next = advanceJourneyDaily(s);
    expect(next.journey).toBeNull();
    expect(next.tasks.filter((t) => t.journeyId)).toHaveLength(0);
  });

  test("không có lộ trình → trả nguyên state", () => {
    const s = freshState();
    expect(advanceJourneyDaily(s)).toBe(s);
  });
});

describe("getJourneyStatus", () => {
  test("trả đủ dữ liệu cho UI: tuần, mẹo, kỳ vọng, nhiệm vụ hôm nay", () => {
    const { state } = startJourney(freshState(), "homework_1012", 1000);
    const st = getJourneyStatus(state);
    expect(st.week).toBe(1);
    expect(st.weeks).toBe(3);
    expect(st.def.title).toBe("Tự giác làm bài về nhà");
    expect(st.parentTip.length).toBeGreaterThan(60);
    expect(st.expectation.length).toBeGreaterThan(40);
    expect(st.stageTasks).toHaveLength(1);
    expect(st.todayAllDone).toBe(false);

    const done = getJourneyStatus(completeJourneyTasks(state));
    expect(done.todayAllDone).toBe(true);
  });

  test("không có lộ trình → null", () => {
    expect(getJourneyStatus(freshState())).toBeNull();
  });
});

describe("Tích hợp resetDailyTasks — lộ trình chạy qua nhịp ngày thật", () => {
  test("qua 1 đêm: chốt ngày thành công, nhiệm vụ mở lại, missStreak ngày đầu = 0", () => {
    let s = startJourney(freshState(), "reading_79", 1000).state;
    s = { ...s, lastResetDate: "01/07/2026" };
    s = completeJourneyTasks(s);

    const next = resetDailyTasks(s, () => 0.99, "01/07/2026");
    expect(next.journey.dayInStage).toBe(1);
    expect(next.journey.successDays).toBe(1);

    const jTask = next.tasks.find((t) => t.journeyId === "reading_79");
    expect(jTask.completed).toBe(false); // ngày mới mở lại
    expect(jTask.missStreak).toBe(0);
  });

  test("qua 1 đêm KHÔNG làm: ngày trượt nhưng nhiệm vụ mới thêm không bị tính at-risk oan", () => {
    let s = startJourney(freshState(), "reading_79", 1000).state;
    s = { ...s, lastResetDate: "01/07/2026" };

    const next = resetDailyTasks(s, () => 0.99, "01/07/2026");
    expect(next.journey.successDays).toBe(0);
    // mẹo -1: đêm đầu tiên missStreak về 0 chứ không phải 1
    expect(next.tasks.find((t) => t.journeyId === "reading_79").missStreak).toBe(0);
  });

  test("đêm thứ 7 → resetDailyTasks tự sang tuần 2 với nhiệm vụ mới", () => {
    let s = startJourney(freshState(), "reading_79", 1000).state;
    s = { ...s, lastResetDate: "01/07/2026", journey: { ...s.journey, dayInStage: 6, totalDays: 6, successDays: 6, stageSuccessDays: 6 } };
    s = completeJourneyTasks(s);

    const next = resetDailyTasks(s, () => 0.99, "01/07/2026");
    expect(next.journey.stage).toBe(1);
    const stageTasks = next.tasks.filter((t) => t.journeyId === "reading_79");
    expect(stageTasks.every((t) => t.journeyStage === 1 && !t.completed)).toBe(true);
  });
});

describe("Tuần Bận (busy mode) — completeTask nhả điểm ngay mọi loại việc", () => {
  test("đang trong tuần bận: việc parent-verify cũng auto, điểm vào ví luôn", () => {
    const base = freshState();
    const s = { ...base, parentConfig: { ...base.parentConfig, busyUntil: 2_000_000 } };
    const { state: next, events } = completeTask(s, "t1", () => 0.99, { now: 1_000_000 });

    expect(events.busyAutoApproved).toBe(true);
    expect(events.pointsPending).toBe(false);
    expect(next.tasks.find((t) => t.id === "t1").approval).toBe("auto");
    expect(next.points).toBe(base.points + events.pointsAdded);
  });

  test("tuần bận đã hết hạn: quay lại escrow như thường", () => {
    const base = freshState();
    const s = { ...base, parentConfig: { ...base.parentConfig, busyUntil: 500 } };
    const { state: next, events } = completeTask(s, "t1", () => 0.99, { now: 1_000_000 });

    expect(events.busyAutoApproved).toBe(false);
    expect(events.pointsPending).toBe(true);
    expect(next.tasks.find((t) => t.id === "t1").approval).toBe("pending");
    expect(next.points).toBe(base.points);
  });

  test("không cấu hình busyUntil (save cũ): mặc định tắt", () => {
    const base = freshState();
    const cfg = { ...base.parentConfig };
    delete cfg.busyUntil;
    const { events } = completeTask({ ...base, parentConfig: cfg }, "t1", () => 0.99, { now: 1_000_000 });
    expect(events.busyAutoApproved).toBe(false);
  });
});

describe("migrateState — trường lộ trình sống sót qua load/save", () => {
  test("giữ nguyên journey đang chạy + sổ thành tích", () => {
    const j = { id: "reading_79", stage: 1, dayInStage: 3, successDays: 8, totalDays: 10, stageSuccessDays: 1, seed: "x", startedAt: 1 };
    const done = [{ id: "brush_teeth_46", title: "Đánh răng không cần nhắc", completedAt: 5, successDays: 18, totalDays: 21, weeks: 3 }];
    const m = migrateState({ journey: j, journeysCompleted: done, lastJourneyCompleted: done[0] });
    expect(m.journey).toEqual(j);
    expect(m.journeysCompleted).toEqual(done);
    expect(m.lastJourneyCompleted).toEqual(done[0]);
  });

  test("save cũ chưa có trường lộ trình → mặc định an toàn", () => {
    const m = migrateState({ charName: "Cũ" });
    expect(m.journey).toBeNull();
    expect(m.journeysCompleted).toEqual([]);
    expect(m.lastJourneyCompleted).toBeNull();
    // busyUntil được merge default vào config cũ
    expect(m.parentConfig.busyUntil).toBe(0);
  });
});
