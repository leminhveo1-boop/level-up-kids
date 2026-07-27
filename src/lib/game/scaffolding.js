/**
 * GĐ0 A0.5 — Scaffolding Level 1-2-3 (cơ chế luồng scale theo NĂNG LỰC THỰC).
 * Xem spec: docs/SPEC_A0.4_SCAFFOLDING_LEVELS.md
 *
 * THUẦN, immutable: không mutate đầu vào, không I/O, không `new Date()` bên trong
 * (ngày "today" luôn được inject để tất định + test được).
 *
 * Level 1 = App dẫn, con tick · Level 2 = Con chọn, app gợi ý · Level 3 = Con tự lập.
 * THĂNG = đề xuất phụ huynh mở (đặt `pending`, KHÔNG tự nhảy). GIÁNG = auto im lặng.
 */

export const SCAFFOLD_WINDOW_DAYS = 14; // cửa sổ trượt đánh giá
export const SCAFFOLD_MIN_DATA_DAYS = 7; // tối thiểu ngày dữ liệu mới dám đổi
export const SCAFFOLD_COOLDOWN_DAYS = 7; // sau mỗi lần đổi, khoá đổi tiếp

const MIN_LEVEL = 1;
const MAX_LEVEL = 3;

// Ngưỡng THĂNG (đủ TẤT CẢ) — cao hơn hẳn ngưỡng GIÁNG → hysteresis, không dao động.
const PROMOTE = {
  // 1 → 2
  2: (m) => m.mandatoryRate >= 0.8 && m.remindersAvg <= 1.0 && m.plannedRate >= 0.5 && m.streakMax >= 7,
  // 2 → 3 (reviewedRate bỏ qua tới khi B1.1 thêm field `reviewed` vào snapshot)
  3: (m) => m.importantRate >= 0.75 && m.remindersAvg <= 0.5 && m.plannedRate >= 0.7,
};

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const clampLevel = (v) => Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.trunc(num(v)) || MIN_LEVEL));

/** Level hiệu lực hiện tại — single source, dùng khắp nơi. */
export function getScaffoldLevel(state) {
  const raw = state?.parentConfig?.scaffoldLevel;
  return clampLevel(raw ?? MIN_LEVEL);
}

/** Số ngày dương giữa 2 chuỗi YYYY-MM-DD (tất định, không phụ thuộc timezone). */
function daysBetween(fromStr, toStr) {
  const parse = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  };
  const a = parse(fromStr);
  const b = parse(toStr);
  if (a == null || b == null) return Infinity; // thiếu mốc → coi như đã qua cooldown
  return Math.round((b - a) / 86400000);
}

/** Trung bình các tín hiệu North Star trên cửa sổ (mảng snapshot đã cắt). */
function computeMetrics(window) {
  const n = window.length || 1;
  let mand = 0;
  let imp = 0;
  let reminders = 0;
  let plannedDays = 0;
  let streakMax = 0;
  let streakResets = 0;
  let prevStreak = null;

  for (const s of window) {
    mand += num(s.mandatoryDone) / Math.max(1, num(s.mandatoryTotal));
    imp += num(s.importantDone) / Math.max(1, num(s.importantTotal));
    reminders += num(s.remindersNeeded);
    if (s.plannedLastNight === true) plannedDays += 1;
    const st = num(s.streak);
    if (st > streakMax) streakMax = st;
    if (prevStreak != null && prevStreak > 0 && st === 0) streakResets += 1;
    prevStreak = st;
  }

  return {
    mandatoryRate: mand / n,
    importantRate: imp / n,
    remindersAvg: reminders / n,
    plannedRate: plannedDays / n,
    streakMax,
    streakResets,
  };
}

function demoteReason(m) {
  if (m.mandatoryRate < 0.5) return "demote:mandatory_low";
  if (m.remindersAvg >= 3.0) return "demote:reminders_high";
  if (m.streakResets >= 2) return "demote:streak_broken";
  return null;
}

/**
 * Đánh giá level dựa dữ liệu hành vi.
 * @param {{ history: Array, config: object, today: string }} args
 * @returns {{ level: 1|2|3, pending: null|2|3, changed: boolean, reason: string }}
 */
export function evaluateScaffoldLevel({ history, config, today } = {}) {
  const current = clampLevel(config?.scaffoldLevel ?? MIN_LEVEL);
  const existingPending = config?.scaffoldPendingLevel ?? null;
  const mode = config?.scaffoldMode || "auto";

  if (mode === "manual") {
    return { level: current, pending: existingPending, changed: false, reason: "manual" };
  }

  const window = (Array.isArray(history) ? history : []).slice(-SCAFFOLD_WINDOW_DAYS);
  if (window.length < SCAFFOLD_MIN_DATA_DAYS) {
    return { level: current, pending: existingPending, changed: false, reason: "insufficient_data" };
  }

  const changedAt = config?.scaffoldChangedAt || "";
  if (changedAt && daysBetween(changedAt, today) < SCAFFOLD_COOLDOWN_DAYS) {
    return { level: current, pending: existingPending, changed: false, reason: "cooldown" };
  }

  const m = computeMetrics(window);

  // GIÁNG trước (an toàn: phục hồi hỗ trợ ngay khi con đuối).
  if (current > MIN_LEVEL) {
    const reason = demoteReason(m);
    if (reason) {
      return { level: current - 1, pending: null, changed: true, reason };
    }
  }

  // THĂNG: đặt pending (đề xuất phụ huynh), KHÔNG tự nhảy level.
  if (current < MAX_LEVEL) {
    const nextLevel = current + 1;
    if (PROMOTE[nextLevel] && PROMOTE[nextLevel](m)) {
      return { level: current, pending: nextLevel, changed: false, reason: "promote_ready" };
    }
  }

  // Không đủ thăng: xoá pending lỗi thời (con đã tụt khỏi ngưỡng) rồi giữ nguyên.
  return { level: current, pending: null, changed: false, reason: "hold" };
}

/**
 * Phụ huynh xác nhận mở lớp đang chờ → parentConfig MỚI (immutable).
 * Không có pending hợp lệ → trả bản sao không đổi level.
 */
export function confirmScaffoldPromotion(config, today) {
  const pending = config?.scaffoldPendingLevel;
  if (pending === 2 || pending === 3) {
    return {
      ...config,
      scaffoldLevel: clampLevel(pending),
      scaffoldPendingLevel: null,
      scaffoldChangedAt: today,
    };
  }
  return { ...config };
}
