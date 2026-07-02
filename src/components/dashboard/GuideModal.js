"use client";

import React from "react";

/** 📜 Warrior handbook — static how-to-play guide for the child. */
export default function GuideModal({ onClose }) {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white border-4 border-forest rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative max-h-[85vh] overflow-y-auto">
        <div className="w-16 h-16 bg-forest-light rounded-full border-2 border-forest mx-auto flex items-center justify-center text-3xl shadow">
          📜
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">Cẩm Nang Chiến Binh Mùa Hè 📜</h3>
          <p className="text-[10px] text-gray-500">Bí kíp để thăng cấp và nhận những phần quà xịn nhất!</p>
        </div>

        <div className="text-left space-y-3.5 text-xs text-forest-dark font-medium bg-sand-light p-4 rounded-2xl border border-sand">
          <div className="space-y-1">
            <p className="font-black text-forest flex items-center gap-1 text-[11px]">
              🎯 1. Làm Nhiệm Vụ Hằng Ngày
            </p>
            <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
              Hoàn thành các nhiệm vụ bố mẹ giao để nhận **EXP thăng cấp**, **Điểm Tích Lũy ⭐** và **Tiền Vàng 🪙**.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-black text-amber-dark flex items-center gap-1 text-[11px]">
              🔥 2. Duy Trì Ngọn Lửa Streak
            </p>
            <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
              Hoàn thành từ **3 nhiệm vụ mỗi ngày** để duy trì ngọn lửa Streak 🔥. Streak càng cao, lượng Điểm ⭐ nhận được từ nhiệm vụ tiếp theo càng nhiều!
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-black text-terracotta flex items-center gap-1 text-[11px]">
              ⚡ 3. Điểm May Mắn (Lucky Multiplier)
            </p>
            <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
              Mỗi khi hoàn thành một nhiệm vụ, dũng sĩ có **15% cơ hội** kích hoạt **Điểm May Mắn ⚡** giúp nhân đôi lượng Điểm ⭐ nhận được!
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-black text-forest-dark flex items-center gap-1 text-[11px]">
              ⛏️ 4. Đào Mỏ & Đổi Quà
            </p>
            <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed space-y-1">
              • Hoàn thành việc tốt nạp **Năng Lượng ⚡**.<br />
              • Đập đá ở **Hang Đào Mỏ ⛏️** nhận **Hero Coin 🪙**.<br />
              • Dùng **Điểm ⭐** đổi thời gian chơi TV/game; dùng **Hero Coin 🪙** đổi quà thực tế lớn (kem, Lego)!
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-black text-clay flex items-center gap-1 text-[11px]">
              🐾 5. Ấp Trứng & Huấn Luyện Thú Cưỡi
            </p>
            <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
              • **Cách có vật phẩm:** Đập đá đào mỏ, nhờ bố mẹ tặng thưởng, hoặc chủ động **dùng Hero Coin 🪙 mua Trứng (Thường, Sói, Rồng), Thuốc phép & Combo Thức ăn** trong Cửa Hàng 🛒.<br />
              • **Ấp thú cưng:** Kết hợp Trứng & Thuốc ấp phép để nở ra Fox, Cat, Sói, Rồng 🦊.<br />
              • **Huấn luyện & Ấn Pháp:** Nuôi pet bằng Thức ăn đạt 100% thân mật sẽ tiến hóa thành **Thú Cưỡi khổng lồ 🦖**, giúp tăng **+10% Năng lượng ⚡** khi làm nhiệm vụ ngày và **+5% tỷ lệ nổ Cú Đập Sức Mạnh 🔥** khi đào mỏ!
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-black text-sky flex items-center gap-1 text-[11px]">
              🕊️ 6. Bồ Câu Nhận Thư Động Viên
            </p>
            <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
              • Mỗi ngày bố mẹ sẽ gửi những lời chúc, lời nhắn nhủ viết tay yêu thương từ Phòng Quản Trị.<br />
              • Nhấp vào chú chim bồ câu 🕊️ bay lượn ở góc màn hình để mở thư động viên của bố mẹ và nhận niềm vui bất ngờ nhé!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-forest text-sand-light font-black text-xs py-3 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
        >
          CON ĐÃ HIỂU, LÊN ĐƯỜNG THÔI! 🚀
        </button>
      </div>
    </div>
  );
}
