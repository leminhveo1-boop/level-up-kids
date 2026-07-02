/**
 * Sổ Vàng Ghi Nhận — data-driven PROCESS-praise suggestions for parents
 * (Dweck growth mindset: praise effort/strategy, never innate talent).
 * Pure function; the parent taps once to send via pigeon.
 */

/**
 * @param {object} state full game state
 * @returns {string[]} up to 3 concrete praise suggestions
 */
export function generatePraiseSuggestions(state) {
  const name = state.charName || "con";
  const suggestions = [];

  const completedToday = state.tasks.filter((t) => t.completed).length;
  const timerTasksDone = state.tasks.filter((t) => t.completed && t.verifyType === "timer").length;
  const mandatoryDone = state.tasks.filter((t) => t.isMandatory && t.completed).length;
  const mandatoryTotal = state.tasks.filter((t) => t.isMandatory).length;

  // Streak — persistence praise
  if (state.streak >= 3) {
    suggestions.push(
      `${name} ơi, bố mẹ thấy con đã kiên trì giữ lửa ${state.streak} ngày liên tục rồi — sự bền bỉ đó quý hơn mọi điểm số! 🔥`
    );
  }

  // Focus time — process praise
  if (timerTasksDone > 0) {
    suggestions.push(
      `Hôm nay con đã tự tập trung hoàn thành ${timerTasksDone} việc cần hẹn giờ mà không cần ai nhắc — bố mẹ rất tự hào về cách con làm việc! ⏱️`
    );
  }

  // Trust — integrity praise
  if ((state.trustScore || 0) >= 70) {
    suggestions.push(
      `Uy Tín của con đang ở mức ${state.trustScore}/100 — con làm thật, báo thật. Trung thực là sức mạnh lớn nhất của một anh hùng! 🤝`
    );
  }

  // Mandatory completion — responsibility praise
  if (mandatoryTotal > 0 && mandatoryDone === mandatoryTotal) {
    suggestions.push(
      `Con đã tự giác xong hết ${mandatoryTotal} việc quan trọng nhất hôm nay. Cách con ưu tiên việc cần làm trước thật đáng nể! ✅`
    );
  }

  // Volume — effort praise
  if (completedToday >= 5) {
    suggestions.push(
      `${completedToday} nhiệm vụ trong một ngày! Bố mẹ thấy rõ con đã cố gắng thế nào — nỗ lực của con không hề nhỏ đâu. 💪`
    );
  }

  // Fallback — encourage restart without shame
  if (suggestions.length === 0) {
    suggestions.push(
      `Hôm nay chưa phải ngày rực rỡ nhất của con, nhưng bố mẹ tin ngày mai con sẽ chọn lại được nhịp của mình. Cả nhà luôn ở đây! 🌱`
    );
  }

  return suggestions.slice(0, 3);
}
