/**
 * C2.4 — Luồng ông bà / người chăm sóc phụ.
 *
 * Người đôn đốc trẻ khung 16–19h thường là ông bà — KHÔNG dùng app. Thay vì ép
 * họ cài app, phụ huynh bấm "Chia sẻ lịch hôm nay" để gửi một đoạn TEXT THÔ qua
 * Zalo/SMS: ông bà chỉ cần đọc và nhắc, trẻ vẫn tự tick trong app khi làm xong.
 *
 * Nguyên tắc nội dung:
 * - Chỉ liệt kê việc CHƯA xong (đã xong / đang chờ duyệt thì bỏ) — ông bà không
 *   phải đoán việc nào còn.
 * - Việc "cần làm" (bắt buộc) xếp trước + gắn nhãn, để ông bà biết ưu tiên.
 * - Ngắn gọn, có trần dòng — tránh bức tường chữ khó đọc trên điện thoại.
 * - Trấn an: "trẻ tự tick trong app" — ông bà KHÔNG cần cài gì.
 *
 * Pure, no React, no side effects — UI chỉ lấy chuỗi rồi navigator.share/clipboard.
 */

// ponytail: trần 8 dòng để text vừa một màn Zalo. Nâng cấp sau: cho phụ huynh
// chọn khung giờ (chỉ gửi việc buổi chiều) khi có dữ liệu anchor theo giờ.
const MAX_LINES = 8;

/** Việc bắt buộc / quan trọng đều coi là "cần làm" để ông bà ưu tiên nhắc. */
function isMustDo(task) {
  return Boolean(task.isMandatory || task.importance);
}

/**
 * @param {object} input
 * @param {string} [input.charName]   tên trẻ (mặc định "con")
 * @param {string} [input.dateLabel]  nhãn ngày hiển thị, vd "28/07"
 * @param {Array<{title:string, completed?:boolean, approval?:string, isMandatory?:boolean, importance?:boolean}>} [input.tasks]
 * @returns {string} đoạn text thô sẵn sàng dán vào Zalo/SMS
 */
export function buildTodayScheduleText(input = {}) {
  const name = (input.charName || "").trim() || "con";
  const dateLabel = (input.dateLabel || "").trim();
  const tasks = Array.isArray(input.tasks) ? input.tasks : [];

  // Chỉ việc còn phải làm: chưa hoàn thành và không đang chờ duyệt.
  const todo = tasks.filter((t) => !t.completed && t.approval !== "pending");

  const header = dateLabel
    ? `📋 Lịch hôm nay của ${name} (${dateLabel})`
    : `📋 Lịch hôm nay của ${name}`;

  if (todo.length === 0) {
    return [
      header,
      "",
      `Hôm nay ${name} đã xong hết việc rồi ạ 🎉 Ông bà cứ yên tâm nhé!`,
    ].join("\n");
  }

  // Việc "cần làm" trước, giữ nguyên thứ tự tương đối trong mỗi nhóm.
  const ordered = [
    ...todo.filter(isMustDo),
    ...todo.filter((t) => !isMustDo(t)),
  ];

  // Nếu tràn trần, chừa 1 slot cho dòng "…và N việc khác" (tổng bullet ≤ MAX_LINES).
  const overflow = ordered.length > MAX_LINES;
  const shown = ordered.slice(0, overflow ? MAX_LINES - 1 : MAX_LINES);
  const extra = ordered.length - shown.length;

  const lines = shown.map((t) => {
    const title = (t.title || "").trim();
    return isMustDo(t) ? `• ${title} (cần làm)` : `• ${title}`;
  });
  if (extra > 0) lines.push(`• …và ${extra} việc khác`);

  return [
    header,
    "",
    "Việc còn phải làm hôm nay:",
    ...lines,
    "",
    `Ông bà nhắc ${name} làm giúp nhà mình nhé. Làm xong ${name} tự tick trong app, ông bà không cần cài gì ạ. Cảm ơn ông bà nhiều! ❤️`,
  ].join("\n");
}
