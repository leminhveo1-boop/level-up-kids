/**
 * Thẻ Thành Tích — logic thuần chọn nội dung cho thẻ chia sẻ (9:16).
 *
 * Nền nghiên cứu (docs/DEEP_05): thẻ share-worthy cần MỘT con số HERO (không
 * liệt kê), đóng khung KỶ NIỆM/CỘT MỐC (không "khoe"), so-với-chính-mình (không
 * xếp hạng con-với-con), và chỉ nên tự gợi ý chia sẻ tại ĐỈNH cảm xúc (peak-end)
 * — không đều đặn mỗi tuần. Không bịa "top X%" vì app chưa có dữ liệu liên-gia-đình.
 *
 * Pure, no side effects, no React — dùng chung cho banner (UI) và canvas (ảnh).
 */

// ponytail: milestone chỉ dùng tín hiệu phát hiện được từ state hiện có
// (streak bội 7, tiến bộ ≥ ngưỡng). Nâng cấp sau: lưu kỷ lục streak cá nhân
// (bestStreak) để bung thẻ khi PHÁ kỷ lục, và tổng hợp liên-gia-đình cho khan hiếm.
const STREAK_MILESTONE_STEP = 7;
const PROGRESS_MILESTONE_MIN_PCT = 20;

/**
 * @param {object} input
 * @param {string} input.charName
 * @param {number} input.level
 * @param {number} input.streak
 * @param {{status:string, thisWeek:number, deltaPct:number}} input.weekCompare  kết quả compareWeeks
 * @param {boolean} [input.mandatoryAllDone]  đã xong hết việc bắt buộc hôm nay
 * @returns {{
 *   milestone: {type:"streak"|"progress", reason:string} | null,
 *   hero: {value:string, label:string},
 *   title: string,
 *   subtitle: string,
 *   evidence: string[],
 *   narrative: string
 * }}
 */
export function buildShareCard(input) {
  const name = (input.charName || "Con").trim() || "Con";
  const level = input.level || 1;
  const streak = input.streak || 0;
  const wc = input.weekCompare || { status: "insufficient", thisWeek: 0, deltaPct: 0 };
  const isUp = wc.status === "up";
  const deltaPct = wc.deltaPct || 0;
  const thisWeek = wc.thisWeek || 0;

  // ── Milestone (peak-end): chỉ khi thật sự đáng, để giữ tính khan hiếm ──
  let milestone = null;
  if (streak > 0 && streak % STREAK_MILESTONE_STEP === 0) {
    milestone = { type: "streak", reason: `Chuỗi ${streak} ngày liên tiếp!` };
  } else if (isUp && deltaPct >= PROGRESS_MILESTONE_MIN_PCT) {
    milestone = { type: "progress", reason: `Tiến bộ +${deltaPct}% so với tuần trước` };
  }

  // ── Hero: MỘT con số duy nhất, chọn theo tín hiệu mạnh nhất ──
  let hero;
  if (streak >= STREAK_MILESTONE_STEP) {
    hero = { value: String(streak), label: "ngày liên tiếp" };
  } else if (isUp) {
    hero = { value: `+${deltaPct}%`, label: "so với tuần trước" };
  } else {
    hero = { value: String(thisWeek), label: "việc hoàn thành tuần này" };
  }

  // ── Title: đóng khung kỷ niệm/cột mốc, title case (KHÔNG IN HOA) ──
  const title = milestone ? `Cột mốc của ${name}` : `Tuần này của ${name}`;
  const subtitle = `Cấp ${level}`;

  // ── Evidence: tối đa 2 dòng phụ, chỉ so-với-chính-mình ──
  const evidence = [];
  if (thisWeek > 0) evidence.push(`✅ ${thisWeek} việc hoàn thành tuần này`);
  // tránh trùng con số hero khi hero đã là %tiến bộ
  if (isUp && hero.value.indexOf("%") === -1) {
    evidence.push(`📈 +${deltaPct}% so với chính mình tuần trước`);
  }

  // ── Narrative: 1 câu cụ thể theo tín hiệu mạnh nhất ──
  let narrative;
  if (streak >= STREAK_MILESTONE_STEP) {
    narrative = `${name} không bỏ lỡ ngày nào suốt ${streak} ngày qua.`;
  } else if (isUp) {
    narrative = `Tuần này ${name} tiến bộ rõ so với chính mình.`;
  } else if (input.mandatoryAllDone) {
    narrative = `${name} tự giác xong hết việc quan trọng — không cần ai nhắc.`;
  } else {
    narrative = `Mỗi ngày một chút, ${name} đang lớn lên từng bước.`;
  }

  return { milestone, hero, title, subtitle, evidence: evidence.slice(0, 2), narrative };
}
