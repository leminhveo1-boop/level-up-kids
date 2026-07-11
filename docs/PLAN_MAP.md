# 🗺️ PLAN MAP — "App là chuyên gia" (bản theo dõi tiến độ)

> **Cập nhật:** 11/07/2026 · **Chủ trì:** Claude Code (Opus 4.8). File này là **tracker sống** — mỗi lần xong 1 atomic task thì tick + đổi trạng thái.
> **Ký hiệu:** ✅ xong+verify · 🔨 đang làm · ⏳ chưa làm · 🔒 bị chặn (chờ việc khác) · ⏸ chờ tín hiệu ngoài · 👤 việc của founder (thao tác Supabase/hạ tầng)
> **Nguyên tắc gốc:** app TỰ là chuyên gia (không thuê người) · base 7–13, đợt này 7–11 · giữ 199k không freemium. Chi tiết: [SPEC_APP_LA_CHUYEN_GIA.md](SPEC_APP_LA_CHUYEN_GIA.md).

---

## 📍 ĐANG Ở ĐÂU
Xong **B2 + B3** (chẩn đoán→kê lộ trình, thẻ Khoảnh khắc) — đều live + verify mắt. Đang **chờ phản hồi 10 thẻ từ khách** trước khi làm sâu tiếp. **PROD-1 bước 1 (SPEC luật cân liều) xong — chờ founder chốt con số fade-out trước khi implement.** B4/B5 chưa khởi công.

---

## 🧰 PHÂN CÔNG MODEL & CÔNG CỤ (giảm token Claude Code)

**Nguyên tắc gốc — "bộ não đắt viết đề bài + chấm bài; bàn tay rẻ gõ phần giữa":**
Claude Code (Opus) chỉ nên tiêu token ở **2 đầu có phán xét cao**: (a) viết SPEC + DoD + khung test, (b) VERIFY tính đúng/an toàn trước deploy. **Phần cơ học ở giữa** (sinh nội dung theo mẫu, wiring UI, i18n, tag, boilerplate, sửa lặp) → đẩy sang **Antigravity IDE/CLI** (quota riêng, không tốn token Claude) hoặc **Haiku** (tier rẻ trong Claude Code).

**Bảng tier (khớp [[model-selection-guidance]]):**
| Ký hiệu | Model/Công cụ | Dùng cho | Chi phí |
|---|---|---|---|
| 🔷 **AG** | **Antigravity IDE/CLI** (Gemini) | Bulk cơ học tách rời: sinh nội dung theo mẫu đã duyệt, boilerplate, test scaffold, sửa lặp nhiều file | **0 token Claude** |
| 🟢 **H** | Haiku 4.5 | Sửa vặt trong Claude Code khi cần context sẵn: i18n key, tag catalog, đổi text | Rẻ (Claude) |
| 🟡 **S** | Sonnet 5 | Code theo SPEC rõ ràng: implement logic/feature đã chốt đề bài | Trung (Claude) |
| 🔴 **O** | Opus 4.8 | Viết SPEC, kiến trúc, **audit an toàn/bảo mật**, thiết kế GIỌNG nội dung, VERIFY logic nhạy cảm | Đắt (Claude) |

**⚠️ KHÔNG được đẩy sang AG/Haiku:** verify an toàn nội dung (DEEP #3: cấm chẩn đoán/quy kết), audit bảo mật (SEC-1), quyết định kiến trúc/kinh tế lõi. Những chỗ này sai là hỏng thật → giữ ở 🔴.

**⚠️ Chi phí handoff:** tách task giữa 2 công cụ tốn công tái tạo ngữ cảnh → **chỉ đẩy việc BULK hoặc TÁCH RỜI**, không đẩy việc suy luận dính chặt. Việc nhỏ dính context thì làm luôn ở Claude, đừng cắt.

**▶️ Mở phiên mới chạy theo plan:** prompt bootstrap tự chứa ở [SESSION_BOOTSTRAP.md](SESSION_BOOTSTRAP.md) — dán vào Claude Code / gemini CLI / Antigravity. Lưu ý: Antigravity **không có CLI headless** (chỉ là IDE lái tay); đường script là **gemini CLI** (đã cài 0.37.1).

---

## ⏭️ CHUỖI THỰC THI THEO THỨ TỰ (kèm model mỗi bước)

| # | Bước | Model/Công cụ | Vì sao tier này |
|---|---|---|---|
| 1 | **PROD-1** design luật cân liều thưởng | 🔴 O | đụng kinh tế lõi + sensor Đọc vị — phán xét cao |
| 2 | **PROD-1** implement + test từ spec | 🟡 S | đề bài đã rõ → code thẳng |
| 3 | **PROD-1** verify không đảo động lực nội tại | 🔴 O | nhạy cảm, không giao máy rẻ |
| 4 | **OPS-1/2/3** deploy email + referral | 👤 Founder | thao tác Supabase |
| 5 | **WAIT-1** → nhân bộ thẻ 3–5/painpoint | 🔷 **AG** | giọng đã duyệt (10 thẻ) → thuần nhân bản theo mẫu, **đẩy hết sang Antigravity** |
| 6 | **EXP-3 (B4)** viết SPEC lát Đọc vị + rào an toàn | 🔴 O | ràng buộc DEEP #3, stakes cao |
| 7 | **EXP-3 (B4)** implement rule engine + test | 🟡 S / 🔷 AG | spec chặt → Sonnet, hoặc AG nếu quá cơ học |
| 8 | **EXP-3 (B4)** verify an toàn (cấm chẩn đoán) | 🔴 O | **bắt buộc Claude**, không giao máy rẻ |
| 9 | **EXP-4 (B5)** SPEC định dạng share | 🔴 O | STEPPS + cấm lộ định danh — phán xét |
| 10 | **EXP-4 (B5)** implement nút + referral wiring | 🟡 S / 🔷 AG | wiring rõ → tier rẻ |

---

## A. XÂY "APP LÀ CHUYÊN GIA" (lõi sản phẩm)

| ID | Task | Trạng thái | Model/Công cụ | Phụ thuộc | DoD (định nghĩa hoàn thành) |
|---|---|---|---|---|---|
| **EXP-1** (B2) | Chẩn đoán painpoint → kê lộ trình riêng | ✅ | — | — | intake ~30s + `recommendJourneys()` + lưu `parentConfig.intake`; live + verify mắt |
| **EXP-2** (B3) | 10 thẻ Khoảnh khắc trong tab Duyệt + nút đo phản hồi | ✅ | — | — | `moments.js` + `MomentCard` + analytics `moment_feedback`; live + verify mắt |
| **EXP-EX** | Khối niềm tin thanh toán (không lưu thẻ / không tự trừ tiền) | ✅ | — | — | premium + landing; live + verify mắt (từ report persona) |
| **EXP-2b** | Nhân bộ thẻ 3–5/painpoint (sau phản hồi) | 🔒 | 🔷 **AG** | WAIT-1 | giọng đã duyệt → thuần nhân theo mẫu; **đẩy sang Antigravity** (0 token Claude); Claude chỉ soát 1 lượt an toàn |
| **EXP-3** (B4) | Lát "Đọc vị con" rule-based trong weekly-email | 🔒 | 🔴spec→🟡impl→🔴verify | OPS-1 (email deploy) + PROD-1 (sensor sạch) | 1 insight/tuần: quy luật + cách đọc + gợi ý; **cấm chẩn đoán/quy kết thao túng** (DEEP #3); test giọng với 5 nhà |
| **EXP-4** (B5) | Nút chia sẻ 3 mạch viral (đồng cảnh ngộ / nỗ lực / "app hiểu con") | 🔒 | 🔴spec→🟡/🔷impl | EXP-2 có phản hồi tốt + WAIT-1 | định dạng share = **khoảnh khắc việc-thật**, KHÔNG điểm/định danh (DEEP #4 + report persona); referral gắn vào khoảnh khắc |

## B. VẬN HÀNH — 👤 FOUNDER thao tác Supabase (code xong, chưa sống)

| ID | Task | Trạng thái | Phụ thuộc | DoD |
|---|---|---|---|---|
| **OPS-1** | Deploy hệ thống email: migration `0010_lifecycle` + `functions deploy lifecycle-email` + `weekly-email` | ⏳👤 | — | chạy trên Supabase; có log gửi thật |
| **OPS-2** | Verify Resend domain (nếu chưa) | ⏳👤 | — | email gửi được tới địa chỉ bất kỳ, không chỉ chủ tài khoản |
| **OPS-3** | Chạy migration `0009_referral` | ⏳👤 | — | cột `referral_code`/`referred_by` + bảng `referrals` tồn tại → nút giới thiệu premium sống |

## C. NỢ SẢN PHẨM (code, làm sau, có thứ tự)

| ID | Task | Trạng thái | Model/Công cụ | Ưu tiên | DoD |
|---|---|---|---|---|---|
| **PROD-1** | Cân liều thưởng — tránh dạy con "làm vì thưởng" + không nhiễu sensor Đọc vị | 🔨 spec ✅ (chờ founder chốt số → impl) | 🔴spec→🟡impl→🔴verify | **Cao — trước B4** | rà cơ chế điểm/thưởng; đặt trần/tần suất; test không đảo ngược động lực nội tại (thẻ #10 + DEEP #3 + report persona). **Bước 1 xong:** [SPEC_PROD1_CAN_LIEU_THUONG.md](SPEC_PROD1_CAN_LIEU_THUONG.md) — luật fade-out theo `habitStreak` (KHÔNG trần cứng: vector farm hẹp); 3 câu hỏi con số chờ chốt |
| **PROD-2** | 12–13 checklist người lớn (đảo cơ chế: tự đặt/tự tick, bỏ escrow) | ⏳ | 🔴spec→🟡/🔷impl | Sau khi 7–11 ổn | giao diện riêng theo DEEP #1; A/B giữ chân vs hero-journey |
| **PROD-3** | Value Gap — quà/việc đề xuất đúng tuổi, danh mục việc theo painpoint | ⏳ | 🔷 **AG** (nội dung theo mẫu) | Trung bình | catalog việc phủ 10 painpoint × 3 lát tuổi 7–11 |
| **PROD-4** | Phòng bố mẹ tab Tuần còn dày ("ngộp") | ⏳ | 🟡 S / 🔷 AG | Thấp | progressive disclosure; giảm chữ theo quân luật parent monochrome |

## D. BẢO MẬT — chốt hoãn tới đợt audit trước launch

| ID | Task | Trạng thái | Model/Công cụ | DoD |
|---|---|---|---|---|
| **SEC-1** | Đợt audit bảo mật trước launch: fix 2 CVE `next`/`postcss` (lên Next 16 breaking) + rotate toàn bộ token/secret + rà RLS/webhook | ⏳ (hoãn có chủ đích) | 🔴 O (**không giao máy rẻ**) | 1 đợt gộp; KHÔNG nhắc lẻ tới lúc đó (quyết định founder) |

*Quét bảo mật hằng ngày (cron) vẫn chạy — chỉ báo khi có vấn đề MỚI. Hiện: sạch.*

## E. NGHIÊN CỨU CHIẾN LƯỢC — ✅ đóng

DEEP #1 (giai đoạn/cơ chế) · #2 (đóng gói chuyên gia) · #3 (hiểu con = attribution shift) · #4 (viral VN) · SPEC · đánh giá report persona. Là tài sản định hướng, không phải code.

## ⏸ CHỜ TÍN HIỆU NGOÀI (không phải nợ)

| ID | Chờ gì | Mở khoá gì |
|---|---|---|
| **WAIT-1** | Phản hồi 10 thẻ B3 từ khách (nút "Đúng con tôi/Chưa trúng" + founder hỏi trực tiếp Mom Test) | Nhân bộ thẻ 3–5/painpoint → làm B4/B5 đáng giá |

---

*Tracker do Claude Code (Fable 5) lập 04/07/2026. Cập nhật mỗi khi đổi trạng thái task. Liên quan [[SPEC_APP_LA_CHUYEN_GIA.md]], [[BUILD_PLAN_CHUYEN_GIA.md]], [[DANH_GIA_REPORT_PERSONA.md]].*
