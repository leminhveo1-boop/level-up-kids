# 🤝 SUPPORT SAU BÁN — GÓC QUẢN TRỊ (Level Up Kids)

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 03/07/2026
> **Câu hỏi founder:** sau khi khách mua (199k/năm qua SePay), *mình support họ như thế nào?*
> ⚠️ *Phân tích chiến lược/vận hành, chưa qua kiểm chứng — là khung tư duy để founder quyết.*

---

## Luận điểm gốc: **Support = Retention, KHÔNG phải Helpdesk**

Với app thói quen, khách hiếm khi "kêu" — họ **lặng lẽ bỏ**. Vòng đời của app này (demo→paid, giữ chân là mô hình tiền) nghĩa là: hỗ trợ tốt nhất không phải trả lời nhanh khi họ hỏi, mà là **chủ động cứu họ trước khi họ churn**. Người rời bỏ đầu tiên là **bố mẹ** (đã phân tích ở [DANH_GIA_DOC_LAP_PMF.md](DANH_GIA_DOC_LAP_PMF.md)) → support phải nhắm vào bố mẹ.

## 1. Hai người cần support, hai nhu cầu khác nhau
- **Bố mẹ (người trả tiền):** kỹ thuật (kích hoạt/SePay, quên PIN, đổi máy) · sản phẩm (set gì, cấu hình) · **thành công** (con không chịu chơi, mình quá tải) · cảm xúc (nghi ngờ có đáng tiền).
- **Trẻ (người dùng):** không tự liên hệ → support **gián tiếp** qua bố mẹ + qua chính game (con chán là tín hiệu, không phải ticket).

## 2. Bản đồ nỗi đau sau mua (theo vòng đời) → đây là nơi đặt support
| Mốc | Nỗi đau | Support cần |
|---|---|---|
| **Ngày 0 — kích hoạt** | Chuyển khoản SePay xong chưa unlock → hoảng, đòi refund | Xác nhận **tức thì** + hướng dẫn kích hoạt cực rõ + SLA refund |
| **Tuần 1 — onboarding** | Không biết set gì; con chưa hào hứng | Onboarding chủ động (Lộ Trình đã lo phần "set gì") + welcome |
| **Tuần 2–4 — ĐIỂM RƠI** | Con chán / bố mẹ quên duyệt / bố mẹ mệt → **churn ở đây** | **Re-engage chủ động** (đòn bẩy lớn nhất) |
| **Sự cố kỹ thuật** | Đổi điện thoại mất tiến trình (localStorage), quên PIN, teen đổi mode | FAQ self-serve + vá gốc rễ data-safety |

## 3. Hạ tầng support đề xuất (solo founder, chi phí thấp)

**A. Reactive — khi họ kêu (chặn ticket cơ bản):**
- **1 kênh duy nhất:** Zalo OA (hoặc Zalo cá nhân/nhóm) — phụ huynh VN sống ở Zalo/Facebook, không phải email/ticket portal.
- **In-app "Trợ giúp":** FAQ 5–7 câu nóng nhất (kích hoạt SePay, quên PIN, đổi máy, teen mode, đổi quà). Chặn ~70% ticket lặp.
- **Email tự động** làm biên nhận + SLA cam kết (vd trả trong 24h).

**B. Proactive — đòn bẩy retention lớn nhất (hạ tầng ĐÃ CÓ, chỉ thêm trigger):**
App đã có `weekly-email` edge function + bảng `events` + push + báo cáo tuần. Thêm **lifecycle triggers**:
- **Welcome (ngày 0):** xác nhận đã kích hoạt + 3 bước bắt đầu (chọn Lộ Trình → giao việc → tối duyệt 30s).
- **Day-3 nudge:** nếu **chưa tick việc nào** → "cần giúp set không? bấm đây".
- **Week-4 re-engage:** nếu hoạt động tụt (đo bằng `events`) → email "78% nhà cũng chững ở tuần 2 — đây là cách vượt" + 1 lời khuyên. Đây chính là **"AI coach nhẹ"** của Phương án B, mặc áo support.
- Đây là chỗ biến weekly-email từ "báo cáo" thành "cứu retention".

**C. Community:** nhóm Facebook/Zalo phụ huynh → vừa support ngang hàng (họ tự trả lời nhau), vừa là kênh **referral + content** miễn phí.

**D. Vá gốc rễ để giảm ticket:** lỗ hổng **đổi máy mất tiến trình** (nếu còn phụ thuộc localStorage cho paid user) — sửa 1 lần đỡ vô số ticket "mất dữ liệu con". Kiểm tra cloud-sync có bật đủ cho mọi paid child chưa.

## 4. Đo lường (support = đo retention)
- Ticket theo loại (kích hoạt / kỹ thuật / success / refund) — loại nào nhiều thì vá gốc.
- **% gia đình còn hoạt động tuần 4** (số bắc cầu quan trọng nhất).
- Thời gian phản hồi trung bình.
- **Phỏng vấn nhà bỏ cuộc:** bỏ vì con chán hay vì bố mẹ mệt? (quyết định hướng sản phẩm).

## 5. Ưu tiên cho solo founder (làm gì TRƯỚC)
1. **In-app FAQ + 1 kênh Zalo** — rẻ nhất, chặn ticket cơ bản ngay.
2. **Lifecycle email tự động** (welcome + day-3 + week-4) — tận dụng `weekly-email` sẵn có; đây là retention lever, không chỉ support.
3. **Vá data-safety đổi máy** — cắt loại ticket đau nhất tận gốc.
4. **Nhóm phụ huynh** — support ngang hàng + referral.

*Điểm mấu chốt: hạ tầng cho support chủ động (email lifecycle, events, push, parent room) hầu như ĐÃ dựng sẵn trong app — thứ còn thiếu chỉ là vài trigger theo vòng đời + 1 kênh Zalo + FAQ. Không cần đội support; cần automation đúng chỗ.*

---

*Tài liệu do Claude Code (Opus 4.8) soạn 03/07/2026; khung phân tích, chưa kiểm chứng người dùng thật.*
