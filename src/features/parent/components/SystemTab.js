"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { enablePush, disablePush, getPushStatus, isPushSupported } from "@/lib/push";
import { BUSY_MODE_MS } from "@/lib/game/constants";
import { track } from "@/lib/analytics";
import { Save, RotateCcw, Lock, Palette, Bell, BellOff, Globe, Plane, Settings } from "lucide-react";

/** Tab ⚙️ HỆ THỐNG — one-time configs: limits, economy rate, PIN, daily reset. */
export default function SystemTab() {
  const {
    isLoaded,
    parentConfig,
    setParentConfig,
    parentPin,
    setParentPin,
    resetDailyTasks,
    setScreenRedeemsThisWeek,
    screenRedeemsThisWeek,
  } = useGame();
  const { isCloudChild, changeParentPin } = useAuth();

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
  const [smartAuto, setSmartAuto] = useState(true);
  const [maxCoins, setMaxCoins] = useState(7000);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);

  useEffect(() => {
    if (isLoaded && parentConfig) {
      setMaxMinutes(parentConfig.screenMaxMinutesPerDay || 60);
      setMaxRedeems(parentConfig.screenRedeemMaxPerWeek || 5);
      setTopVnd(parentConfig.topRewardMoneyVnd || 500000);
      setTopDays(parentConfig.topRewardEffortDays || 14);
      setRequireMandatory(parentConfig.requireAllMandatory !== false);
      setSmartAuto(parentConfig.smartAutoApprove !== false);
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
      smartAutoApprove: smartAuto,
      maxCoinBalance: maxCoins,
    });
    showFlash("Đã lưu thiết lập! ✅");
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      showFlash("Mã PIN mới phải từ 4 số trở lên! ❌");
      return;
    }
    // Re-checking the current PIN here (not just at room entry) matters because the
    // room-level gate is client-side React state — trivially bypassable via devtools.
    // Cloud children verify it server-side; local/offline children have no server to
    // call, so they compare against the client-side copy (approved offline fallback).
    if (isCloudChild) {
      setIsChangingPin(true);
      const result = await changeParentPin(newPin, oldPin);
      setIsChangingPin(false);
      if (!result.success) {
        showFlash("Mã PIN cũ không đúng! ❌");
        return;
      }
    } else if (oldPin !== parentPin) {
      showFlash("Mã PIN cũ không đúng! ❌");
      return;
    } else {
      setParentPin(newPin);
    }
    setOldPin("");
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
        <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
          <Settings size={16} /> Giới hạn & tỷ giá kinh tế
        </h3>

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

        {/* Đợt Bằng Chứng: chế độ tự lái cho tuần bận */}
        <label className="flex items-start gap-2 text-scale-2xs font-bold text-gray-600 cursor-pointer bg-sand-light rounded-xl p-3">
          <input
            type="checkbox"
            checked={smartAuto}
            onChange={(e) => setSmartAuto(e.target.checked)}
            className="w-5 h-5 rounded text-forest focus:ring-forest mt-0.5 flex-shrink-0"
          />
          <span>
            ⚡ Tự duyệt thông minh khi Uy Tín ≥ 80
            <span className="block font-medium text-gray-400 mt-0.5">
              Việc con tự ghi nhận được nhả điểm ngay, không chờ duyệt — dành cho con đã chứng minh đáng tin. Việc cần bố mẹ xác nhận vẫn chờ như thường.
            </span>
          </span>
        </label>

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

      {/* B-lite: Tuần Bận — full autopilot for a hard week */}
      <BusyModeCard showFlash={showFlash} />

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
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            placeholder="Mã PIN hiện tại..."
            className="flex-grow min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none"
          />
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
            disabled={isChangingPin}
            className="min-h-tap bg-forest text-white text-scale-xs font-black px-4 rounded-xl active:scale-95 transition-transform disabled:opacity-60"
          >
            {isChangingPin ? "..." : "Cập nhật"}
          </button>
        </div>
      </form>

      {/* Language (global) */}
      <LanguageCard />

      {/* UI mode per child */}
      <UiModeCard showFlash={showFlash} />

      {/* Push notifications */}
      <PushCard showFlash={showFlash} />

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

/**
 * ✈️ Tuần Bận — one tap turns on 7 days of full autopilot: every claim the
 * child makes releases points instantly (no escrow queue, no evening review).
 * The app must keep working for the family even when the parent can't.
 */
function BusyModeCard({ showFlash }) {
  const { parentConfig, setParentConfig } = useGame();
  const busyUntil = parentConfig?.busyUntil || 0;
  const isActive = busyUntil > Date.now();
  const daysLeft = Math.max(1, Math.ceil((busyUntil - Date.now()) / (24 * 60 * 60 * 1000)));

  const handleToggle = () => {
    if (isActive) {
      setParentConfig((prev) => ({ ...prev, busyUntil: 0 }));
      track("busy_mode_off", {});
      showFlash("Đã tắt Tuần Bận — tối nay bố mẹ duyệt điểm lại như thường. ✅");
    } else {
      if (!confirm("Bật Tuần Bận 7 ngày? Mọi việc con tick sẽ được duyệt NGAY, không chờ bố mẹ.")) return;
      setParentConfig((prev) => ({ ...prev, busyUntil: Date.now() + BUSY_MODE_MS }));
      track("busy_mode_on", {});
      showFlash("Đã bật Tuần Bận! App tự chạy 7 ngày — bố mẹ cứ yên tâm lo việc lớn. ✈️");
    }
  };

  return (
    <div className={`border rounded-xl p-4 space-y-2 ${isActive ? "bg-amber-light/30 border-amber/40" : "bg-white border-sand"}`}>
      <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
        <Plane size={16} /> Tuần Bận (tự lái trọn gói)
        {isActive && (
          <span className="text-[11px] font-black text-white bg-amber rounded-full px-2 py-0.5">
            CÒN {daysLeft} NGÀY
          </span>
        )}
      </h3>
      <p className="text-scale-2xs text-gray-500 leading-relaxed">
        Tuần này quá bận? Bật 1 nút: mọi việc con ghi nhận được duyệt ngay lập tức — không hàng chờ, không phải mở app mỗi tối.
        Tự tắt sau 7 ngày. Uy Tín của con giữ nguyên, báo cáo tuần vẫn ghi đầy đủ.
      </p>
      <button
        onClick={handleToggle}
        className={`w-full min-h-tap rounded-xl text-scale-xs font-black active:scale-[0.98] transition-transform ${
          isActive ? "bg-sand text-gray-500" : "bg-amber text-white"
        }`}
      >
        {isActive ? "TẮT TUẦN BẬN — DUYỆT TAY LẠI" : "BẬT TUẦN BẬN 7 NGÀY ✈️"}
      </button>
    </div>
  );
}

/** Push notification opt-in for THIS device (parent audience). */
function PushCard({ showFlash }) {
  const { cloudEnabled, user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushStatus().then(setEnabled);
  }, []);

  if (!cloudEnabled || !user || !isPushSupported()) return null;

  const handleToggle = async () => {
    setBusy(true);
    try {
      if (enabled) {
        await disablePush();
        setEnabled(false);
        showFlash("Đã tắt thông báo trên thiết bị này. 🔕");
      } else {
        const r = await enablePush("parent");
        if (r.success) {
          setEnabled(true);
          showFlash("Đã bật thông báo! Bố mẹ sẽ được nhắc duyệt điểm lúc 20h. 🔔");
        } else if (r.error === "PERMISSION_DENIED") {
          showFlash("Trình duyệt đã chặn thông báo — mở cài đặt site để cho phép lại. ⚠️");
        } else {
          showFlash("Không bật được thông báo: " + r.error);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
      <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
        {enabled ? <Bell size={16} /> : <BellOff size={16} />} Thông báo đẩy (thiết bị này)
      </h3>
      <p className="text-scale-2xs text-gray-500">
        Nhận nhắc nhở khi con xin duyệt điểm và tóm tắt cuối ngày. Không gửi sau 20h30.
      </p>
      <button
        onClick={handleToggle}
        disabled={busy}
        className={`w-full min-h-tap rounded-xl text-scale-xs font-black active:scale-[0.98] transition-transform ${
          enabled ? "bg-sand text-gray-500" : "bg-forest text-white"
        }`}
      >
        {busy ? "Đang xử lý..." : enabled ? "TẮT THÔNG BÁO 🔕" : "BẬT THÔNG BÁO 🔔"}
      </button>
    </div>
  );
}

/** App language switcher — global (persisted per device via LanguageContext). */
function LanguageCard() {
  const { locale, setLocale, t } = useLang();
  const options = [
    { code: "vi", labelKey: "game.lang.vi" },
    { code: "en", labelKey: "game.lang.en" },
  ];

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
      <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
        <Globe size={16} /> {t("game.lang.title")}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ code, labelKey }) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={`min-h-tap rounded-xl border-2 text-scale-2xs font-black transition-all ${
              locale === code ? "border-forest bg-forest-light/20 text-forest-dark" : "border-sand text-gray-500"
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      <p className="text-scale-2xs text-gray-400">{t("game.lang.desc")}</p>
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
