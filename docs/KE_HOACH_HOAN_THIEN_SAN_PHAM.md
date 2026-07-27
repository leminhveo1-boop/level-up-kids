# Kế hoạch hoàn thiện sản phẩm — tổng hợp 4 nguồn đánh giá độc lập

> **Tác giả tổng hợp:** Claude (Anthropic) · **Model:** Opus 4.8 · **Ngày:** 2026-07-27
> **Đầu vào (4 nguồn phản biện độc lập cùng đọc `docs/Nền tảng học thuật.md`):**
> 1. **C** — `docs/DEEPDIVE_TRIEN_KHAI_VS_HOC_THUAT.md` (Claude/Opus 4.8) — điểm khác biệt: **đối chiếu lý thuyết với code thật đang chạy** (21 hạng mục có `file:line`).
> 2. **GP** — `Phan_bien_Gemini_3.1_Pro_High.md` (Gemini 3.1 Pro High) — 11 điểm mù.
> 3. **GR** — `model-grok.md` (Grok) — 12 điểm mù.
> 4. **GF** — `docs/Phan_bien_Nen_tang_hoc_thuat_Gemini_Flash.md` (Gemini 3.6 Flash) — 12 điểm mù.
> - **PS** — `Simulations_Gemini_3.1_Pro_High.md`: 10 gia đình mô phỏng theo tuổi. **Là dữ liệu AI mô phỏng, KHÔNG phải nghiên cứu thật** (nền tảng học thuật đã cảnh báo) — dùng làm **kịch bản minh hoạ** cho các nguyên lý, không phải bằng chứng định lượng.
> - **Quy tắc ưu tiên (theo `docs/PROMPT_DANH_GIA_DOC_LAP.md`):** điểm mù **≥2/4 nguồn cùng nêu = ưu tiên cao, gần như chắc đúng**; chỉ 1 nguồn = cân nhắc (góc riêng hoặc ảo giác model).
>
> **Phạm vi:** tài liệu này lên kế hoạch hoàn thiện **trải nghiệm & lớp quản-lý-công-việc**.
> **Phần tiền tệ Xu & cơ chế phạt/hệ quả: founder rẽ nhánh riêng để phản biện chuyên sâu** → tài liệu này CHỈ ghi nhận đồng thuận và trỏ sang (§4), KHÔNG lên kế hoạch chi tiết cho nhánh đó.

---

## 1. Ma trận đồng thuận (xếp theo mức đồng thuận × tác động)

Trạng thái ô: ● = nêu mạnh/trực tiếp · ○ = nêu ngầm/liên quan · — = không nêu.

| # | Chủ đề (điểm mù / phát hiện) | C | GP | GR | GF | PS | Đồng thuận | Ưu tiên |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **1** | **Quá tải nhận thức — luồng "Chuẩn bị ngày mai" 5 bước quá nặng, phải rút xuống micro-choice ~15s** | ○ | ● | ○ | ● | ● | 4/4 | 🔴 tối cao |
| **2** | **Lệch pha phát triển — cơ chế luồng phải scale theo NĂNG LỰC THỰC (scaffolding level), không chỉ đổi theming theo tuổi** | ● | ● | ● | ● | ● | 4/4 | 🔴 tối cao |
| **3** | **App mù chính North Star — thiếu `importance`/`dueDate`/đếm-số-lần-nhắc ở data model** | ● | ○ | ● | — | ● | 3/4 | 🔴 tối cao |
| **4** | **Nghịch lý màn hình — game loop kéo trẻ Ở LẠI vs North Star "dùng ít đi"; chế độ sổ làm đứt data loop** | ● | ● | ○ | ● | — | 4/4 | 🔴 cao |
| **5** | **Con số % phản tác dụng — "giám sát trá hình", phụ huynh dùng số để mắng → phản kháng tâm lý; teen đòi summary, không granular** | ● | ● | ○ | ● | ● | 4/4 | 🔴 cao |
| **6** | **PWA iOS notification là ảo tưởng — chuyển nhắc nhở sang Zalo (ZNS/Bot) trigger từ server** | — | ● | — | ● | — | 2/4 | 🟠 cao (kỹ thuật) |
| **7** | **Vòng lặp kích hoạt phụ huynh đứt — người TRẢ TIỀN không có "aha moment" định kỳ → không gia hạn 199k** | ● | ● | — | ○ | ● | 3/4 | 🟠 cao (business) |
| **8** | **Vai trò ông bà / người chăm sóc phụ — người đôn đốc trẻ 16–19h thường là ông bà, không dùng app** | — | ● | — | ● | ● | 2/4 | 🟠 trung-cao |
| **9** | **Thiếu pha Review nhân văn — nhưng Review bằng TEXT sẽ ra rác (trẻ kém metacognition) → Review bằng emoji/1-tap** | ● | ● | — | ● | ○ | 3/4 | 🟠 trung-cao |
| **10** | **Onboarding ma sát → Activation collapse — cần template 1-chạm 30s, không bắt tạo 4 loại việc ngay** | ○ | ● | — | ● | ● | 2/4 | 🟠 trung-cao |
| **11** | **Bảo vệ giờ nghỉ / chống quá tải / học thêm lấn / mandatory break cho teen burnout** | ● | — | — | ● | ● | 2/4 | 🟡 trung-cao |
| **12** | **Xử lý việc-chưa-xong nhân văn — "rescue card", đổi ngôn ngữ "chưa xong"→"đang gỡ vướng"; lý do từ chối cụ thể** | ● | ● | — | ● | — | 3/4 | 🟡 trung |
| **13** | **Kiến trúc state — dồn lịch sử 4 chiều vào 1 JSONB document → phình payload + race-condition 2 máy** | ○ | ○ | — | ● | — | 2/4 | 🟡 trung (kỹ thuật) |
| **14** | **Anh em dùng chung 1 thiết bị — chuyển tài khoản khung giờ vàng + công bằng anh em** | — | ● | ● | — | — | 2/4 | 🟡 trung |
| **15** | **Dark pattern "Con sẵn sàng" — nút ép đồng thuận → đổi ngôn ngữ trung tính "Khoá kế hoạch"/"Lưu lại"** | ○ | ● | — | — | — | 2/4* | 🟡 trung |
| **16** | **Tách 4 loại việc + trục quan trọng/khẩn cấp làm "bộ máy phân loại ngầm"** (một phần trỏ §4 vì dính xu) | ● | ○ | ● | ● | ● | 4/4 | 🔴 (đo) / §4 (xu) |
| **17** | Overjustification / token economy / tiền tệ hoá việc nhà / extinction burst khi cắt xu | ● | ● | ● | ● | ● | 4/4 | ➡️ §4 (rẽ nhánh) |
| **18** | CAC/LTV, viral loop (PWA không có traffic store) | — | ● | — | — | — | 1/4 | ⚪ ghi nhận |

*(*) Mục 15: C ban đầu **đề xuất** nút "Con sẵn sàng" trong deepdive; GP chỉ ra đó là dark pattern. Đây là điểm C **tự sửa** — xem §2-T4.*

**Đọc nhanh ma trận:** 8 chủ đề đạt ≥3/4 nguồn. Ba trục lặp lại ở gần như mọi nguồn: **(a) đơn giản hoá tàn nhẫn cho trẻ** (1,2,9,10), **(b) đo lường ẩn nhưng đừng phô số phán xét** (3,5,16), **(c) giải nghịch lý màn hình + hạ cấp kỳ vọng PWA** (4,6,13). Đây là 3 xương sống của kế hoạch.

---

## 2. Bốn điểm CĂNG THẲNG giữa các nguồn — và cách hoà giải (phần quan trọng nhất)

Sức mạnh của việc chạy 4 model độc lập không chỉ là "đếm phiếu", mà là **các mâu thuẫn giữa chúng** — mỗi mâu thuẫn chỉ ra một cái bẫy thiết kế. Bốn cặp căng thẳng, mỗi cặp có lời giải hoà giải:

### T1. "Lý thuyết phải HIỆN HỮU" (C) ⚔️ "CẮT BỎ 5 framework" (GP, GF)
- C nói founder không thấy lý thuyết → cần cho nó hiện hữu. GP/GF nói: nhồi 5 framework là "MBA thu nhỏ cho học sinh tiểu học", phải cắt xuống 3 câu / 1-tap 15s.
- **Đây không phải mâu thuẫn thật — mà là nhầm tầng.** Deepdive §0 đã nói: *"dưới nắp máy nghĩa là trẻ không phải HỌC lý thuyết, KHÔNG có nghĩa là trải nghiệm không PHẢN CHIẾU lý thuyết."*
- **Hoà giải (nguyên tắc chủ đạo toàn kế hoạch):** lý thuyết hiện hữu ở **tầng hệ thống/phụ huynh** (đo lường North Star, khép vòng, phân loại việc) — **vô hình với trẻ**. Luồng của TRẺ phải cực nhẹ: 1 micro-choice ~15s. Lý thuyết là **bộ xương bên trong**, không phải bài giảng bày ra ngoài.

### T2. "Thêm pha Review" (C) ⚔️ "Self-reflection là ảo tưởng" (GP)
- C muốn thêm bước "nhìn lại hôm nay". GP: trẻ kém siêu nhận thức, hỏi "điều gì giúp con đúng giờ?" → ra rác dữ liệu, trẻ đổ lỗi ngoại cảnh.
- **Hoà giải:** GIỮ pha Review (nó khép vòng SRL) nhưng **cấm hỏi bằng text**. Review = **1-tap chọn 1 trong 3 emoji** (dễ / hơi mệt / quá khó) + app tự suy thời gian trễ. Đúng đề xuất GP, vẫn đạt mục tiêu C.

### T3. "Phải ĐO North Star" (C, GR) ⚔️ "Ẩn con số đi" (GF)
- C/GR: không đo thì không cải thiện, không chứng minh giá trị cho phụ huynh trả tiền. GF: phô "% Giữ lời 70%" cho phụ huynh → họ mắng con → phản kháng.
- **Hoà giải (rất quan trọng):** **ĐO đầy đủ ở tầng dữ liệu** (để có North Star + bằng chứng tiến bộ), nhưng **KHÔNG phô số trần trụi**. Chuyển số thành **insight tích cực dựa-trên-điểm-mạnh**: không hiển thị "70%", mà "Khoa giỏi tự bắt đầu Toán vào thứ Ba — bố mẹ khen con nhé". Với teen: chỉ **summary report**, không granular. Đo là việc của máy; cái phụ huynh/trẻ THẤY là gợi ý hành vi.

### T4. Nút "Con sẵn sàng" (C đề xuất) ⚔️ "Forced consent dark pattern" (GP)
- C đề xuất màn xác nhận "Con sẵn sàng" tạo khoảnh khắc cam kết. GP: ép trẻ bấm đồng thuận → khi fail trẻ cãi "app bắt con bấm", cam kết giả tạo.
- **Hoà giải:** GP đúng. Giữ **màn chốt kế hoạch** (khoảnh khắc "mình-tối-qua giúp mình-hôm-nay" vẫn giá trị) nhưng **đổi ngôn ngữ sang trung tính**: "Khoá kế hoạch" / "Lưu lại", bỏ ngôn ngữ ép-đồng-thuận.

> **Bốn hoà giải này chưng cất thành nguyên tắc thiết kế ở §3.**

---

## 3. Kế hoạch hoàn thiện (đã loại nhánh tiền tệ/phạt)

### 3.0 — Sáu nguyên tắc thiết kế rút ra (kim chỉ nam cho mọi bước)

1. **Lý thuyết ẩn dưới nắp máy, trải nghiệm trẻ ≤15s** (T1). Không một khái niệm hàn lâm nào lộ ra giao diện trẻ.
2. **Đo tất cả, phô rất ít** (T3). Máy đo North Star; người dùng chỉ thấy gợi-ý-điểm-mạnh, không thấy điểm-phán-xét.
3. **Scale theo năng lực thực, không theo tuổi khai sinh** (mục 2). Scaffolding level 1–2–3, tự điều chỉnh theo hành vi.
4. **Nhân văn khi lỡ, không xấu hổ** (T2, mục 9,12). "Đang gỡ vướng" thay "thất bại"; Review bằng emoji; rescue card.
5. **Ngôn ngữ trung tính, không thao túng** (T4). Không dark pattern, không ép đồng thuận, không "thua cuộc".
6. **Ngoài đời > trong app.** Mọi tính năng đo bằng "trẻ có tự làm NGOÀI đời không", app thành công khi trẻ mở nó ít đi.

### Giai đoạn 0 — NỀN: đo lường ẩn + đơn giản hoá + scaffolding *(ưu tiên #1, mở khóa mọi thứ)*

Đây là hạ tầng; không có nó thì các giai đoạn sau treo lơ lửng. Gồm 3 việc song song:

- **0a. Thêm 2 tín hiệu vào task: `importance` + `dueDate` (optional), + mở rộng daily snapshot** (`remindersNeeded`, `importantDoneBeforeDue`, `plannedLastNight`).
  → Mở khóa: đo North Star (mục 3, GỐC-1 của C), sắp "bắt đầu từ đây", phát hiện quá tải, chỉ số "Chủ động". *Rẻ: chỉ thêm field + ghi số, chưa cần UI ma trận.*
  → **Đo ở tầng máy, tuyệt đối không phô số cho trẻ** (T3).
- **0b. Rút luồng "Chuẩn bị ngày mai" xuống 1-Tap Micro-Choice ≤15s** (mục 1). Sau bữa tối, một màn: "Mai việc quan trọng nhất của con là gì?" → chọn 1 thẻ có sẵn → xong. Các bước WOOP/mốc-giờ/dự-báo-trở-ngại **chỉ bung ra khi scaffolding level cao** hoặc khi trẻ fail đúng việc đó nhiều ngày.
- **0c. Scaffolding Level 1–2–3 thay cho phân tầng tuổi cứng** (mục 2). 3 câu onboarding + tự điều chỉnh theo dữ liệu hành vi. Level 1 = app auto-fill lịch cơ bản, trẻ chỉ tick; Level 3 = trẻ tự lập kế hoạch, thấy trục quan trọng/khẩn. `uiMode` kid/teen hiện tại chỉ đổi theming → nâng thành đổi **cơ chế luồng**.

### Giai đoạn 1 — KHÉP VÒNG nhẹ (Plan→Do→Review) *(chữa GỐC-3 của C)*

- **1a. Pha Review bằng emoji 1-tap** (mục 9 + T2). Trước micro-choice tối: "Hôm nay con thấy sao?" → 3 emoji, KHÔNG text. App tự suy phần còn lại.
- **1b. Xử-lý-việc-chưa-xong 4 lối + ngôn ngữ "đang gỡ vướng"** (mục 12). Chuyển ngày · chọn giờ khác · nhờ người lớn · bỏ có lý do. Thêm **"Thẻ Hỗ trợ" (rescue card)** dời việc không tính điểm trừ. Đếm số lần chuyển → gợi "cùng bố mẹ xem lại" (không phạt).
- **1c. Màn chốt kế hoạch ngôn ngữ trung tính** (T4): "Khoá kế hoạch" + sáng hôm sau "Hôm qua con đã chuẩn bị rồi". Bỏ "Con sẵn sàng".

### Giai đoạn 2 — PHỤ HUYNH: nhìn-điểm-mạnh, không giám sát *(chữa churn gia hạn — business)*

- **2a. Phòng phụ huynh chuyển từ bảng-số sang insight-điểm-mạnh** (mục 5 + T3). Card "Ngày mai của [con] đã sẵn sàng · 3 việc thường · 1 việc quan trọng" + gợi ý hành vi tích cực. **Ẩn % phán xét.** Teen: chỉ summary, không granular (PS: 12+ ghét micro-manage).
- **2b. "Aha moment" định kỳ cho người trả tiền** (mục 7). 1 thông báo/tuần (Zalo, 19h thứ Sáu): "Tuần này [con] tự giác làm X 4 lần không cần nhắc" + nút "Tặng 1 lời khen". Đây là visibility giữ chân gia hạn 199k.
- **2c. Luồng ông bà / người chăm sóc phụ** (mục 8). Nút "Chia sẻ lịch hôm nay" gửi Zalo/SMS bản text thô cho ông bà (không cần cài app). PS gia đình B4 (bà ngoại chăm cháu) là kịch bản điển hình.
- **2d. Lý do từ chối cụ thể** (mục 12, GP#8). Khi phụ huynh bấm "chưa đạt" → chọn 1 trong 3 lý do nhanh ("chưa sạch"/"trễ giờ"/"làm thiếu"), tránh trẻ thấy bị phủ nhận độc đoán. Nối với **Definition of Done** (deepdive G-1).

### Giai đoạn 3 — NGHỊCH LÝ MÀN HÌNH + hạ cấp PWA *(chữa GỐC-2, đánh insight gia đình thật)*

- **3a. "Chế độ sổ / không màn hình" thật** (mục 4). Một màn danh sách sạch (không game/xu/hiệu ứng) + nút in + đếm giờ kết thúc phiên. Đây là giải pháp trực tiếp cho "cửa ngõ YouTube".
- **3b. Định vị lại game = "lớp mồi rút dần"** (mục 4, GỐC-2 — *cần founder quyết*). Game/đào mỏ chỉ mở trong phiên check cuối ngày, không kéo trẻ mở app giữa ngày. North Star đo bằng **giảm** session.
- **3c. Chuyển nhắc nhở khỏi PWA iOS sang Zalo Bot/ZNS** (mục 6). PWA iOS không đảm bảo push → nhắc nhở trigger từ Cloudflare Worker qua Zalo. PWA chỉ là giao diện hiển thị nhẹ.
- **3d. Bảo vệ giờ nghỉ / mandatory break** (mục 11). Cảnh báo mềm khi ngày mai quá đầy; với teen burnout, chặn nhập thêm task học thuật quá ngưỡng (PS gia đình C3).

### Xuyên suốt — KỸ THUẬT (làm cùng lúc, không thành giai đoạn riêng)

- **Kiến trúc state** (mục 13): giữ `GameState` document tinh gọn (trạng thái ngày hiện tại + chỉ số cơ bản); **đẩy lịch sử 4 chiều sang bảng log append-only** qua Cloudflare Workers, tránh phình JSONB + race-condition 2 máy. *Ràng buộc dự án hiện tại là "1 document sync" — mở rộng lịch sử phải theo hướng này, không nhồi thêm vào document chính.*
- **Anh em / thiết bị chung** (mục 14): UX chuyển tài khoản nhanh khung giờ vàng; xét công bằng anh em khi thiết kế bảng chỉ số.

---

## 4. Nhánh rẽ riêng — Tiền tệ Xu & Hệ quả/Phạt *(founder tự phản biện chuyên sâu)*

**4/4 nguồn + PS đồng thuận đây là vùng rủi ro cao nhất** — nhưng founder đã tách ra làm nhánh riêng, nên tài liệu này **chỉ ghi nhận đồng thuận để nhánh đó dùng**, không lên kế hoạch:

- **Từ chối tiền tệ hoá việc nhà** (PS: B1, C2, nhiều bé mặc cả "được mấy tiền"; GP#10 phụ huynh Việt dị ứng "tí tuổi đi làm thuê cho mẹ"). → Phải tách rạch ròi **"nghĩa vụ không thương lượng"** vs **"nhiệm vụ làm thêm có thưởng"** (PS tổng kết #4).
- **Overjustification** (Deci): nghĩa vụ KHÔNG trả xu từng lần (C, GF, GR, GP đều nêu). Khớp spec kinh tế xu hiện có: xu chỉ chảy vào loại **`contribution`**.
- **Extinction Burst khi cắt xu đột ngột** (GF#4, GR#4): reinforcement thinning phải cực từ từ; loss aversion khiến trẻ mất xu → bỏ hẳn. App đã có `rewardDoseFactor` (fade dần) làm nền.
- **"Uy tín" là tiền giả nếu không có sức mua** (GP#3): nếu đổi nghĩa vụ sang "điểm uy tín", phải cột chặt vào quyền lực thật trong app (vd tự-duyệt-kế-hoạch khi uy tín cao).

→ **Móc nối:** phần này thuộc `docs/SPEC_KINH_TE_XU_MINH_BACH.md` (mục 13 hệ quả ≠ hình phạt) + nhánh phản biện chuyên sâu của founder. **Mục 16 của ma trận (tách 4 loại việc)** là điểm giao: phần **đo/phân loại** thuộc Giai đoạn 0 (kế hoạch này); phần **xu chảy vào loại nào** thuộc nhánh xu.

---

## 5. Ba rủi ro lớn nhất (hợp nhất từ 4 nguồn) + dấu hiệu sớm

1. **Nhập-liệu mệt mỏi → churn hàng loạt sau ~10 ngày** (GF-top1, GP-rủi ro1, C-rủi ro). App biến thành "phần mềm kế toán việc nhà". *Dấu hiệu sớm:* tỷ lệ hoàn thành luồng tối rớt từ >80% (D1) xuống <25% (D5); số task bị dời tăng vọt. **→ Giai đoạn 0b (micro-choice 15s) là thuốc.**
2. **Tác dụng ngược động lực + phản kháng → xung đột gia đình** (GF-top2, GR-rủi ro1, C-rủi ro3). Con số phán xét + tiền tệ hoá → trẻ tick giả/khai gian, phụ huynh dùng số mắng con. *Dấu hiệu sớm:* trẻ tick 100% trong 5 giây cuối ngày nhưng ngoài đời không làm; phụ huynh phàn nàn "dùng app con vẫn lười". **→ T3 (ẩn số) + nhánh §4 là thuốc.**
3. **Vỡ trận kỹ thuật iOS — PWA notification hỏng + sync conflict** (GF-top3, GP-rủi ro2). *Dấu hiệu sớm:* chênh lệch retention D7 rõ rệt Android (cao) vs iOS (rớt); lỗi `409 Conflict` Supabase; phụ huynh báo "app không kêu nhắc". **→ Giai đoạn 3c (Zalo) + kỹ thuật state là thuốc.**

---

## 6. Câu hỏi buộc trả lời trước khi code lớn (gộp Phần D của 4 nguồn)

1. **Game là mồi-rút-dần hay trung tâm?** (C, GP) — quyết định này định hình mọi thứ. *Khuyến nghị: mồi rút dần, North Star đo bằng giảm session.*
2. **Thứ tự: đo lường trước hay Review trước?** (C) — *Khuyến nghị: đo lường (Giai đoạn 0) trước, vì là hạ tầng cho cả scoreboard lẫn hệ quả.*
3. **Offline sync conflict** (GP-D1): iPad trẻ check offline sáng, mẹ từ chối trên 4G — ai là single-source-of-truth để không mất streak oan? *Khuyến nghị: quyết trước khi làm chế độ sổ.*
4. **Anh em 1 thiết bị** (GP-D2, GR): UX chuyển tài khoản khung giờ vàng?
5. **Định giá "việc làm thêm có xu" sao cho trẻ không so với tiền thật** (GF-D2) → **thuộc nhánh §4.**
6. **Minimum Viable Data** (GF-D3): dữ liệu nhỏ nhất PWA cần để không trắng màn hình khi Safari xoá cache?

---

## 7. Đề xuất bước đi ngay (nếu chỉ chọn 1)

**Giai đoạn 0 — cụ thể là 0a (thêm `importance`+`dueDate` + ghi số) và 0b (micro-choice 15s) làm song song.**

Lý do: 0a mở khóa toàn bộ khả năng ĐO (North Star, chứng minh giá trị 199k, scoreboard, hệ quả ở nhánh xu); 0b là **thuốc trực tiếp cho rủi ro #1** (churn vì mệt) mà 4/4 nguồn cảnh báo. Hai việc này rẻ, độc lập, và là nền cho mọi giai đoạn sau. Mọi thứ khác (Review, phụ huynh, chế độ sổ) chỉ có nghĩa khi đã đo được và đã đủ nhẹ để trẻ không bỏ.

> **Ghi chú tính trung thực:** persona-sim (PS) là mô phỏng của cùng dòng Gemini, không phải phỏng vấn thật — mọi kết luận dựa trên PS ở trên chỉ ở mức **giả thuyết cần kiểm chứng bằng người dùng thật**, không phải sự thật đã chứng minh.
