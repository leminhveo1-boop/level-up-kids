"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { useLang } from "@/context/LanguageContext";
import { getAtRiskTasks } from "@/lib/game/habits";
import { assessDailyWorkload } from "@/lib/game/workload";
import { COIN_RATE_VND, ALLOWANCE_PERK_SEEDS } from "@/lib/game/constants";
import { budgetCoinsFor } from "@/lib/game/economy";
import JourneySection from "@/features/parent/components/JourneySection";
import TimetableSection from "@/features/parent/components/TimetableSection";
import AllowanceCard from "@/features/parent/components/AllowanceCard";
import Collapsible from "@/ui/Collapsible";
import { Trash2, Plus, Gift, PackageOpen, Pencil, Check, X, Coffee } from "lucide-react";

const TASK_TEMPLATES = [
  { title: "🧹 Rửa bát chén sạch sẽ", category: "help", exp: 15, energy: 15, verifyType: "trust" },
  { title: "✨ Quét & lau nhà gọn gàng", category: "help", exp: 20, energy: 20, verifyType: "trust" },
  { title: "🌿 Tưới cây & chăm vườn", category: "help", exp: 10, energy: 10, verifyType: "trust" },
  { title: "🗑️ Tự giác đi đổ rác", category: "help", exp: 10, energy: 10, verifyType: "trust" },
  { title: "📚 Đọc sách 20 phút", category: "intellect", exp: 25, energy: 20, verifyType: "focus", durationMin: 20 },
  { title: "🇬🇧 Học Tiếng Anh 15 phút", category: "intellect", exp: 25, energy: 20, verifyType: "focus", durationMin: 15 },
  { title: "✍️ Hoàn thành bài tập hè", category: "intellect", exp: 30, energy: 25, verifyType: "trust" },
  { title: "🛌 Gấp chăn màn gọn gàng", category: "discipline", exp: 15, energy: 10, verifyType: "trust" },
  { title: "💤 Đi ngủ trước 22h tối", category: "discipline", exp: 20, energy: 15, verifyType: "parent" },
  { title: "🏃 Tập thể dục 15 phút", category: "strength", exp: 20, energy: 20, verifyType: "focus", durationMin: 15 },
  { title: "🎨 Vẽ tranh hoặc tô màu", category: "creative", exp: 20, energy: 15, verifyType: "trust" },
  { title: "🎹 Luyện đàn / nhạc cụ 15p", category: "creative", exp: 25, energy: 20, verifyType: "focus", durationMin: 15 },
  // 💞 Connection quests — parent & child together (both earn the moment)
  { title: "💞 Đọc sách cùng bố mẹ 15 phút", category: "connection", exp: 25, energy: 20, verifyType: "parent" },
  { title: "💞 Cùng nấu một món / làm việc nhà chung", category: "connection", exp: 25, energy: 20, verifyType: "parent" },
  { title: "💞 Đi dạo & trò chuyện cùng nhau 15p", category: "connection", exp: 20, energy: 15, verifyType: "parent" },
  { title: "💞 Ôm bố mẹ và nói một lời yêu thương", category: "connection", exp: 10, energy: 8, verifyType: "parent" },
];

// V1.3: soft hints only (never a gate). "focus" enables an optional focus timer.
const VERIFY_OPTIONS = [
  { value: "trust", label: "🤝 Con tự ghi nhận" },
  { value: "parent", label: "👨‍👩‍👧 Bố mẹ ghi nhận" },
  { value: "focus", label: "🌳 Có tập trung (thưởng thêm)" },
];

const CATEGORY_OPTIONS = [
  { value: "discipline", label: "⚡ Kỷ luật" },
  { value: "strength", label: "🏃 Thể lực (mở Ấn Pháp)" },
  { value: "intellect", label: "🧠 Trí tuệ (mở Ấn Pháp)" },
  { value: "creative", label: "🎨 Sáng tạo" },
  { value: "help", label: "🤝 Giúp đỡ" },
  { value: "connection", label: "💞 Kết nối bố mẹ & con" },
];

/** Tab 🎯 NHIỆM VỤ & QUÀ — CRUD tasks/rewards + inventory gifting. */
export default function ManageTab() {
  const {
    tasks,
    rewards,
    addCustomTask,
    deleteTask,
    updateTask,
    splitTask,
    dismissAtRisk,
    addCustomReward,
    updateReward,
    deleteReward,
    setInventory,
    parentConfig,
    charName,
    uiMode,
  } = useGame();
  const { t } = useLang();
  const budgetCoins = budgetCoinsFor(parentConfig); // Pha E — >0 mới hiện ô Xu/task
  const allowanceOn = budgetCoins > 0;
  const atRiskTasks = getAtRiskTasks(tasks);
  const workload = assessDailyWorkload(tasks); // D3.5 — cảnh báo mềm khi ngày quá đầy

  const [flash, setFlash] = useState("");
  const showFlash = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(""), 3000);
  };

  // ----- Task form -----
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("discipline");
  const [taskExp, setTaskExp] = useState(20);
  const [taskEnergy, setTaskEnergy] = useState(15);
  const [taskVerify, setTaskVerify] = useState("trust");
  const [taskDuration, setTaskDuration] = useState(15);
  const [taskIsMandatory, setTaskIsMandatory] = useState(false);
  const [taskCoin, setTaskCoin] = useState(0);

  const applyTemplate = (tpl) => {
    setTaskTitle(tpl.title);
    setTaskCategory(tpl.category);
    setTaskExp(tpl.exp);
    setTaskEnergy(tpl.energy);
    setTaskVerify(tpl.verifyType || "trust");
    if (tpl.durationMin) setTaskDuration(tpl.durationMin);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addCustomTask(taskTitle.trim(), taskExp, taskCategory, taskIsMandatory, taskExp, taskEnergy, taskVerify, taskDuration, taskCoin);
    setTaskTitle("");
    setTaskIsMandatory(false);
    setTaskCoin(0);
    showFlash("Đã thêm nhiệm vụ mới! ✅");
  };

  // ----- #2: Sửa gợi ý nhiệm vụ (inline edit) -----
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(null);

  const startEdit = (tk) => {
    setEditId(tk.id);
    setEdit({
      title: tk.title,
      category: tk.category || "discipline",
      exp: tk.exp ?? 20,
      energy: tk.energy ?? 15,
      verifyType: tk.verifyType || "trust",
      durationMin: tk.durationMin || 15,
      isMandatory: !!tk.isMandatory,
      coinReward: tk.coinReward || 0,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEdit(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!edit || !edit.title.trim()) return;
    updateTask(editId, edit);
    cancelEdit();
    showFlash("Đã cập nhật nhiệm vụ! ✏️");
  };

  // ----- Reward form -----
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardVnd, setRewardVnd] = useState("");
  const [rewardCost, setRewardCost] = useState(50);
  const [rewardType, setRewardType] = useState("perk");
  const [rewardMinutes, setRewardMinutes] = useState(20);
  const [rewardCurrency, setRewardCurrency] = useState("points");

  const coinRate = COIN_RATE_VND; // tỷ giá cố định 1 xu = 1000đ

  const handleAddReward = (e) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;
    addCustomReward(rewardTitle.trim(), rewardCost, rewardType, rewardMinutes, "rare", rewardCurrency);
    setRewardTitle("");
    setRewardVnd("");
    showFlash("Đã thêm phần thưởng mới! ✅");
  };

  const [editRewardId, setEditRewardId] = useState(null);
  const [rewardEdit, setRewardEdit] = useState(null);

  const startRewardEdit = (reward) => {
    setEditRewardId(reward.id);
    setRewardEdit({
      title: reward.title,
      cost: reward.cost,
      currency: reward.currency || "points",
      type: reward.type || "perk",
      minutes: reward.type === "game_time" ? reward.value || 20 : 20,
    });
  };

  const cancelRewardEdit = () => {
    setEditRewardId(null);
    setRewardEdit(null);
  };

  const saveRewardEdit = (event) => {
    event.preventDefault();
    if (!rewardEdit?.title.trim()) return;
    updateReward(editRewardId, rewardEdit);
    cancelRewardEdit();
    showFlash("Đã cập nhật phần thưởng! ✅");
  };

  // ----- Inventory gifting -----
  const [itemType, setItemType] = useState("eggs");
  const [itemKey, setItemKey] = useState("base");
  const ITEM_KEYS = {
    eggs: [["base", "🥚 Trứng Thường"], ["wolf", "🐺 Trứng Sói"], ["dragon", "🐉 Trứng Rồng"]],
    potions: [["fire", "🔥 Thuốc Lửa"], ["ice", "❄️ Thuốc Băng"], ["magic", "✨ Thuốc Thần Kỳ"]],
    foods: [["meat", "🥩 Thịt Bò"], ["candy", "🍬 Kẹo Ngọt"], ["leaf", "🌿 Lá Cây"]],
  };

  const handleGift = () => {
    setInventory((prev) => ({
      ...prev,
      [itemType]: { ...prev[itemType], [itemKey]: (prev[itemType][itemKey] || 0) + 1 },
    }));
    showFlash(`Đã tặng 1 vật phẩm cho ${charName}! 🎁`);
  };

  const verifyBadge = (t) => {
    const map = { trust: "🤝", parent: "👨‍👩‍👧", focus: "🌳" };
    return map[t.verifyType] || "🤝";
  };

  return (
    <div className="space-y-4">
      {flash && (
        <p className="text-scale-xs font-bold text-center text-forest bg-forest-light/30 border border-forest/20 rounded-xl p-2.5">
          {flash}
        </p>
      )}

      {/* 🛤️ B-lite: Lộ Trình — the guided path sits on top of everything */}
      <JourneySection showFlash={showFlash} />

      {/* 📅 Đợt 3: Thời khóa biểu — TKB lớp tự sinh nhiệm vụ học mỗi ngày (nối #2 sửa gợi ý) */}
      <TimetableSection showFlash={showFlash} />

      {/* 💰 Pha E: Quỹ tiêu vặt — trần KIẾM xu + auto-chia quỹ vào nhiệm vụ */}
      <AllowanceCard showFlash={showFlash} />

      {/* D4: at-risk tasks — gentle "make it tiny" nudge (Fogg) */}
      {atRiskTasks.length > 0 && (
        <div className="bg-amber-light/40 border-2 border-amber/40 rounded-xl p-4 space-y-2.5">
          <h3 className="text-scale-sm font-black text-amber-dark">{t("game.habit.title")}</h3>
          <p className="text-scale-2xs text-gray-500 font-medium leading-relaxed">{t("game.habit.desc")}</p>
          {atRiskTasks.map((tk) => (
            <div key={tk.id} className="bg-white border border-amber/30 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="flex-grow min-w-0">
                <p className="text-scale-2xs font-black text-forest-dark truncate">{tk.title}</p>
                <p className="text-[11px] font-bold text-terracotta">{t("game.habit.missDays", { n: tk.missStreak || 0 })}</p>
              </div>
              <button
                onClick={() => { splitTask(tk.id); showFlash(t("game.habit.splitDone")); }}
                className="min-h-tap flex-shrink-0 bg-forest text-white text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
              >
                {t("game.habit.split")}
              </button>
              <button
                onClick={() => dismissAtRisk(tk.id)}
                className="min-h-tap flex-shrink-0 bg-white border border-sand text-gray-500 text-[10px] font-bold px-2.5 rounded-xl active:scale-95 transition-transform"
              >
                {t("game.habit.dismiss")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ============ TASKS ============ */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">🎯 Nhiệm vụ ngày</h3>

        {/* D3.5 — bảo vệ giờ nghỉ: cảnh báo MỀM (không chặn) khi ngày quá đầy */}
        {workload.overloaded && (
          <div className="bg-amber-light/40 border border-amber/40 rounded-xl p-3 flex items-start gap-2.5">
            <Coffee size={18} className="text-amber-dark flex-shrink-0 mt-0.5" />
            <p className="text-scale-2xs font-semibold text-gray-600 leading-relaxed">{workload.message}</p>
          </div>
        )}

        <Collapsible summary="Thêm nhiệm vụ mới" icon={Plus}>
        <form onSubmit={handleAddTask} className="space-y-2.5 bg-sand-light border border-sand rounded-xl p-3">
          <select
            onChange={(e) => {
              if (e.target.value !== "") {
                applyTemplate(TASK_TEMPLATES[Number(e.target.value)]);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest focus:outline-none"
          >
            <option value="" disabled>💡 Chọn nhiệm vụ mẫu (đã gán sẵn kiểu xác nhận)...</option>
            {TASK_TEMPLATES.map((t, i) => (
              <option key={t.title} value={i}>{t.title}</option>
            ))}
          </select>

          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Tên nhiệm vụ..."
            className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
            maxLength={40}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
              className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={taskVerify}
              onChange={(e) => setTaskVerify(e.target.value)}
              className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
            >
              {VERIFY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
              <span>EXP/Điểm ⭐</span>
              <input
                type="number"
                value={taskExp}
                onChange={(e) => setTaskExp(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                min={0}
              />
            </label>
            <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
              <span>Năng lượng ⚡</span>
              <input
                type="number"
                value={taskEnergy}
                onChange={(e) => setTaskEnergy(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                min={0}
              />
            </label>
            {taskVerify === "focus" && (
              <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
                <span>Phút ⏱️</span>
                <input
                  type="number"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                  min={1}
                />
              </label>
            )}
          </div>

          {allowanceOn && (
            <label className="text-scale-2xs font-bold text-gray-500 space-y-1 block">
              <span>Xu tiêu vặt 🪙 (để 0 nếu việc này không quy ra tiền)</span>
              <input
                type="number"
                value={taskCoin}
                onChange={(e) => setTaskCoin(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                min={0}
              />
            </label>
          )}

          <label className="flex items-center gap-2 text-scale-2xs font-bold text-gray-600 cursor-pointer min-h-tap">
            <input
              type="checkbox"
              checked={taskIsMandatory}
              onChange={(e) => setTaskIsMandatory(e.target.checked)}
              className="w-5 h-5 rounded text-forest focus:ring-forest"
            />
            🔴 Nhiệm vụ BẮT BUỘC hằng ngày
          </label>

          <button
            type="submit"
            className="w-full min-h-tap bg-forest text-white text-scale-xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Plus size={16} /> Lưu nhiệm vụ
          </button>
        </form>
        </Collapsible>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {tasks.map((t) =>
            editId === t.id ? (
              <form
                key={t.id}
                onSubmit={handleSaveEdit}
                className="border border-forest/40 bg-forest-light/10 rounded-xl p-3 space-y-2.5"
              >
                <input
                  type="text"
                  value={edit.title}
                  onChange={(e) => setEdit((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Tên nhiệm vụ..."
                  className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
                  maxLength={40}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={edit.category}
                    onChange={(e) => setEdit((s) => ({ ...s, category: e.target.value }))}
                    className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={edit.verifyType}
                    onChange={(e) => setEdit((s) => ({ ...s, verifyType: e.target.value }))}
                    className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
                  >
                    {VERIFY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
                    <span>EXP/Điểm ⭐</span>
                    <input
                      type="number"
                      value={edit.exp}
                      onChange={(e) => setEdit((s) => ({ ...s, exp: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                      min={0}
                    />
                  </label>
                  <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
                    <span>Năng lượng ⚡</span>
                    <input
                      type="number"
                      value={edit.energy}
                      onChange={(e) => setEdit((s) => ({ ...s, energy: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                      min={0}
                    />
                  </label>
                  {edit.verifyType === "focus" && (
                    <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
                      <span>Phút ⏱️</span>
                      <input
                        type="number"
                        value={edit.durationMin}
                        onChange={(e) => setEdit((s) => ({ ...s, durationMin: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                        min={1}
                      />
                    </label>
                  )}
                </div>
                {allowanceOn && (
                  <label className="text-scale-2xs font-bold text-gray-500 space-y-1 block">
                    <span>Xu tiêu vặt 🪙</span>
                    <input
                      type="number"
                      value={edit.coinReward}
                      onChange={(e) => setEdit((s) => ({ ...s, coinReward: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                      min={0}
                    />
                  </label>
                )}
                <label className="flex items-center gap-2 text-scale-2xs font-bold text-gray-600 cursor-pointer min-h-tap">
                  <input
                    type="checkbox"
                    checked={edit.isMandatory}
                    onChange={(e) => setEdit((s) => ({ ...s, isMandatory: e.target.checked }))}
                    className="w-5 h-5 rounded text-forest focus:ring-forest"
                  />
                  🔴 Nhiệm vụ BẮT BUỘC hằng ngày
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow min-h-tap bg-forest text-white text-scale-xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                  >
                    <Check size={16} /> Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="min-w-tap min-h-tap bg-sand text-gray-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                    title="Huỷ"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div key={t.id} className={`border rounded-xl px-3 py-2 flex items-center gap-2 ${t.isMandatory ? "border-red-200 bg-red-50/20" : "border-sand"}`}>
                <span className="text-scale-xs">{verifyBadge(t)}</span>
                <span className="flex-grow text-scale-2xs font-bold text-forest-dark truncate">{t.title}</span>
                {t.coinReward > 0 && <span className="text-scale-2xs text-coin font-black flex-shrink-0">+{t.coinReward}🪙</span>}
                {t.isMandatory && <span className="text-scale-2xs text-terracotta font-black">🔴</span>}
                <button
                  onClick={() => startEdit(t)}
                  className="min-w-tap min-h-tap flex items-center justify-center text-forest hover:text-forest-dark"
                  title="Sửa"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => confirm("Xóa nhiệm vụ này?") && deleteTask(t.id)}
                  className="min-w-tap min-h-tap flex items-center justify-center text-terracotta hover:text-red-700"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ============ REWARDS ============ */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">🎁 Cửa hàng quà</h3>

        <Collapsible summary="Thêm phần thưởng mới" icon={Gift}>
        <form onSubmit={handleAddReward} className="space-y-2.5 bg-sand-light border border-sand rounded-xl p-3">
          <input
            type="text"
            value={rewardTitle}
            onChange={(e) => setRewardTitle(e.target.value)}
            placeholder="Tên quà... (ví dụ: Ăn kem tươi 🍨)"
            className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
            maxLength={40}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
            >
              <option value="perk">🎁 Quà thực tế</option>
              <option value="game_time">⏰ Giờ chơi game</option>
              <option value="card">🎟️ Thẻ đặc quyền</option>
            </select>
            <select
              value={rewardCurrency}
              onChange={(e) => setRewardCurrency(e.target.value)}
              className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
            >
              <option value="points">Ví Điểm ⭐</option>
              <option value="heroCoins">Ví Hero Coin 🪙</option>
            </select>
          </div>

          {rewardCurrency === "heroCoins" && (
            <input
              type="number"
              value={rewardVnd}
              onChange={(e) => {
                const vnd = Math.max(0, parseInt(e.target.value) || 0);
                setRewardVnd(vnd || "");
                setRewardCost(Math.max(1, Math.round(vnd / coinRate)) || 1);
              }}
              placeholder={`Giá tiền thật VNĐ (1🪙 = ${coinRate.toLocaleString("vi-VN")}₫)...`}
              className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none"
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
              <span>{rewardCurrency === "heroCoins" ? "Giá Coin 🪙" : "Giá Điểm ⭐"}</span>
              <input
                type="number"
                value={rewardCost}
                onChange={(e) => setRewardCost(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                min={1}
              />
            </label>
            {rewardType === "game_time" && (
              <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
                <span>Số phút ⏰</span>
                <input
                  type="number"
                  value={rewardMinutes}
                  onChange={(e) => setRewardMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                  className="w-full min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                  min={5}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-tap bg-forest text-white text-scale-xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Plus size={16} /> Lưu phần thưởng
          </button>
        </form>

        {/* Pha E §7 — gợi ý quà Xu theo tuổi: 1-chạm thêm vào cửa hàng (sửa giá sau) */}
        {allowanceOn && (
          <div className="mt-2.5 space-y-1.5">
            <p className="text-scale-2xs font-bold text-gray-500">Gợi ý quà đổi bằng Xu 🪙 (chạm để thêm, chỉnh giá sau):</p>
            <div className="flex flex-wrap gap-1.5">
              {(ALLOWANCE_PERK_SEEDS[uiMode === "teen" ? "teen" : "kid"] || []).map((seed) => {
                const cost = Math.max(1, Math.round(seed.vnd / coinRate));
                return (
                  <button
                    key={seed.title}
                    type="button"
                    onClick={() => {
                      addCustomReward(seed.title, cost, "perk", 20, "rare", "heroCoins");
                      showFlash(`Đã thêm "${seed.title}" vào cửa hàng! 🎁`);
                    }}
                    className="min-h-tap bg-white border border-sand rounded-full px-3 text-scale-2xs font-bold text-forest-dark active:scale-95 transition-transform"
                  >
                    {seed.title} <span className="text-coin font-black">{cost}🪙</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </Collapsible>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {rewards.map((r) =>
            editRewardId === r.id ? (
              <form
                key={r.id}
                onSubmit={saveRewardEdit}
                className="bg-sand-light rounded-xl p-3 space-y-2"
              >
                <input
                  value={rewardEdit.title}
                  onChange={(event) =>
                    setRewardEdit((value) => ({ ...value, title: event.target.value }))
                  }
                  maxLength={60}
                  className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
                  aria-label="Tên phần thưởng"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={rewardEdit.type}
                    onChange={(event) =>
                      setRewardEdit((value) => ({ ...value, type: event.target.value }))
                    }
                    className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark"
                    aria-label="Loại phần thưởng"
                  >
                    <option value="perk">Quà thực tế</option>
                    <option value="game_time">Giờ chơi game</option>
                    <option value="card">Thẻ đặc quyền</option>
                  </select>
                  <select
                    value={rewardEdit.currency}
                    onChange={(event) =>
                      setRewardEdit((value) => ({ ...value, currency: event.target.value }))
                    }
                    className="min-h-tap bg-white border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark"
                    aria-label="Ví thanh toán"
                  >
                    <option value="points">Ví Điểm ⭐</option>
                    <option value="heroCoins">Ví Hero Coin 🪙</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={rewardEdit.cost}
                    onChange={(event) =>
                      setRewardEdit((value) => ({ ...value, cost: event.target.value }))
                    }
                    className="flex-1 min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark"
                    aria-label="Giá phần thưởng"
                  />
                  <button
                    type="submit"
                    className="min-h-tap px-4 bg-forest text-white text-scale-xs font-bold rounded-xl"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={cancelRewardEdit}
                    className="min-w-tap min-h-tap flex items-center justify-center text-gray-500"
                    aria-label="Hủy sửa"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div key={r.id} className="border border-sand rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="flex-grow text-scale-2xs font-bold text-forest-dark truncate">{r.title}</span>
                <span className="text-scale-2xs font-black text-gray-500 flex-shrink-0">
                  {r.cost} {r.currency === "heroCoins" ? "🪙" : "⭐"}
                </span>
                <button
                  onClick={() => startRewardEdit(r)}
                  className="min-w-tap min-h-tap flex items-center justify-center text-forest"
                  title="Sửa phần thưởng"
                  aria-label={`Sửa ${r.title}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => confirm("Xóa phần thưởng này?") && deleteReward(r.id)}
                  className="min-w-tap min-h-tap flex items-center justify-center text-terracotta hover:text-red-700"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ============ INVENTORY GIFT ============ */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">🎒 Tặng vật phẩm thú cưng</h3>
        <Collapsible summary="Tặng vật phẩm" icon={PackageOpen} tone="quiet">
        <div className="flex items-center gap-2">
          <select
            value={itemType}
            onChange={(e) => {
              setItemType(e.target.value);
              setItemKey(ITEM_KEYS[e.target.value][0][0]);
            }}
            className="flex-1 min-h-tap bg-sand-light border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
          >
            <option value="eggs">🥚 Trứng</option>
            <option value="potions">🧪 Thuốc ấp</option>
            <option value="foods">🥩 Thức ăn</option>
          </select>
          <select
            value={itemKey}
            onChange={(e) => setItemKey(e.target.value)}
            className="flex-1 min-h-tap bg-sand-light border border-sand rounded-xl px-2 text-scale-2xs font-bold text-forest-dark focus:outline-none"
          >
            {ITEM_KEYS[itemType].map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleGift}
            className="min-h-tap bg-amber text-white text-scale-xs font-black px-4 rounded-xl active:scale-95 transition-transform"
          >
            🎁 Tặng
          </button>
        </div>
        </Collapsible>
      </div>
    </div>
  );
}
