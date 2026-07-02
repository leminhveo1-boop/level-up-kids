"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/lib/analytics";

/**
 * Onboarding wizard — from "paid" to "child playing" in under 3 minutes.
 * Step 1: pick age band → suggested tasks (pre-checked)
 * Step 2: first 3 real-world rewards (VND → coin conversion)
 * Step 3: set parent PIN (replace default 1234)
 */

const AGE_BANDS = [
  { id: "4-6", label: "4–6 tuổi 🧸", desc: "Thói quen cơ bản, việc nhẹ" },
  { id: "7-9", label: "7–9 tuổi 🚴", desc: "Tự lập, học tập, việc nhà" },
  { id: "10-12", label: "10–12 tuổi 🚀", desc: "Kỷ luật, trách nhiệm, kỹ năng" },
];

const TASKS_BY_AGE = {
  "4-6": [
    { title: "🦷 Tự đánh răng sáng & tối", category: "discipline", exp: 10, points: 10, energy: 8 },
    { title: "🧸 Tự cất đồ chơi sau khi chơi", category: "help", exp: 10, points: 10, energy: 8 },
    { title: "👕 Tự mặc quần áo", category: "discipline", exp: 10, points: 10, energy: 8 },
    { title: "📖 Nghe bố mẹ đọc sách 10 phút", category: "intellect", exp: 15, points: 15, energy: 10 },
    { title: "🥦 Ăn hết rau trong bữa cơm", category: "strength", exp: 15, points: 15, energy: 10 },
    { title: "🎨 Vẽ hoặc tô màu 1 bức tranh", category: "creative", exp: 10, points: 10, energy: 8 },
  ],
  "7-9": [
    { title: "🛏️ Gấp chăn màn sau khi dậy", category: "discipline", exp: 15, points: 15, energy: 10 },
    { title: "📚 Đọc sách 15 phút", category: "intellect", exp: 20, points: 20, energy: 15 },
    { title: "🧹 Quét nhà hoặc lau bàn", category: "help", exp: 15, points: 15, energy: 12 },
    { title: "✍️ Hoàn thành bài tập về nhà", category: "intellect", exp: 25, points: 25, energy: 18 },
    { title: "🏃 Vận động ngoài trời 20 phút", category: "strength", exp: 20, points: 20, energy: 15 },
    { title: "🌿 Tưới cây mỗi ngày", category: "creative", exp: 10, points: 10, energy: 8 },
  ],
  "10-12": [
    { title: "⏰ Tự dậy đúng giờ không cần gọi", category: "discipline", exp: 20, points: 20, energy: 15 },
    { title: "📚 Đọc sách 30 phút", category: "intellect", exp: 25, points: 25, energy: 18 },
    { title: "🍽️ Rửa bát sau bữa ăn", category: "help", exp: 20, points: 20, energy: 15 },
    { title: "🇬🇧 Học tiếng Anh 20 phút", category: "intellect", exp: 25, points: 25, energy: 18 },
    { title: "🏃 Tập thể dục 30 phút", category: "strength", exp: 25, points: 25, energy: 18 },
    { title: "📝 Viết nhật ký 5 phút", category: "creative", exp: 15, points: 15, energy: 10 },
  ],
};

const REWARD_SUGGESTIONS = [
  { title: "🍨 Một ly kem yêu thích", vnd: 25000 },
  { title: "🍕 Đi ăn món con thích cuối tuần", vnd: 100000 },
  { title: "🧩 Món đồ chơi con mơ ước", vnd: 300000 },
];

export default function SetupWizardPage() {
  const router = useRouter();
  const { isLoaded, charName, addCustomTask, addCustomReward, setParentPin, parentConfig } = useGame();
  const { authLoaded, activeChildId, isDemo } = useAuth();

  const [step, setStep] = useState(1);
  const [ageBand, setAgeBand] = useState("7-9");
  const [checkedTasks, setCheckedTasks] = useState(() => TASKS_BY_AGE["7-9"].map(() => true));
  const [rewards, setRewards] = useState(REWARD_SUGGESTIONS.map((r) => ({ ...r, enabled: true })));
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pinError, setPinError] = useState("");

  // VND → coin theo tỷ giá kinh tế của app (đồng bộ với trang parent)
  const coinRate =
    (parentConfig?.topRewardMoneyVnd || 500000) / (250 * (parentConfig?.topRewardEffortDays || 14));
  const vndToCoins = (vnd) => Math.max(1, Math.round(vnd / coinRate));

  useEffect(() => {
    if (authLoaded && isLoaded && (!activeChildId || isDemo)) router.replace("/family");
  }, [authLoaded, isLoaded, activeChildId, isDemo, router]);

  if (!isLoaded || !authLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang tải...</p>
      </div>
    );
  }

  const selectAge = (band) => {
    setAgeBand(band);
    setCheckedTasks(TASKS_BY_AGE[band].map(() => true));
  };

  const handleFinish = (e) => {
    e.preventDefault();
    if (pin1.length < 4) {
      setPinError("Mã PIN phải từ 4 số trở lên!");
      return;
    }
    if (pin1 !== pin2) {
      setPinError("Hai mã PIN không khớp nhau!");
      return;
    }

    // Apply everything at once
    TASKS_BY_AGE[ageBand].forEach((task, i) => {
      if (checkedTasks[i]) {
        addCustomTask(task.title, task.exp, task.category, false, task.points, task.energy);
      }
    });
    rewards.forEach((r) => {
      if (r.enabled && r.title.trim()) {
        addCustomReward(r.title.trim(), vndToCoins(r.vnd), "perk", 0, "rare", "heroCoins");
      }
    });
    setParentPin(pin1);

    track("onboarding_completed", {
      age_band: ageBand,
      tasks: checkedTasks.filter(Boolean).length,
      rewards: rewards.filter((r) => r.enabled).length,
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col flex-grow p-6 space-y-5 overflow-y-auto">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-forest uppercase tracking-tight">
            Thiết Lập Cho {charName || "Bé"} 🛠️
          </h1>
          <span className="text-[10px] font-black text-gray-400 uppercase">Bước {step}/3</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-grow rounded-full transition-colors ${s <= step ? "bg-forest" : "bg-sand"}`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: age band + suggested tasks */}
      {step === 1 && (
        <div className="space-y-4 flex-grow">
          <p className="text-xs font-bold text-gray-500">Chọn độ tuổi để nhận bộ nhiệm vụ phù hợp:</p>

          <div className="grid grid-cols-3 gap-2">
            {AGE_BANDS.map((band) => (
              <button
                key={band.id}
                type="button"
                onClick={() => selectAge(band.id)}
                className={`p-3 rounded-2xl border-2 text-center space-y-1 transition-all ${
                  ageBand === band.id
                    ? "border-forest bg-forest-light/20 shadow-game-forest"
                    : "border-sand bg-white shadow-game-flat"
                }`}
              >
                <p className="text-[11px] font-black text-forest-dark">{band.label}</p>
                <p className="text-[8.5px] text-gray-400 font-bold leading-tight">{band.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Nhiệm vụ gợi ý (bỏ chọn nếu không cần):
            </p>
            {TASKS_BY_AGE[ageBand].map((task, i) => (
              <label
                key={task.title}
                className={`flex items-center gap-3 bg-white border-2 rounded-xl p-3 cursor-pointer transition-all ${
                  checkedTasks[i] ? "border-forest/40" : "border-sand opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedTasks[i]}
                  onChange={(e) =>
                    setCheckedTasks((prev) => prev.map((c, idx) => (idx === i ? e.target.checked : c)))
                  }
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span className="text-xs font-bold text-forest-dark flex-grow">{task.title}</span>
                <span className="text-[9px] font-black text-amber-dark">+{task.energy}⚡</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-forest text-sand-light font-black text-sm py-3.5 rounded-2xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
          >
            TIẾP TỤC ➡️
          </button>
        </div>
      )}

      {/* STEP 2: first rewards with VND conversion */}
      {step === 2 && (
        <div className="space-y-4 flex-grow">
          <p className="text-xs font-bold text-gray-500">
            Đặt 3 phần quà đầu tiên — bé nhìn thấy mục tiêu là có động lực ngay! (1 🪙 ≈{" "}
            {Math.round(coinRate).toLocaleString("vi-VN")}₫)
          </p>

          {rewards.map((r, i) => (
            <div
              key={i}
              className={`bg-white border-2 rounded-2xl p-3.5 space-y-2 transition-all ${
                r.enabled ? "border-amber/40" : "border-sand opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) =>
                    setRewards((prev) => prev.map((x, idx) => (idx === i ? { ...x, enabled: e.target.checked } : x)))
                  }
                  className="w-4 h-4 rounded text-amber focus:ring-amber"
                />
                <input
                  type="text"
                  value={r.title}
                  onChange={(e) =>
                    setRewards((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                  }
                  className="flex-grow bg-sand-light border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
                  maxLength={40}
                />
              </div>
              <div className="flex items-center gap-2 pl-6">
                <input
                  type="number"
                  value={r.vnd}
                  onChange={(e) =>
                    setRewards((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, vnd: Math.max(0, parseInt(e.target.value) || 0) } : x
                      )
                    )
                  }
                  className="w-28 bg-sand-light border border-sand rounded-xl px-3 py-1.5 text-xs font-bold text-forest-dark focus:outline-none"
                  min={0}
                  step={5000}
                />
                <span className="text-[10px] font-bold text-gray-400">VNĐ ≈</span>
                <span className="text-xs font-black text-amber-dark">{vndToCoins(r.vnd)} 🪙</span>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 bg-white text-gray-400 font-black text-xs py-3.5 rounded-2xl border-2 border-sand shadow-game-flat btn-game-transition"
            >
              ⬅️ LẠI
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-2/3 bg-forest text-sand-light font-black text-sm py-3.5 rounded-2xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
            >
              TIẾP TỤC ➡️
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: parent PIN */}
      {step === 3 && (
        <form onSubmit={handleFinish} className="space-y-4 flex-grow">
          <div className="bg-amber-light/40 border-2 border-amber/30 rounded-2xl p-4 text-center space-y-1">
            <span className="text-3xl">🔑</span>
            <p className="text-xs font-black text-amber-dark">Đặt mã PIN riêng của bố mẹ</p>
            <p className="text-[10px] text-gray-500 font-medium">
              Dùng để duyệt đổi quà & vào phòng quản trị — đừng để bé biết nhé!
            </p>
          </div>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin1}
            onChange={(e) => setPin1(e.target.value)}
            placeholder="Mã PIN mới (4-6 số)"
            className="w-full text-center bg-white border-2 border-sand rounded-xl py-3 text-lg font-black text-forest-dark focus:outline-none focus:border-forest transition-colors"
            required
          />
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin2}
            onChange={(e) => setPin2(e.target.value)}
            placeholder="Nhập lại mã PIN"
            className="w-full text-center bg-white border-2 border-sand rounded-xl py-3 text-lg font-black text-forest-dark focus:outline-none focus:border-forest transition-colors"
            required
          />

          {pinError && (
            <p className="text-[11px] font-bold text-terracotta text-center bg-rose-50 border border-red-100 rounded-xl p-2">
              ⚠️ {pinError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 bg-white text-gray-400 font-black text-xs py-3.5 rounded-2xl border-2 border-sand shadow-game-flat btn-game-transition"
            >
              ⬅️ LẠI
            </button>
            <button
              type="submit"
              className="w-2/3 bg-amber text-white font-black text-sm py-3.5 rounded-2xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              HOÀN TẤT — VÀO CHƠI! 🚀
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
