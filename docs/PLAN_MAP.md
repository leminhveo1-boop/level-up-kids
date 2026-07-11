# 🗺️ PLAN MAP — "App là chuyên gia" (bản theo dõi tiến độ)

> **Cập nhật:** 04/07/2026 · **Chủ trì:** Claude Code (Fable 5). File này là **tracker sống** — mỗi lần xong 1 atomic task thì tick + đổi trạng thái.
> **Ký hiệu:** ✅ xong+verify · 🔨 đang làm · ⏳ chưa làm · 🔒 bị chặn (chờ việc khác) · ⏸ chờ tín hiệu ngoài · 👤 việc của founder (thao tác Supabase/hạ tầng)
> **Nguyên tắc gốc:** app TỰ là chuyên gia (không thuê người) · base 7–13, đợt này 7–11 · giữ 199k không freemium. Chi tiết: [SPEC_APP_LA_CHUYEN_GIA.md](SPEC_APP_LA_CHUYEN_GIA.md).

---

## 📍 ĐANG Ở ĐÂU
Xong **B2 + B3** (chẩn đoán→kê lộ trình, thẻ Khoảnh khắc) — đều live + verify mắt. Đang **chờ phản hồi 10 thẻ từ khách** trước khi làm sâu tiếp. B4/B5 chưa khởi công.

## ⏭️ 3 VIỆC KẾ TIẾP (thứ tự đề xuất)
1. **PROD-1** cân liều thưởng — chốt chặn hợp lý trước B4 (dọn sensor + sửa cảnh báo report persona).
2. **OPS-1/2/3** founder deploy email + referral trên Supabase — mở khoá B4 và làm referral sống.
3. **EXP-3 (B4)** lát "Đọc vị con" — sau khi PROD-1 xong + email đã deploy.

---

## A. XÂY "APP LÀ CHUYÊN GIA" (lõi sản phẩm)

| ID | Task | Trạng thái | Phụ thuộc | DoD (định nghĩa hoàn thành) |
|---|---|---|---|---|
| **EXP-1** (B2) | Chẩn đoán painpoint → kê lộ trình riêng | ✅ | — | intake ~30s + `recommendJourneys()` + lưu `parentConfig.intake`; live + verify mắt |
| **EXP-2** (B3) | 10 thẻ Khoảnh khắc trong tab Duyệt + nút đo phản hồi | ✅ | — | `moments.js` + `MomentCard` + analytics `moment_feedback`; live + verify mắt |
| **EXP-EX** | Khối niềm tin thanh toán (không lưu thẻ / không tự trừ tiền) | ✅ | — | premium + landing; live + verify mắt (từ report persona) |
| **EXP-3** (B4) | Lát "Đọc vị con" rule-based trong weekly-email | 🔒 | OPS-1 (email deploy) + PROD-1 (sensor sạch) | 1 insight/tuần: quy luật + cách đọc + gợi ý; **cấm chẩn đoán/quy kết thao túng** (DEEP #3); test giọng với 5 nhà |
| **EXP-4** (B5) | Nút chia sẻ 3 mạch viral (đồng cảnh ngộ / nỗ lực / "app hiểu con") | 🔒 | EXP-2 có phản hồi tốt + WAIT-1 | định dạng share = **khoảnh khắc việc-thật**, KHÔNG điểm/định danh (DEEP #4 + report persona); referral gắn vào khoảnh khắc |

## B. VẬN HÀNH — 👤 FOUNDER thao tác Supabase (code xong, chưa sống)

| ID | Task | Trạng thái | Phụ thuộc | DoD |
|---|---|---|---|---|
| **OPS-1** | Deploy hệ thống email: migration `0010_lifecycle` + `functions deploy lifecycle-email` + `weekly-email` | ⏳👤 | — | chạy trên Supabase; có log gửi thật |
| **OPS-2** | Verify Resend domain (nếu chưa) | ⏳👤 | — | email gửi được tới địa chỉ bất kỳ, không chỉ chủ tài khoản |
| **OPS-3** | Chạy migration `0009_referral` | ⏳👤 | — | cột `referral_code`/`referred_by` + bảng `referrals` tồn tại → nút giới thiệu premium sống |

## C. NỢ SẢN PHẨM (code, làm sau, có thứ tự)

| ID | Task | Trạng thái | Ưu tiên | DoD |
|---|---|---|---|---|
| **PROD-1** | Cân liều thưởng — tránh dạy con "làm vì thưởng" + không nhiễu sensor Đọc vị | ⏳ | **Cao — trước B4** | rà cơ chế điểm/thưởng; đặt trần/tần suất; test không đảo ngược động lực nội tại (thẻ #10 + DEEP #3 + report persona) |
| **PROD-2** | 12–13 checklist người lớn (đảo cơ chế: tự đặt/tự tick, bỏ escrow) | ⏳ | Sau khi 7–11 ổn | giao diện riêng theo DEEP #1; A/B giữ chân vs hero-journey |
| **PROD-3** | Value Gap — quà/việc đề xuất đúng tuổi, danh mục việc theo painpoint | ⏳ | Trung bình | catalog việc phủ 10 painpoint × 3 lát tuổi 7–11 |
| **PROD-4** | Phòng bố mẹ tab Tuần còn dày ("ngộp") | ⏳ | Thấp | progressive disclosure; giảm chữ theo quân luật parent monochrome |

## D. BẢO MẬT — chốt hoãn tới đợt audit trước launch

| ID | Task | Trạng thái | DoD |
|---|---|---|---|
| **SEC-1** | Đợt audit bảo mật trước launch: fix 2 CVE `next`/`postcss` (lên Next 16 breaking) + rotate toàn bộ token/secret + rà RLS/webhook | ⏳ (hoãn có chủ đích) | 1 đợt gộp; KHÔNG nhắc lẻ tới lúc đó (quyết định founder) |

*Quét bảo mật hằng ngày (cron) vẫn chạy — chỉ báo khi có vấn đề MỚI. Hiện: sạch.*

## E. NGHIÊN CỨU CHIẾN LƯỢC — ✅ đóng

DEEP #1 (giai đoạn/cơ chế) · #2 (đóng gói chuyên gia) · #3 (hiểu con = attribution shift) · #4 (viral VN) · SPEC · đánh giá report persona. Là tài sản định hướng, không phải code.

## ⏸ CHỜ TÍN HIỆU NGOÀI (không phải nợ)

| ID | Chờ gì | Mở khoá gì |
|---|---|---|
| **WAIT-1** | Phản hồi 10 thẻ B3 từ khách (nút "Đúng con tôi/Chưa trúng" + founder hỏi trực tiếp Mom Test) | Nhân bộ thẻ 3–5/painpoint → làm B4/B5 đáng giá |

---

*Tracker do Claude Code (Fable 5) lập 04/07/2026. Cập nhật mỗi khi đổi trạng thái task. Liên quan [[SPEC_APP_LA_CHUYEN_GIA.md]], [[BUILD_PLAN_CHUYEN_GIA.md]], [[DANH_GIA_REPORT_PERSONA.md]].*
