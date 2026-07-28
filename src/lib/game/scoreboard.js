/**
 * D3.2/D3.3 — SCOREBOARD: đo theo NHÓM loại việc, so con-với-chính-con.
 * SPEC: docs/SPEC_D3_2_SCOREBOARD.md (founder chốt 28/07: 5 vùng, hiện từ 8t).
 *
 * Thuần dữ liệu, không React, không side effect. Nguyên tắc bất biến:
 *  - CẤM % hoàn thành trong mọi chuỗi UI thấy (P2) — module này chỉ trả số đếm nỗ lực.
 *  - So-với-chính-mình, KHÔNG so anh em/bạn (P3): hàm chỉ nhận 1 history của MỘT trẻ.
 *  - Trung thực (P6): không bịa số cho ngày quá khứ thiếu `groups` — bỏ qua, không suy diễn.
 *  - "Độ bền Khiên"/phong độ: thước game bền, có sàn > 0, không extinction cứng (P5).
 */

import { COMPARE_MIN_LAST_WEEK_DAYS } from "./constants";

// 5 VÙNG = đúng 5 chỉ số ⚔️ hero trẻ đã thấy. connection→help (đã trùng statKey "help").
export const GROUP_KEYS = ["strength", "intellect", "discipline", "creative", "help"];

export const GROUP_LABELS = {
  strength: "Thể Lực",
  intellect: "Trí Tuệ",
  discipline: "Kỷ Luật",
  creative: "Sáng Tạo",
  help: "Giúp Đỡ",
};

export const CATEGORY_TO_GROUP = {
  strength: "strength",
  intellect: "intellect",
  discipline: "discipline",
  creative: "creative",
  help: "help",
  connection: "help", // gộp Kết nối vào Giúp Đỡ (founder chốt Q1: 5 vùng)
};

// ===== "Độ bền Khiên" / phong độ — hằng số thước bền =====
export const FORM_BASE = 0.5; // mốc khởi điểm khi chưa có lịch sử
export const FORM_UP = 0.08; // mỗi ngày active: +
export const FORM_DOWN = 0.05; // mỗi ngày nghỉ: − (NHẸ hơn tăng → chớm sụt, không sập)
export const FORM_FLOOR = 0.15; // sàn > 0: nghỉ dài vẫn không về 0 (khỏe lại được)
export const FORM_CEIL = 1;
export const FORM_LEVELS = 5; // số nấc icon Khiên
export const FORM_WINDOW = 14; // số ngày-có-groups gần nhất tính phong độ

// Founder chốt Q3: hiện scoreboard từ 8 tuổi. Dưới 8t: ẩn (chỉ pet/extinction).
export const SCOREBOARD_MIN_AGE = 8;

const emptyGroup = () => ({ done: 0, total: 0, importantDone: 0, importantTotal: 0 });

/**
 * Gộp danh sách task của MỘT ngày theo 5 vùng. Luôn trả đủ 5 khoá (kể cả 0).
 * @param {Array<{category?:string, completed?:boolean, importance?:boolean}>} tasks
 */
export function groupSignals(tasks) {
  const list = Array.isArray(tasks) ? tasks : [];
  const groups = Object.fromEntries(GROUP_KEYS.map((k) => [k, emptyGroup()]));
  for (const t of list) {
    const group = CATEGORY_TO_GROUP[t?.category];
    if (!group) continue; // category lạ → bỏ qua, không bịa nhóm mới (P6)
    const g = groups[group];
    g.total += 1;
    if (t.completed) g.done += 1;
    if (t.importance) {
      g.importantTotal += 1;
      if (t.completed) g.importantDone += 1;
    }
  }
  return groups;
}

/**
 * Phong độ từ chuỗi cờ active/nghỉ (cũ→mới). Bền, kẹp [FLOOR, CEIL].
 * @param {boolean[]} activeFlags
 */
export function computeForm(activeFlags) {
  const flags = Array.isArray(activeFlags) ? activeFlags : [];
  let form = FORM_BASE;
  for (const active of flags) {
    form += active ? FORM_UP : -FORM_DOWN;
    form = Math.max(FORM_FLOOR, Math.min(FORM_CEIL, form));
  }
  return form;
}

/** Phong độ (0..1) → nấc icon 1..FORM_LEVELS. */
export function formLevel(form) {
  const lvl = Math.ceil((Number(form) || 0) * FORM_LEVELS);
  return Math.max(1, Math.min(FORM_LEVELS, lvl));
}

/** Tầng hiển thị theo tuổi. teen (12+) = tự xem phong độ; kid = game "Độ bền Khiên". */
export function scoreboardTier(uiMode) {
  return uiMode === "teen" ? "selfView" : "form";
}

const groupOf = (day, key) => (day?.groups && day.groups[key]) || emptyGroup();
const sumDone = (days, key) => days.reduce((s, d) => s + groupOf(d, key).done, 0);

/** Số đo 1 vùng trên cửa sổ ngày-có-groups. */
function buildGroupMetric(withGroups, key) {
  const thisWeek = withGroups.slice(-7);
  const lastWeek = withGroups.slice(-14, -7);

  const effort = sumDone(thisWeek, key);
  const lastEffort = sumDone(lastWeek, key);
  const activeDays = thisWeek.filter((d) => groupOf(d, key).done >= 1).length;
  // North Star theo vùng: việc quan trọng con TỰ khởi động (ngày không cần nhắc).
  const selfStart = thisWeek.reduce(
    (s, d) => s + ((Number(d?.remindersNeeded) || 0) === 0 ? groupOf(d, key).importantDone : 0),
    0
  );

  let trend = "insufficient";
  let trendDelta = 0;
  if (lastWeek.length >= COMPARE_MIN_LAST_WEEK_DAYS && lastEffort > 0) {
    trendDelta = effort - lastEffort;
    trend = trendDelta > 0 ? "up" : trendDelta < 0 ? "down" : "flat";
  }

  const flags = withGroups.slice(-FORM_WINDOW).map((d) => groupOf(d, key).done >= 1);
  const form = computeForm(flags);

  return {
    key,
    label: GROUP_LABELS[key],
    effort,
    trend,
    trendDelta,
    selfStart,
    activeDays,
    form,
    formLevel: formLevel(form),
  };
}

/**
 * Dựng scoreboard cho MỘT trẻ. Chỉ tính ngày có `groups` (trung thực với dữ liệu
 * sau khi feature ra đời; ngày cũ thiếu groups bị bỏ qua, không suy diễn).
 * @param {Array} history  daily snapshots cũ→mới của MỘT trẻ (KHÔNG nhận trẻ khác)
 * @param {{ uiMode?: "kid"|"teen" }} [opts]
 */
export function buildScoreboard(history, { uiMode = "kid" } = {}) {
  const closed = Array.isArray(history) ? history : [];
  const withGroups = closed.filter((d) => d && d.groups);
  const hasData = withGroups.length > 0;
  const tier = scoreboardTier(uiMode);
  const groups = Object.fromEntries(GROUP_KEYS.map((k) => [k, buildGroupMetric(withGroups, k)]));
  return { tier, visible: hasData, hasData, groups };
}
