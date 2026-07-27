const EDITABLE_REWARD_FIELDS = ["title", "cost", "currency", "type"];

/** Sửa quà tại chỗ, kể cả quà seed; giữ nguyên id và lịch sử duyệt. */
export function updateRewardById(rewards, id, patch = {}) {
  const list = Array.isArray(rewards) ? rewards : [];
  return list.map((reward) => {
    if (reward.id !== id) return reward;

    const next = { ...reward };
    for (const field of EDITABLE_REWARD_FIELDS) {
      if (!(field in patch)) continue;
      if (field === "title") {
        const title = String(patch.title || "").trim().slice(0, 60);
        if (title) next.title = title;
      } else if (field === "cost") {
        next.cost = Math.max(1, parseInt(patch.cost, 10) || 1);
      } else if (patch[field]) {
        next[field] = patch[field];
      }
    }

    if (next.type === "game_time" && "minutes" in patch) {
      next.value = Math.max(5, parseInt(patch.minutes, 10) || 5);
    }
    return next;
  });
}
