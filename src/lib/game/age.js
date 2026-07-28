/**
 * §13 — Nhóm tuổi cho HỆ QUẢ XU (spec: docs/SPEC_KINH_TE_XU_MINH_BACH.md §13).
 *
 * App KHÔNG lưu tuổi thật ở bảng `children` (chỉ ui_mode kid/teen). Founder chốt
 * 28/07: thêm `birthYear` trong GameState document (JSONB) — KHÔNG migration prod.
 * Module này thuần dữ liệu: quy birthYear (+ fallback ui_mode) → nhóm tuổi + cờ hệ quả.
 *
 * Nguyên tắc BẢO THỦ khi thiếu tuổi: mọi hệ quả NHẠY CẢM (đụng xu thật / hạ cấp mạnh)
 * chỉ bật khi biết CHẮC tuổi. Thiếu tuổi → fallback nhóm an toàn, KHÔNG tự bật hệ quả.
 */

// Ranh giới (khớp §13.1–13.3, đã qua 4 model phản biện):
export const YOUNG_KID_MAX = 8; // ≤8: extinction thuần (chưa hiểu nhân-quả tài sản — Kohlberg)
export const AGE_RESTITUTION_MIN = 9; // ≥9: mới cho Restitution/đền bù
export const AGE_PLEDGE_MIN = 12; // ≥12: mới cho Cọc cam kết

const AGE_SANE_MIN = 0;
const AGE_SANE_MAX = 120;

/**
 * @typedef {Object} AgeInfo
 * @property {"young_kid"|"older_kid"|"teen"} group
 * @property {boolean} known   true = tính từ birthYear thật; false = suy từ ui_mode
 * @property {number} [age]    chỉ có khi known
 */

/**
 * Quy nhóm tuổi. `now` truyền vào để tất định (test không phụ thuộc đồng hồ).
 * @param {{ birthYear?: number|null, uiMode?: "kid"|"teen" }} [child]
 * @param {Date} [now]
 * @returns {AgeInfo}
 */
export function ageGroupFor(child = {}, now = new Date()) {
  const { birthYear, uiMode } = child || {};
  const age = ageFromBirthYear(birthYear, now);

  if (age !== null) {
    return { group: groupForAge(age), known: true, age };
  }

  // Thiếu/rác tuổi → suy từ ui_mode, đánh dấu known:false.
  // teen → teen; còn lại (kid/undefined) → older_kid (KHÔNG young_kid: tránh hạ cấp
  // trẻ có thể 11t thành "pet chết"; cũng KHÔNG tự bật Restitution vì known=false).
  const group = uiMode === "teen" ? "teen" : "older_kid";
  return { group, known: false };
}

/** birthYear hợp lệ → tuổi nguyên; rác/thiếu → null. */
function ageFromBirthYear(birthYear, now) {
  if (!Number.isInteger(birthYear)) return null;
  const age = now.getFullYear() - birthYear;
  if (age < AGE_SANE_MIN || age > AGE_SANE_MAX) return null;
  return age;
}

function groupForAge(age) {
  if (age <= YOUNG_KID_MAX) return "young_kid";
  if (age < AGE_PLEDGE_MIN) return "older_kid";
  return "teen";
}

/**
 * Restitution/đền bù (đụng xu) — CHỈ khi biết CHẮC tuổi ≥9.
 * Thiếu tuổi → tắt (phụ huynh phải nhập tuổi mới dùng).
 * @param {AgeInfo} info
 */
export function restitutionEnabled(info) {
  return Boolean(info?.known && info.age >= AGE_RESTITUTION_MIN);
}

/**
 * Cọc cam kết (tự nguyện opt-in, mặc định Điểm ⭐ không rủi ro) — biết chắc ≥12
 * HOẶC ui_mode teen (teen luôn được, vì Cọc mặc định không đụng xu thật).
 * @param {AgeInfo} info
 * @param {"kid"|"teen"} [uiMode]
 */
export function pledgeEnabled(info, uiMode) {
  if (uiMode === "teen") return true;
  return Boolean(info?.known && info.age >= AGE_PLEDGE_MIN);
}

/**
 * Pet "xìu mạnh" (extinction) — CHỈ young_kid (biết chắc ≤8). Thiếu tuổi không bao giờ
 * rơi vào young_kid → an toàn.
 * @param {AgeInfo} info
 */
export function extinctionEnabled(info) {
  return info?.group === "young_kid";
}
