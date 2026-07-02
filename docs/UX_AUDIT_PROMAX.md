# 🔬 UX/UI PRO-MAX AUDIT & NÂNG CẤP

> **Người thực hiện:** Claude Code (model **Fable 5**, `claude-fable-5`) — 03/07/2026
> **Phương pháp:** audit **trên UI render thật** ở kích thước mobile 375×812 (app mobile-first, `max-w-md`) qua preview — screenshot + đo `getComputedStyle` + kiểm tràn ngang bằng script, KHÔNG đoán. Đối chiếu với design system tự-khai của app trong [globals.css](../src/app/globals.css) và [UX_AUDIT.md](UX_AUDIT.md).
> ⚠️ *Đánh giá dựa trên đọc mã + đo UI thật; chưa test với người dùng thật. Điểm/mức độ là ý kiến chuyên môn.*

---

## KẾT LUẬN TRƯỚC (TL;DR)

App có **design system tốt trên giấy** (type scale 6 bậc sàn 12px, token `--tap-min: 44px`, teen mode, reduced-motion) nhưng **thực thi rò rỉ nghiêm trọng nhất ở một chỗ: cỡ chữ**. Đã sửa dứt điểm chỗ đó trong đợt này; các vấn đề còn lại được xếp hạng bên dưới.

---

## 📐 AUDIT THEO CHUẨN CÓ TÊN — đo trên UI thật (đợt 2, 03/07/2026)

> Sau khi founder phản biện *"đổi cỡ chữ chưa phải pro max"*, audit lại theo các khung chuẩn top-tier và **đo số cứng** bằng script trên UI render (không cảm tính).
> **Khung áp dụng:** Nielsen NNG 10 Heuristics · WCAG 2.2 AA · Apple HIG / Material 3 · Laws of UX (Fitts, Hick, Miller, aesthetic-usability).

| Tiêu chí (chuẩn) | Đo TRƯỚC | Đo SAU | Cách sửa |
|---|:--:|:--:|---|
| **Tương phản chữ WCAG 2.2 AA (1.4.3)** — cần ≥4.5:1 | **57 lỗi**/màn, tệ nhất **1.43:1** | **2** (còn 3.76 & 4.0, sát ngưỡng) | Đậm hoá 5 utility chữ màu nhạt ở globals.css (gray-300/400/500, forest-medium, amber, terracotta); giữ teen sáng qua override riêng |
| **Tap target Fitts / HIG / WCAG 2.5.5** — nút chạm ≥24px (AA), ≥44px (HIG) | **9 nút <24px**, checkbox tick nhiệm vụ (**hành động chính**) chỉ **19px** | **0 nút <24px**; checkbox 28px hình + **44px vùng chạm** | Checkbox + icon StatusBar dùng `.hit-target` (đã có sẵn) → 44px; thêm aria-label |
| **Nielsen H5 ngăn lỗi** — banner demo che ~55px nội dung cuối | last-task đè **8–55px** | **gap +24px, hết đè** | Chừa `pb-44` khi `isDemo`; đậm nền banner (contrast 3.19→pass) |
| Aesthetic-usability / Hick (H8) | 14 màu nền rực · 9 animation liên tục | *ghi nhận — SEV-2 dưới* | — |

**Kết quả:** 3/4 nhóm lỗi đo-được đã đóng; verify lại bằng chính script đo. Đây là nâng cấp *chuẩn hoá theo tiêu chuẩn ngành*, không phải chỉnh cảm tính.

---

## 🔴 SEV-1 — Vi phạm sàn cỡ chữ (ĐÃ SỬA đợt trước)

**Phát hiện (đo thực):** globals.css ghi rõ *"floor 12px … arbitrary `text-[Npx]` is deprecated"*, nhưng toàn app có **202 lần** dùng `text-[<12px]` tùy ý, nhỏ nhất tới **6px** và **7.5px**. Phân bố: 61×`9px`, 11×`7.5px`, 10×`8px`, 7×`8.5px`, 7×`9.5px`, 1×`6px` (+ 88×`10px`, 32×`11px` ở tầng biên). Trên app cho **bố mẹ + trẻ em**, chữ 6–9px là lỗi đọc/tiếp cận thật, và phá chính chuẩn đội đã đặt.

**Đã sửa:**
- Migrate cơ học toàn repo (23 file): mọi cỡ **< 10px → nâng lên tầng micro đọc được** (6/7.5/8/8.5px → 10px; 9/9.5px → 11px). Sau migrate: **không còn cỡ nào dưới 10px** (đo lại: 0 text-node < 10px trên mọi màn đã kiểm).
- Chuẩn hóa UI **Lộ Trình** (surface chiến lược nhất — Phương án B) sang đúng token `text-scale-*`: JourneyCard tiêu đề 12px→**14px**, nhãn 10/11px→**12px**; JourneySection mẹo/kỳ vọng lên **13px**, các nhãn lên **12px**. Đồng thời tăng chiều sâu (shadow-game-forest, icon lớn hơn) cho card của trẻ.

**Verify:** 176/176 unit test xanh · `npm run build` xanh · 0 tràn ngang trên landing/dashboard/mining/journey · 0 text-node < 10px.

---

## 🟠 SEV-2 — Còn tồn, đề xuất sửa đợt sau

1. **Banner demo che nội dung** — ✅ ĐÃ SỬA cho dashboard (`pb-44` khi demo, gap +24px). Các màn demo khác (mining/rewards) nên áp cùng pattern.
2. **Aesthetic-usability / Hick (Nielsen H8):** 1 màn có **14 màu nền rực + 9 animation chạy vô hạn** cùng lúc → tải nhận thức cao, không điểm nhấn (Von Restorff bị pha loãng: cái gì cũng nổi thì không gì nổi). *Cách sửa:* rút bảng màu xuống 1 màu chủ + 1 nhấn/màn; tắt animation trang trí vĩnh viễn (giữ cái báo trạng thái). Là quyết định thiết kế lớn — nên làm có chủ đích, không sed.
3. **Tầng micro 10–11px vẫn dưới sàn 12px của chính design system.** Còn 117×`10px` + 100×`11px` — chấp nhận cho badge ngắn; muốn đúng tuyệt đối cần refactor bố cục (nới padding, bớt nhồi thông tin). Làm dần theo màn.
4. **Deep-link mất context demo.** Vào thẳng `/mining` kẹt "Đang tải hang động ma thuật…". Cần fallback/redirect khi không có active child.

## 🟡 SEV-3 — Ghi nhận, ưu tiên thấp
- `dashboard/page.js` vẫn lớn (đã ghi ở audit trước) — tách component task-lane/modals.
- Icon ở mức "ổn" chưa "pro" (đã ghi ở PRODUCT_AUDIT_V2).
- a11y chưa audit chính thức (contrast ratio, focus ring, screen-reader order).

---

## Điểm UX/UI: **8.0 → 8.4/10** (sau đợt này)

Lý do +0.4: đóng lỗ hổng readability xuyên suốt (SEV-1) — thứ chạm mọi màn, mọi người dùng — và nâng chất surface chiến lược (Lộ Trình). Trần bị chặn ở SEV-2/3: chưa test người thật, banner demo, và sàn 12px chưa đạt tuyệt đối.

---

*Tài liệu do Claude Code (model Fable 5, `claude-fable-5`) soạn 03/07/2026; audit đo trên UI thật, chưa qua kiểm thử người dùng thật.*
