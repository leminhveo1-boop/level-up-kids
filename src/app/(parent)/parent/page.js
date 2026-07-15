"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import ApprovalTab from "@/features/parent/components/ApprovalTab";
import WeekTab from "@/features/parent/components/WeekTab";
import ManageTab from "@/features/parent/components/ManageTab";
import SystemTab from "@/features/parent/components/SystemTab";
import BottomNav from "@/ui/BottomNav";
import { KeyRound, CheckCircle2, BarChart3, Target, Settings } from "lucide-react";

const TABS = [
  { id: "approval", label: "Duyệt", Icon: CheckCircle2 },
  { id: "week", label: "Tuần", Icon: BarChart3 },
  { id: "manage", label: "Việc & Quà", Icon: Target },
  { id: "system", label: "Hệ thống", Icon: Settings },
];

/**
 * Parent room — adult-mode UI (UX_AUDIT Phần 5): daily work ≤2 taps in Tab Duyệt,
 * one-time setup tucked into Hệ thống. Deliberately denser & calmer than kid UI.
 */
export default function ParentDashboard() {
  const router = useRouter();
  const { isLoaded, charName, parentPin, pendingCount } = useGame();
  const { isCloudChild, verifyParentPin, resetParentPin } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("approval");

  // Forgot-PIN reset: re-prove the account password, then set a new PIN. Only
  // offered for cloud children — local/offline children have no account to check.
  const [isResetting, setIsResetting] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");

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

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    // Cloud children verify server-side (RPC never leaks the hash to the client);
    // local/offline children have no server to call, so they keep the old
    // client-side comparison (approved offline fallback).
    if (isCloudChild) {
      setIsVerifying(true);
      const result = await verifyParentPin(pinEntry);
      setIsVerifying(false);
      if (result.success) {
        setIsAuthenticated(true);
        setPinError("");
      } else {
        setPinError("Mã PIN không khớp! Vui lòng thử lại.");
      }
      return;
    }
    if (pinEntry === parentPin) {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Mã PIN không khớp! Vui lòng thử lại.");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    if (resetNewPin.length < 4) {
      setResetError("Mã PIN mới phải từ 4 số trở lên.");
      return;
    }
    setResetBusy(true);
    const result = await resetParentPin(resetPassword, resetNewPin);
    setResetBusy(false);
    if (result.success) {
      // Account password proven + new PIN set — let them straight in.
      setResetPassword("");
      setResetNewPin("");
      setIsResetting(false);
      setPinError("");
      setIsAuthenticated(true);
    } else {
      setResetError("Mật khẩu tài khoản không đúng (hoặc đang tạm khoá do thử sai nhiều lần). Thử lại sau ít phút.");
    }
  };

  // ---------- PIN GATE ----------
  if (!isAuthenticated) {
    // Forgot-PIN reset form (cloud children only).
    if (isResetting) {
      return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
          <form
            onSubmit={handleResetSubmit}
            className="bg-white border-2 border-sand rounded-2xl p-6 shadow-lg w-full max-w-sm space-y-4"
          >
            <div className="w-14 h-14 bg-sand-light rounded-full border border-sand mx-auto flex items-center justify-center">
              <KeyRound size={24} className="text-forest-dark" />
            </div>
            <div className="space-y-1">
              <h2 className="text-scale-lg font-black text-forest-dark">Đặt lại mã PIN</h2>
              <p className="text-scale-2xs text-gray-500">
                Nhập mật khẩu tài khoản để xác minh là bố mẹ, rồi đặt mã PIN mới.
              </p>
            </div>

            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Mật khẩu tài khoản..."
              autoComplete="current-password"
              className="w-full min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest transition-colors"
              autoFocus
            />
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={resetNewPin}
              onChange={(e) => setResetNewPin(e.target.value)}
              placeholder="Mã PIN mới (4-6 số)..."
              className="w-full min-h-tap text-center bg-sand-light border border-sand rounded-xl text-scale-lg font-black text-forest-dark focus:outline-none focus:border-forest transition-colors"
            />
            {resetError && <p className="text-scale-2xs font-bold text-terracotta">⚠️ {resetError}</p>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetting(false);
                  setResetError("");
                  setResetPassword("");
                  setResetNewPin("");
                }}
                className="w-1/2 min-h-tap bg-white text-gray-500 font-bold text-scale-xs rounded-xl border border-sand active:scale-[0.98] transition-transform"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={resetBusy}
                className="w-1/2 min-h-tap bg-forest text-white font-black text-scale-xs rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {resetBusy ? "Đang xác minh..." : "Đặt PIN mới"}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <form
          onSubmit={handlePinSubmit}
          className="bg-white border-2 border-sand rounded-2xl p-6 shadow-lg w-full max-w-sm space-y-4"
        >
          <div className="w-14 h-14 bg-sand-light rounded-full border border-sand mx-auto flex items-center justify-center">
            <KeyRound size={24} className="text-forest-dark" />
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
              disabled={isVerifying}
              className="w-1/2 min-h-tap bg-forest text-white font-black text-scale-xs rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {isVerifying ? "Đang kiểm tra..." : "Vào quản trị"}
            </button>
          </div>

          {isCloudChild && (
            <button
              type="button"
              onClick={() => {
                setIsResetting(true);
                setPinError("");
              }}
              className="text-scale-2xs font-bold text-gray-400 underline underline-offset-2 hover:text-forest transition-colors"
            >
              Quên mã PIN?
            </button>
          )}
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
          <span className="text-scale-2xs font-black text-amber flex items-center gap-1">
            <KeyRound size={14} /> Quản trị
          </span>
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-4 gap-1.5 bg-sand-light border border-sand rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative min-h-tap rounded-lg text-scale-2xs font-black transition-colors flex flex-col items-center justify-center gap-0.5 ${
                activeTab === tab.id ? "bg-white text-forest-dark shadow-sm" : "text-gray-500 hover:text-forest-dark"
              }`}
            >
              <tab.Icon size={16} />
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

      <BottomNav active="parent" wide />
    </div>
  );
}
