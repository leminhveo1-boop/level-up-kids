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
> **Phạm vi:** tài liệu này lên kế hoạch hoàn thiện **trải nghiệm & lớp quản-lý-công-việc**, và **tích hợp nhánh Xu/hệ quả vào roadmap triển khai** (§4, §7).
> **Cập nhật 28/07/2026 (founder):** nhánh tiền tệ Xu & cơ chế phạt/hệ quả **đã khép ở tầng SPEC** (`docs/SPEC_KINH_TE_XU_MINH_BACH.md`) và **chờ nhánh scoreboard (chấm + đo theo nhóm) để triển khai** → nay **đưa luôn vào kế hoạch triển khai**, xếp SAU scoreboard trong roadmap. **Business:** gói **200k/bé/năm; từ bé thứ 2 giảm 50%**. **Online-only** (không offline).

---

## 1. Ma trận đồng thuận (xếp theo mức đồng thuận × tác động)

Trạng thái ô: ● = nêu mạnh/trực tiếp · ○ = nêu ngầm/liên quan · — = không nêu.

| # | Chủ đề (điểm mù / phát hiện) | C | GP | GR | GF | PS | Đồng thuận | Ưu tiên |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **1** | **Quá tải nhận thức — luồng "Chuẩn bị ngày mai" 5 bước quá nặng, phải rút xuống micro-choice ~15s** | ○ | ● | ○ | ● | ● | 4/4 | 🔴 tối cao |
| **2** | **Lệch pha phát triển — cơ chế luồng phải scale theo NĂNG LỰC THỰC (scaffolding level), không chỉ đổi theming theo tuổi** | ● | ● | ● | ● | ● | 4/4 | 🔴 tối cao |
| **3** | **App mù chính North Star — thiếu `importance`/`dueDate`/đếm-số-lần-nhắc ở data model** | ● | ○ | ● | — | ● | 3/4 | 🔴 tối cao |
| **4** | **Nghịch lý màn hình — game loop kéo trẻ Ở LẠI vs North Star "dùng ít đi"; giải bằng scoreboard (chấm+đo theo nhóm §3b), không "rút game"** | ● | ● | ○ | ● | — | 4/4 | 🔴 cao |
| **5** | **Con số % phản tác dụng — "giám sát trá hình", phụ huynh dùng số để mắng → phản kháng tâm lý; teen đòi summary, không granular** | ● | ● | ○ | ● | ● | 4/4 | 🔴 cao |
| **6** | **PWA iOS notification là ảo tưởng — chuyển nhắc nhở sang Zalo (ZNS/Bot) trigger từ server** | — | ● | — | ● | — | 2/4 | 🟠 cao (kỹ thuật) |
| **7** | **Vòng lặp kích hoạt phụ huynh đứt — người TRẢ TIỀN không có "aha moment" định kỳ → không gia hạn 200k/bé** | ● | ● | — | ○ | ● | 3/4 | 🟠 cao (business) |
| **8** | **Vai trò ông bà / người chăm sóc phụ — người đôn đốc trẻ 16–19h thường là ông bà, không dùng app** | — | ● | — | ● | ● | 2/4 | 🟠 trung-cao |
| **9** | **Thiếu pha Review nhân văn — nhưng Review bằng TEXT sẽ ra rác (trẻ kém metacognition) → Review bằng emoji/1-tap** | ● | ● | — | ● | ○ | 3/4 | 🟠 trung-cao |
| **10** | **Onboarding ma sát → Activation collapse — cần template 1-chạm 30s, không bắt tạo 4 loại việc ngay** | ○ | ● | — | ● | ● | 2/4 | 🟠 trung-cao |
| **11** | **Bảo vệ giờ nghỉ / chống quá tải / học thêm lấn / mandatory break cho teen burnout** | ● | — | — | ● | ● | 2/4 | 🟡 trung-cao |
| **12** | **Xử lý việc-chưa-xong nhân văn — "rescue card", đổi ngôn ngữ "chưa xong"→"đang gỡ vướng"; lý do từ chối cụ thể** | ● | ● | — | ● | — | 3/4 | 🟡 trung |
| **13** | **Kiến trúc state — dồn lịch sử 4 chiều vào 1 JSONB document → phình payload + race-condition 2 máy** | ○ | ○ | — | ● | — | 2/4 | 🟡 trung (kỹ thuật) |
| **14** | **Anh em dùng chung 1 thiết bị — chuyển tài khoản khung giờ vàng + công bằng anh em** | — | ● | ● | — | — | 2/4 | 🟡 trung |
| **15** | **Dark pattern "Con sẵn sàng" — nút ép đồng thuận → đổi ngôn ngữ trung tính "Khoá kế hoạch"/"Lưu lại"** | ○ | ● | — | — | — | 2/4* | 🟡 trung |
| **16** | **Tách 4 loại việc + trục quan trọng/khẩn cấp làm "bộ máy phân loại ngầm"** (một phần trỏ §4 vì dính xu) | ● | ○ | ● | ● | ● | 4/4 | 🔴 (đo) / §4 (xu) |
| **17** | Overjustification / token economy / tiền tệ hoá việc nhà / extinction burst khi cắt xu | ● | ● | ● | ● | ● | 4/4 | ➡️ §4 → §7 Pha E (sau scoreboard) |
| **18** | CAC/LTV, viral loop (PWA không có traffic store) | — | ● | — | — | — | 1/4 | ⚪ ghi nhận |

*(*) Mục 15: C ban đầu **đề xuất** nút "Con sẵn sàng" trong deepdive; GP chỉ ra đó là dark pattern. Đây là điểm C **tự sửa** — xem §2-T4.*

**Đọc nhanh ma trận:** 8 chủ đề đạt ≥3/4 nguồn. Ba trục lặp lại ở gần như mọi nguồn: **(a) đơn giản hoá tàn nhẫn cho trẻ** (1,2,9,10), **(b) đo lường ẩn nhưng đừng phô số phán xét** (3,5,16), **(c) giải nghịch lý màn hình + hạ cấp kỳ vọng PWA** (4,6,13). Đây là 3 xương sống của kế hoạch.

---

## 2. Bốn điểm CĂNG THẲNG giữa các nguồn — và cách hoà giải (phần quan trọng nhất)

Sức mạnh của việc chạy 4 model độc lập không chỉ là "đếm phiếu", mà là **các mâu thuẫn giữa chúng** — mỗi mâu thuẫn chỉ ra một cái bẫy thiết kế. Bốn cặp căng thẳng, mỗi cặp có lời giải hoà giải:

### T1. "Lý thuyết phải HIỆN HỮU" (C) ⚔️ "CẮT BỎ 5 framework" (GP, GF) — *founder đính chính cách hoà giải*
- C nói founder không thấy lý thuyết → cần cho nó hiện hữu. GP/GF nói: nhồi 5 framework là "MBA thu nhỏ cho học sinh tiểu học", phải cắt xuống 3 câu / 1-tap 15s.
- **Founder đính chính (điểm cốt lõi):** "hiện hữu" KHÔNG phải là "ẩn dưới nắp máy" như bản nháp trước hiểu. "Hiện hữu" = **ứng dụng của lý thuyết phải HIỆN HỮU TRONG TRẢI NGHIỆM của trẻ** — trẻ *làm* nó mỗi ngày mà không được dạy tên gọi, để **khi lớn lên gặp lý thuyết chính thức sẽ nhận ra "ồ mình đã làm cái này từ nhỏ mà không biết"**. Vô hình về **KHÁI NIỆM/TỪ KHÓA**, nhưng **hiện hữu về TRẢI NGHIỆM**.
- **Vì vậy "CẮT BỎ" là SAI.** Cắt đi thì trải nghiệm không còn phản chiếu lý thuyết → hỏng mục tiêu. GP/GF chỉ đúng ở chỗ **"đừng nhồi 5 thứ CÙNG một lúc"**, không đúng ở "loại bỏ".
- **Hoà giải mới (nguyên tắc chủ đạo toàn kế hoạch): trải độ phức tạp theo trục THỜI GIAN, không cắt, không ẩn vĩnh viễn.** Thiết kế **lộ trình 12 tháng**: mỗi giai đoạn *đề xuất phụ huynh* đưa thêm 1 lớp năng lực vào (khớp scaffolding level), sao cho tại mỗi thời điểm trẻ chỉ trải 1 lớp mới (luồng vẫn ~15s), nhưng sau 12 tháng đã trải đủ cả 5 framework qua thực hành. **Điểm rơi tháng 12** = trẻ/gia đình vừa hoàn thành 1 vòng năng lực trọn vẹn → khoảnh khắc tự nhiên để **gợi mở gia hạn** (retention-by-design, khớp business 200k/bé/năm). Chi tiết lộ trình → §7 (roadmap 12 tháng).

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

## 3. Kế hoạch hoàn thiện (5 giai đoạn — nhánh Xu/hệ quả xếp sau scoreboard, xem §7 Pha E)

### 3.0 — Sáu nguyên tắc thiết kế rút ra (kim chỉ nam cho mọi bước)

1. **Vô hình về TỪ KHÓA, hiện hữu về TRẢI NGHIỆM** (T1 — founder đính chính). Trẻ *trải* lý thuyết qua hành động, không bị dạy tên gọi; lớn lên gặp lý thuyết chính thức (SRL, Eisenhower…) sẽ nhận ra "mình đã làm cái này từ nhỏ mà không biết". Độ phức tạp **KHÔNG bị cắt bỏ** — nó được **trải theo lộ trình 12 tháng** (progressive disclosure), mỗi giai đoạn phụ huynh được đề xuất mở thêm 1 lớp; **điểm rơi tháng 12 = gợi mở gia hạn**.
2. **Đo tất cả, phô rất ít** (T3). Máy đo North Star; người dùng chỉ thấy gợi-ý-điểm-mạnh, không thấy điểm-phán-xét.
3. **Scale theo năng lực thực, không theo tuổi khai sinh** (mục 2). Scaffolding level 1–2–3, tự điều chỉnh theo hành vi.
4. **Nhân văn khi lỡ, không xấu hổ** (T2, mục 9,12). "Đang gỡ vướng" thay "thất bại"; Review bằng emoji; rescue card.
5. **Ngôn ngữ trung tính, không thao túng** (T4). Không dark pattern, không ép đồng thuận, không "thua cuộc".
6. **Ngoài đời > trong app.** Giá trị đo bằng "trẻ có tự làm NGOÀI đời không" qua cơ chế **chấm + đo theo nhóm** (§6-Q1), KHÔNG phải bằng thời lượng dùng app. **Online-only** — app không hoạt động offline.

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
- **2b. "Aha moment" định kỳ cho người trả tiền** (mục 7). 1 thông báo/tuần (Zalo, 19h thứ Sáu): "Tuần này [con] tự giác làm X 4 lần không cần nhắc" + nút "Tặng 1 lời khen". Đây là visibility giữ chân gia hạn 200k/bé (điểm rơi tháng 12, §7.3).
- **2c. Luồng ông bà / người chăm sóc phụ** (mục 8). Nút "Chia sẻ lịch hôm nay" gửi Zalo/SMS bản text thô cho ông bà (không cần cài app). PS gia đình B4 (bà ngoại chăm cháu) là kịch bản điển hình.
- **2d. Lý do từ chối cụ thể** (mục 12, GP#8). Khi phụ huynh bấm "chưa đạt" → chọn 1 trong 3 lý do nhanh ("chưa sạch"/"trễ giờ"/"làm thiếu"), tránh trẻ thấy bị phủ nhận độc đoán. Nối với **Definition of Done** (deepdive G-1).

### Giai đoạn 3 — NGHỊCH LÝ MÀN HÌNH + hạ cấp PWA *(chữa GỐC-2, đánh insight gia đình thật)*

- **3a. "Chế độ sổ / không màn hình" thật** (mục 4). Một màn danh sách sạch (không game/xu/hiệu ứng) + nút in + đếm giờ kết thúc phiên. Đây là giải pháp trực tiếp cho "cửa ngõ YouTube".
- **3b. Cơ chế CHẤM + ĐO THEO NHÓM (scoreboard) — thay cho ý "game mồi rút dần"** (mục 4, GỐC-2). *Founder đính chính:* nghịch lý màn hình KHÔNG giải bằng cách "rút game", mà bằng cách **dời trọng tâm giá trị sang phép chấm-điểm hành vi tự-chủ + đo theo nhóm**. Khi giá trị của app nằm ở *thước đo tiến bộ* (cho phụ huynh, so nhóm) chứ không ở *thời lượng chơi*, time-on-site tự khắc không còn là thứ được tối ưu — game vẫn là lớp tạo hứng nhưng không phải mục tiêu. **Scoreboard là nhánh nền**: nhánh Xu/hệ quả (§4) đã khép ở tầng spec và **chờ scoreboard này để triển khai**. *(Giả định đang dùng, cần founder xác nhận 1 câu: "đo theo nhóm" = đo & so theo (a) nhóm loại việc (nghĩa vụ/thói quen/dự án/đóng góp) và (b) chuẩn nhóm-tuổi (normative benchmark) để phụ huynh thấy tiến bộ tương đối — không phải bảng xếp hạng công khai giữa các trẻ.)*
- **3c. Chuyển nhắc nhở khỏi PWA iOS sang Zalo Bot/ZNS** (mục 6). PWA iOS không đảm bảo push → nhắc nhở trigger từ Cloudflare Worker qua Zalo. PWA chỉ là giao diện hiển thị nhẹ.
- **3d. Bảo vệ giờ nghỉ / mandatory break** (mục 11). Cảnh báo mềm khi ngày mai quá đầy; với teen burnout, chặn nhập thêm task học thuật quá ngưỡng (PS gia đình C3).

### Xuyên suốt — KỸ THUẬT (làm cùng lúc, không thành giai đoạn riêng)

- **Kiến trúc state** (mục 13): giữ `GameState` document tinh gọn (trạng thái ngày hiện tại + chỉ số cơ bản); **đẩy lịch sử 4 chiều sang bảng log append-only** qua Cloudflare Workers, tránh phình JSONB + race-condition 2 máy. *Ràng buộc dự án hiện tại là "1 document sync" — mở rộng lịch sử phải theo hướng này, không nhồi thêm vào document chính.*
- **Anh em / thiết bị chung** (mục 14): UX chuyển tài khoản nhanh khung giờ vàng; xét công bằng anh em khi thiết kế bảng chỉ số.

---

## 4. Nhánh Xu & Hệ quả/Phạt — SPEC đã khép, chờ scoreboard để triển khai *(đưa vào roadmap §7)*

**4/4 nguồn + PS đồng thuận đây là vùng rủi ro cao nhất.** Founder xác nhận (28/07): nhánh này **đã khép ở tầng spec** và **phụ thuộc scoreboard (chấm + đo theo nhóm)** — nên trong roadmap §7 nó là một **pha triển khai xếp SAU pha scoreboard**, không còn là nhánh tách rời. Các đồng thuận ràng buộc thiết kế của nhánh:

- **Từ chối tiền tệ hoá việc nhà** (PS: B1, C2, nhiều bé mặc cả "được mấy tiền"; GP#10 phụ huynh Việt dị ứng "tí tuổi đi làm thuê cho mẹ"). → Phải tách rạch ròi **"nghĩa vụ không thương lượng"** vs **"nhiệm vụ làm thêm có thưởng"** (PS tổng kết #4).
- **Overjustification** (Deci): nghĩa vụ KHÔNG trả xu từng lần (C, GF, GR, GP đều nêu). Khớp spec kinh tế xu hiện có: xu chỉ chảy vào loại **`contribution`**.
- **Extinction Burst khi cắt xu đột ngột** (GF#4, GR#4): reinforcement thinning phải cực từ từ; loss aversion khiến trẻ mất xu → bỏ hẳn. App đã có `rewardDoseFactor` (fade dần) làm nền.
- **"Uy tín" là tiền giả nếu không có sức mua** (GP#3): nếu đổi nghĩa vụ sang "điểm uy tín", phải cột chặt vào quyền lực thật trong app (vd tự-duyệt-kế-hoạch khi uy tín cao).

→ **Móc nối & thứ tự triển khai:** spec ở `docs/SPEC_KINH_TE_XU_MINH_BACH.md` (mục 13 hệ quả ≠ hình phạt). **Mục 16 ma trận (tách 4 loại việc)** là điểm giao: phần **đo/phân loại** thuộc Giai đoạn 0; phần **scoreboard chấm+đo** thuộc Giai đoạn 3b; phần **xu chảy vào loại nào + hệ quả** triển khai SAU scoreboard (§7 — Pha E). Chuỗi phụ thuộc: **0a (data model) → 3b (scoreboard) → nhánh Xu/hệ quả**.

---

## 5. Ba rủi ro lớn nhất + ĐỀ XUẤT GIẢI QUYẾT (founder: dùng app phải làm mọi thứ TỐT LÊN, không tạo khủng hoảng)

Mỗi rủi ro giải theo 3 lớp: **(P) Phòng ngừa** (thiết kế để không xảy ra) · **(D) Phát hiện sớm** (chỉ số cảnh báo) · **(R) Phục hồi** (khi đã chớm, app tự biến sự cố thành cải thiện — không đổ khủng hoảng lên gia đình).

### Rủi ro 1 — Nhập-liệu mệt mỏi → churn hàng loạt sau ~10 ngày *(GF-top1, GP-rủi ro1, C)*
App biến thành "phần mềm kế toán việc nhà".
- **(P)** Giai đoạn 0b: luồng tối = **1-Tap Micro-Choice ≤15s**, không bắt nhập 4 loại việc. Onboarding template 1-chạm 30s (mục 10). App auto-fill lịch cơ bản ở scaffolding Level 1, trẻ chỉ tick.
- **(D)** Tỷ lệ hoàn thành luồng tối rớt >80% (D1) → <25% (D5); số task bị dời tăng vọt; thời gian nhập/ngày tăng.
- **(R)** **"Chế độ nhẹ" tự kích hoạt:** khi phát hiện mệt mỏi (bỏ luồng 2 tối liên tiếp), app tự rút còn **1 việc quan trọng duy nhất/ngày** + tắt mọi nhắc phụ, kèm 1 dòng cho phụ huynh "Tuần này để con nhẹ lại một chút". Ít việc mà giữ chân > nhiều việc mà bỏ.

### Rủi ro 2 — Tác dụng ngược động lực + phản kháng → xung đột gia đình *(GF-top2, GR-rủi ro1, C-rủi ro3)*
Con số phán xét + tiền tệ hoá → trẻ tick giả, phụ huynh dùng số mắng con.
- **(P)** T3: **ẩn số phán xét**, chỉ phô insight điểm-mạnh. Nghĩa vụ KHÔNG trả xu từng lần (§4, chống overjustification). Reinforcement thinning cực từ từ qua `rewardDoseFactor`.
- **(D)** Trẻ tick 100% trong 5 giây cuối ngày nhưng ngoài đời không làm; phụ huynh phàn nàn "dùng app con vẫn lười"; trẻ hỏi "được mấy xu" tăng.
- **(R)** **Chuyển khung ngôn ngữ cho phụ huynh:** khi phát hiện dấu hiệu mắng-bằng-số (vd phụ huynh từ chối liên tục), app đổi thông điệp tuần sang **gợi ý hành vi cụ thể để KHEN** ("con tự bắt đầu Toán thứ Ba — khen con nhé") thay vì báo cáo tỷ lệ. Scoreboard (3b) đo **tiến bộ tương đối theo nhóm** (con so với chính con tháng trước), không phải điểm tuyệt đối để phán xét.

### Rủi ro 3 — Vỡ trận kỹ thuật iOS — PWA notification hỏng *(GF-top3, GP-rủi ro2)*
*(Sync-conflict offline đã LOẠI: founder chốt online-only.)*
- **(P)** Giai đoạn 3c: nhắc nhở trigger từ **Cloudflare Worker qua Zalo Bot/ZNS**, không phụ thuộc PWA push. App online-only nên **single-source-of-truth luôn là server** — không có nhánh offline để xung đột.
- **(D)** Chênh lệch retention D7 Android (cao) vs iOS (rớt); phụ huynh báo "app không kêu nhắc"; lỗi mạng khi mất kết nối.
- **(R)** **Trạng thái mất-mạng tường minh & an toàn:** khi offline, app hiện màn "Cần mạng để đồng bộ" (không cho tick mù rồi mất), giữ nguyên streak/kế hoạch trên server → khi có mạng lại vào đúng chỗ. Không bao giờ mất streak oan vì trạng thái luôn ở server.

---

## 6. Câu hỏi buộc trả lời trước khi code lớn (gộp Phần D của 4 nguồn) — trạng thái 28/07

**Q1 — Game rút-dần hay trung tâm? → ĐÃ QUYẾT (founder):** không dùng khái niệm "game rút dần". Nghịch lý màn hình giải bằng **cơ chế chấm + đo theo nhóm (scoreboard, §3b)** — dời trọng tâm giá trị khỏi thời lượng. Game giữ vai trò lớp tạo hứng, không bị tối ưu để kéo giờ.

**Q3 — Offline sync conflict? → ĐÃ QUYẾT (founder):** **Không offline — offline thì app không hoạt động.** Bỏ toàn bộ cân nhắc offline-sync. Server là single-source-of-truth duy nhất; không có nhánh offline để xung đột.

**Q-Business — Định giá? → ĐÃ QUYẾT (founder):** **200k/bé/năm; từ bé thứ 2 giảm 50% (100k).** (Thay mô hình 199k/gia-đình cũ.) Điểm rơi gia hạn = tháng 12 của lộ trình (T1).

**Q2 — Thứ tự: đo lường trước hay Review trước? → ĐỀ XUẤT: ĐO TRƯỚC.**
- *Căn cứ tâm lý học (chuẩn):* mô hình SRL của Zimmerman đặt **Forethought (lập kế hoạch) → Performance → Self-reflection (Review)**. Muốn Review có ý nghĩa thì trước đó phải có **dữ liệu về kế hoạch đã đặt** để đối chiếu ("mình định làm X, thực tế ra sao"). Không có lớp đo (0a: `importance`+`dueDate`+snapshot) thì Review chỉ là cảm tính → đúng cảnh báo GP "self-reflection ảo tưởng".
- *Kết luận:* làm **Giai đoạn 0 (đo) trước**, rồi Giai đoạn 1 (Review emoji) mới có chất liệu để phản chiếu. Đây cũng là hạ tầng cho scoreboard (3b) và nhánh Xu (§4).

**Q4 — Anh em 1 thiết bị → ĐỀ XUẤT: chuyển hồ sơ nhanh, KHÔNG so-kè công khai.**
- *Căn cứ tâm lý học:* so sánh anh-em trực diện (sibling comparison) làm xói mòn động lực nội tại và gây ganh đua độc hại (SDT + nghiên cứu sibling rivalry). Vì vậy scoreboard tuyệt đối **không xếp hạng giữa các con**; mỗi con chỉ so với **chính mình tháng trước**.
- *UX:* màn "Đổi người dùng" nhẹ ở khung giờ vàng (avatar chạm 1 phát), state mỗi bé độc lập trên server. Ưu tiên thấp hơn 0/1/2 — làm khi có tín hiệu nhiều-con thật.

**Q5 — Định giá "việc làm thêm có xu" để trẻ không quy ra tiền thật → ĐỀ XUẤT PHƯƠNG ÁN CHUẨN TÂM LÝ HỌC** *(thuộc nhánh §4, triển khai sau scoreboard)*:
- *Nguyên lý (chống overjustification — Deci/Ryan; tránh "market pricing" — Heyman & Ariely):* khi phần thưởng có **tỷ giá tiền mặt minh bạch**, hành vi chuyển từ "vì trách nhiệm" sang "vì tiền", và trả ít thì tệ hơn không trả. Nên:
  1. **Tách tuyệt đối:** nghĩa vụ (không thương lượng) KHÔNG bao giờ ra xu; chỉ **`contribution` (làm thêm)** mới có xu — khớp spec xu hiện có.
  2. **Không neo vào tiền mặt ở giao diện trẻ:** trẻ thấy xu quy đổi thành **"giỏ phần thưởng/đặc quyền"** (thời gian chơi, chọn món ăn, hoạt động cùng bố mẹ), KHÔNG thấy "1 xu = 1.000đ". Tỷ giá tiền chỉ tồn tại ở tầng phụ huynh/kế toán.
  3. **Trần & nhịp:** áp Quỹ tiêu vặt tuần/tháng có trần (spec xu) để xu không trở thành "lương theo sản lượng"; reinforcement thinning từ từ (`rewardDoseFactor`).
  4. **Đóng khung "đặc quyền" thay "tiền công"** (GP#10 — phụ huynh Việt dị ứng "tí tuổi làm thuê cho mẹ").

**Q6 — Minimum Viable Data → ĐỀ XUẤT (đã đơn giản hoá nhờ online-only):** vì không offline, **không cần** dữ liệu-tối-thiểu để chạy khi mất mạng. MVD rút về: **cache tĩnh cho vỏ app (app shell) để không trắng màn hình khi Safari xoá cache** — mọi state động luôn fetch từ server, kèm màn "Cần mạng để đồng bộ" khi offline (§5-R3). Bỏ hẳn yêu cầu "state nhỏ nhất chạy offline" trong bản nháp trước.

---

## 7. Kế hoạch nâng cấp toàn diện + ATOMIC PLAN (từng bước, phân model theo roadmap)

### 7.0 — Quy ước phân model

| Ký hiệu | Model | Dùng cho |
|---|---|---|
| 🔴 **O** | Opus 4.8 | Thiết kế schema/cơ chế, quyết định KHÓ-ĐỔI (data model, scoreboard, kinh tế xu, tách state), audit. Áp **Confusion Protocol**: có spec/quyết định trước khi code. |
| 🟡 **S** | Sonnet 5 | Code có spec rõ (implement component, migration đã chốt, tích hợp Worker). |
| 🟢 **H** | Haiku 4.5 | Sửa vặt cơ học (đổi copy, rename, checklist, bump version). |

**Nguyên tắc atomic:** mỗi bước là 1 đơn vị giao được độc lập, có **DoD + cách verify tất định** (vitest/build/số đo/screenshot ở `/demo`), không đụng dữ liệu trẻ thật. Bước 🔴 O ra **spec/PR thiết kế** trước; bước 🟡 S code theo spec đó.

### 7.1 — Chuỗi phụ thuộc (roadmap kỹ thuật)

```
Pha 0 (NỀN) ──► Pha 1 (Khép vòng) ──► Pha 2 (Phụ huynh)
   │                                        
   └──► Pha 3 (Nghịch lý + SCOREBOARD 3b) ──► Pha E (Xu/hệ quả)
Kỹ thuật (T) + Business (BZ): chạy song song, không chặn.
```
Điểm chốt: **A0.1 (data model) mở khóa mọi thứ**; **D3.2 (scoreboard) chặn Pha E (xu)**.

### 7.2 — Bảng atomic steps

**Pha 0 — NỀN (đo lường ẩn + đơn giản hoá + scaffolding)** *(ưu tiên #1)*

| ID | Bước (nguyên tử) | Model | DoD / verify |
|---|---|:-:|---|
| **A0.1** | Thiết kế schema: thêm `importance`+`dueDate?` vào task (`constants.js`), mở rộng daily snapshot (`remindersNeeded`, `importantDoneBeforeDue`, `plannedLastNight`); kế hoạch di trú GameState không phá doc cũ | 🔴 O | Spec + test đọc/ghi tương thích ngược; vitest xanh |
| **A0.2** | Code field + ghi số vào snapshot (`planning.js`/`progress.js`) | 🟡 S | vitest xanh; ghi số thật ở `/demo`; **không phô số cho trẻ** |
| **A0.3** | Rút `TomorrowPlanner` → 1-Tap Micro-Choice ≤15s; WOOP/mốc-giờ ẩn theo scaffolding | 🟡 S | Luồng 1 màn; đo thời gian ≤15s; screenshot `/demo` |
| **A0.4** | Thiết kế Scaffolding Level 1-2-3 (cơ chế luồng mỗi level + tiêu chí tự chuyển theo hành vi) | 🔴 O | Spec chuyển-level dựa dữ liệu, khớp roadmap 12 tháng (7.3) |
| **A0.5** | Nâng `uiMode` từ theming → đổi **cơ chế luồng**; 3 câu onboarding | 🟡 S | Level 1 auto-fill+tick; Level 3 full; vitest |
| **A0.6** | Copy onboarding template 1-chạm 30s | 🟢 H | Screenshot; đúng quân luật giao diện |

**Pha 1 — KHÉP VÒNG (Plan→Do→Review)**

| ID | Bước | Model | DoD / verify |
|---|---|:-:|---|
| **B1.1** | Review emoji 1-tap (3 emoji), app tự suy thời gian trễ | 🟡 S | Không có ô text; ghi tín hiệu; `/demo` |
| **B1.2** | Xử-lý-việc-chưa-xong 4 lối + rescue card + ngôn ngữ "đang gỡ vướng" | 🔴 O→🟡 S | Thiết kế 4 lối+trạng thái (O) → code (S); không phạt điểm; vitest |
| **B1.3** | Đổi nút "Con sẵn sàng" → "Khoá kế hoạch"/"Lưu lại" (T4) | 🟢 H | grep hết chuỗi cũ; screenshot |

**Pha 2 — PHỤ HUYNH (insight điểm-mạnh, giữ chân gia hạn)**

| ID | Bước | Model | DoD / verify |
|---|---|:-:|---|
| **C2.1** | Thiết kế insight điểm-mạnh: số→gợi-ý-hành-vi, ẩn %; teen chỉ summary | 🔴 O | Spec mapping số→câu khen; không lộ % phán xét |
| **C2.2** | Code phòng phụ huynh insight card | 🟡 S | Screenshot; ẩn %; vitest |
| **C2.3** | Aha-moment tuần qua Zalo (Worker cron 19h T6) | 🟡 S | ⛔ **CHẶN Zalo integ** (gộp với D3.4 + mục-6): cần founder lập Zalo OA/ZNS + CF cron secret. Bản in-app trùng InsightCard (C2.2) nên hoãn tới khi có kênh gửi thật. |
| **C2.4** | Luồng ông bà: nút "Chia sẻ lịch hôm nay" (text Zalo/SMS, không cần app) | 🟡 S | Bản text đúng; `/demo` |
| **C2.5** | Lý do từ chối cụ thể (3 nút nhanh) nối Definition of Done | 🟢 H | 3 nút; ghi lý do |

**Pha 3 — NGHỊCH LÝ MÀN HÌNH + SCOREBOARD + Zalo**

| ID | Bước | Model | DoD / verify |
|---|---|:-:|---|
| **D3.1** | Chế độ sổ/không màn hình + nút in + đếm giờ kết thúc phiên | 🟡 S | Màn sạch không game; `window.print()`; screenshot |
| **D3.2** | **Thiết kế Scoreboard: chấm + đo theo nhóm** (định nghĩa "nhóm", chỉ số, chuẩn normative, chống so-kè anh em) — **NỀN cho Pha E** | 🔴 O | Spec khớp North Star + spec xu; **Confusion Protocol: founder xác nhận nghĩa "nhóm" (7.4) trước khi code** |
| **D3.3** | Code scoreboard theo spec D3.2 | 🟡 S | vitest; số đo đúng ở `/demo` |
| **D3.4** | Nhắc nhở Zalo Bot/ZNS từ Worker (thay PWA iOS push) | 🟡 S | Gửi thật; log Worker |
| **D3.5** | Bảo vệ giờ nghỉ / mandatory break (cảnh báo mềm khi ngày mai quá đầy) | 🟡 S | Chặn nhập quá ngưỡng; `/demo` |

**Pha E — XU / HỆ QUẢ** *(chỉ bắt đầu SAU D3.3 — scoreboard xong; branch `feat/allowance-economy`)*

| ID | Bước | Model | DoD / verify |
|---|---|:-:|---|
| **E.1** | Rà spec xu khớp scoreboard; chốt hệ quả ≠ hình phạt (mục 16 điểm giao) | 🔴 O | Spec cập nhật; điểm giao rõ với D3.2 |
| **E.2** | Code kinh tế xu (nghĩa vụ không ra xu; chỉ `contribution`) | 🟡 S | vitest; `rewardDoseFactor` fade; branch riêng |
| **E.3** | Giỏ phần thưởng/đặc quyền — ẩn tỷ giá tiền ở giao diện trẻ (Q5) | 🟡 S | Trẻ không thấy "1 xu=1.000đ"; screenshot |

**Xuyên suốt — KỸ THUẬT (T) + BUSINESS (BZ)** *(song song, không chặn)*

| ID | Bước | Model | DoD / verify |
|---|---|:-:|---|
| **T.1** | Thiết kế tách lịch sử → bảng log append-only (Worker); GameState tinh gọn | 🔴 O | Spec; không phình JSONB; không race (online-only, server SoT) |
| **T.2** | Code migration + ghi log append-only | 🟡 S | Migration verify SQL; vitest |
| **T.3** | Bump `CACHE_VERSION` mỗi deploy (checklist PWA) | 🟢 H | grep version tăng; mobile không treo cache |
| **BZ.1** | Đổi giá 199k→**200k/bé** + logic **bé thứ 2 giảm 50%** (SePay webhook + entitlement) | 🔴 O→🟡 S | Thiết kế tính giá (O) → code (S); webhook tính đúng; verify test account |

### 7.3 — Roadmap 12 THÁNG (progressive disclosure — hiện thực hoá T1, điểm rơi gia hạn tháng 12)

Mỗi giai đoạn *đề xuất phụ huynh* mở thêm 1 lớp; tại mỗi thời điểm trẻ chỉ trải 1 lớp mới (luồng vẫn ~15s). Framework **hiện hữu trong trải nghiệm**, vô hình về từ khóa.

| Tháng | Lớp năng lực mở (đề xuất cho phụ huynh) | Framework ẩn bên dưới | Scaffolding |
|---|---|---|---|
| 1–2 | Tick việc + chọn 1 việc quan trọng cho mai (micro-choice) | Habit loop; Plan tối thiểu (SRL-Forethought) | Level 1 |
| 3–4 | Review emoji cuối ngày | SRL-Self-reflection | Level 1→2 |
| 5–6 | Phân biệt "việc quan trọng" vs "việc gấp" | Eisenhower/Covey (ẩn) | Level 2 |
| 7–8 | "Nếu…thì…" khi vướng lặp lại | WOOP mini / implementation intentions | Level 2 |
| 9–10 | Mỗi lúc chỉ làm 1 việc; dự án nhiều bước | Kanban WIP=1; 4DX (ẩn) | Level 2→3 |
| 11–12 | Tự lập kế hoạch trọn ngày + xem tiến bộ (scoreboard) | SRL đầy đủ; đo theo nhóm | Level 3 |

**Điểm rơi tháng 12:** trẻ vừa hoàn thành 1 vòng năng lực trọn vẹn, scoreboard cho thấy tiến bộ so với chính mình → khoảnh khắc tự nhiên **gợi mở gia hạn 200k/bé** (bé thứ 2 giảm 50%).

### 7.4 — Bước đi ngay + 1 điểm cần founder xác nhận

**Làm ngay, song song:** **A0.1** (🔴 O — thiết kế data model, mở khóa mọi thứ) + **A0.3** (🟡 S — micro-choice 15s, thuốc trực tiếp rủi ro #1). Đây là nền rẻ, độc lập.

**1 điểm cần founder xác nhận trước khi code D3.2 (scoreboard — khó-đổi):** nghĩa "**đo theo nhóm**" = (a) theo nhóm loại việc + (b) chuẩn nhóm-tuổi để so con-với-chính-con, **không xếp hạng công khai giữa các trẻ** — đúng ý anh chứ? (D3.2 chặn cả Pha E nên cần chốt trước khi vào Opus thiết kế.)

> **Ghi chú tính trung thực:** persona-sim (PS) là mô phỏng của cùng dòng Gemini, không phải phỏng vấn thật — mọi kết luận dựa trên PS chỉ ở mức **giả thuyết cần kiểm chứng bằng người dùng thật**, không phải sự thật đã chứng minh.
