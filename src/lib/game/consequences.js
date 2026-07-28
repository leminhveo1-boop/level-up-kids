/**
 * §13 Mảnh B — HỆ QUẢ theo tuổi cho 9–13t: Restitution (đền bù 2 bên) + Cọc cam kết.
 * PURE (no React, no side effect). Bất biến §13.4 (ranh đỏ):
 *  - KHÔNG nút trừ-xu-một-phía: Restitution chỉ CHUYỂN khi con `agree` (2 bên đồng thuận).
 *  - Mọi "mất" trên tài nguyên game/tự nguyện, phục hồi được, biết trước, không dán nhãn.
 *  - Cọc mất → "quỹ chung nhà" (familyFund), KHÔNG về túi bố mẹ.
 * Gate tuổi ở lớp gọi qua age.js (restitutionEnabled/pledgeEnabled) — kiểm lại tại đây
 * để hàm thuần tự an toàn dù UI quên gate.
 */

import { restitutionEnabled, pledgeEnabled } from "./age";

export const RESTITUTION_MAX_RATIO = 0.3; // đền bù ≤ 30% ví hiện có (spec §13)

/** Trần đền bù theo ví hiện có (số nguyên, không âm). */
export function maxRestitution(heroCoins) {
  return Math.max(0, Math.floor((Number(heroCoins) || 0) * RESTITUTION_MAX_RATIO));
}

const genId = (idFn) => (typeof idFn === "function" ? idFn() : "r_" + Date.now() + "_" + Math.random().toString(36).slice(2));

/**
 * Bố mẹ ĐỀ NGHỊ đền bù — CHỈ tạo bản ghi pending, KHÔNG đụng ví. Con phải `agree` mới chuyển.
 * @returns {{state, result:{success, error?, item?}}}
 */
export function proposeRestitution(state, { reason, amount, taskId } = {}, ageInfo, idFn) {
  if (!restitutionEnabled(ageInfo)) return { state, result: { success: false, error: "AGE_NOT_ELIGIBLE" } };
  if (!Number.isInteger(amount) || amount <= 0) return { state, result: { success: false, error: "INVALID_AMOUNT" } };
  if (!reason || !String(reason).trim()) return { state, result: { success: false, error: "REASON_REQUIRED" } };
  if (amount > maxRestitution(state.heroCoins)) return { state, result: { success: false, error: "AMOUNT_TOO_HIGH" } };

  const item = { id: genId(idFn), taskId: taskId || null, reason: String(reason).trim(), amount, status: "pending" };
  return {
    state: { ...state, restitutions: [...(state.restitutions || []), item] },
    result: { success: true, item },
  };
}

/**
 * Con ĐỒNG Ý đền bù → chuyển xu sang repairFund. Nếu ví đã tụt dưới mức đề nghị thì chỉ
 * chuyển phần còn (không đẩy ví âm). Đã agreed rồi thì không chuyển lần nữa.
 */
export function agreeRestitution(state, id) {
  const list = state.restitutions || [];
  const item = list.find((r) => r.id === id);
  if (!item) return { state, result: { success: false, error: "NOT_FOUND" } };
  if (item.status !== "pending") return { state, result: { success: false, error: "NOT_PENDING" } };

  const moved = Math.min(item.amount, Math.max(0, state.heroCoins || 0));
  return {
    state: {
      ...state,
      heroCoins: (state.heroCoins || 0) - moved,
      repairFund: (state.repairFund || 0) + moved,
      restitutions: list.map((r) => (r.id === id ? { ...r, status: "agreed", movedAmount: moved } : r)),
    },
    result: { success: true, moved },
  };
}

/** Con chọn "nói chuyện đã" → bỏ đề nghị pending. Không xoá được item đã agreed. */
export function dismissRestitution(state, id) {
  const list = state.restitutions || [];
  const item = list.find((r) => r.id === id);
  if (!item || item.status !== "pending") return { state, result: { success: false, error: "NOT_PENDING" } };
  return {
    state: { ...state, restitutions: list.filter((r) => r.id !== id) },
    result: { success: true },
  };
}

// ===== Cọc cam kết =====

const PLEDGE_BALANCE_FIELD = { points: "points", coins: "heroCoins" };

/**
 * Con ĐẶT CỌC (tự nguyện opt-in). Giữ cọc (escrow) ngay: trừ khỏi số dư tương ứng.
 * Mặc định Điểm ⭐; xu thật chỉ khi con chủ động chọn currency:"coins".
 */
export function createPledge(state, { goal, stake, currency = "points" } = {}, ageInfo, uiMode, idFn) {
  if (!pledgeEnabled(ageInfo, uiMode)) return { state, result: { success: false, error: "AGE_NOT_ELIGIBLE" } };
  const field = PLEDGE_BALANCE_FIELD[currency];
  if (!field) return { state, result: { success: false, error: "INVALID_CURRENCY" } };
  if (!Number.isInteger(stake) || stake <= 0) return { state, result: { success: false, error: "INVALID_STAKE" } };
  if (!goal || !String(goal).trim()) return { state, result: { success: false, error: "GOAL_REQUIRED" } };
  if ((state[field] || 0) < stake) return { state, result: { success: false, error: "INSUFFICIENT" } };

  const pledge = { id: genId(idFn), goal: String(goal).trim(), stake, currency, status: "open" };
  return {
    state: { ...state, [field]: state[field] - stake, pledges: [...(state.pledges || []), pledge] },
    result: { success: true, pledge },
  };
}

/**
 * Chốt cọc. met=true → hoàn cọc về đúng loại. met=false → cọc xu vào familyFund (quỹ chung
 * nhà, KHÔNG về bố mẹ); cọc Điểm chỉ mất (Điểm là tài nguyên game mềm, quỹ chung tính bằng xu).
 */
export function resolvePledge(state, id, met) {
  const list = state.pledges || [];
  const pledge = list.find((p) => p.id === id);
  if (!pledge || pledge.status !== "open") return { state, result: { success: false, error: "NOT_OPEN" } };

  const field = PLEDGE_BALANCE_FIELD[pledge.currency];
  let next = { ...state };
  if (met) {
    next[field] = (state[field] || 0) + pledge.stake; // hoàn cọc
  } else if (pledge.currency === "coins") {
    next.familyFund = (state.familyFund || 0) + pledge.stake; // xu lỡ → quỹ chung nhà
  }
  next.pledges = list.map((p) => (p.id === id ? { ...p, status: met ? "kept" : "lost" } : p));
  return { state: next, result: { success: true, met: Boolean(met) } };
}
