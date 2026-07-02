# 🔬 UX/UI PRO-MAX AUDIT & NÂNG CẤP

> **Người thực hiện:** Claude Code (model **Fable 5**, `claude-fable-5`) — 03/07/2026
> **Phương pháp:** audit **trên UI render thật** ở kích thước mobile 375×812 (app mobile-first, `max-w-md`) qua preview — screenshot + đo `getComputedStyle` + kiểm tràn ngang bằng script, KHÔNG đoán. Đối chiếu với design system tự-khai của app trong [globals.css](../src/app/globals.css) và [UX_AUDIT.md](UX_AUDIT.md).
> ⚠️ *Đánh giá dựa trên đọc mã + đo UI thật; chưa test với người dùng thật. Điểm/mức độ là ý kiến chuyên môn.*

---

## KẾT LUẬN TRƯỚC (TL;DR)

App có **design system tốt trên giấy** (type scale 6 bậc sàn 12px, token `--tap-min: 44px`, teen mode, reduced-motion) nhưng **thực thi rò rỉ nghiêm trọng nhất ở một chỗ: cỡ chữ**. Đã sửa dứt điểm chỗ đó trong đợt này; các vấn đề còn lại được xếp hạng bên dưới.

---

## 🔴 SEV-1 — Vi phạm sàn cỡ chữ (ĐÃ SỬA đợt này)

**Phát hiện (đo thực):** globals.css ghi rõ *"floor 12px … arbitrary `text-[Npx]` is deprecated"*, nhưng toàn app có **202 lần** dùng `text-[<12px]` tùy ý, nhỏ nhất tới **6px** và **7.5px**. Phân bố: 61×`9px`, 11×`7.5px`, 10×`8px`, 7×`8.5px`, 7×`9.5px`, 1×`6px` (+ 88×`10px`, 32×`11px` ở tầng biên). Trên app cho **bố mẹ + trẻ em**, chữ 6–9px là lỗi đọc/tiếp cận thật, và phá chính chuẩn đội đã đặt.

**Đã sửa:**
- Migrate cơ học toàn repo (23 file): mọi cỡ **< 10px → nâng lên tầng micro đọc được** (6/7.5/8/8.5px → 10px; 9/9.5px → 11px). Sau migrate: **không còn cỡ nào dưới 10px** (đo lại: 0 text-node < 10px trên mọi màn đã kiểm).
- Chuẩn hóa UI **Lộ Trình** (surface chiến lược nhất — Phương án B) sang đúng token `text-scale-*`: JourneyCard tiêu đề 12px→**14px**, nhãn 10/11px→**12px**; JourneySection mẹo/kỳ vọng lên **13px**, các nhãn lên **12px**. Đồng thời tăng chiều sâu (shadow-game-forest, icon lớn hơn) cho card của trẻ.

**Verify:** 176/176 unit test xanh · `npm run build` xanh · 0 tràn ngang trên landing/dashboard/mining/journey · 0 text-node < 10px.

---

## 🟠 SEV-2 — Còn tồn, đề xuất sửa đợt sau

1. **Banner paywall demo che nội dung.** `DemoBanner` là `fixed bottom-20`, đè một dải ~55px nội dung cuối ở MỌI màn demo (thấy rõ: banner đè lên card Cây Thế Giới / thanh Năng Lượng). Không ảnh hưởng người đã trả phí (họ không thấy banner), nhưng làm demo — thứ để BÁN — trông lỗi. *Cách sửa đề xuất:* khi `isDemo`, thêm class vào `body` và một rule global `padding-bottom` cho vùng cuộn (`overflow-y-auto`) để chừa chỗ cho banner; hoặc chuyển banner thành sticky trong luồng thay vì floating.
2. **Tầng micro 10–11px vẫn dưới sàn 12px của chính design system.** Đợt này chỉ nâng phần *quá nhỏ* (<10px) để tránh vỡ layout hàng loạt. Vẫn còn 117×`10px` + 100×`11px` — chấp nhận được cho badge/nhãn uppercase ngắn, nhưng nếu muốn *đúng chuẩn tuyệt đối* cần refactor bố cục (nới padding, bớt nhồi thông tin) để đưa body text lên 12px thật. Việc lớn, làm dần theo màn.
3. **Deep-link mất context demo.** Vào thẳng `/mining` (không qua `/demo`) kẹt vĩnh viễn ở "Đang tải hang động ma thuật…". Cần fallback/redirect khi không có active child.

## 🟡 SEV-3 — Ghi nhận, ưu tiên thấp
- `dashboard/page.js` vẫn lớn (đã ghi ở audit trước) — tách component task-lane/modals.
- Icon ở mức "ổn" chưa "pro" (đã ghi ở PRODUCT_AUDIT_V2).
- a11y chưa audit chính thức (contrast ratio, focus ring, screen-reader order).

---

## Điểm UX/UI: **8.0 → 8.4/10** (sau đợt này)

Lý do +0.4: đóng lỗ hổng readability xuyên suốt (SEV-1) — thứ chạm mọi màn, mọi người dùng — và nâng chất surface chiến lược (Lộ Trình). Trần bị chặn ở SEV-2/3: chưa test người thật, banner demo, và sàn 12px chưa đạt tuyệt đối.

---

*Tài liệu do Claude Code (model Fable 5, `claude-fable-5`) soạn 03/07/2026; audit đo trên UI thật, chưa qua kiểm thử người dùng thật.*
