"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { useLang } from "@/context/LanguageContext";
import { getAtRiskTasks } from "@/lib/game/habits";
import JourneySection from "@/components/parent/JourneySection";
import { Trash2, Plus } from "lucide-react";

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
    splitTask,
    dismissAtRisk,
    addCustomReward,
    deleteReward,
    setInventory,
    parentConfig,
    charName,
  } = useGame();
  const { t } = useLang();
  const atRiskTasks = getAtRiskTasks(tasks);

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
    addCustomTask(taskTitle.trim(), taskExp, taskCategory, taskIsMandatory, taskExp, taskEnergy, taskVerify, taskDuration);
    setTaskTitle("");
    setTaskIsMandatory(false);
    showFlash("Đã thêm nhiệm vụ mới! ✅");
  };

  // ----- Reward form -----
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardVnd, setRewardVnd] = useState("");
  const [rewardCost, setRewardCost] = useState(50);
  const [rewardType, setRewardType] = useState("perk");
  const [rewardMinutes, setRewardMinutes] = useState(20);
  const [rewardCurrency, setRewardCurrency] = useState("points");

  const coinRate = (parentConfig?.topRewardMoneyVnd || 500000) / (250 * (parentConfig?.topRewardEffortDays || 14));

  const handleAddReward = (e) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;
    addCustomReward(rewardTitle.trim(), rewardCost, rewardType, rewardMinutes, "rare", rewardCurrency);
    setRewardTitle("");
    setRewardVnd("");
    showFlash("Đã thêm phần thưởng mới! ✅");
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
            <Plus size={16} /> THÊM NHIỆM VỤ
          </button>
        </form>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {tasks.map((t) => (
            <div key={t.id} className={`border rounded-xl px-3 py-2 flex items-center gap-2 ${t.isMandatory ? "border-red-200 bg-red-50/20" : "border-sand"}`}>
              <span className="text-scale-xs">{verifyBadge(t)}</span>
              <span className="flex-grow text-scale-2xs font-bold text-forest-dark truncate">{t.title}</span>
              {t.isMandatory && <span className="text-scale-2xs text-terracotta font-black">🔴</span>}
              <button
                onClick={() => confirm("Xóa nhiệm vụ này?") && deleteTask(t.id)}
                className="min-w-tap min-h-tap flex items-center justify-center text-terracotta hover:text-red-700"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============ REWARDS ============ */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">🎁 Cửa hàng quà</h3>

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
              placeholder={`Giá tiền thật VNĐ (1🪙 ≈ ${Math.round(coinRate)}₫)...`}
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
            <Plus size={16} /> THÊM PHẦN THƯỞNG
          </button>
        </form>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {rewards.map((r) => (
            <div key={r.id} className="border border-sand rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="flex-grow text-scale-2xs font-bold text-forest-dark truncate">{r.title}</span>
              <span className="text-scale-2xs font-black text-gray-500 flex-shrink-0">
                {r.cost} {r.currency === "heroCoins" ? "🪙" : "⭐"}
              </span>
              <button
                onClick={() => confirm("Xóa phần thưởng này?") && deleteReward(r.id)}
                className="min-w-tap min-h-tap flex items-center justify-center text-terracotta hover:text-red-700"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============ INVENTORY GIFT ============ */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">🎒 Tặng vật phẩm thú cưng</h3>
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
      </div>
    </div>
  );
}
