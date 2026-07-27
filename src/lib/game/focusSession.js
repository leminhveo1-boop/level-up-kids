/**
 * D3.1 — CHẾ ĐỘ SỔ / KHÔNG MÀN HÌNH (giải nghịch lý màn hình).
 *
 * App tự nó là một màn hình → mâu thuẫn với mục tiêu giảm lệ thuộc màn hình.
 * Chế độ sổ đưa việc hôm nay ra một danh sách SẠCH (không xu/EXP/pet/hiệu ứng)
 * để: (1) IN ra giấy, trẻ làm hoàn toàn ngoài màn hình; (2) đặt ĐỒNG HỒ PHIÊN có
 * hạn — dùng app một lúc rồi gấp lại, không phải "cửa ngõ YouTube" vô tận.
 *
 * Module thuần: chỉ lọc/format dữ liệu. UI (overlay + countdown + window.print)
 * nằm ở FocusSessionMode.js.
 */

// Mốc thời lượng phiên (phút) — ngắn, có hạn; trẻ dùng app rồi ra ngoài làm.
export const SESSION_PRESETS = [15, 25, 40];

/** Việc bắt buộc / quan trọng đều là "cần làm" để đứng trước trong sổ. */
function isMustDo(task) {
  return Boolean(task.isMandatory || task.importance);
}

/**
 * Danh sách sạch cho chế độ sổ: chỉ id/title/isMandatory/completed — KHÔNG mang
 * điểm, năng lượng, emoji thưởng hay field game nào. Việc cần-làm xếp trước.
 * @param {Array<object>} tasks
 * @returns {Array<{id:string, title:string, isMandatory:boolean, completed:boolean}>}
 */
export function sessionTaskList(tasks) {
  const src = Array.isArray(tasks) ? tasks : [];
  const clean = src.map((t) => ({
    id: t.id,
    title: (t.title || "").trim(),
    isMandatory: isMustDo(t),
    completed: Boolean(t.completed),
  }));
  return [
    ...clean.filter((t) => t.isMandatory),
    ...clean.filter((t) => !t.isMandatory),
  ];
}

/**
 * Định dạng đồng hồ mm:ss, kẹp về 00:00 khi ≤ 0 (không hiển thị số âm).
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
