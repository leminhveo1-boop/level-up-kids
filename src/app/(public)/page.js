"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { isLoaded, level } = useGame();
  const { authLoaded, cloudEnabled, user, activeChild, isPaid, isDemo } = useAuth();

  // Where should the primary CTA go?
  // Paid-only funnel: unauth → /auth; unpaid → /demo (showcase); paid → family/dashboard
  const primaryTarget =
    activeChild && !isDemo
      ? "/dashboard"
      : cloudEnabled && !user
      ? "/auth"
      : !isPaid
      ? "/demo"
      : "/family";

  if (!isLoaded || !authLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang tải thế giới phiêu lưu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-6 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[30%] bg-forest-light opacity-60 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[40%] bg-amber-light opacity-50 rounded-full blur-3xl -z-10"></div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow text-center my-auto space-y-6">
        {/* Cute Mascot SVG - Forest Knight Mascot */}
        <div className="w-40 h-40 animate-float relative flex items-center justify-center bg-forest-light border-4 border-forest rounded-full shadow-game-forest">
          <svg className="w-24 h-24 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7s0 6 8 10z" fill="#A7F3D0" />
            <circle cx="12" cy="11" r="3" fill="#D97706" />
            <path d="M12 2v20M2 12h20" stroke="#1B5E20" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          <span className="absolute bottom-[-10px] bg-amber text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-sand-light shadow">
            SUMMER V1
          </span>
        </div>

        {/* Branding & Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-forest tracking-tight uppercase leading-tight drop-shadow-sm">
            Level Up <span className="text-amber">Kids</span> <br />
            <span className="text-lg">Hành Trình Anh Hùng Nhí</span>
          </h1>
          <p className="text-sm font-medium text-forest-dark opacity-90 max-w-xs mx-auto">
            Biến quá trình phát triển bản thân ngoài đời thực thành một trò chơi phiêu lưu kỳ thú!
          </p>
        </div>

        {/* Feature Cards - Flat 3D game style */}
        <div className="grid grid-cols-2 gap-4 w-full pt-4">
          <div className="bg-white border-2 border-sand p-3.5 rounded-2xl shadow-game-flat flex flex-col items-center text-center space-y-1">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xs font-extrabold text-forest-dark uppercase">Nhận Nhiệm Vụ</h3>
            <p className="text-[10px] text-gray-500">Làm việc tốt ngoài đời thật để thăng tiến</p>
          </div>
          <div className="bg-white border-2 border-sand p-3.5 rounded-2xl shadow-game-flat flex flex-col items-center text-center space-y-1">
            <span className="text-2xl">🔥</span>
            <h3 className="text-xs font-extrabold text-forest-dark uppercase">Tích Lũy EXP</h3>
            <p className="text-[10px] text-gray-500">Tăng cấp Chiến Binh, rèn luyện 5 chỉ số</p>
          </div>
          <div className="bg-white border-2 border-sand p-3.5 rounded-2xl shadow-game-flat flex flex-col items-center text-center space-y-1">
            <span className="text-2xl">📺</span>
            <h3 className="text-xs font-extrabold text-forest-dark uppercase">Mở Khóa Quà</h3>
            <p className="text-[10px] text-gray-500">Đổi giờ chơi game & đặc quyền giải trí</p>
          </div>
          <div className="bg-white border-2 border-sand p-3.5 rounded-2xl shadow-game-flat flex flex-col items-center text-center space-y-1">
            <span className="text-2xl">👾</span>
            <h3 className="text-xs font-extrabold text-forest-dark uppercase">Diệt Boss Tuần</h3>
            <p className="text-[10px] text-gray-500">Vượt qua thói quen lười biếng hằng ngày</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-8 space-y-3 w-full pb-4">
        <button
          onClick={() => router.push(primaryTarget)}
          className="w-full bg-forest text-sand-light font-extrabold text-base py-4 px-6 rounded-2xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
        >
          {activeChild && !isDemo
            ? `TIẾP TỤC HÀNH TRÌNH (CẤP ${level}) 🌳`
            : primaryTarget === "/demo"
            ? "CHƠI THỬ NGAY — MIỄN PHÍ 🎮"
            : "BẮT ĐẦU PHIÊU LƯU 🗡️"}
        </button>

        {primaryTarget === "/demo" && (
          <>
            <button
              onClick={() => router.push("/premium")}
              className="w-full bg-amber text-white font-extrabold text-sm py-3 px-6 rounded-2xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              👑 MỞ KHÓA TRỌN BỘ — 199.000₫/NĂM
            </button>
            {/* Nỗi sợ #1 phụ huynh VN: bẫy auto-renew — LUK cấu trúc không thể dính, nói to ra */}
            <p className="text-[11px] font-bold text-gray-500 text-center">
              Không lưu thẻ · Không tự động trừ tiền — chuyển khoản 1 lần, hết hạn là ngừng
            </p>
          </>
        )}

        {activeChild && !isDemo && (
          <button
            onClick={() => router.push("/family")}
            className="w-full bg-sand-light text-forest font-bold text-xs py-2.5 px-4 rounded-xl border border-sand hover:bg-sand-dark transition-all"
          >
            👨‍👩‍👧‍👦 Đổi hồ sơ / Thêm anh hùng mới
          </button>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => router.push("/parent")}
            className="text-xs font-bold text-amber hover:underline uppercase tracking-wider"
          >
            🔑 DASHBOARD CHO BỐ MẸ
          </button>
        </div>
      </div>
    </div>
  );
}
