"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { getJourneysForAge, JOURNEY_AGE_BANDS, recommendJourneys, getPainpointById } from "@/lib/game/journeys";
import PainpointPicker from "@/features/parent/components/PainpointPicker";
import { track } from "@/lib/analytics";

/**
 * Onboarding wizard — from "paid" to "child playing" in under 3 minutes.
 * B-lite: Step 1 is now "pick a 3-week JOURNEY" (the parent's đường dẫn) —
 * no more inventing tasks from scratch. Loose tasks became an optional extra.
 * Step 2: first 3 real-world rewards (VND → coin conversion)
 * Step 3: set parent PIN (replace default 1234)
 */

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
  "13-15": [
    { title: "📚 Học/ôn bài tập trung 25 phút", category: "intellect", exp: 25, points: 25, energy: 18 },
    { title: "💪 Vận động 20 phút", category: "strength", exp: 25, points: 25, energy: 18 },
    { title: "🍽️ Một việc nhà cố định mỗi ngày", category: "help", exp: 22, points: 22, energy: 16 },
    { title: "🇬🇧 Tiếng Anh 20 phút", category: "intellect", exp: 25, points: 25, energy: 18 },
    { title: "🛏️ Phòng riêng gọn gàng", category: "discipline", exp: 18, points: 18, energy: 12 },
    { title: "🍳 Phụ nấu hoặc tự chuẩn bị 1 bữa", category: "help", exp: 22, points: 22, energy: 16 },
  ],
};

// Value Gap: reward suggestions match the child's age (teens ≠ kids).
const REWARDS_BY_AGE = {
  "4-6": [
    { title: "🍨 Một que kem yêu thích", vnd: 20000 },
    { title: "🎈 Đi công viên/khu vui chơi", vnd: 80000 },
    { title: "🧸 Món đồ chơi con mơ ước", vnd: 200000 },
  ],
  "7-9": [
    { title: "🍨 Một ly kem yêu thích", vnd: 25000 },
    { title: "🎬 Đi xem phim cuối tuần", vnd: 100000 },
    { title: "🧩 Món đồ chơi/bộ Lego con thích", vnd: 300000 },
  ],
  "10-12": [
    { title: "💵 Tiền tiêu vặt tự quản", vnd: 50000 },
    { title: "🎮 Mua game/vật phẩm trong game", vnd: 150000 },
    { title: "⚽ Đồ thể thao/sở thích con chọn", vnd: 300000 },
  ],
  "13-15": [
    { title: "💵 Tiền tiêu vặt 100.000₫ tự quản", vnd: 100000 },
    { title: "☕ Đi chơi/cà phê với bạn", vnd: 150000 },
    { title: "🎧 Phụ kiện công nghệ tự chọn", vnd: 500000 },
  ],
};

export default function SetupWizardPage() {
  const router = useRouter();
  const { isLoaded, charName, journey, startJourney, addCustomTask, addCustomReward, setParentPin, parentConfig, setParentConfig } = useGame();
  const { authLoaded, activeChildId, isDemo, isCloudChild, changeParentPin } = useAuth();

  const [step, setStep] = useState(1);
  const [ageBand, setAgeBand] = useState("7-9");
  const [painpoints, setPainpoints] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(() => getJourneysForAge("7-9")[0]?.id || null);
  const [showExtraTasks, setShowExtraTasks] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState(() => TASKS_BY_AGE["7-9"].map(() => false));
  const [rewards, setRewards] = useState(REWARDS_BY_AGE["7-9"].map((r) => ({ ...r, enabled: true })));
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

  const journeys = getJourneysForAge(ageBand);
  const pickingJourney = selectedJourney !== null;

  // "Chẩn đoán" → kê đơn: lộ trình khớp painpoint lên đầu, kèm lý do kê
  const { recommendations } = recommendJourneys(ageBand, painpoints);
  const recIds = recommendations.map((r) => r.journey.id);
  const orderedJourneys = [...recommendations.map((r) => r.journey), ...journeys.filter((j) => !recIds.includes(j.id))];
  const matchedLabels = (journeyId) =>
    (recommendations.find((r) => r.journey.id === journeyId)?.matched || [])
      .map((pid) => getPainpointById(pid)?.label)
      .filter(Boolean);

  const topRecommendedId = (band, points) =>
    recommendJourneys(band, points).recommendations[0]?.journey.id || getJourneysForAge(band)[0]?.id || null;

  const selectAge = (band) => {
    setAgeBand(band);
    setSelectedJourney(topRecommendedId(band, painpoints));
    setShowExtraTasks(false);
    setCheckedTasks(TASKS_BY_AGE[band].map(() => false));
    setRewards(REWARDS_BY_AGE[band].map((r) => ({ ...r, enabled: true })));
  };

  const changePainpoints = (next) => {
    setPainpoints(next);
    // chỉ tự nhảy lựa chọn khi bố mẹ đang theo lộ trình (không đè lựa chọn "kiểu cũ")
    if (pickingJourney) setSelectedJourney(topRecommendedId(ageBand, next));
  };

  const selectNoJourney = () => {
    setSelectedJourney(null);
    // không theo lộ trình → quay về kiểu cũ: nhiệm vụ lẻ bật sẵn hết
    setShowExtraTasks(true);
    setCheckedTasks(TASKS_BY_AGE[ageBand].map(() => true));
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (pin1.length < 4) {
      setPinError("Mã PIN phải từ 4 số trở lên!");
      return;
    }
    if (pin1 !== pin2) {
      setPinError("Hai mã PIN không khớp nhau!");
      return;
    }
    // First-time PIN: cloud children set it server-side (no old PIN needed yet —
    // the RPC only requires one once a hash already exists); local/offline
    // children keep the client-side field (approved offline fallback).
    if (isCloudChild) {
      const result = await changeParentPin(pin1, null);
      if (!result.success) {
        setPinError("Không thể lưu mã PIN, thử lại nhé!");
        return;
      }
    } else {
      setParentPin(pin1);
    }

    // Apply everything at once
    // Lưu "chẩn đoán" (kể cả painpoint chưa có lộ trình) — nguồn cho thẻ Khoảnh khắc sau này
    setParentConfig({ ...(parentConfig || {}), intake: { ageBand, painpoints, updatedAt: Date.now() } });
    if (selectedJourney && !journey) {
      const r = startJourney(selectedJourney);
      if (r.success) track("journey_started", { id: selectedJourney, source: "onboarding" });
    }
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

    track("onboarding_completed", {
      age_band: ageBand,
      painpoints: painpoints.join(","),
      journey: selectedJourney || "none",
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

      {/* STEP 1: age band + JOURNEY pick (B-lite đường dẫn) */}
      {step === 1 && (
        <div className="space-y-4 flex-grow">
          <p className="text-xs font-bold text-gray-500">Chọn độ tuổi của con:</p>

          <div className="grid grid-cols-2 gap-2">
            {JOURNEY_AGE_BANDS.map((band) => (
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
                <p className="text-[10px] text-gray-400 font-bold leading-tight">{band.desc}</p>
              </button>
            ))}
          </div>

          <PainpointPicker selected={painpoints} onChange={changePainpoints} />

          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              {recommendations.length > 0
                ? "🛤️ Lộ trình 3 tuần được kê riêng cho con:"
                : "🛤️ Chọn 1 lộ trình 3 tuần — nhiệm vụ & mẹo mỗi tuần đã soạn sẵn:"}
            </p>
            {orderedJourneys.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setSelectedJourney(j.id)}
                className={`w-full text-left bg-white border-2 rounded-2xl p-3.5 transition-all ${
                  selectedJourney === j.id ? "border-forest shadow-game-forest" : "border-sand shadow-game-flat"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{j.icon}</span>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-black text-forest-dark">
                      {j.title}
                      <span className="ml-1.5 text-[11px] font-black text-amber-dark bg-amber-light/50 rounded-full px-1.5 py-0.5">
                        3 TUẦN
                      </span>
                    </p>
                    {matchedLabels(j.id).length > 0 && (
                      <p className="text-[10px] font-black text-forest mt-0.5">
                        Kê theo: {matchedLabels(j.id).join(" · ").toLowerCase()}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500 font-medium leading-snug mt-0.5">{j.goal}</p>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-black ${
                      selectedJourney === j.id ? "border-forest bg-forest text-white" : "border-sand text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={selectNoJourney}
              className={`w-full text-left rounded-2xl border-2 p-3 text-[10px] font-bold transition-all ${
                !pickingJourney ? "border-forest bg-forest-light/10 text-forest-dark" : "border-sand bg-white text-gray-400"
              }`}
            >
              ⚙️ Không theo lộ trình — tự chọn nhiệm vụ lẻ (kiểu cũ)
            </button>
          </div>

          {/* Nhiệm vụ lẻ: tuỳ chọn khi đã có lộ trình, bắt buộc hiện khi không lộ trình */}
          <div className="space-y-2">
            {pickingJourney && (
              <button
                type="button"
                onClick={() => setShowExtraTasks((v) => !v)}
                className="text-[10px] font-black text-sky-dark underline"
              >
                {showExtraTasks ? "▲ Ẩn nhiệm vụ lẻ" : "➕ Thêm nhiệm vụ lẻ ngoài lộ trình (tuỳ chọn)"}
              </button>
            )}
            {showExtraTasks &&
              TASKS_BY_AGE[ageBand].map((task, i) => (
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
                  <span className="text-[11px] font-black text-amber-dark">+{task.energy}⚡</span>
                </label>
              ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!pickingJourney && checkedTasks.every((c) => !c)}
            className="w-full bg-forest text-sand-light font-black text-sm py-3.5 rounded-2xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed disabled:opacity-50"
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
