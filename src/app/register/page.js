"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const CLASSES = [
  {
    id: "Warrior",
    title: "Chiến Binh Quả Cảm ⚔️",
    description: "Vượt qua thử thách rèn luyện thể chất, dũng mãnh và kỷ luật cực cao.",
    baseStats: { strength: 14, intellect: 9, discipline: 11, creative: 8, help: 8 },
    emoji: "🛡️",
    color: "border-terracotta bg-rose-50 text-terracotta",
    accent: "bg-terracotta",
  },
  {
    id: "Mage",
    title: "Pháp Sư Trí Tuệ 🧠",
    description: "Đam mê đọc sách, khám phá kiến thức mới, sáng tạo không ngừng.",
    baseStats: { strength: 8, intellect: 14, discipline: 9, creative: 11, help: 8 },
    emoji: "🔮",
    color: "border-sky bg-blue-50 text-sky",
    accent: "bg-sky",
  },
  {
    id: "Druid",
    title: "Thần Cây Bảo Vệ 🌳",
    description: "Luôn giúp đỡ mọi người xung quanh, hiền hòa, yêu thiên nhiên.",
    baseStats: { strength: 9, intellect: 8, discipline: 10, creative: 9, help: 14 },
    emoji: "🌱",
    color: "border-forest bg-green-50 text-forest",
    accent: "bg-forest-medium",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { createChild, childLimit, childProfiles } = useAuth();

  const [nameInput, setNameInput] = useState("");
  const [selectedClass, setSelectedClass] = useState("Warrior");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartAdventure = async () => {
    if (!nameInput.trim()) {
      setErrorMessage("Vui lòng nhập tên Anh Hùng của con nhé!");
      return;
    }
    setBusy(true);
    setErrorMessage("");

    const res = await createChild(nameInput.trim(), selectedClass);
    setBusy(false);

    if (!res.success) {
      if (res.error === "CHILD_LIMIT_REACHED") {
        setErrorMessage(
          `Gói hiện tại chỉ tạo được ${childLimit} hồ sơ con (đang có ${childProfiles.length}). Nâng cấp Premium để thêm bé nhé! 👑`
        );
      } else {
        setErrorMessage(res.error || "Có lỗi xảy ra, vui lòng thử lại!");
      }
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col flex-grow p-6 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-forest-accent opacity-20 rounded-full blur-2xl -z-10"></div>
      
      {/* Back button */}
      <button
        onClick={() => router.push("/family")}
        className="self-start text-xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider mb-4 flex items-center gap-1"
      >
        ⬅️ Quay lại
      </button>

      {/* Header */}
      <div className="text-center space-y-1.5 mb-6">
        <h2 className="text-2xl font-black text-forest uppercase tracking-tight">Tạo Anh Hùng Mùa Hè</h2>
        <p className="text-xs font-medium text-gray-500">Khởi đầu hành trình rèn luyện bản thân của con</p>
      </div>

      {/* Name Input Card */}
      <div className="bg-white border-2 border-sand p-4 rounded-2xl shadow-game-flat space-y-3 mb-6">
        <label className="block text-xs font-black text-forest-dark uppercase tracking-wider">Tên Anh Hùng Của Bé</label>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nhập tên của bé..."
          className="w-full bg-sand-light border-2 border-sand rounded-xl px-4 py-3 text-base font-bold text-forest-dark focus:outline-none focus:border-forest transition-colors"
          maxLength={18}
        />
      </div>

      {/* Class Selection */}
      <div className="space-y-4 flex-grow">
        <label className="block text-xs font-black text-forest-dark uppercase tracking-wider">Chọn Lớp Nhân Vật</label>
        
        <div className="space-y-3">
          {CLASSES.map((c) => {
            const isSelected = selectedClass === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClass(c.id)}
                className={`w-full text-left bg-white border-2 rounded-2xl p-4 flex items-start gap-4 transition-all duration-100 ${
                  isSelected 
                    ? `border-forest shadow-game-forest translate-y-[-2px]` 
                    : "border-sand shadow-game-flat hover:border-sand-dark"
                }`}
              >
                {/* Class Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 ${
                  isSelected ? "bg-sand" : "bg-sand-light"
                }`}>
                  {c.emoji}
                </div>

                {/* Class Details */}
                <div className="flex-grow space-y-1">
                  <h3 className="text-sm font-extrabold text-forest-dark">{c.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-normal">{c.description}</p>
                  
                  {/* Stats previews */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {Object.entries(c.baseStats).map(([key, val]) => {
                      let statLabel = "";
                      if (key === "strength") statLabel = "❤️ Thể lực";
                      if (key === "intellect") statLabel = "🧠 Trí tuệ";
                      if (key === "discipline") statLabel = "⚡ Kỷ luật";
                      if (key === "creative") statLabel = "🎨 Sáng tạo";
                      if (key === "help") statLabel = "🤝 Giúp đỡ";
                      
                      // Highlight key stat of class
                      const isMainStat = (key === "strength" && c.id === "Warrior") ||
                                       (key === "intellect" && c.id === "Mage") ||
                                       (key === "help" && c.id === "Druid");

                      return (
                        <span 
                          key={key} 
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isMainStat 
                              ? "bg-amber-light border-amber text-amber" 
                              : "bg-sand-light border-sand text-gray-500"
                          }`}
                        >
                          {statLabel}: {val}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Launch Action */}
      <div className="mt-8 pb-4 space-y-3">
        {errorMessage && (
          <p className="text-[11px] font-bold text-terracotta text-center bg-rose-50 border border-red-100 rounded-xl p-2.5">
            ⚠️ {errorMessage}
          </p>
        )}
        <button
          onClick={handleStartAdventure}
          disabled={busy}
          className={`w-full font-extrabold text-base py-4 px-6 rounded-2xl border-2 btn-game-transition ${
            busy
              ? "bg-gray-100 border-sand text-gray-400"
              : "bg-forest text-sand-light border-forest shadow-game-forest active:shadow-game-pressed"
          }`}
        >
          {busy ? "ĐANG TẠO..." : "XUẤT PHÁT KIÊN CƯỜNG! 🚀"}
        </button>
      </div>
    </div>
  );
}
