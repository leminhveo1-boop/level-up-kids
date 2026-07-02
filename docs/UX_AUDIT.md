# 🎨 AUDIT UX/UI TOÀN DIỆN & KIẾN TRÚC GIAO DIỆN THEO NHÓM TUỔI — Level Up Kids

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 02/07/2026
> **Phương pháp:** Đọc toàn bộ UI code 8 màn hình + smoke test trên preview 375px + đối chiếu chuẩn WCAG 2.1, Apple HIG/Material touch target, tâm lý học phát triển (Piaget) và thực tiễn các app cùng ngành (Duolingo, Habitica, ClassDojo, Forest)
> **Lăng kính (đã hiệu chỉnh theo phản biện của chủ sản phẩm):** KHÔNG gộp "trẻ em" thành một khối. Ba persona UI tách biệt:
> 1. **Nhi đồng 6–11 tuổi** — đọc được chữ, tư duy cụ thể, mê nhân vật/phép thuật
> 2. **Teen 12+** — tư duy trừu tượng, nhạy cảm với sự "trẻ con hóa" (cringe-averse), coi trọng tự chủ & hình ảnh bản thân
> 3. **Bố mẹ** — người lớn bận rộn, cần hiệu suất thao tác, không cần trang trí
>
> *(Dưới 6 tuổi chưa đọc thạo → không phải người dùng trực tiếp; bố mẹ thao tác hộ — ngoài phạm vi thiết kế UI trẻ em.)*

---

## PHẦN 1 — CƠ SỞ: VÌ SAO PHẢI TÁCH GIAO DIỆN THEO TUỔI

| Chiều | Nhi đồng 6–11 | Teen 12+ |
|---|---|---|
| Giai đoạn nhận thức (Piaget) | Thao tác cụ thể — cần hình ảnh, nhân vật hữu hình | Thao tác hình thức — xử lý được trừu tượng, số liệu, mục tiêu dài hạn |
| Động lực game | Fantasy, phép thuật, thú cưng, phần thưởng tức thì | Năng lực bản thân, chỉ số tiến bộ, so sánh với chính mình, tiền thật |
| Thái độ với "dễ thương" | Yêu thích — mascot/emoji là điểm cộng | **Rủi ro cringe** — cùng yếu tố đó là lý do XÓA APP |
| Xưng hô chấp nhận được | "Con", "Dũng sĩ nhí", giọng cổ tích | "Bạn" hoặc trung tính; giọng coach/ngang hàng |
| Aesthetic | Sáng, bo tròn to, màu bão hòa | Tối/trầm, phẳng, gọn — nhìn "như app người lớn" |
| Hiệu ứng | Confetti, âm thanh, rung lắc = phần thưởng | Vừa phải; quá nhiều = "app trẻ con" |
| Quyền riêng tư | Không quan trọng | Quan trọng — không muốn bố mẹ soi từng phút |

**Kết luận thiết kế:** một codebase, **2 chế độ giao diện (UI Mode)** gắn vào hồ sơ con: `kid` (6–11) và `teen` (12+). Wizard tạo con đã hỏi độ tuổi sẵn (4-6/7-9/10-12) — chỉ cần thêm band "13+" và map: ≤11 → kid, ≥12 → teen. Cho phép bố mẹ đổi tay trong phòng quản trị (trẻ 11 tuổi "già dặn" có thể xin mode teen).

---

## PHẦN 2 — CHẤM ĐIỂM HIỆN TRẠNG THEO 3 PERSONA (thang 10)

| Màn hình | Kid 6–11 | Teen 12+ | Bố mẹ | Vấn đề chính |
|---|:---:|:---:|:---:|---|
| Landing `/` | 7 | 4 | 6 | Teen: "Anh Hùng Nhí" ngay tiêu đề = tự loại khách 12+ |
| Dashboard | 6 | 3 | – | Chữ 8.5–9px quá nhỏ cho trẻ 6–8; teen: "Chiến Binh Kỷ Luật ⚡", confetti dày đặc |
| Mining ⛏️ | 8 | 4 | – | Kid rất tốt (clicker trực quan); teen thấy "đập đá ma thuật" ấu trĩ nhưng cơ chế earn thì teen LẠI THÍCH — vấn đề là *vỏ ngôn ngữ*, không phải ruột |
| Pet/ấp trứng | 9 | 3 | – | Điểm mạnh nhất cho kid, điểm cringe nhất cho teen nếu giữ nguyên giọng "thú cưng ơi 🥰" |
| Rewards 🛒 | 7 | 6 | 7 | Teen ổn vì quà là thật (tiền/đồ) — chỉ cần đổi giọng copy |
| Parent room 🔑 | – | – | **4** | 1261 dòng 1 trang cuộn dài; việc THƯỜNG LÀM NHẤT (duyệt/thưởng nhanh) trộn lẫn việc LÀM 1 LẦN (cấu hình); style trẻ con hóa làm chậm người lớn |
| Setup wizard | – | – | 8 | Tốt — mới làm, đúng hướng |
| Auth/Family/Premium | 6 | 6 | 7 | Trung tính, tạm ổn cho cả 3 |

**Điểm trung bình: Kid 7.0 — Teen 4.3 — Parent 6.4.** App hiện tại về bản chất là **app cho nhi đồng 6–11**; bán cho nhà có con 12+ gần như chắc chắn thất bại nếu không có Teen Mode. Đây là **một nửa thị trường đang bị bỏ**.

---

## PHẦN 3 — LỖI CROSS-CUTTING (ảnh hưởng mọi persona, sửa trước khi làm mode)

**3.1 Typography vỡ chuẩn (nghiêm trọng nhất):** codebase dùng tràn lan `text-[7.5px]`, `text-[8px]`, `text-[8.5px]`, `text-[9px]`, `text-[9.5px]`, `text-[10px]`, `text-[10.5px]`, `text-[11px]` — 8+ cỡ chữ tùy hứng, nhiều cỡ **dưới ngưỡng đọc được** của mọi lứa tuổi (khuyến nghị tối thiểu cho trẻ em: 14–16px body; WCAG không có mức tuyệt đối nhưng 7.5px là không thể bào chữa). **Fix:** type scale chuẩn 6 bậc qua CSS variables — `--text-xs: 12px` là SÀN, cấm arbitrary values bằng ESLint rule.

**3.2 Touch target dưới chuẩn:** checkbox hoàn thành nhiệm vụ `w-6 h-6` = 24px (chuẩn Apple/Google: **≥44px**) — đây là NÚT ĐƯỢC BẤM NHIỀU NHẤT APP, bởi ngón tay vụng nhất (trẻ 6 tuổi). Nút xóa 🗑️, nút feed pet, toggle... cùng lỗi. **Fix:** hit area tối thiểu 44px (padding vô hình nếu visual cần nhỏ).

**3.3 Emoji làm icon hệ thống:** 🗑️🔑⛏️🕊️ render khác nhau giữa Android/iOS/Windows, không đổi màu theo theme được, không scale sạch. **Fix:** lucide-react đã có trong dependencies mà gần như không dùng — thay emoji chức năng bằng icon thật (emoji chỉ giữ vai trò trang trí/cảm xúc).

**3.4 Motion không kiểm soát:** `animate-pulse`, `animate-bounce`, `animate-flame` chạy vĩnh viễn đồng thời 5–7 chỗ trên một màn hình → quá tải giác quan (đặc biệt hại cho trẻ ADHD — một phần đáng kể khách hàng mục tiêu của app thói quen!) + tốn pin. Không tôn trọng `prefers-reduced-motion`. **Fix:** animation chỉ chạy KHI CÓ SỰ KIỆN, tối đa 1 attention-seeker thường trực mỗi màn; thêm media query reduced-motion.

**3.5 Desktop bị bỏ rơi:** `max-w-md` cứng → màn 27" hiện cột 448px giữa biển trắng. Chấp nhận được cho V1 mobile-first, nhưng tối thiểu thêm background trang trí + căn giữa có chủ đích.

**3.6 Không có Dark Mode:** với Teen Mode (Phần 4) dark là mặc định — cần làm token hóa màu ngay từ bước fix 3.1.

---

## PHẦN 4 — KIẾN TRÚC 2 UI MODE: `kid` & `teen`

### 4.1 Nguyên tắc kỹ thuật: MỘT logic, HAI lớp da

Game economy, PDCA/escrow, Kanban, Octalysis... **không đổi giữa 2 mode** — chỉ đổi 3 lớp:

```
┌─ Lớp 1: DESIGN TOKENS (CSS variables theo [data-ui-mode])
│   màu, radius, cỡ chữ, mật độ, cường độ hiệu ứng
├─ Lớp 2: VOICE PACK (mở rộng LanguageContext hiện có)
│   cùng key i18n, thêm chiều mode: vi-kid / vi-teen (+ en-*)
└─ Lớp 3: ASSET SKIN
    mascot/pet artwork, icon set, âm lượng & kiểu SFX
```

`uiMode` lưu trong hồ sơ con (children.ui_mode — migration nhỏ), suy ra mặc định từ band tuổi wizard, bố mẹ đổi được.

### 4.2 Bảng khác biệt cụ thể

| Thành phần | 🧒 Kid Mode (6–11) | 🎧 Teen Mode (12+) |
|---|---|---|
| Bảng màu | Forest/sand/amber hiện tại (giữ nguyên) | Dark slate + 1 accent neon (xanh điện/tím), nhìn như app fitness |
| Typography | Bo tròn, đậm, 16px body, viết HOA tiêu đề | Gọn, 14–15px body, sentence case, bớt font-black |
| Xưng hô & giọng | "Con/Dũng sĩ", cổ tích: "Kỳ diệu! Con đã ấp nở..." | "Bạn" hoặc không xưng, coach: "Nice. +12 coin. Streak 6 ngày." |
| Nhân vật chính | Hero + class Chiến Binh/Pháp Sư/Thần Cây | Profile + "path" (Athlete/Scholar/Builder) — cùng data, khác tên |
| Đào mỏ ⛏️ | "Động Khai Thác Anh Hùng — đập đá ma thuật!" | "Grind Zone — đổi effort lấy coin" (cơ chế clicker GIỮ NGUYÊN — teen vẫn thích earn, chỉ dị ứng vỏ chữ) |
| Pet 🐾 | Trung tâm trải nghiệm, giọng nựng | Reframe thành "Collection" sưu tầm hiếm (teen sưu tầm skin/badge, không "nuôi cưng") — hoặc cho phép ẩn |
| Boss tuần 👾 | "Thần Lười Biếng" hoạt hình | "Weekly Challenge" + progress ring |
| Hiệu ứng | Confetti + SFX đầy đủ | Confetti CHỈ khi milestone lớn; haptic-style micro-feedback; SFX mặc định nhỏ |
| Phần thưởng hiển thị | Emoji to, "quà xịn" | Hiện luôn **quy đổi VNĐ** ("~120.000₫") — teen hiểu và bị thuyết phục bởi tiền thật |
| Điểm nhạy cảm riêng tư | Không có | Bố mẹ thấy tổng quan tuần, KHÔNG thấy log từng phút (thỏa thuận hiển thị rõ) — đổi lấy sự hợp tác của teen |
| Landing/marketing | "Hành Trình Anh Hùng Nhí" | Cần landing segment riêng: "Level up chính mình. Kiếm coin thật." |

### 4.3 Chi phí thực thi (ước lượng)

| Việc | Công |
|---|---|
| Token hóa màu/chữ vào CSS variables + `[data-ui-mode]` (đồng thời fix 3.1) | 1–1.5 ngày |
| Voice pack layer trên LanguageContext (kid/teen × vi/en) + trích copy 4 màn chính | 2–3 ngày |
| Teen dark theme + tinh chỉnh component | 1.5–2 ngày |
| `ui_mode` per child + wizard band 13+ + toggle trong parent room | 0.5 ngày |
| Reframe copy pet/boss/mining cho teen | 1 ngày |
| **Tổng Teen Mode khả dụng** | **~6–8 ngày** |

---

## PHẦN 5 — PARENT MODE: TÁCH KHỎI GAME HOÀN TOÀN

Bố mẹ không cần "vui" — cần **nhanh**. Nguyên tắc: *"việc hằng ngày ≤ 2 chạm, việc 1 lần giấu vào Settings"*.

**5.1 Cấu trúc lại phòng bố mẹ (hiện 1261 dòng/1 trang cuộn):**

```
Tab ✅ DUYỆT (mặc định khi mở)   ← escrow queue P0 ngồi đây, swipe-to-approve
Tab 📊 TUẦN NÀY                  ← báo cáo tuần V1.2 + cumulative flow Kanban
Tab 🎯 NHIỆM VỤ & QUÀ            ← CRUD hiện có, thu gọn bằng accordion
Tab ⚙️ HỆ THỐNG                  ← config, PIN, tỷ giá, ui_mode của con
```

**5.2 Style parent = người lớn:** bỏ shadow game/bo tròn kẹo ngọt trong khu bố mẹ, mật độ cao hơn, cỡ chữ 14px+, iconography lucide nghiêm túc. Tương phản có chủ đích với khu trẻ em — bước qua cửa 🔑 là "đổi thế giới", cũng giúp trẻ hiểu ranh giới.

**5.3 Quick actions nổi:** 2 việc bố mẹ làm nhiều nhất — "Duyệt tất cả hôm nay" và "Thưởng nóng ⭐/🪙" — phải ở ngay đầu Tab Duyệt, 1 chạm.

---

## PHẦN 6 — LỘ TRÌNH THỰC THI GHÉP VỚI P0 (khoa học + UX làm chung một mạch)

| Bước | Nội dung | Gồm |
|---|---|---|
| **B1** | Nền móng token (bắt buộc trước) | Fix 3.1 type scale + 3.2 touch target + 3.3 icon + 3.4 motion + CSS vars `[data-ui-mode]` |
| **B2** | Parent room tách 4 tab | Cấu trúc 5.1 + style 5.2 — chuẩn bị đất cho escrow |
| **B3** | **P0 khoa học** trên nền mới | Escrow + duyệt gộp trong Tab Duyệt + nút "Nhắc bố mẹ 🕊️" + 4 kiểu xác nhận + Uy Tín (grid 6 chỉ số) |
| **B4** | Kid Mode polish | Tăng cỡ chữ/target cho 6–8 tuổi trên token mới |
| **B5** | **Teen Mode** | Dark theme + voice pack + reframe pet/boss/mining + band 13+ |
| **B6** | Kanban board (P1 khoa học) | Trên nền token, 2 mode hưởng chung |

Thứ tự này đảm bảo: **không màn hình nào phải làm 2 lần**, P0 ra đời ngồi đúng chỗ (Tab Duyệt), Teen Mode mở nửa thị trường mới trước khi tung marketing.

---

## PHẦN 7 — CÁ NHÂN HÓA, XÃ HỘI & GHI NHẬN (bổ sung theo câu hỏi chủ sản phẩm, 02/07/2026)

### 7.1 Trang cá nhân hóa của con — LÀM, ưu tiên cao

Quan sát thực tế của chủ sản phẩm (con 9 tuổi hào hứng với sự kiện Duolingo: thay logo, mua áo cho cú, *khác biệt hóa với em gái*) khớp chính xác lý thuyết: **Octalysis CD4 (Ownership) + nhu cầu bản sắc (identity)**. Với 2 con chung 1 tài khoản family, nhu cầu "khác em" còn mạnh hơn nhu cầu "hơn em".

**Thiết kế đề xuất — "Góc Của Tớ 🏠":**
- **Avatar shop:** trang phục/màu/phụ kiện cho nhân vật + **trang phục cho pet** (đúng insight "mua áo cho cú") — mua bằng Hero Coin → coin sink mới, giải áp lực lạm phát ví
- **Trang trí căn cứ:** phòng riêng ảo, đặt đồ đạc mua/nhặt được (đã có trong FEATURE_AUDIT B4/C3 — nâng ưu tiên lên)
- **Sự kiện mùa giới hạn:** skin Tết/Trung Thu/hè chỉ bán trong mùa (scarcity lành mạnh — hết mùa quay lại năm sau, không mất vĩnh viễn)
- **Danh thiếp anh hùng:** trang profile công khai trong nhà: avatar + title + 3 huy hiệu tự chọn ghim — mỗi con curate bản sắc riêng
- Kid mode: shop màu sắc rực rỡ; Teen mode: cùng hệ thống, gọi là "Customize", aesthetic khác

### 7.2 Kết bạn — CÓ, nhưng theo 3 vòng an toàn (trẻ em = rủi ro pháp lý & an toàn cao nhất)

| Vòng | Phạm vi | Được làm gì | Rủi ro |
|---|---|---|---|
| **V1 — Trong nhà** (làm ngay) | Anh chị em cùng tài khoản | Thấy level/pet/căn cứ của nhau, **co-op đánh boss chung**, tặng vật phẩm | Zero |
| **V2 — Nhà quen** (sau) | Friend-code 2 gia đình quen ngoài đời, **bố mẹ 2 bên cùng duyệt bằng PIN** | Thấy tiến độ + gửi "cổ vũ" bằng sticker/emoji **định sẵn** (KHÔNG free-text chat → không cần moderation) | Thấp, kiểm soát được |
| **V3 — KHÔNG BAO GIỜ** | Tìm bạn lạ công khai, chat tự do | — | Stranger danger, gánh nặng moderation, COPPA/PDPA — giết niềm tin phụ huynh (người cầm ví) |

### 7.3 Bảng xếp hạng — CÓ NHƯNG KHÔNG XẾP THEO ĐIỂM TUYỆT ĐỐI

Nghiên cứu leaderboard nhất quán: **top 3 hưng phấn, nhóm cuối bỏ cuộc**. Trong nhà, anh lớn luôn thắng em nhỏ theo điểm tuyệt đối → BXH điểm biến sibling thành ganh đua độc hại — phản mục tiêu giáo dục.

**Thay thế:**
- **So với chính mình:** "Tuần này bạn cải thiện +18% so với tuần trước 📈" — công bằng mọi lứa tuổi (đúng lưu ý "khác nhau mỗi tuổi")
- **Xếp theo hành-vi-kiểm-soát-được** (streak, số ngày đủ 3 nhiệm vụ) chứ không theo kết-quả-phụ-thuộc-tuổi (tổng điểm, level)
- **Anh em cùng TEAM chứ không đấu nhau:** boss tuần cả nhà cùng đánh, thanh máu chung, mỗi con góp damage — chuyển ganh đua thành hợp tác
- Nếu sau này có V2 bạn bè: league nhóm nhỏ theo tuần kiểu Duolingo (reset thứ Hai = fresh start effect), chia theo band tuổi

### 7.4 Ghi nhận trẻ — điểm văn hóa VN, thiết kế THEO TUỔI

Insight đúng: trẻ VN thiếu được ghi nhận; và bố mẹ VN **không quen khen** — vậy app không chỉ nhắc mà phải **dạy bố mẹ khen đúng cách** (khen quá trình, không khen tư chất — Dweck, growth mindset: "Mẹ thấy con kiên trì đọc đủ 7 ngày" ✅ vs "Con thông minh quá" ❌ tạo fixed mindset).

| Tuổi | Kiểu ghi nhận hiệu quả | Trong app |
|---|---|---|
| 6–8 | Tức thì, hữu hình, tần suất cao, đọc to được | Sticker/huy hiệu ngay khi làm xong + màn "khoảnh khắc" cuối ngày bố mẹ đọc cùng |
| 9–11 | Ghi nhận NỖ LỰC & quá trình, chứng nhận trang trọng | "Chứng Chỉ Tuần" có tên + việc nổi bật; lễ tốt nghiệp thói quen 🎓 |
| 12+ | Riêng tư (ngại khoe công khai), tôn trọng tự chủ, dữ liệu | Thông báo riêng "Bạn tự quản lý 30 ngày liên tục — không ai phải nhắc"; KHÔNG auto-khoe |

**Cơ chế "Sổ Vàng Ghi Nhận":** cuối tuần app nhắc bố mẹ + **soạn sẵn 3 gợi ý lời khen quá trình dựa trên dữ liệu thật** ("Tuần này Minh Anh tự giác đọc sách 6/7 ngày — gợi ý: ...") → bố mẹ chạm 1 phát gửi qua bồ câu 🕊️ (kênh có sẵn). Lời khen đúng lúc + cụ thể + miễn phí = phần thưởng mạnh hơn coin.

### 7.5 Ghi nhận BỐ MẸ + Flex khoe con = viral loop

- **Ghi nhận bố mẹ (retention):** bố mẹ cũng có streak — "Đồng hành 30 ngày 🌱", huy hiệu "Người Ươm Mầm". Vì app sống chết ở việc *bố mẹ* duy trì duyệt/ghi nhận, không chỉ trẻ
- **"Thẻ Khoe Con" (growth, CAC ≈ 0):** cuối tuần app xuất **ảnh share 9:16** thiết kế đẹp: avatar + level + streak + 1 việc tốt nổi bật + 1 câu con viết trong nhật ký → bố mẹ đăng Facebook/Zalo story. Bố mẹ VN rất thích khoe con — mỗi lần khoe là 1 quảng cáo tự nhiên kèm watermark + **mã giới thiệu** (2 nhà cùng +1 tháng Premium) → kênh tăng trưởng rẻ nhất có thể có
- Teen exception: thẻ khoe của con 12+ cần **con đồng ý trước khi bố mẹ share** (tôn trọng riêng tư = giữ teen ở lại app)

### 7.6 Cập nhật ưu tiên tổng (gộp với Phần 6)

B1 Token → B2 Parent tabs → B3 P0 khoa học → **B3.5 Góc Của Tớ (avatar shop + sổ vàng ghi nhận + thẻ khoe con)** → B4 Kid polish → B5 Teen Mode → B6 Kanban → B7 Friend V2 + League.

*(Lý do chen B3.5 trước Teen Mode: cá nhân hóa phục vụ ngay người dùng hiện hữu 6–11 + thẻ khoe con mở kênh tăng trưởng — cả retention lẫn acquisition cùng lúc.)*

---

*Tài liệu do Claude Code (Opus 4.8) soạn 02/07/2026, đã hiệu chỉnh lăng kính nhóm tuổi theo phản biện của chủ sản phẩm (tách 6–11 vs 12+ thay vì gộp 6–12); Phần 7 bổ sung cùng ngày theo câu hỏi về cá nhân hóa/xã hội/ghi nhận. Điểm số là đánh giá chuyên môn từ đọc code + smoke test, chưa qua usability testing với trẻ thật — khuyến nghị test 3–5 trẻ mỗi nhóm tuổi trước khi chốt Teen Mode.*
