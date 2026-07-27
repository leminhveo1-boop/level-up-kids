const FIRST_STEP_MAX = 160;
const ANCHOR_MAX = 80;

/** YYYY-MM-DD theo múi giờ địa phương của gia đình, không dùng UTC. */
export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addLocalDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function selectDefaultFocusTask(tasks = []) {
  const list = Array.isArray(tasks) ? tasks : [];
  return (
    list.find((task) => !task.completed && task.isMandatory) ||
    list.find((task) => !task.completed) ||
    list.find((task) => task.isMandatory) ||
    list[0] ||
    null
  );
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

/**
 * Snapshot toàn bộ trách nhiệm để giấy/sổ ngày mai không phụ thuộc việc danh
 * sách live bị sửa sau đó. `focusTaskId` chỉ làm nổi bật điểm bắt đầu, không
 * ẩn hoặc cắt các việc còn lại.
 */
export function createTomorrowPlan(tasks, options = {}) {
  const list = Array.isArray(tasks) ? tasks : [];
  const items = list
    .filter((task) => task?.id && task?.title)
    .map((task) => ({
      taskId: task.id,
      title: String(task.title).trim(),
      isMandatory: Boolean(task.isMandatory),
    }));

  const requestedFocus = items.find((item) => item.taskId === options.focusTaskId);
  const fallback = selectDefaultFocusTask(list);
  const fallbackInSnapshot = items.find((item) => item.taskId === fallback?.id);
  const now = options.now instanceof Date ? options.now : new Date();

  return {
    targetDate: dateKey(addLocalDays(now, 1)),
    items,
    focusTaskId: requestedFocus?.taskId || fallbackInSnapshot?.taskId || null,
    firstStep: cleanText(options.firstStep, FIRST_STEP_MAX),
    anchor: cleanText(options.anchor, ANCHOR_MAX),
    createdAt: now.getTime(),
  };
}

export function getPlanPhase(plan, now = new Date()) {
  if (!plan?.targetDate) return "none";
  const today = dateKey(now);
  const tomorrow = dateKey(addLocalDays(now, 1));
  if (plan.targetDate === today) return "today";
  if (plan.targetDate === tomorrow) return "tomorrow";
  return plan.targetDate < today ? "stale" : "future";
}
