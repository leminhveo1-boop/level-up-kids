"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import ApprovalTab from "@/features/parent/components/ApprovalTab";
import WeekTab from "@/features/parent/components/WeekTab";
import ManageTab from "@/features/parent/components/ManageTab";
import SystemTab from "@/features/parent/components/SystemTab";

const TABS = [
  { id: "approval", label: "✅ Duyệt" },
  { id: "week", label: "📊 Tuần" },
  { id: "manage", label: "🎯 Việc & Quà" },
  { id: "system", label: "⚙️ Hệ thống" },
];

/**
 * Parent room — adult-mode UI (UX_AUDIT Phần 5): daily work ≤2 taps in Tab Duyệt,
 * one-time setup tucked into Hệ thống. Deliberately denser & calmer than kid UI.
 */
export default function ParentDashboard() {
  const router = useRouter();
  const { isLoaded, charName, parentPin, pendingCount } = useGame();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("approval");

  useEffect(() => {
    if (isLoaded && !charName) router.push("/");
  }, [isLoaded, charName, router]);

  // Theme "parent" is applied by app/(parent)/layout.js via ThemeScope.

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang tải...</p>
      </div>
    );
  }

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinEntry === parentPin) {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Mã PIN không khớp! Vui lòng thử lại.");
    }
  };

  // ---------- PIN GATE ----------
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <form
          onSubmit={handlePinSubmit}
          className="bg-white border-2 border-sand rounded-2xl p-6 shadow-lg w-full max-w-sm space-y-4"
        >
          <div className="w-14 h-14 bg-sand-light rounded-full border border-sand mx-auto flex items-center justify-center text-2xl">
            🔑
          </div>
          <div className="space-y-1">
            <h2 className="text-scale-lg font-black text-forest-dark">Phòng Bố Mẹ</h2>
            <p className="text-scale-2xs text-gray-500">Nhập mã PIN để tiếp tục.</p>
          </div>

          <input
            type="password"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={6}
            value={pinEntry}
            onChange={(e) => setPinEntry(e.target.value)}
            placeholder="Mã PIN..."
            className="w-full min-h-tap text-center bg-sand-light border border-sand rounded-xl text-scale-lg font-black text-forest-dark focus:outline-none focus:border-forest transition-colors"
            autoFocus
          />
          {pinError && <p className="text-scale-2xs font-bold text-terracotta">⚠️ {pinError}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-1/2 min-h-tap bg-white text-gray-500 font-bold text-scale-xs rounded-xl border border-sand active:scale-[0.98] transition-transform"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="w-1/2 min-h-tap bg-forest text-white font-black text-scale-xs rounded-xl active:scale-[0.98] transition-transform"
            >
              Vào quản trị
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------- MAIN: 4 TABS ----------
  return (
    <div className="flex flex-col flex-grow relative pb-20">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="min-h-tap text-scale-2xs font-bold text-gray-500 hover:text-forest-dark flex items-center gap-1"
          >
            ← Về màn hình của con
          </button>
          <span className="text-scale-2xs font-black text-amber">🔑 QUẢN TRỊ</span>
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-4 gap-1.5 bg-sand-light border border-sand rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative min-h-tap rounded-lg text-scale-2xs font-black transition-colors ${
                activeTab === tab.id ? "bg-white text-forest-dark shadow-sm" : "text-gray-500 hover:text-forest-dark"
              }`}
            >
              {tab.label}
              {tab.id === "approval" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active tab */}
        {activeTab === "approval" && <ApprovalTab />}
        {activeTab === "week" && <WeekTab />}
        {activeTab === "manage" && <ManageTab />}
        {activeTab === "system" && <SystemTab />}
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
        <button onClick={() => router.push("/dashboard")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">🌳</span>
          <span className="text-scale-2xs font-extrabold">Phiêu Lưu</span>
        </button>
        <button onClick={() => router.push("/rewards")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">🛒</span>
          <span className="text-scale-2xs font-extrabold">Đổi Quà</span>
        </button>
        <button onClick={() => router.push("/mining")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">⛏️</span>
          <span className="text-scale-2xs font-extrabold">Đào Mỏ</span>
        </button>
        <button onClick={() => {}} className="min-h-tap flex flex-col items-center p-2 text-forest-medium space-y-0.5">
          <span className="text-xl">🔑</span>
          <span className="text-scale-2xs font-black">Bố Mẹ</span>
        </button>
      </div>
    </div>
  );
}
