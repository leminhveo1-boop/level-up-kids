import { describe, test, expect } from "vitest";
import {
  WEEKDAY_KEYS,
  weekdayKey,
  nextDay,
  createEmptyTimetable,
  generateTimetableTasks,
  parseTimetableText,
  createSampleTimetableText,
  TIMETABLE_TASK_DEFAULTS,
} from "@/lib/game/timetable";
import { resetDailyTasks } from "@/lib/game/economy";
import { createInitialState } from "@/lib/game/constants";

// 2026-07-27 = thứ Hai (đã tính tay). month index 6 = July, 7 = August.
const MON = new Date(2026, 6, 27);
const TUE = new Date(2026, 6, 28);
const FRI = new Date(2026, 6, 31);
const SAT = new Date(2026, 7, 1);
const SUN = new Date(2026, 7, 2);

/** Thời khóa biểu mẫu: Toán(có bài+soạn), Văn(có bài, ko soạn), Thể dục(ko bài, ko soạn), Lý(ko bài, có soạn). */
const sampleTimetable = () => ({
  version: 1,
  enabled: true,
  subjects: {
    toan: { id: "toan", name: "Toán", hasHomework: true, needsPrep: true },
    van: { id: "van", name: "Văn", hasHomework: true, needsPrep: false },
    the: { id: "the", name: "Thể dục", hasHomework: false, needsPrep: false },
    ly: { id: "ly", name: "Lý", hasHomework: false, needsPrep: true },
  },
  week: {
    mon: ["toan", "van", "the"], // hôm nay: bài Toán+Văn
    tue: ["ly"], // mai (từ Mon): soạn Lý
    wed: [],
    thu: [],
    fri: ["the"], // fri: ko bài; sat rỗng → ko soạn
    sat: [],
    sun: [],
  },
});

describe("timetable helpers — weekdayKey & nextDay", () => {
  test("WEEKDAY_KEYS đúng thứ tự getDay (0=CN)", () => {
    expect(WEEKDAY_KEYS).toEqual(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
  });

  test("weekdayKey trả đúng key theo thứ", () => {
    expect(weekdayKey(MON)).toBe("mon");
    expect(weekdayKey(FRI)).toBe("fri");
    expect(weekdayKey(SAT)).toBe("sat");
    expect(weekdayKey(SUN)).toBe("sun");
  });

  test("nextDay = ngày dương kế tiếp, không mutate đầu vào", () => {
    expect(weekdayKey(nextDay(SUN))).toBe("mon"); // CN → T2
    expect(weekdayKey(nextDay(FRI))).toBe("sat"); // T6 → T7
    const before = MON.getTime();
    nextDay(MON);
    expect(MON.getTime()).toBe(before); // input bất biến
  });
});

describe("createEmptyTimetable", () => {
  test("tạo TKB rỗng, enabled, đủ 7 ô thứ rỗng", () => {
    const tt = createEmptyTimetable();
    expect(tt.enabled).toBe(true);
    expect(tt.subjects).toEqual({});
    for (const k of WEEKDAY_KEYS) expect(tt.week[k]).toEqual([]);
  });
});

describe("nhập thời khóa biểu bằng văn bản", () => {
  test("dán lịch theo T2..CN → tự tạo môn và xếp đúng ngày", () => {
    const result = parseTimetableText(`
      T2: Toán, Tiếng Việt, Anh
      Thứ 3: Toán; Khoa học
      T7: Bơi
      CN: nghỉ
    `);

    expect(result.success).toBe(true);
    expect(Object.values(result.timetable.subjects).map((s) => s.name)).toEqual([
      "Toán",
      "Tiếng Việt",
      "Anh",
      "Khoa học",
      "Bơi",
    ]);
    const namesFor = (key) =>
      result.timetable.week[key].map((id) => result.timetable.subjects[id].name);
    expect(namesFor("mon")).toEqual(["Toán", "Tiếng Việt", "Anh"]);
    expect(namesFor("tue")).toEqual(["Toán", "Khoa học"]);
    expect(namesFor("sat")).toEqual(["Bơi"]);
    expect(namesFor("sun")).toEqual([]);
  });

  test("báo lỗi khi chưa nhận ra dòng lịch nào", () => {
    expect(parseTimetableText("Toán, Văn, Anh").success).toBe(false);
  });

  test("có bản mẫu để phụ huynh sửa, không phải bắt đầu từ trang trắng", () => {
    expect(createSampleTimetableText()).toContain("T2:");
    expect(createSampleTimetableText()).toContain("T6:");
  });
});

describe("generateTimetableTasks — luật sinh nhiệm vụ", () => {
  test("không TKB / TKB tắt → không sinh gì", () => {
    expect(generateTimetableTasks(null, MON)).toEqual([]);
    expect(generateTimetableTasks(undefined, MON)).toEqual([]);
    expect(generateTimetableTasks({ ...sampleTimetable(), enabled: false }, MON)).toEqual([]);
  });

  test("thứ Hai: 1 task bài tập (Toán, Văn) + 1 task soạn cho mai (Lý)", () => {
    const tasks = generateTimetableTasks(sampleTimetable(), MON);
    expect(tasks).toHaveLength(2);

    const hw = tasks.find((t) => t.kind === "homework");
    expect(hw.title).toContain("Toán");
    expect(hw.title).toContain("Văn");
    expect(hw.title).not.toContain("Thể dục"); // ko hasHomework
    expect(hw.subjectIds).toEqual(["toan", "van"]);
    expect(hw.verifyType).toBe("parent"); // decision B

    const prep = tasks.find((t) => t.kind === "prep");
    expect(prep.title).toContain("Lý");
    expect(prep.subjectIds).toEqual(["ly"]);
  });

  test("ngày có môn nhưng không môn nào hasHomework → không sinh task bài tập", () => {
    const tt = sampleTimetable();
    tt.week.wed = ["the"]; // Thể dục: ko bài
    tt.week.thu = []; // mai rỗng → ko soạn
    const tasks = generateTimetableTasks(tt, new Date(2026, 6, 29)); // 29/07 = thứ Tư
    expect(tasks).toEqual([]);
  });

  test("thứ Sáu: mai (T7) rỗng → chỉ xét bài hôm nay, không task soạn", () => {
    const tasks = generateTimetableTasks(sampleTimetable(), FRI);
    expect(tasks.find((t) => t.kind === "prep")).toBeUndefined();
  });

  test("Chủ nhật: mai là thứ Hai có Toán(needsPrep) → sinh task soạn cho T2", () => {
    const tt = sampleTimetable();
    const tasks = generateTimetableTasks(tt, SUN);
    const prep = tasks.find((t) => t.kind === "prep");
    expect(prep).toBeDefined();
    expect(prep.subjectIds).toEqual(["toan"]); // Toán needsPrep, Văn ko, Thể dục ko
  });

  test("task có schema hợp lệ + id tất định theo ngày + tag source", () => {
    const tasks = generateTimetableTasks(sampleTimetable(), MON);
    for (const t of tasks) {
      expect(t.source).toBe("timetable");
      expect(t.completed).toBe(false);
      expect(t.custom).toBe(true);
      expect(t.category).toBe("intellect");
      expect(t.statKey).toBe("intellect");
      expect(t.exp).toBe(TIMETABLE_TASK_DEFAULTS.exp);
      expect(t.points).toBe(TIMETABLE_TASK_DEFAULTS.points);
      expect(t.energy).toBe(TIMETABLE_TASK_DEFAULTS.energy);
      expect(typeof t.id).toBe("string");
    }
    // id tất định: sinh lại cùng ngày ra cùng id (idempotent, chống nhân đôi)
    const again = generateTimetableTasks(sampleTimetable(), MON);
    expect(again.map((t) => t.id).sort()).toEqual(tasks.map((t) => t.id).sort());
    // ngày khác → id khác
    const tue = generateTimetableTasks(sampleTimetable(), TUE);
    expect(tue[0]?.id).not.toBe(tasks[0]?.id);
  });

  test("taskDefaults ghi đè điểm mặc định (decision C — cho chỉnh)", () => {
    const tt = { ...sampleTimetable(), taskDefaults: { exp: 30, points: 35, energy: 20 } };
    const hw = generateTimetableTasks(tt, MON).find((t) => t.kind === "homework");
    expect(hw.exp).toBe(30);
    expect(hw.points).toBe(35);
    expect(hw.energy).toBe(20);
  });
});

describe("nối resetDailyTasks — timetable task theo ngày, không tồn dư", () => {
  test("reset xoá task timetable ngày cũ và sinh lại cho ngày mới", () => {
    const base = createInitialState({ name: "Bé Test", charClass: "Warrior" });
    // giả lập còn task timetable ngày cũ trên bảng
    const staleTT = { id: "tt_homework_old", title: "cũ", source: "timetable", completed: true, kind: "homework" };
    const state = { ...base, timetable: sampleTimetable(), tasks: [...base.tasks, staleTT] };

    const next = resetDailyTasks(state, Math.random, "", MON);
    // task timetable cũ biến mất
    expect(next.tasks.find((t) => t.id === "tt_homework_old")).toBeUndefined();
    // có task timetable mới cho thứ Hai
    const fresh = next.tasks.filter((t) => t.source === "timetable");
    expect(fresh.length).toBe(2);
    expect(fresh.every((t) => t.completed === false)).toBe(true);
  });

  test("không có timetable → reset chạy như cũ (không sinh task lạ)", () => {
    const base = createInitialState({ name: "Bé Test", charClass: "Warrior" });
    const next = resetDailyTasks(base, Math.random, "", MON);
    expect(next.tasks.some((t) => t.source === "timetable")).toBe(false);
  });
});
