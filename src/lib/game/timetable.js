/**
 * 📅 "Thời khóa biểu" — thời khóa biểu lớp → tự sinh nhiệm vụ học tập theo thứ.
 *
 * Phụ huynh nhập TKB MỘT LẦN (dùng 2–3 tháng); mỗi ngày app tự sinh tối đa 2 nhiệm vụ:
 *   1. bài tập về nhà các môn HÔM NAY có `hasHomework`
 *   2. soạn/xem bài cho các môn NGÀY MAI có `needsPrep`
 * Nguồn sự thật là danh mục môn + cờ → sửa cờ = sửa gợi ý (nối painpoint #2).
 *
 * PURE (không React). Task sinh ra tag `source:"timetable"` để resetDailyTasks
 * xoá & sinh lại mỗi ngày (giống Lộ Trình lọc theo `journeyId`). Xem docs/SPEC_THOI_KHOA_BIEU.md.
 */

/** getDay(): 0=CN..6=T7 → key ô thứ. */
export const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Điểm mặc định cho nhiệm vụ học (decision C: parent chỉnh được qua timetable.taskDefaults). */
export const TIMETABLE_TASK_DEFAULTS = { exp: 20, points: 20, energy: 15 };

/** @param {Date} date */
export function weekdayKey(date) {
  return WEEKDAY_KEYS[date.getDay()];
}

/** Ngày dương kế tiếp (bản sao mới — không mutate đầu vào). @param {Date} date */
export function nextDay(date) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + 1);
  return d;
}

/** Mốc ngày local YYYY-MM-DD cho id tất định (an toàn timezone, không dùng toISOString/UTC). */
function dateStamp(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** TKB rỗng ban đầu: bật sẵn, chưa có môn, 7 ô thứ rỗng. */
export function createEmptyTimetable() {
  return {
    version: 1,
    enabled: true,
    subjects: {},
    week: WEEKDAY_KEYS.reduce((acc, k) => ({ ...acc, [k]: [] }), {}),
  };
}

const DAY_ALIASES = {
  t2: "mon",
  "thứ 2": "mon",
  "thu 2": "mon",
  t3: "tue",
  "thứ 3": "tue",
  "thu 3": "tue",
  t4: "wed",
  "thứ 4": "wed",
  "thu 4": "wed",
  t5: "thu",
  "thứ 5": "thu",
  "thu 5": "thu",
  t6: "fri",
  "thứ 6": "fri",
  "thu 6": "fri",
  t7: "sat",
  "thứ 7": "sat",
  "thu 7": "sat",
  cn: "sun",
  "chủ nhật": "sun",
  "chu nhat": "sun",
};

export function createSampleTimetableText() {
  return [
    "T2: Toán, Tiếng Việt, Tiếng Anh",
    "T3: Toán, Khoa học",
    "T4: Tiếng Việt, Tiếng Anh",
    "T5: Toán, Lịch sử",
    "T6: Tiếng Việt, Thể dục",
  ].join("\n");
}

function subjectIdFromName(name, usedIds) {
  const base =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "mon";
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}_${suffix++}`;
  usedIds.add(id);
  return id;
}

/**
 * Nhập nhanh từ văn bản phụ huynh đang có, ví dụ:
 * `T2: Toán, Văn, Anh`. Trả kết quả thay vì throw để UI báo lỗi thân thiện.
 */
export function parseTimetableText(text) {
  const parsedDays = {};
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const [rawDay, ...rest] = rawLine.split(":");
    if (rest.length === 0) continue;
    const dayKey = DAY_ALIASES[rawDay.trim().toLowerCase()];
    if (!dayKey) continue;
    const names = rest
      .join(":")
      .split(/[,;|]/)
      .map((name) => name.trim())
      .filter((name) => name && !/^nghỉ$/i.test(name));
    parsedDays[dayKey] = names;
  }

  if (Object.keys(parsedDays).length === 0) {
    return { success: false, error: "NO_RECOGNIZED_DAYS" };
  }

  const timetable = createEmptyTimetable();
  const usedIds = new Set();
  const idByName = new Map();

  for (const dayKey of WEEKDAY_KEYS) {
    timetable.week[dayKey] = (parsedDays[dayKey] || []).map((name) => {
      const normalized = name.toLocaleLowerCase("vi");
      if (!idByName.has(normalized)) {
        const id = subjectIdFromName(name, usedIds);
        idByName.set(normalized, id);
        timetable.subjects[id] = {
          id,
          name,
          hasHomework: true,
          needsPrep: true,
        };
      }
      return idByName.get(normalized);
    });
  }

  return { success: true, timetable };
}

/** Các môn của một ô thứ (bỏ id không còn trong danh mục — chống drift khi xoá môn). */
function subjectsOfDay(timetable, dayKey) {
  return (timetable.week?.[dayKey] || [])
    .map((id) => timetable.subjects?.[id])
    .filter(Boolean);
}

/** Dựng 1 task học tập gộp. */
function buildTask(kind, subjects, date, defaults) {
  const names = subjects.map((s) => s.name).join(", ");
  const title =
    kind === "homework"
      ? `📚 Làm bài tập về nhà: ${names}`
      : `🎒 Soạn sách vở + xem bài mai: ${names}`;
  return {
    id: `tt_${kind}_${dateStamp(date)}`,
    title,
    exp: defaults.exp,
    points: defaults.points,
    energy: defaults.energy,
    category: "intellect",
    completed: false,
    statKey: "intellect",
    statVal: 2,
    custom: true,
    isMandatory: false,
    // decision B: bài tập cần bố mẹ xác nhận; soạn cặp là tự-giác (giảm số lần duyệt, #1)
    verifyType: kind === "homework" ? "parent" : "trust",
    source: "timetable",
    kind,
    subjectIds: subjects.map((s) => s.id),
    // như journey: -1 để lần reset đầu tiên không tính "trượt" oan
    missStreak: -1,
  };
}

/**
 * Sinh nhiệm vụ học tập cho đúng ngày `date` từ thời khóa biểu.
 * @param {object|null} timetable
 * @param {Date} date
 * @returns {Array<object>} 0–2 task (bài tập hôm nay + soạn bài cho mai)
 */
export function generateTimetableTasks(timetable, date) {
  if (!timetable || !timetable.enabled) return [];
  const defaults = { ...TIMETABLE_TASK_DEFAULTS, ...(timetable.taskDefaults || {}) };
  const tasks = [];

  const todayHomework = subjectsOfDay(timetable, weekdayKey(date)).filter((s) => s.hasHomework);
  if (todayHomework.length > 0) tasks.push(buildTask("homework", todayHomework, date, defaults));

  const tomorrowPrep = subjectsOfDay(timetable, weekdayKey(nextDay(date))).filter((s) => s.needsPrep);
  if (tomorrowPrep.length > 0) tasks.push(buildTask("prep", tomorrowPrep, date, defaults));

  return tasks;
}
