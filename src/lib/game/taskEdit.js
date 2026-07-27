/**
 * Sửa 1 nhiệm vụ đã có — phụ huynh chỉnh gợi ý của app (#2 UX: gợi ý phải sửa được).
 *
 * Pure, immutable: trả về task MỚI, không đụng task gốc. Chỉ nhận các field cho
 * phép sửa; field lạ bị bỏ qua. Ép kiểu số an toàn (không cho âm/không NaN).
 */

/** category → statKey (khớp addCustomTask trong GameState). */
export const TASK_STAT_KEY_MAP = {
  strength: "strength",
  intellect: "intellect",
  creative: "creative",
  help: "help",
  connection: "help",
};

export const toInt = (v, min, fallback) => {
  const n = parseInt(v, 10);
  return Math.max(min, Number.isFinite(n) ? n : fallback);
};

/**
 * @param {object} task            nhiệm vụ hiện tại
 * @param {object} patch           các field muốn đổi: title, category, exp, energy, verifyType, durationMin, isMandatory
 * @param {object} [statKeyMap]    map category→statKey (mặc định TASK_STAT_KEY_MAP)
 * @returns {object} task mới đã áp thay đổi
 */
export function applyTaskEdit(task, patch, statKeyMap = TASK_STAT_KEY_MAP) {
  if (!task) return task;
  const p = patch || {};
  const next = { ...task };

  if (p.title != null) {
    const t = String(p.title).trim();
    if (t) next.title = t; // giữ tên cũ nếu sửa thành rỗng
  }

  if (p.category != null) {
    next.category = p.category;
    next.statKey = statKeyMap[p.category] || "discipline";
  }

  // EXP/Điểm là 1 con số trong form → đồng bộ cả exp lẫn points (khớp addCustomTask).
  if (p.exp != null) {
    const v = toInt(p.exp, 0, 0);
    next.exp = v;
    next.points = v;
  }

  if (p.energy != null) next.energy = toInt(p.energy, 0, 0);

  // verifyType đổi kèm quy tắc durationMin: chỉ "focus" mới có timer (khớp UI + constants).
  if (p.verifyType != null) {
    next.verifyType = p.verifyType;
    if (p.verifyType === "focus") {
      next.durationMin = toInt(p.durationMin ?? next.durationMin, 1, 10);
    } else {
      next.durationMin = undefined;
    }
  } else if (p.durationMin != null && next.verifyType === "focus") {
    next.durationMin = toInt(p.durationMin, 1, 10);
  }

  if (p.isMandatory != null) next.isMandatory = !!p.isMandatory;

  return next;
}
