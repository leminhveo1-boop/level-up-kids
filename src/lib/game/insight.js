/**
 * C2.1 — INSIGHT ĐIỂM-MẠNH cho phòng phụ huynh (thiết kế 🔴 O).
 *
 * Nguyên tắc T3 ("Đo tất cả, phô rất ít"): tầng máy ĐÃ đo đầy đủ North Star qua
 * daily snapshot; hàm này KHÔNG phô con số phán xét. Nó dịch tín-hiệu-hành-vi
 * thành QUAN SÁT ĐIỂM-MẠNH cụ thể + gợi ý một hành động ấm cho bố mẹ.
 *
 * ── Luật ẩn số (bắt buộc) ──────────────────────────────────────────────
 *  • CẤM mọi tỉ lệ hoàn thành dạng "%" trong text phụ huynh THẤY (vd "70%").
 *    (compareWeeks nhúng % là cho MÀN TRẺ so-với-chính-mình D8, KHÔNG dùng ở đây.)
 *  • Được nêu SỐ ĐẾM nỗ lực cụ thể (streak ngày, số việc) — đó là sự thật hành
 *    vi để khen, không phải điểm phán xét. Không bao giờ nêu "điểm/100" làm tiêu đề.
 *
 * ── Trung thực dữ liệu ─────────────────────────────────────────────────
 *  Snapshot chỉ lưu TỔNG theo ngày (không có "Toán vào thứ Ba"). Vì vậy các câu
 *  khen chỉ dựa trên mẫu CÓ THẬT trong dữ liệu (tự-bắt-đầu, lập-kế-hoạch, ưu-tiên,
 *  tự-review, đà-tuần). KHÔNG bịa mức cụ thể mà máy không đo được.
 *
 * ── Ánh xạ tín-hiệu → câu khen (số → gợi-ý-hành-vi) ────────────────────
 *  | tín hiệu (cửa sổ 7 ngày đóng gần nhất)        | điểm mạnh          | teen? |
 *  |------------------------------------------------|--------------------|:-----:|
 *  | ≥3 ngày remindersNeeded=0 & làm hết việc q.trọng | Tự giác (North★)  |  ✓   |
 *  | streak (live) ≥3                                | Bền bỉ            |  ✓   |
 *  | ≥3 ngày plannedLastNight                        | Tự tổ chức         |  ✓   |
 *  | compareWeeks status "up"                        | Đà đi lên          |  ✓   |
 *  | ≥3 ngày làm hết việc bắt buộc                   | Biết ưu tiên       |  ✓   |
 *  | ≥3 ngày reviewed                                | Tự phản tỉnh       |  ✗   |  ← quá micro cho teen
 *
 * ── Gating teen (PS: 12+ ghét micro-manage) ───────────────────────────
 *  teen → CHỈ summary: tối đa 1 insight, và loại các mục mức-ngày (review).
 *  kid  → tối đa 2 insight, xếp theo priority (North★ trước).
 *
 * Hàm THUẦN (default `now = new Date()` chỉ khi caller bỏ trống, giống planning.js).
 * C2.2 (🟡 S) chỉ việc render — không chứa logic ánh xạ ở tầng UI.
 */

import { addLocalDays, dateKey } from "./planning";
import { compareWeeks } from "./progress";

const INSIGHT_WINDOW_DAYS = 7; // cửa sổ ngày đóng gần nhất để soi mẫu hành vi
const PATTERN_MIN_DAYS = 3; // số ngày tối thiểu để coi là "mẫu" (không phải may rủi)
const STREAK_MIN = 3; // streak tối thiểu để khen bền bỉ (khớp STREAK_MIN_TASKS)
const KID_MAX_INSIGHTS = 2;
const TEEN_MAX_INSIGHTS = 1;

const recentClosedDays = (history) => {
  const days = Array.isArray(history) ? history : [];
  return days.slice(-INSIGHT_WINDOW_DAYS);
};

/**
 * Card "Ngày mai của [con] đã sẵn sàng · N việc thường · M việc quan trọng".
 * Chỉ hiện khi có kế hoạch cho ĐÚNG ngày mai (hoặc đang là hôm nay) — kế hoạch
 * cũ/quá khứ trả null để không khoe nhầm.
 */
function buildTomorrowCard(state, name, now) {
  const plan = state?.tomorrowPlan;
  const items = Array.isArray(plan?.items) ? plan.items : [];
  if (!plan?.targetDate || items.length === 0) return null;

  const today = dateKey(now);
  const tomorrow = dateKey(addLocalDays(now, 1));
  const isReady = plan.targetDate === tomorrow || plan.targetDate === today;
  if (!isReady) return null;

  const importantCount = items.filter((it) => it.isMandatory).length;
  const ordinaryCount = items.length - importantCount;

  const parts = [];
  if (ordinaryCount > 0) parts.push(`${ordinaryCount} việc thường`);
  if (importantCount > 0) parts.push(`${importantCount} việc quan trọng`);
  const detail = parts.length ? ` · ${parts.join(" · ")}` : "";

  return {
    ordinaryCount,
    importantCount,
    text: `Ngày mai của ${name} đã sẵn sàng${detail}`,
  };
}

/**
 * Sinh các câu khen điểm-mạnh từ mẫu hành vi có thật.
 * @returns {Array<{ id: string, priority: number, teenOk: boolean, text: string }>}
 */
function candidateInsights(state, name) {
  const days = recentClosedDays(state?.history);
  const withData = days.filter((d) => (d?.total || 0) > 0);
  const out = [];

  // 1) North Star — tự bắt đầu việc quan trọng, không cần nhắc.
  const selfStartDays = withData.filter(
    (d) => (d.importantTotal || 0) > 0 && d.importantDone === d.importantTotal && (d.remindersNeeded || 0) === 0
  ).length;
  if (selfStartDays >= PATTERN_MIN_DAYS) {
    out.push({
      id: "self_start",
      priority: 1,
      teenOk: true,
      text: `${name} tự bắt đầu những việc quan trọng mà không cần ai nhắc — sự tự giác này đáng để bố mẹ khen con ngay hôm nay.`,
    });
  }

  // 2) Bền bỉ — streak sống.
  const streak = Math.trunc(Number(state?.streak)) || 0;
  if (streak >= STREAK_MIN) {
    out.push({
      id: "streak",
      priority: 2,
      teenOk: true,
      text: `${name} giữ nhịp đều ${streak} ngày liên tục — sự bền bỉ này là một điểm mạnh thật sự, bố mẹ ghi nhận cùng con nhé.`,
    });
  }

  // 3) Tự tổ chức — chuẩn bị kế hoạch từ tối hôm trước.
  const planningDays = withData.filter((d) => d.plannedLastNight).length;
  if (planningDays >= PATTERN_MIN_DAYS) {
    out.push({
      id: "planning",
      priority: 3,
      teenOk: true,
      text: `${name} đã tự chuẩn bị kế hoạch từ tối hôm trước nhiều ngày liền — kỹ năng tự tổ chức đang lớn dần lên.`,
    });
  }

  // 4) Đà đi lên — so tuần (ẩn %: KHÔNG dùng message của compareWeeks vốn có %).
  const cmp = compareWeeks(state?.history);
  if (cmp.status === "up") {
    out.push({
      id: "trend_up",
      priority: 4,
      teenOk: true,
      text: `Tuần này ${name} hoàn thành nhiều việc hơn tuần trước một nhịp — đà đi lên đang rất rõ.`,
    });
  }

  // 5) Biết ưu tiên — làm hết việc bắt buộc.
  const priorityDays = withData.filter(
    (d) => (d.mandatoryTotal || 0) > 0 && d.mandatoryDone === d.mandatoryTotal
  ).length;
  if (priorityDays >= PATTERN_MIN_DAYS) {
    out.push({
      id: "priority",
      priority: 5,
      teenOk: true,
      text: `${name} làm xong những việc quan trọng nhất trước tiên — con đang biết ưu tiên đúng chỗ.`,
    });
  }

  // 6) Tự phản tỉnh — nhìn lại ngày (mức-ngày → CHẶN cho teen).
  const reviewDays = withData.filter((d) => d.reviewed).length;
  if (reviewDays >= PATTERN_MIN_DAYS) {
    out.push({
      id: "self_review",
      priority: 6,
      teenOk: false,
      text: `${name} tự nhìn lại ngày của mình mỗi tối — thói quen tự phản tỉnh này rất đáng quý ở lứa tuổi con.`,
    });
  }

  return out.sort((a, b) => a.priority - b.priority);
}

/**
 * Điểm vào chính. Trả dữ liệu ĐÃ chọn lọc cho phòng phụ huynh render.
 * @param {object} state  full game state (charName, uiMode, history, streak, tomorrowPlan)
 * @param {Date}  [now]   mốc thời gian (test truyền cố định)
 * @returns {{ tomorrow: {ordinaryCount:number, importantCount:number, text:string}|null,
 *             insights: string[] }}
 */
export function buildParentInsight(state, now = new Date()) {
  const name = state?.charName || "Con";
  const isTeen = state?.uiMode === "teen";

  const tomorrow = buildTomorrowCard(state, name, now);

  let picked = candidateInsights(state, name);
  if (isTeen) picked = picked.filter((c) => c.teenOk);

  const cap = isTeen ? TEEN_MAX_INSIGHTS : KID_MAX_INSIGHTS;
  let insights = picked.slice(0, cap).map((c) => c.text);

  // Fallback không xấu hổ: chưa đủ mẫu điểm-mạnh → một lời nâng đỡ hướng tới.
  if (insights.length === 0) {
    insights = [
      `Những ngày đầu luôn cần thời gian tìm nhịp. Một lời động viên nhỏ từ bố mẹ lúc này có sức mạnh hơn bất kỳ phần thưởng nào — cả nhà đang đi cùng ${name}.`,
    ];
  }

  return { tomorrow, insights };
}
