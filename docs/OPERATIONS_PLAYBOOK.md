# ⚙️ VẬN HÀNH TỰ CHẠY — TRƯỚC · TRONG · SAU BÁN (Level Up Kids)

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 03/07/2026
> **Đề bài founder:** nghiên cứu cách app quốc tế top vận hành, để founder có **sự tự do** — bộ máy chạy trước/trong/sau bán mà không xích người vào việc tay.
> **Nguồn:** research web 07/2026 (ProductLed, Duolingo case studies, subscription-ops guides). ⚠️ *Khung tổng hợp, số của bên bán là marketing — cần tự kiểm.*

---

## Nguyên tắc gốc (rút từ các app top): **Sản phẩm tự bán, tự onboard, tự giữ**

"Sự tự do" = **số việc-tay tiến về 0**. Cách top-tier đạt được:
- **Product-Led Growth:** sản phẩm là kênh bán chính — user tự đăng ký, tự trải nghiệm giá trị, tự trả tiền, **không cần đội sales**. Duolingo: **~80% user đến organic** nhờ viral loop + product tự marketing.
- **Retention > Acquisition (fix leaky bucket TRƯỚC):** Duolingo phát hiện vấn đề không phải thiếu user mà là **churn** → sửa giữ chân trước, DAU tăng 4.5x. Giữ 1 khách rẻ hơn kiếm mới 5–25 lần.
- **Automate onboarding + thu-hồi-thanh-toán TRƯỚC:** 2 việc này chặn cửa churn cao nhất (30 ngày đầu + thanh toán hụt) với ít công nhất.
- **Cảnh báo #1 của solo founder theo khảo sát: KHÔNG phải chiến lược sai — mà là BURNOUT.** Tự do = kỷ luật "không tự thêm việc tay", coi tự-động-hoá như hạ tầng bắt buộc.

---

## TRƯỚC bán — Acquisition tự chạy
**Top apps:** product markets itself; content/SEO/docs để tự tìm thấy (organic); viral/sharing loop nhúng sẵn trong sản phẩm; ASO trên store. *"Viral launch là huyền thoại — tăng trưởng đến từ grind liên tục, vài thứ mang lại phần lớn kết quả."*

| Việc | LUK đã có | Còn thiếu (làm 1 lần chạy mãi) |
|---|---|---|
| Viral loop | Thẻ Khoe Con + referral 2 chiều | Kích hoạt (chạy migration 0009) + gắn nút vào khoảnh khắc tốt nghiệp 🎓 |
| SEO organic | — | Landing SSR + 12 trang lộ trình ("dạy con 8 tuổi tự soạn cặp") = 12 cửa tự tìm thấy |
| Content 1-lần-dùng-mãi | — | "Nhật ký 3 tuần" cho hội nhóm phụ huynh; PR "bố Việt tự làm app" |
| Free tier làm phễu | demo→paid | Free tier THẬT (1 con + 1 lộ trình) nuôi referral + trường học |
| ASO | — | Khi lên App Store/Play (TWA) |

## TRONG bán — Conversion self-serve, ZERO sales
**Top apps:** freemium/free-trial + self-serve checkout + upsell trong sản phẩm (PQL); không người bán; **activation "aha" ngay session đầu** (dưới 30% đạt aha = sản phẩm/onboarding hỏng).

- ✅ **LUK đã đạt phần khó:** SePay webhook **tự kích hoạt premium**, không ai xử đơn tay — đây chính là "self-serve checkout" của app.
- Cần: đo **activation rate** (% người mua đạt "aha" = con tick việc đầu / duyệt điểm đầu trong 24–48h). Lộ Trình chính là bộ tạo-aha (bấm 1 nút có việc ngay).
- Freedom: không thêm bước tay nào ở khâu bán.

## SAU bán — Onboarding + Retention + Support tự động (nơi cần nhất)
**Top apps:** onboarding tự động (30 ngày đầu rủi ro nhất) · self-serve help center (đẩy lùi ticket) · **dunning** (thu hồi thanh toán hụt — ROI cao nhất) · cancellation-flow giữ chân · health scoring (phát hiện sắp bỏ trước khi họ tự bỏ).

| Lớp | Top apps | LUK đã có / cần |
|---|---|---|
| Onboarding | flow tự động, activation checklist | ✅ Lộ Trình + welcome email (vừa dựng) |
| Support tự phục vụ | help center, in-app guide → đẩy lùi ~70% ticket | ⬜ **In-app FAQ** (kích hoạt/PIN/đổi máy/SePay) + 1 kênh Zalo |
| Lifecycle nhắc nhở | lifecycle email theo hành vi | ✅ welcome / day-3 / week-4 (vừa dựng) |
| **"Dunning" = nhắc GIA HẠN** | thu hồi thanh toán hụt | 🔴 **THIẾU — điểm đau lớn nhất, xem dưới** |
| Giữ chân khi bỏ | cancellation offer / win-back | ⬜ email win-back khi lapsed |
| Health signal | Green/Yellow/Red, chủ động cứu Red | ⚠️ đã có tín hiệu week-4 (dùng `events`/`history`); mở rộng thành health score |
| Gamification giữ chân | streak/league/badge nhiều tầng | ✅ streak/pet/boss/mùa/tốt nghiệp |

### 🔴 Insight quan trọng nhất cho LUK: **"Dunning" của mô hình 199k/năm-SePay**
Các app thẻ tín dụng **tự động gia hạn** — khách không làm gì vẫn bị charge. **LUK thu qua SePay chuyển khoản tay → KHÔNG có auto-renew.** Nghĩa là: đến ngày 365, **100% khách phải CHỦ ĐỘNG chuyển khoản lại**. Không có chuỗi nhắc gia hạn → **phần lớn sẽ churn chỉ vì QUÊN**, dù vẫn thích app. Đây là churn "involuntary" khổng lồ mà mô hình trả-tay tạo ra — và là **đòn bẩy retention tự động số 1** còn thiếu.
→ **Giải:** thêm 1 `kind` vào lifecycle-email vừa dựng: nhắc gia hạn ở **ngày 350 / 360 / 364** (dựa `premium_until`) + QR SePay sẵn trong email. Hạ tầng đã có, chỉ thêm trigger + template.

---

## Ưu tiên thực thi (theo research: "automate onboarding + dunning first")
1. **Renewal reminder (dunning cho SePay)** — 🔴 cao nhất, chống churn cuối kỳ. Thêm vào lifecycle-email đã dựng.
2. **In-app FAQ + 1 kênh Zalo** — đẩy lùi ticket cơ bản, rẻ nhất.
3. **Verify retention tuần 4 (fix leaky bucket)** — Duolingo dạy: đừng đổ tiền acquisition khi bucket còn rò. LUK **chưa đo** retention thật → beta 10 gia đình trước khi scale.
4. **Free tier + 12 trang SEO** — acquisition tự chạy sau khi bucket kín.
5. **Win-back + health score** — khi có đủ dữ liệu.

## Đo lường (số nhân-quả, bỏ số phù phiếm)
Activation rate (aha session đầu) · **% gia đình hoạt động tuần 4** (số bắc cầu) · renewal rate cuối kỳ · CAC payback · lý do churn (phỏng vấn nhà bỏ). *Bỏ: follower, impression, lượt xem — tương quan chứ không nhân quả.*

---

*Tài liệu do Claude Code (Opus 4.8) soạn 03/07/2026; khung tổng hợp từ research công khai, chưa kiểm chứng trên dữ liệu LUK thật. Liên quan [[POST_SALES_SUPPORT.md]], [[DANH_GIA_DOC_LAP_PMF.md]], [[KE_HOACH_B_LITE_10K.md]].*
