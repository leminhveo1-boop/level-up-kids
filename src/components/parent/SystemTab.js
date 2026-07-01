"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { Save, RotateCcw, Lock, Palette } from "lucide-react";

/** Tab ⚙️ HỆ THỐNG — one-time configs: limits, economy rate, PIN, daily reset. */
export default function SystemTab() {
  const {
    isLoaded,
    parentConfig,
    setParentConfig,
    setParentPin,
    resetDailyTasks,
    setScreenRedeemsThisWeek,
    screenRedeemsThisWeek,
  } = useGame();

  const [flash, setFlash] = useState("");
  const showFlash = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(""), 3000);
  };

  // Config fields
  const [maxMinutes, setMaxMinutes] = useState(60);
  const [maxRedeems, setMaxRedeems] = useState(5);
  const [topVnd, setTopVnd] = useState(500000);
  const [topDays, setTopDays] = useState(14);
  const [requireMandatory, setRequireMandatory] = useState(true);
  const [maxCoins, setMaxCoins] = useState(7000);
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    if (isLoaded && parentConfig) {
      setMaxMinutes(parentConfig.screenMaxMinutesPerDay || 60);
      setMaxRedeems(parentConfig.screenRedeemMaxPerWeek || 5);
      setTopVnd(parentConfig.topRewardMoneyVnd || 500000);
      setTopDays(parentConfig.topRewardEffortDays || 14);
      setRequireMandatory(parentConfig.requireAllMandatory !== false);
      setMaxCoins(parentConfig.maxCoinBalance || 7000);
    }
  }, [isLoaded, parentConfig]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setParentConfig({
      screenMaxMinutesPerDay: maxMinutes,
      screenRedeemMaxPerWeek: maxRedeems,
      topRewardMoneyVnd: topVnd,
      topRewardEffortDays: topDays,
      requireAllMandatory: requireMandatory,
      maxCoinBalance: maxCoins,
    });
    showFlash("Đã lưu thiết lập! ✅");
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      showFlash("Mã PIN mới phải từ 4 số trở lên! ❌");
      return;
    }
    setParentPin(newPin);
    setNewPin("");
    showFlash("Đã đổi mã PIN! 🔒");
  };

  const numField = (label, value, setter, min = 0) => (
    <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => setter(Math.max(min, parseInt(e.target.value) || min))}
        className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none"
        min={min}
        required
      />
    </label>
  );

  return (
    <div className="space-y-4">
      {flash && (
        <p className="text-scale-xs font-bold text-center text-forest bg-forest-light/30 border border-forest/20 rounded-xl p-2.5">
          {flash}
        </p>
      )}

      {/* Limits & economy */}
      <form onSubmit={handleSaveConfig} className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">⚙️ Giới hạn & tỷ giá kinh tế</h3>

        <div className="grid grid-cols-2 gap-3">
          {numField("TV/iPad tối đa (phút/ngày)", maxMinutes, setMaxMinutes)}
          {numField("Lượt đổi tối đa (tuần)", maxRedeems, setMaxRedeems)}
          {numField("Ngân sách quà đỉnh (VNĐ)", topVnd, setTopVnd)}
          {numField("Số ngày cày quà đỉnh", topDays, setTopDays)}
          {numField("Trần ví coin của con", maxCoins, setMaxCoins)}
          <label className="flex items-end gap-2 text-scale-2xs font-bold text-gray-600 cursor-pointer min-h-tap pb-2">
            <input
              type="checkbox"
              checked={requireMandatory}
              onChange={(e) => setRequireMandatory(e.target.checked)}
              className="w-5 h-5 rounded text-forest focus:ring-forest"
            />
            Bắt buộc xong việc 🔴 mới đổi quà
          </label>
        </div>

        <div className="bg-sand-light rounded-xl p-3 text-scale-2xs text-gray-500 font-bold">
          📊 Tỷ giá hiện tại: 1 🪙 ≈ {Math.round(topVnd / (250 * Math.max(1, topDays)))} VNĐ · Tuần này con đã đổi {screenRedeemsThisWeek}/{maxRedeems} lượt giải trí
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 min-h-tap bg-forest text-white text-scale-xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Save size={16} /> LƯU THIẾT LẬP
          </button>
          <button
            type="button"
            onClick={() => {
              setScreenRedeemsThisWeek(0);
              showFlash("Đã reset lượt đổi tuần về 0! ✅");
            }}
            className="min-h-tap bg-amber text-white text-scale-2xs font-black px-4 rounded-xl active:scale-95 transition-transform"
          >
            Reset tuần
          </button>
        </div>
      </form>

      {/* PIN */}
      <form onSubmit={handleChangePin} className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
          <Lock size={16} /> Đổi mã PIN phụ huynh
        </h3>
        <div className="flex gap-2">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Mã PIN mới (4-6 số)..."
            className="flex-grow min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-tap bg-forest text-white text-scale-xs font-black px-4 rounded-xl active:scale-95 transition-transform"
          >
            Cập nhật
          </button>
        </div>
      </form>

      {/* UI mode per child */}
      <UiModeCard showFlash={showFlash} />

      {/* Daily reset */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
        <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
          <RotateCcw size={16} /> Kích hoạt ngày mới
        </h3>
        <p className="text-scale-2xs text-gray-500">
          Nhiệm vụ được làm mới, điểm treo còn lại tự duyệt, streak cộng dồn nếu con làm đủ 3 việc. Bình thường hệ thống tự chạy lúc sang ngày — nút này chỉ dùng khi cần chủ động.
        </p>
        <button
          onClick={() => {
            if (confirm("Reset ngày mới và chốt streak cho con?")) {
              resetDailyTasks();
              showFlash("Đã kích hoạt ngày mới! 🔄");
            }
          }}
          className="w-full min-h-tap bg-amber text-white text-scale-xs font-black rounded-xl active:scale-[0.98] transition-transform"
        >
          GIẢ LẬP NGÀY MỚI 🔄
        </button>
      </div>
    </div>
  );
}

/** Per-child UI mode switcher (kid 6-11 forest / teen 12+ dark). */
function UiModeCard({ showFlash }) {
  const { activeChild, activeChildId, uiMode, setChildUiMode, isDemo } = useAuth();

  if (!activeChildId || isDemo) return null;

  const handleSwitch = async (mode) => {
    if (mode === uiMode) return;
    const r = await setChildUiMode(activeChildId, mode);
    showFlash(r.success ? `Đã đổi giao diện của ${activeChild?.name} sang chế độ ${mode === "teen" ? "Teen 🎧" : "Nhi đồng 🧒"}!` : "Không đổi được, thử lại!");
  };

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
      <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
        <Palette size={16} /> Giao diện theo tuổi của {activeChild?.name}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleSwitch("kid")}
          className={`min-h-tap rounded-xl border-2 text-scale-2xs font-black transition-all ${
            uiMode === "kid" ? "border-forest bg-forest-light/20 text-forest-dark" : "border-sand text-gray-500"
          }`}
        >
          🧒 Nhi đồng (6–11)
        </button>
        <button
          onClick={() => handleSwitch("teen")}
          className={`min-h-tap rounded-xl border-2 text-scale-2xs font-black transition-all ${
            uiMode === "teen" ? "border-forest bg-forest-light/20 text-forest-dark" : "border-sand text-gray-500"
          }`}
        >
          🎧 Teen (12+)
        </button>
      </div>
      <p className="text-scale-2xs text-gray-400">
        Teen: nền tối, gọn gàng, bớt hiệu ứng — cùng cơ chế game, khác cách thể hiện.
      </p>
    </div>
  );
}
