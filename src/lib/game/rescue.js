/**
 * B1.2 — Xử-lý-việc-chưa-xong NHÂN VĂN ("đang gỡ vướng", không phạt, không xấu hổ).
 * PURE (không React, không thời gian). Thiết kế 4 lối + trạng thái (🔴 O):
 *
 *   1. Chuyển ngày   → applyDefer(task, "tomorrow")   : mai làm lại
 *   2. Chọn giờ khác → applyDefer(task, "later", slot): trong hôm nay, mốc giờ khác
 *   3. Nhờ người lớn → requestHelp(task)               : gắn cờ cho phòng bố mẹ
 *   4. Bỏ có lý do   → applyDrop(task, reasonId)        : gỡ khỏi ngày mai, có lý do
 *
 * Nguyên tắc "rescue = thẻ hỗ trợ":
 *  - Dời/nhờ/bỏ đều là XỬ LÝ CHỦ ĐỘNG → KHÔNG tính "miss" (economy không bump
 *    missStreak) → không kích "chia nhỏ" như một thất bại, KHÔNG trừ điểm.
 *  - `deferCount` cộng dồn qua ngày (clearRescue KHÔNG reset) → khi >= ngưỡng,
 *    gợi ý "cùng bố mẹ xem lại" (getReviewTogetherTasks) — nhắc nhẹ, không phạt.
 *
 * ponytail: "later" chưa nối lịch-giờ thật trong ngày — deferSlot chỉ là nhãn
 * hiển thị/gợi ý. Trần: không có nhắc theo mốc giờ. Nâng cấp: nối session-clock
 * + Zalo reminder ở D3.1/3c.
 */

export const DROP_REASONS = [
  { id: "tired", label: "Con mệt / chưa khoẻ" },
  { id: "no_time", label: "Hôm nay bận quá" },
  { id: "too_hard", label: "Việc hơi khó" },
  { id: "changed", label: "Kế hoạch đổi rồi" },
];

// Số lần con chủ động dời 1 việc trước khi app gợi "cùng bố mẹ xem lại".
export const DEFER_REVIEW_THRESHOLD = 3;

const DROP_REASON_IDS = new Set(DROP_REASONS.map((r) => r.id));

/**
 * Con dời việc. mode "tomorrow" = để mai; "later" = hôm nay giờ khác (kèm nhãn slot).
 * Tăng deferCount (nuôi nudge "xem lại"); xoá cờ nhờ-giúp/bỏ trước đó.
 * @param {object} task
 * @param {"tomorrow"|"later"} [mode]
 * @param {string|null} [slot]
 */
export function applyDefer(task, mode = "tomorrow", slot = null) {
  const m = mode === "later" ? "later" : "tomorrow";
  return {
    ...task,
    deferState: m,
    deferSlot: m === "later" ? slot || null : null,
    deferCount: (task.deferCount || 0) + 1,
    helpRequested: false,
    dropReason: null,
  };
}

/** Con nhờ người lớn hỗ trợ. */
export function requestHelp(task) {
  return { ...task, helpRequested: true, dropReason: null };
}

/**
 * Con bỏ việc có lý do. Lý do lạ → no-op an toàn (validate ở biên).
 * @param {object} task
 * @param {string} reasonId
 */
export function applyDrop(task, reasonId) {
  if (!DROP_REASON_IDS.has(reasonId)) return task;
  return { ...task, dropReason: reasonId, deferState: null, deferSlot: null, helpRequested: false };
}

/** Việc đã được con xử lý chủ động (dời/nhờ/bỏ) — reset ngày sẽ không tính miss. */
export function isConsciouslyHandled(task) {
  return Boolean(task.deferState || task.helpRequested || task.dropReason);
}

/**
 * Gỡ cờ rescue tạm thời khi mang task sang ngày mới; GIỮ deferCount tích luỹ.
 */
export function clearRescue(task) {
  const { deferState, deferSlot, helpRequested, dropReason, ...rest } = task;
  return rest;
}

/** Việc bị con dời nhiều lần → gợi "cùng bố mẹ xem lại" (không phạt). */
export function getReviewTogetherTasks(tasks, threshold = DEFER_REVIEW_THRESHOLD) {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => (t.deferCount || 0) >= threshold);
}

/**
 * Nhãn trạng thái nhân văn cho việc chưa xong (KHÔNG "thất bại"/"chưa xong").
 * @returns {string|null} null nếu đã hoàn thành hoặc không có trạng thái rescue.
 */
export function rescueStatusLabel(task) {
  if (task.completed) return null;
  if (task.dropReason) {
    const r = DROP_REASONS.find((x) => x.id === task.dropReason);
    return r ? r.label : "Đã bỏ qua";
  }
  if (task.helpRequested) return "Đang nhờ người lớn";
  if (task.deferState === "tomorrow") return "Để mai làm tiếp";
  if (task.deferState === "later") {
    return task.deferSlot ? `Đang gỡ vướng · ${task.deferSlot}` : "Đang gỡ vướng";
  }
  return null;
}
