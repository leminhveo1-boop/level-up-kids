/**
 * D8 "So-với-chính-mình" — weekly self-comparison from daily history snapshots.
 * Pure functions, no side effects. Self-comparison only (Dweck process praise):
 * never compares against siblings or other kids.
 */

import { COMPARE_MIN_LAST_WEEK_DAYS } from "./constants";

const sumCompleted = (days) => days.reduce((acc, d) => acc + (d.completed || 0), 0);

/**
 * GĐ0 — tầng ĐO North Star (T3). North Star = việc QUAN TRỌNG con TỰ khởi động
 * đúng giờ, không cần nhắc. Đo đầy đủ ở tầng máy để dựng insight điểm-mạnh sau
 * này; TUYỆT ĐỐI không phô con số này như một điểm số phán xét cho trẻ.
 *
 * Pure, không side effect. Nhận state ĐÃ settle của ngày đóng + ngày đóng.
 * @param {object} state          state ngày đang đóng (sau approveAllPending)
 * @param {string} closingDate    khoá ngày đang đóng (khớp tomorrowPlan.targetDate)
 * @returns {{ remindersNeeded: number, importantDone: number,
 *             importantTotal: number, plannedLastNight: boolean }}
 */
export function northStarSignals(state, closingDate = "") {
  const tasks = Array.isArray(state?.tasks) ? state.tasks : [];
  const important = tasks.filter((t) => t.importance);
  // ponytail: remindersToday là counter thô, CHƯA có UI tăng — nối khi nút
  // "bố mẹ nhắc" ra đời (D3.4). Tới đó field vẫn ghi 0 an toàn.
  const reminders = Math.trunc(Number(state?.remindersToday));
  return {
    remindersNeeded: Number.isFinite(reminders) ? Math.max(0, reminders) : 0,
    importantDone: important.filter((t) => t.completed).length,
    importantTotal: important.length,
    plannedLastNight: Boolean(
      state?.tomorrowPlan && closingDate && state.tomorrowPlan.targetDate === closingDate
    ),
  };
}

/**
 * Compare the last 7 days against the 7 days before them.
 * @param {Array<{date: string, completed: number, total: number}>} history
 *        closed daily snapshots, oldest → newest (as stored in game state)
 * @param {{ completed: number, total: number } | null} [todayLive]
 *        optional in-progress day (not yet snapshotted) counted into this week
 * @returns {{ status: "up"|"down"|"flat"|"insufficient", thisWeek: number,
 *             lastWeek: number, deltaPct: number, message: string }}
 */
export function compareWeeks(history, todayLive = null) {
  const closed = Array.isArray(history) ? history : [];
  const days = todayLive ? [...closed, todayLive] : closed;

  const thisWeekDays = days.slice(-7);
  const lastWeekDays = days.slice(-14, -7);
  const thisWeek = sumCompleted(thisWeekDays);
  const lastWeek = sumCompleted(lastWeekDays);

  // Not enough of a baseline (few days, or an empty week) — comparing would mislead
  if (lastWeekDays.length < COMPARE_MIN_LAST_WEEK_DAYS || lastWeek === 0) {
    return { status: "insufficient", thisWeek, lastWeek, deltaPct: 0, message: "" };
  }

  const deltaPct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

  if (deltaPct > 0) {
    return {
      status: "up",
      thisWeek,
      lastWeek,
      deltaPct,
      message: `Tuần này hoàn thành ${thisWeek} việc — nhiều hơn ${deltaPct}% so với tuần trước 📈`,
    };
  }
  if (deltaPct < 0) {
    // Down weeks get a gentle forward-looking nudge — no percentages, no blame
    return {
      status: "down",
      thisWeek,
      lastWeek,
      deltaPct,
      message: `Tuần này ${thisWeek} việc — chậm hơn tuần trước một nhịp, tuần mới là cơ hội bứt phá 🌱`,
    };
  }
  return {
    status: "flat",
    thisWeek,
    lastWeek,
    deltaPct: 0,
    message: "Giữ vững phong độ như tuần trước — đều đặn chính là siêu năng lực 💪",
  };
}
