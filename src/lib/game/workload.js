/**
 * D3.5 — BẢO VỆ GIỜ NGHỈ / MANDATORY BREAK.
 *
 * App dễ biến "phát triển bản thân" thành một lịch kín mít: phụ huynh cứ thêm
 * việc, mỗi việc lại có điểm/xu → con hết giờ nghỉ và mất quyền tự chủ (đi ngược
 * mục tiêu Pha 3 — nghịch lý màn hình). Module thuần này đánh giá tải MỘT NGÀY
 * và trả về CẢNH BÁO MỀM (không chặn cứng) để nhắc phụ huynh chừa khoảng thở.
 *
 * Thuần dữ liệu: chỉ đếm/tổng hợp. UI banner nằm ở ManageTab (phòng phụ huynh) —
 * đúng nơi phát sinh việc, nên đúng nơi nhắc.
 */

// Ngưỡng "lành mạnh" cho một ngày của trẻ.
// ponytail: đây là ngưỡng cố định, chưa cá nhân hoá theo tuổi/thể trạng —
// nâng cấp lên chuẩn nhóm-tuổi khi có scoreboard normative (D3.2/D3.3).
export const SOFT_MAX_TASKS = 8;
export const SOFT_MAX_MANDATORY = 4;
export const SOFT_MAX_FOCUS_MINUTES = 90;

/** Chỉ việc có hẹn giờ (focus) mới tính vào "phút effort/màn hình" của ngày. */
function focusMinutesOf(task) {
  const min = Number(task?.durationMin);
  return Number.isFinite(min) && min > 0 ? min : 0;
}

function buildWorkloadMessage(reasons, stats) {
  const parts = [];
  if (reasons.includes("tasks")) parts.push(`${stats.taskCount} việc/ngày`);
  if (reasons.includes("mandatory")) parts.push(`${stats.mandatoryCount} việc bắt buộc`);
  if (reasons.includes("minutes")) parts.push(`${stats.focusMinutes} phút có hẹn giờ`);
  const detail = parts.join(" · ");
  return `Ngày của con đang khá đầy (${detail}). Cân nhắc để lại vài việc thôi và chừa giờ nghỉ cho con — nghỉ ngơi cũng là một phần của lớn khôn.`;
}

/**
 * Đánh giá tải một ngày. Trả về cảnh báo MỀM khi vượt bất kỳ ngưỡng nào.
 * @param {Array<{isMandatory?: boolean, durationMin?: number}>} tasks
 * @returns {{ taskCount:number, mandatoryCount:number, focusMinutes:number,
 *   overloaded:boolean, reasons:Array<'tasks'|'mandatory'|'minutes'>, message:string }}
 */
export function assessDailyWorkload(tasks) {
  const list = Array.isArray(tasks) ? tasks : [];
  const taskCount = list.length;
  const mandatoryCount = list.filter((t) => t?.isMandatory).length;
  const focusMinutes = list.reduce((sum, t) => sum + focusMinutesOf(t), 0);

  const reasons = [];
  if (taskCount > SOFT_MAX_TASKS) reasons.push("tasks");
  if (mandatoryCount > SOFT_MAX_MANDATORY) reasons.push("mandatory");
  if (focusMinutes > SOFT_MAX_FOCUS_MINUTES) reasons.push("minutes");

  const overloaded = reasons.length > 0;
  const stats = { taskCount, mandatoryCount, focusMinutes };
  return {
    ...stats,
    overloaded,
    reasons,
    message: overloaded ? buildWorkloadMessage(reasons, stats) : "",
  };
}
