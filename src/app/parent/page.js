"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";

export default function ParentDashboard() {
  const router = useRouter();
  const {
    isLoaded,
    charName,
    charClass,
    level,
    streak,
    stats,
    tasks,
    rewards,
    parentPin,
    setParentPin,
    addCustomTask,
    deleteTask,
    addCustomReward,
    deleteReward,
    sendEncouragement,
    resetDailyTasks,
    gold,
    setGold,
    points,
    setPoints,
  } = useGame();

  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState("");

  // Gold and Points manual adjustments
  const [goldAdjustAmount, setGoldAdjustAmount] = useState(20);
  const [goldAdjustSuccess, setGoldAdjustSuccess] = useState("");
  const [pointsAdjustAmount, setPointsAdjustAmount] = useState(50);
  const [pointsAdjustSuccess, setPointsAdjustSuccess] = useState("");

  // CRUD Forms States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("discipline");
  const [taskExp, setTaskExp] = useState(20);
  const [taskPoints, setTaskPoints] = useState(20); // default points = exp
  const [taskGold, setTaskGold] = useState(0); // default gold = 0
  const [taskIsMandatory, setTaskIsMandatory] = useState(false);

  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState(50);
  const [rewardType, setRewardType] = useState("perk");
  const [rewardMinutes, setRewardMinutes] = useState(20);
  const [rewardRarity, setRewardRarity] = useState("rare");
  const [rewardCurrency, setRewardCurrency] = useState("points"); // default currency points

  const [encouragementText, setEncouragementText] = useState("");
  const [messageSuccess, setMessageSuccess] = useState(false);

  const [newPin, setNewPin] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState("");
  const [showParentGuide, setShowParentGuide] = useState(false); // Setup Guide for parent

  // Preset task templates for quick selection
  const taskTemplates = [
    { title: "🧹 Rửa bát chén sạch sẽ", category: "help", exp: 15, points: 15, gold: 2, icon: "🧹" },
    { title: "✨ Quét & lau nhà gọn gàng", category: "help", exp: 20, points: 20, gold: 3, icon: "✨" },
    { title: "🌿 Tưới cây & chăm vườn", category: "help", exp: 10, points: 10, gold: 1, icon: "🌿" },
    { title: "🗑️ Tự giác đi đổ rác", category: "help", exp: 10, points: 10, gold: 1, icon: "🗑️" },
    { title: "📚 Đọc sách 20 phút", category: "intellect", exp: 25, points: 25, gold: 1, icon: "📚" },
    { title: "🇬🇧 Học Tiếng Anh 15 phút", category: "intellect", exp: 25, points: 25, gold: 1, icon: "🇬🇧" },
    { title: "✍️ Hoàn thành bài tập hè", category: "intellect", exp: 30, points: 30, gold: 2, icon: "✍️" },
    { title: "🛌 Gấp chăn màn gọn gàng", category: "discipline", exp: 15, points: 15, gold: 1, icon: "🛌" },
    { title: "💤 Đi ngủ trước 22h tối", category: "discipline", exp: 20, points: 20, gold: 1, icon: "💤" },
    { title: "🦷 Đánh răng đúng giờ", category: "discipline", exp: 10, points: 10, gold: 0, icon: "🦷" },
    { title: "🏃 Tập thể dục buổi sáng 10p", category: "strength", exp: 20, points: 20, gold: 1, icon: "🏃" },
    { title: "🪢 Nhảy dây 100 cái liên tục", category: "strength", exp: 15, points: 15, gold: 1, icon: "🪢" },
    { title: "🎨 Vẽ tranh hoặc tô màu", category: "creative", exp: 20, points: 20, gold: 1, icon: "🎨" },
    { title: "🎹 Luyện đàn / nhạc cụ 15p", category: "creative", exp: 25, points: 25, gold: 1, icon: "🎹" },
  ];

  const applyTaskTemplate = (template) => {
    if (!template) return;
    setTaskTitle(template.title);
    setTaskCategory(template.category);
    setTaskExp(template.exp);
    setTaskPoints(template.points);
    setTaskGold(template.gold);
  };

  useEffect(() => {
    if (isLoaded && !charName) {
      router.push("/");
    }
  }, [isLoaded, charName, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang tải...</p>
      </div>
    );
  }

  // Handle PIN validation to enter Parent room
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinEntry === parentPin) {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Mã PIN không khớp! Vui lòng thử lại. ❌");
    }
  };

  // Submit custom task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addCustomTask(taskTitle, taskExp, taskCategory, taskIsMandatory, taskPoints, taskGold);
    setTaskTitle("");
    setTaskGold(0);
    setTaskIsMandatory(false);
    alert("Đã thêm nhiệm vụ mới thành công! ✅");
  };

  // Submit custom reward
  const handleAddReward = (e) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    addCustomReward(rewardTitle, rewardCost, rewardType, rewardMinutes, rewardRarity, rewardCurrency);
    setRewardTitle("");
    alert("Đã thêm phần thưởng mới thành công! ✅");
  };

  // Adjust gold manually
  const handleAdjustGold = (type) => {
    if (goldAdjustAmount <= 0) return;
    if (type === "add") {
      setGold((prev) => prev + goldAdjustAmount);
      setGoldAdjustSuccess(`Đã thưởng nóng +${goldAdjustAmount} 🪙 Tiền Vàng cho Quốc Bảo! 🎉`);
    } else {
      setGold((prev) => Math.max(0, prev - goldAdjustAmount));
      setGoldAdjustSuccess(`Đã phạt trừ -${goldAdjustAmount} 🪙 Tiền Vàng của Quốc Bảo! ⚠️`);
    }
    setTimeout(() => setGoldAdjustSuccess(""), 3500);
  };

  // Adjust points manually
  const handleAdjustPoints = (type) => {
    if (pointsAdjustAmount <= 0) return;
    if (type === "add") {
      setPoints((prev) => prev + pointsAdjustAmount);
      setPointsAdjustSuccess(`Đã thưởng nóng +${pointsAdjustAmount} ⭐ Điểm Tích Lũy! 🎉`);
    } else {
      setPoints((prev) => Math.max(0, prev - pointsAdjustAmount));
      setPointsAdjustSuccess(`Đã phạt trừ -${pointsAdjustAmount} ⭐ Điểm Tích Lũy! ⚠️`);
    }
    setTimeout(() => setPointsAdjustSuccess(""), 3500);
  };

  // Send pigeon message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!encouragementText.trim()) return;

    sendEncouragement(encouragementText);
    setEncouragementText("");
    setMessageSuccess(true);
    setTimeout(() => setMessageSuccess(false), 3000);
  };

  // Change PIN
  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeSuccess("Mã PIN mới phải từ 4 số trở lên! ❌");
      return;
    }
    setParentPin(newPin);
    setNewPin("");
    setPinChangeSuccess("Đã thay đổi mã PIN thành công! ✅");
    setTimeout(() => setPinChangeSuccess(""), 3000);
  };

  // AUTHENTICATION GATE - Security passcode check
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <form 
          onSubmit={handlePinSubmit}
          className="bg-white border-4 border-amber rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-5"
        >
          <div className="w-16 h-16 bg-amber-light rounded-full border-2 border-amber mx-auto flex items-center justify-center text-3xl shadow animate-float">
            🔑
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-black text-forest-dark uppercase tracking-wider">Cửa Phòng Bố Mẹ</h2>
            <p className="text-[10.5px] text-gray-500">Vui lòng nhập mã PIN bảo mật để tiếp tục quản trị.</p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={pinEntry}
              onChange={(e) => setPinEntry(e.target.value)}
              placeholder="Nhập mã PIN của bố mẹ..."
              className="w-full text-center bg-sand-light border-2 border-sand rounded-xl py-3 text-lg font-black text-forest-dark focus:outline-none focus:border-forest transition-colors"
            />
            {pinError && <p className="text-[10.5px] font-bold text-terracotta">{pinError}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-1/2 bg-white text-gray-400 font-extrabold text-xs py-3 rounded-xl border-2 border-sand shadow-game-flat btn-game-transition active:shadow-game-pressed"
            >
              QUAY LẠI 🌳
            </button>
            <button
              type="submit"
              className="w-1/2 bg-amber text-sand-light font-black text-xs py-3 rounded-xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              VÀO QUẢN TRỊ 🔓
            </button>
          </div>
        </form>
      </div>
    );
  }

  // PARENT DASHBOARD MAIN AREA
  return (
    <div className="flex flex-col flex-grow relative pb-20">
      
      {/* Scrollable control panel */}
      <div className="flex-grow p-5 space-y-6 overflow-y-auto">
        
        {/* Header back navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider flex items-center gap-1"
          >
            🌳 Dashboard
          </button>
          
          <div className="flex items-center gap-2 select-none">
            <button
              onClick={() => setShowParentGuide(true)}
              className="text-[9px] font-black text-forest hover:text-forest-dark bg-forest-accent/40 border border-forest/30 px-2 py-1 rounded-full uppercase tracking-wider transition-all active:scale-95 flex items-center gap-0.5"
              type="button"
            >
              💡 Hướng Dẫn Setup
            </button>
            <span className="text-xs font-black text-amber">🔑 PHÒNG QUẢN TRỊ BỐ MẸ</span>
          </div>
        </div>

        {/* 1. CHILD PROGRESS ANALYTICS */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">📈 Tiến Trình Học Tập Của Con</h3>
            <p className="text-[10px] text-gray-400">Chiến binh {charName} - Cấp độ {level} (Streak {streak} ngày 🔥)</p>
          </div>

          {/* Bar charts of stats */}
          <div className="space-y-3.5 pt-2">
            {Object.entries(stats).map(([key, val]) => {
              let label = "";
              let color = "bg-terracotta";
              let emoji = "";
              if (key === "strength") { label = "Thể lực"; color = "bg-terracotta"; emoji = "❤️"; }
              if (key === "intellect") { label = "Trí tuệ"; color = "bg-sky"; emoji = "🧠"; }
              if (key === "discipline") { label = "Kỷ luật"; color = "bg-amber"; emoji = "⚡"; }
              if (key === "creative") { label = "Sáng tạo"; color = "bg-clay"; emoji = "🎨"; }
              if (key === "help") { label = "Giúp đỡ"; color = "bg-forest-medium"; emoji = "🤝"; }

              // Calculate proportional width relative to max stat level of 100
              const percentage = Math.min(100, Math.round((val / 100) * 100));

              return (
                <div key={key} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-600">
                    <span className="flex items-center gap-1">{emoji} {label}</span>
                    <span className="font-extrabold">{val} Điểm</span>
                  </div>
                  <div className="w-full bg-sand h-3 rounded-full border border-sand overflow-hidden relative shadow-inner">
                    <div 
                      className={`${color} h-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DUAL CURRENCY ADJUSTMENT PANEL FOR PARENT */}
          <div className="bg-sand-light border-2 border-sand p-3.5 rounded-2xl space-y-4 mt-4">
            <div className="text-[10px] font-black text-forest-dark uppercase tracking-wider flex items-center gap-1 select-none">
              <span>🔑</span>
              <span>Bảng Điều Chỉnh Ví Của Con</span>
            </div>
            
            {/* Points adjustment */}
            <div className="space-y-2 border-b border-sand pb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 flex items-center gap-0.5">⭐ Điểm Tích Lũy (Giải trí):</span>
                <span className="font-black text-forest-dark">{points} ⭐</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={pointsAdjustAmount}
                  onChange={(e) => setPointsAdjustAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-1/2 bg-white border border-sand rounded-xl px-3 py-1.5 text-xs font-bold text-forest-dark focus:outline-none"
                  min={0}
                />
                <button
                  type="button"
                  onClick={() => handleAdjustPoints("add")}
                  className="w-1/4 bg-forest text-sand-light font-black text-[9px] py-1.5 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
                >
                  + THƯỞNG
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustPoints("sub")}
                  className="w-1/4 bg-terracotta text-white font-black text-[9px] py-1.5 rounded-xl border-2 border-terracotta shadow-game-terracotta btn-game-transition active:shadow-game-pressed"
                >
                  - PHẠT
                </button>
              </div>
              {pointsAdjustSuccess && <p className="text-[8px] font-bold text-center text-forest animate-pulse">{pointsAdjustSuccess}</p>}
            </div>

            {/* Gold adjustment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 flex items-center gap-0.5">🪙 Tiền Vàng (Tiền mặt thật):</span>
                <span className="font-black text-amber-dark">{gold} 🪙</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={goldAdjustAmount}
                  onChange={(e) => setGoldAdjustAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-1/2 bg-white border border-sand rounded-xl px-3 py-1.5 text-xs font-bold text-forest-dark focus:outline-none"
                  min={0}
                />
                <button
                  type="button"
                  onClick={() => handleAdjustGold("add")}
                  className="w-1/4 bg-forest text-sand-light font-black text-[9px] py-1.5 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
                >
                  + THƯỞNG
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustGold("sub")}
                  className="w-1/4 bg-terracotta text-white font-black text-[9px] py-1.5 rounded-xl border-2 border-terracotta shadow-game-terracotta btn-game-transition active:shadow-game-pressed"
                >
                  - PHẠT
                </button>
              </div>
              {goldAdjustSuccess && <p className="text-[8px] font-bold text-center text-forest animate-pulse">{goldAdjustSuccess}</p>}
            </div>
          </div>
        </div>

        {/* 2. SEND PIGEON ENCOURAGEMENT MESSAGE */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
          <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">🕊️ Thả Bồ Câu Động Viên Con</h3>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              rows={2}
              value={encouragementText}
              onChange={(e) => setEncouragementText(e.target.value)}
              placeholder="Nhập lời khen ngợi/động viên gửi con..."
              className="w-full bg-sand-light border-2 border-sand rounded-xl p-3 text-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
              maxLength={150}
            />
            <div className="flex justify-between items-center">
              {messageSuccess && <span className="text-[10px] font-bold text-forest">Đã buộc thư vào chân bồ câu! 🕊️</span>}
              <button
                type="submit"
                className="ml-auto bg-forest text-sand-light font-black text-[11px] py-2 px-4 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
              >
                GỬI LỜI NHẮN 💌
              </button>
            </div>
          </form>
        </div>

        {/* 3. CRUD TASK MANAGEMENT PANEL */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
          <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">🎯 Thiết Lập Nhiệm Vụ Ngày</h3>
          
          {/* Quick Create Task Form */}
          <form onSubmit={handleAddTask} className="bg-sand-light border border-sand p-3.5 rounded-2xl space-y-3">
            <div className="text-[10px] font-black text-forest uppercase tracking-wider">⚡ Thiết Lập Nhiệm Vụ Nhanh</div>
            
            {/* Template Dropdown Select */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-0.5">
                💡 Gợi Ý Nhiệm Vụ Mẫu:
              </label>
              <select
                onChange={(e) => {
                  const selectedIdx = e.target.value;
                  if (selectedIdx !== "") {
                    applyTaskTemplate(taskTemplates[selectedIdx]);
                    e.target.value = ""; // Reset dropdown after selection
                  }
                }}
                className="w-full bg-white border border-sand rounded-xl p-2 text-xs font-bold text-forest focus:outline-none focus:border-forest"
                defaultValue=""
              >
                <option value="" disabled>-- Chọn một nhiệm vụ mẫu có sẵn --</option>
                <optgroup label="🤝 Việc Nhà / Giúp Đỡ">
                  {taskTemplates.filter(t => t.category === "help").map((t, idx) => (
                    <option key={t.title} value={taskTemplates.indexOf(t)}>
                      {t.icon} {t.title} (EXP: {t.exp} | ⭐: {t.points} | 🪙: {t.gold})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🧠 Học Tập / Trí Tuệ">
                  {taskTemplates.filter(t => t.category === "intellect").map((t, idx) => (
                    <option key={t.title} value={taskTemplates.indexOf(t)}>
                      {t.icon} {t.title} (EXP: {t.exp} | ⭐: {t.points} | 🪙: {t.gold})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Tự Lập / Kỷ Luật">
                  {taskTemplates.filter(t => t.category === "discipline").map((t, idx) => (
                    <option key={t.title} value={taskTemplates.indexOf(t)}>
                      {t.icon} {t.title} (EXP: {t.exp} | ⭐: {t.points} | 🪙: {t.gold})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="❤️ Sức Khỏe / Thể Lực">
                  {taskTemplates.filter(t => t.category === "strength").map((t, idx) => (
                    <option key={t.title} value={taskTemplates.indexOf(t)}>
                      {t.icon} {t.title} (EXP: {t.exp} | ⭐: {t.points} | 🪙: {t.gold})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🎨 Năng Khiếu / Sáng Tạo">
                  {taskTemplates.filter(t => t.category === "creative").map((t, idx) => (
                    <option key={t.title} value={taskTemplates.indexOf(t)}>
                      {t.icon} {t.title} (EXP: {t.exp} | ⭐: {t.points} | 🪙: {t.gold})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Quick tag items list */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                🔥 Việc Phổ Biến (Chạm 1 giây để chọn):
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {[
                  taskTemplates[0], // Rửa bát
                  taskTemplates[4], // Đọc sách
                  taskTemplates[7], // Gấp chăn
                  taskTemplates[10], // Thể dục
                ].map((template) => (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => applyTaskTemplate(template)}
                    className="flex-shrink-0 bg-white hover:bg-sand border border-sand px-2.5 py-1 rounded-full text-[10px] font-bold text-forest-dark flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    <span>{template.icon}</span>
                    <span>{template.title.split(" ")[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Tên Nhiệm Vụ:</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Nhập tên nhiệm vụ hoặc chỉnh sửa gợi ý phía trên..."
                className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
                maxLength={40}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Nhóm Chỉ Số</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full bg-white border border-sand rounded-xl p-2 text-xs font-bold text-forest-dark focus:outline-none"
                >
                  <option value="discipline">⚡ Kỷ luật</option>
                  <option value="strength">❤️ Thể lực</option>
                  <option value="intellect">🧠 Trí tuệ</option>
                  <option value="creative">🎨 Sáng tạo</option>
                  <option value="help">🤝 Giúp đỡ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">EXP Thăng Cấp</label>
                <input
                  type="number"
                  value={taskExp}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setTaskExp(val);
                    setTaskPoints(val); // Auto sync for convenience
                  }}
                  className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none"
                  min={0}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Điểm Thử Thách ⭐ (Đổi Giải Trí)</label>
                <input
                  type="number"
                  value={taskPoints}
                  onChange={(e) => setTaskPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none"
                  min={0}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Tiền Vàng 🪙 (Đổi Tiền Thật)</label>
                <input
                  type="number"
                  value={taskGold}
                  onChange={(e) => setTaskGold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none"
                  min={0}
                  required
                />
              </div>
            </div>

            {/* Checkbox for mandatory */}
            <div className="flex items-center gap-2 py-1 text-xs">
              <input
                type="checkbox"
                id="isMandatory"
                checked={taskIsMandatory}
                onChange={(e) => setTaskIsMandatory(e.target.checked)}
                className="w-4 h-4 rounded border-sand text-forest focus:ring-forest"
              />
              <label htmlFor="isMandatory" className="font-bold text-gray-600 cursor-pointer select-none">
                🔴 Đặt làm nhiệm vụ BẮT BUỘC hằng ngày
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-forest text-sand-light font-black text-xs py-2 px-4 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
            >
              THÊM NHIỆM VỤ MỚI ➕
            </button>
          </form>

          {/* List of current tasks */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nhiệm Vụ Hiện Tại:</div>
            
            {tasks.map((t) => (
              <div 
                key={t.id} 
                className={`bg-sand-light border p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-forest-dark gap-2 ${
                  t.isMandatory ? "border-red-200 bg-red-50/20" : "border-sand"
                }`}
              >
                <div className="flex flex-col truncate">
                  <span className="truncate max-w-[200px]">{t.title}</span>
                  {t.isMandatory && (
                    <span className="text-[8px] font-black text-terracotta uppercase tracking-wide">🔴 Bắt buộc</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-white border border-sand rounded px-1.5 py-0.5 text-gray-500 font-extrabold uppercase">
                    {t.category === "discipline" ? "⚡ KL" : t.category === "strength" ? "❤️ TL" : t.category === "intellect" ? "🧠 TT" : t.category === "creative" ? "🎨 ST" : "🤝 GD"}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Con có chắc muốn xóa nhiệm vụ này không?`)) {
                        deleteTask(t.id);
                      }
                    }}
                    className="text-terracotta hover:text-red-700 text-sm p-1.5"
                    title="Xóa nhiệm vụ"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CRUD REWARD MANAGEMENT PANEL */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
          <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">🎁 Thiết Lập Cửa Hàng Quà Tặng</h3>
          
          {/* Quick Create Reward Form */}
          <form onSubmit={handleAddReward} className="bg-sand-light border border-sand p-3.5 rounded-2xl space-y-3">
            <div className="text-[10px] font-black text-forest uppercase tracking-wider">⚡ Tạo Phần Thưởng Tùy Chỉnh</div>
            
            <input
              type="text"
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="Tên phần thưởng... (ví dụ: Ăn kem tươi 🍨)"
              className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
              maxLength={40}
              required
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Điểm Quy Đổi</label>
                <input
                  type="number"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(e.target.value)}
                  className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
                  min={10}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Loại Quà</label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="w-full bg-white border border-sand rounded-xl p-2 text-xs font-bold text-forest-dark focus:outline-none"
                >
                  <option value="perk">🎁 Món quà thực tế</option>
                  <option value="game_time">⏰ Khóa giờ chơi game</option>
                  <option value="card">🎟️ Thẻ bài đặc quyền</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Độ Hiếm Quà</label>
                <select
                  value={rewardRarity}
                  onChange={(e) => setRewardRarity(e.target.value)}
                  className="w-full bg-white border border-sand rounded-xl p-2 text-xs font-bold text-forest-dark focus:outline-none"
                >
                  <option value="common">Thường ⚙️</option>
                  <option value="rare">Hiếm 🔷</option>
                  <option value="epic">Sử Thi 👑</option>
                  <option value="legendary">Huyền Thoại ⚡</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Ví Thanh Toán</label>
                <select
                  value={rewardCurrency}
                  onChange={(e) => setRewardCurrency(e.target.value)}
                  className="w-full bg-white border border-sand rounded-xl p-2 text-xs font-bold text-forest-dark focus:outline-none"
                >
                  <option value="points">Điểm Tích Lũy ⭐</option>
                  <option value="gold">Tiền Vàng 🪙</option>
                </select>
              </div>
            </div>

            {rewardType === "game_time" && (
              <div className="space-y-1 text-xs">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Số Phút Mở Khóa</label>
                <input
                  type="number"
                  value={rewardMinutes}
                  onChange={(e) => setRewardMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none"
                  min={5}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-forest text-sand-light font-black text-xs py-2 px-4 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
            >
              THÊM PHẦN THƯỞNG ➕
            </button>
          </form>

          {/* List of current rewards */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Danh Sách Quà Hiện Tại:</div>
            
            {rewards.map((r) => {
              let rarityLabel = "Thường ⚙️";
              if (r.rarity === "rare") rarityLabel = "Hiếm 🔷";
              if (r.rarity === "epic") rarityLabel = "Sử Thi 👑";
              if (r.rarity === "legendary") rarityLabel = "Huyền Thoại ⚡";

              return (
                <div 
                  key={r.id} 
                  className="bg-sand-light border border-sand p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-forest-dark gap-2"
                >
                  <div className="flex flex-col truncate">
                    <span className="truncate max-w-[150px]">{r.title}</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-wide">{rarityLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-white border border-sand rounded px-1.5 py-0.5 text-gray-500 font-extrabold uppercase">
                      {r.cost} vàng 🪙
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Bố mẹ chắc chắn muốn xóa phần thưởng này chứ?`)) {
                          deleteReward(r.id);
                        }
                      }}
                      className="text-terracotta hover:text-red-700 text-sm p-1.5"
                      title="Xóa phần thưởng"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. DAILY OVERRIDE RESET & PIN CHANGE CONFIGS */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
          <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">⚙️ Bảng Điều Khiển Hệ Thống</h3>

          {/* Pin Change Form */}
          <form onSubmit={handleChangePin} className="space-y-3 border-b border-sand pb-4">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">🔒 Thay Đổi Mã PIN Phụ Huynh</div>
            <div className="flex gap-2">
              <input
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Nhập mã PIN mới..."
                className="w-2/3 bg-sand-light border border-sand rounded-xl px-3 py-2 text-xs font-bold text-forest-dark focus:outline-none"
              />
              <button
                type="submit"
                className="w-1/3 bg-forest text-sand-light font-black text-[10px] rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
              >
                CẬP NHẬT 🔒
              </button>
            </div>
            {pinChangeSuccess && <p className="text-[10px] font-bold text-center text-forest">{pinChangeSuccess}</p>}
          </form>

          {/* Manual Daily Reset Button */}
          <div className="space-y-2 text-center">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider text-left">🔄 Đặt Lại Ngày Mới</div>
            <p className="text-[9px] text-gray-500 text-left">Nhiệm vụ của bé và trạng thái quy đổi quà sẽ được xóa để sẵn sàng cho ngày mới. Nếu bé làm tốt từ 3 việc trở lên, ngọn lửa Streak 🔥 sẽ tăng lên!</p>
            
            <button
              onClick={() => {
                if (confirm("Bố mẹ chắc chắn muốn reset ngày mới và cộng dồn ngọn lửa Streak cho con chứ?")) {
                  resetDailyTasks();
                  alert("Đã khởi động ngày mới thành công! 🔄 Giao diện của con đã được làm mới.");
                }
              }}
              className="w-full bg-amber text-sand-light font-black text-xs py-3 px-4 rounded-xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              GIẢ LẬP KÍCH HOẠT NGÀY MỚI 🔄
            </button>
          </div>
        </div>

      </div>

      {/* PARENT SETUP GUIDE MODAL */}
      {showParentGuide && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white border-4 border-amber rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative max-h-[85vh] overflow-y-auto">
            <div className="w-16 h-16 bg-amber-light rounded-full border-2 border-amber mx-auto flex items-center justify-center text-3xl shadow">
              💡
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">Cẩm Nang Quản Trị Của Bố Mẹ 💡</h3>
              <p className="text-[10px] text-gray-500">Hướng dẫn thiết lập game hóa để đạt hiệu quả giáo dục tốt nhất!</p>
            </div>

            <div className="text-left space-y-3.5 text-xs text-forest-dark font-medium bg-sand-light p-4 rounded-2xl border border-sand">
              <div className="space-y-1.5">
                <p className="font-black text-forest flex items-center gap-1 text-[11px]">
                  ⭐ 1. Cân Bằng Ví Kép (Điểm vs Vàng)
                </p>
                <p className="pl-5 text-gray-600 text-[10px] leading-relaxed">
                  • <strong>Điểm ⭐ (Giải trí):</strong> Hãy cho bé Điểm hào phóng khi hoàn thành bài tập, giữ kỷ luật. Điểm này dùng để bé mua thời gian chơi game, TV, tạo động lực ngắn hạn.
                </p>
                <p className="pl-5 text-gray-600 text-[10px] leading-relaxed">
                  • <strong>Tiền Vàng 🪙 (Tiền thật):</strong> Chỉ tặng Tiền Vàng giới hạn khi bé giúp đỡ việc nhà thực tế (rửa bát, quét nhà). 10 Vàng = 10k hoặc 20k tiền mặt thật tùy bố mẹ quy ước. Việc này dạy bé giá trị của lao động chân tay.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-black text-amber-dark flex items-center gap-1 text-[11px]">
                  ➕ 2. Cách Tạo Nhiệm Vụ Mới
                </p>
                <p className="pl-5 text-gray-600 text-[10px] leading-relaxed">
                  • Bố mẹ gõ tên nhiệm vụ hoặc sử dụng <strong>Dropdown Gợi Ý Mẫu</strong> để tự động điền form cực nhanh.<br />
                  • Có thể tích chọn <strong>Bắt buộc 🔴</strong> nếu đây là việc ngày nào con cũng phải làm (ví dụ: đánh răng, học bài).
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-black text-terracotta flex items-center gap-1 text-[11px]">
                  🎁 3. Thiết Lập Quà Tặng & Duyệt Quà
                </p>
                <p className="pl-5 text-gray-600 text-[10px] leading-relaxed">
                  • Khi tạo quà, bố mẹ chọn <strong>Ví Thanh Toán</strong> (Ví dụ: Thẻ xem TV đổi bằng Điểm ⭐, Nhận 50k tiền mặt đổi bằng Vàng 🪙).<br />
                  • Khi con bấm {"'Đổi quà'"}, bố mẹ sẽ phải nhập mã PIN để duyệt và thực hiện trao quà thực tế cho con ngoài đời.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-black text-forest-dark flex items-center gap-1 text-[11px]">
                  🔄 4. Đặt Lại Ngày Mới (Reset Ngày)
                </p>
                <p className="pl-5 text-gray-600 text-[10px] leading-relaxed">
                  • Mỗi tối trước khi đi ngủ hoặc sáng sớm, bố mẹ bấm nút <strong>{"'Giả lập kích hoạt ngày mới'"}</strong> để làm mới danh sách việc ngày cho con.<br />
                  • Nếu ngày hôm đó con làm tốt từ 3 việc trở lên, ngọn lửa <strong>Streak 🔥</strong> của con sẽ tăng lên!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowParentGuide(false)}
              className="w-full bg-amber text-sand-light font-black text-xs py-3 rounded-xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              TÔI ĐÃ HIỂU, TIẾP TỤC ĐỒNG HÀNH! 🚀
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM TAB NAVIGATION */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🌳</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Phiêu Lưu</span>
        </button>

        <button
          onClick={() => router.push("/rewards")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🛒</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Đổi Quà</span>
        </button>

        <button
          onClick={() => router.push("/boss")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">👾</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Boss Tuần</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center p-2 text-forest-medium space-y-0.5"
        >
          <span className="text-xl">🔑</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Bố Mẹ</span>
        </button>
      </div>
    </div>
  );
}
