# Deepdive — Triển khai hiện tại vs Nền tảng học thuật

> **Tác giả:** Claude (Anthropic) · **Model:** Opus 4.8 · **Ngày:** 2026-07-27
> **Đầu vào:** (1) đọc trọn `docs/Nền tảng học thuật.md` (1503 dòng); (2) quét code bản deploy gần
> nhất với bằng chứng `file:line` (map 21 hạng mục quản-lý-công-việc).
> **Điểm khác biệt với bản Grok/Antigravity:** hai model kia chỉ đọc *lý thuyết*; bản này đối chiếu
> lý thuyết **với code thật đang chạy**, nên chỉ ra được **khoảng cách giữa "đã nghĩ" và "đã hiện
> hữu"** — đúng câu hỏi founder: *"Anh chưa nhìn thấy sự hiện hữu ứng dụng của các lý thuyết quản lý
> công việc."*
> **Cách đối chiếu chéo:** xem `docs/PROMPT_DANH_GIA_DOC_LAP.md`. Điểm mù ≥2/3 nguồn cùng nêu = ưu tiên cao.

---

## 0. Chẩn đoán câu hỏi cốt lõi của founder

Founder không nói app *thiếu tính năng*. Founder nói *không nhìn thấy lý thuyết hiện hữu*. Đây là hai chuyện khác nhau, và chẩn đoán đúng mới sửa đúng.

Sự thật kỹ thuật: **app đã cài mầm của khá nhiều lý thuyết**, nhưng dưới dạng **cơ chế ẩn rời rạc**, không phải **xương sống trải nghiệm**:

- Chống overjustification (Deci): CÓ, là hàm `rewardDoseFactor` fade điểm sau 14 ngày (`economy.js:44`) — nhưng trẻ/bố mẹ **không hề thấy** nó; nó chôn trong công thức.
- Streak an toàn (không sụp khi lỡ): CÓ, `streakFreeze` (`economy.js:604`) — nhưng là "thẻ đóng băng" mua bằng điểm, không phải triết lý phục hồi hiển thị.
- Lập kế hoạch buổi tối: CÓ, `TomorrowPlanner` (`planning.js` + `TomorrowPlanner.js`) — nhưng là **một modal bật lên sau 19h**, không phải **vòng lặp Plan→Do→Review làm cột sống điều hướng**.

→ **Chẩn đoán:** lý thuyết bị **"chôn dưới nắp máy" quá sâu** đến mức chính người làm ra cũng không cảm nhận được nó đang vận hành. Nền tảng học thuật muốn mọi thứ *dưới nắp máy* — nhưng "dưới nắp máy" nghĩa là **trẻ không phải học lý thuyết**, KHÔNG có nghĩa là **trải nghiệm không phản chiếu lý thuyết**. Hiện tại app rơi vào vế thứ hai: lý thuyết vừa vô hình với trẻ, vừa vô hình với sản phẩm.

Nói cách khác: **có "Do" (checklist + game), có mầm "Plan" (TomorrowPlanner), gần như không có "Review", và hoàn toàn không có bộ khung phân loại/ưu tiên/đo lường để 3 pha đó khép thành một vòng có ý nghĩa.**

---

## 1. Bảng đối chiếu 21 hạng mục (nền bằng chứng)

Trạng thái: ✅ có · 🟡 một phần/nửa vời · ❌ không.

| # | Hạng mục (theo nền tảng học thuật) | TT | Bằng chứng / khoảng cách |
|---|---|---|---|
| A1 | Màn "Chuẩn bị ngày mai" buổi tối | 🟡 | `TomorrowPlanner.js:32`, `planning.js:76` — có chọn focus task + anchor + firstStep; **snapshot toàn bộ task, không xử lý từng việc chưa xong** |
| A2 | Bước "nhìn lại buổi tối" (self-reflection SRL) | ❌ | Nhảy thẳng vào form plan, không có review |
| A3 | Sáng chỉ "nhắc lại" | ✅ | `getPlanPhase()` `planning.js:63` tái dùng plan tối qua ở chế độ đọc |
| A4 | Xử lý việc chưa xong (chuyển ngày/chia nhỏ/nhờ giúp/bỏ có lý do) | 🟡 | Chỉ "chia nhỏ" qua `splitTask`/`buildTinyTask` (`habits.js:31`); **thiếu chuyển ngày, nhờ giúp, bỏ có lý do** |
| A5 | Màn xác nhận "Con sẵn sàng" + trải nghiệm "mình-tối-qua giúp mình-hôm-nay" | ❌ | Không có confirm step, không có moment cảm xúc |
| B6 | Phân loại quan trọng/khẩn cấp (Eisenhower ngầm) | ❌ | Task model (`constants.js:111`) **không có** priority/importance/urgency/deadline; chỉ `isMandatory` |
| B7 | Tách 4 loại việc (nghĩa vụ/thói quen/dự án/đóng góp) | ❌ | Không có field `type`/`kind`; `category` chỉ là nhóm chủ đề |
| B8 | "Dự án quan trọng chưa gấp" (multi-step, deadline xa) | ❌ | Journey (`journeys.js`) gần nhất nhưng là thói quen 3 tuần, không phải project có hạn |
| C9 | Điểm phân biệt theo loại việc | 🟡 | Mọi task cùng `completeTask` (`economy.js:90`); chỉ khác ở dose-fade theo streak, **không theo loại việc** |
| C10 | Reinforcement giảm dần | ✅ | `rewardDoseFactor` FADE_START=14 → GRADUATION_DAYS=30 (`economy.js:44`) |
| C11 | Nguồn xu (heroCoins) | ✅(dữ kiện) | Từ đào mỏ/boss/thưởng tay — **không từ task**; đây là gốc của spec kinh tế xu đang chờ duyệt |
| D12 | Phát hiện "ngày mai quá tải" / buffer | ❌ | `createTomorrowPlan` (`planning.js:38`) không có capacity check |
| D13 | Giới hạn WIP ("việc tiếp theo") | 🟡 | `focusTaskId` single-select (1 task "doing", `dashboard/page.js:211`); phần còn lại vẫn phơi hết ở lane "today" |
| D14 | Bước nhỏ đầu tiên / WOOP if-then | 🟡 | Có `firstStep` free-text; **không có** obstacle→plan (WOOP 4 bước) |
| E15 | Scoreboard 3 chỉ số (Giữ lời/Chủ động/Đang rèn) | ❌ | Chỉ có level/exp/streak/trustScore + 5 stats thẩm mỹ (`StatsGrid.js:17`) |
| E16 | Đo "% việc quan trọng trước hạn" / "số lần cần nhắc" | ❌ | Không có deadline; snapshot (`economy.js:621`) chỉ đếm completed/mandatory/screen |
| E17 | Streak khi lỡ (phục hồi, không về 0) | ✅ | `streakFreeze` (`economy.js:604`) |
| F18 | Chế độ sổ / không màn hình | 🟡 | Chỉ `window.print()` (`TomorrowPlanner.js:224`); **không** widget/lockscreen/quick-view đọc-only |
| F19 | Phân tầng theo tuổi (6-8/9-11/12+) | 🟡 | `uiMode` kid/teen đổi theming+rewards+text; **không** khác cơ chế luồng kế hoạch; Teens chưa là sản phẩm riêng |
| G20 | Phụ huynh quản theo ngoại lệ (thấy "đã có kế hoạch chưa") | ❌ | 4 tab parent **không** hiển thị plan-state của con; vẫn duyệt từng task |
| G21 | Tiêu chuẩn hoàn thành (Definition of Done) hiển thị | ❌ | Không có DoD; đúng xung đột "con làm rồi / bố mẹ thấy chưa đạt" |

**Tổng: ✅ 4 · 🟡 8 · ❌ 9.** Bốn cái ✅ đều là *cơ chế ẩn*; chín cái ❌ tập trung đúng vào **lớp "quản lý công việc"** (Eisenhower, 4 loại việc, dự án, scoreboard, đo lường, management-by-exception, DoD) — chính là thứ founder nói không thấy.

---

## 2. Ba phát hiện GỐC (đọc kỹ nhất phần này)

### 🔴 GỐC-1: App không thể ĐO chính North Star của nó

Founder đã chốt North Star: *"Tỷ lệ việc quan trọng do trẻ tự chọn thời điểm và tự bắt đầu mà không cần bố mẹ nhắc."*

Nhưng để đo được câu đó, hệ thống phải biết ba thứ — và **không có thứ nào tồn tại trong data model**:
1. **Việc nào "quan trọng"** → không có field importance/priority (B6 ❌).
2. **"Trước hạn"** → không có deadline (E16 ❌).
3. **"Không cần nhắc"** → không đo số lần bị nhắc; `approvalNudges` (`economy.js:287`) đếm chiều ngược (con nhắc bố mẹ duyệt).

→ **Hệ quả nghiêm trọng nhất toàn bộ deepdive:** sản phẩm đang tối ưu một North Star mà chính nó **mù**. Không đo được thì không cải thiện được, không chứng minh giá trị cho phụ huynh trả 199k ("con tôi tiến bộ ở đâu?" → không có câu trả lời định lượng). Đây phải là việc sửa số 1.

### 🔴 GỐC-2: Kiến trúc động lực đang KÉO NGƯỢC North Star (nghịch lý time-on-site)

Insight đắt nhất trong nền tảng học thuật đến từ **gia đình thật**: app đang là *"cửa ngõ sang YouTube"*, và **child time-on-site nên GIẢM** — "trẻ mở app càng ít càng tốt nhưng vẫn nhớ việc và tự làm ngoài đời".

Nhưng toàn bộ lớp game hiện tại (đào mỏ `mineTreasure`, pet hunger, boss tuần, energy loop, cosmetics) là **kiến trúc engagement cổ điển — thiết kế để kéo trẻ Ở LẠI app**. Hai lực này **chỏi nhau trực tiếp**:

- Nền tảng học thuật muốn: mỗi tối lập kế hoạch 1 lần → đưa ra giấy/sổ → cuối ngày vào check 1 lần → North Star = "đỡ phải nhắc", đo bằng **giảm** thời gian dùng.
- Game loop muốn: quay lại đào mỏ, cho pet ăn, đánh boss → tăng session/ngày.

→ **Đây là mâu thuẫn chiến lược cấp sản phẩm, không phải bug.** App có mầm đúng hướng (`window.print()` = đưa kế hoạch ra giấy) nhưng bị chôn dưới một game loop hướng ngược. Nếu không giải quyết dứt khoát, mọi tính năng planning mới sẽ bị game loop nuốt. **Phải chọn:** game là *mồi câu ban đầu rồi rút lui*, hay là *trung tâm*? Nền tảng học thuật (và dữ liệu gia đình thật) nói rõ: game là "lớp tạo hứng thú, không phải giá trị phụ huynh trả tiền lâu dài".

### 🔴 GỐC-3: Vòng Plan→Do→Review bị đứt ở "Review", và "Plan" chưa phải cột sống

Zimmerman SRL = 3 pha: **Forethought (Plan) → Performance (Do) → Self-reflection (Review)**, và pha 3 nuôi lại pha 1. Hiện trạng:

- **Do**: mạnh (checklist, escrow, game) — đây là phần app làm tốt nhất.
- **Plan**: có mầm (`TomorrowPlanner`) nhưng là **modal phụ bật sau 19h**, không phải khung điều hướng chính; dashboard vẫn game-first.
- **Review**: gần như **không có** (A2 ❌, A5 ❌). Không có "nhìn lại hôm nay", không có moment "mình-tối-qua giúp mình-hôm-nay" — mà nền tảng học thuật coi *chính moment đó* là **bản sắc sản phẩm** ("Mỗi tối chuẩn bị một ngày mai bình tĩnh hơn").

→ Vòng lặp đứt ở Review nghĩa là trẻ **không bao giờ đóng được vòng tự-điều-chỉnh** — cốt lõi của self-regulated learning. App dừng ở "làm việc để nhận điểm", chưa lên được "nhìn trước, chọn việc quan trọng, đặt thời gian, xử lý trở ngại, điều chỉnh".

---

## 3. Điểm mù & thiếu sót theo nhóm (phần chính)

Mỗi mục: **hiện trạng (bằng chứng)** → **lý thuyết đòi gì** → **khoảng cách/hệ quả** → **đề xuất tối thiểu (rẻ nhất)**.

### Nhóm A — Vòng Plan→Do→Review chưa khép

**A-1. Thiếu pha REVIEW buổi tối.**
Hiện: TomorrowPlanner vào thẳng form (A2 ❌). SRL đòi self-reflection trước forethought. Khoảng cách: trẻ lập kế hoạch mà không nhìn lại hôm nay đã đi tới đâu → kế hoạch thiếu dữ liệu tự thân, mất cơ hội cảm xúc "hôm nay mình làm được gì". *Đề xuất:* thêm 1 màn nhẹ trước planner — không phải biểu đồ, chỉ một câu: "Hôm nay con giữ được 3/4 lời hứa. Việc chưa xong: [X]. Con muốn làm gì với nó?" → nối thẳng vào A-2.

**A-2. Xử lý việc chưa xong quá nghèo.**
Hiện: chỉ "chia nhỏ" (A4 🟡). Nền tảng học thuật §"Nếu trẻ chưa hoàn thành" đòi **4 lối**: chuyển ngày · không cần làm nữa · nhờ bố mẹ · chọn giờ khác — và đặc biệt *"không ép hoàn thành sạch mới được lập kế hoạch"*, *"không trừ điểm vì không hoàn hảo"*, và cảnh báo "đã chuyển 3 lần → kế hoạch chưa phù hợp". Khoảng cách: thiếu 3/4 lối → trẻ gặp việc khó chỉ có "chia nhỏ" hoặc bỏ lơ → cảm giác thất bại. *Đề xuất:* mở rộng luồng xử-lý-việc-chưa-xong thành 4 nút; đếm số lần chuyển để gợi "cùng bố mẹ xem lại".

**A-3. Thiếu màn "Con sẵn sàng" + khoảnh khắc bản sắc.**
Hiện: A5 ❌. Nền tảng học thuật coi *"mình của tối hôm qua đã giúp mình của hôm nay"* là **trải nghiệm lập kế hoạch thực sự** và là điểm khác biệt với mọi app checklist. Khoảng cách: bỏ mất chính moment tạo bản sắc & giữ chân cảm xúc. *Đề xuất:* màn xác nhận 1 nút "Con sẵn sàng" + sáng hôm sau "Chào buổi sáng — hôm qua con đã chuẩn bị hôm nay rồi" (rẻ, chỉ là 2 màn tĩnh, giá trị cảm xúc cao).

### Nhóm B — Time Matrix & 4 loại việc (điểm founder nhấn mạnh nhất)

**B-1. Không có trục quan trọng/khẩn cấp — kể cả ngầm.**
Hiện: B6 ❌, chỉ `isMandatory`. Nền tảng học thuật: ma trận phải tồn tại như **"bộ máy phân loại ngầm"** (có deadline gần? ảnh hưởng mục tiêu? lên lịch trước được? trẻ có phải người phù hợp?) — trẻ chỉ thấy 4 nhãn đời thường ("làm sớm để không bị gấp" / "cần xử lý" / "nhờ người lớn" / "nếu còn thời gian"). Khoảng cách: đây **chính** là "lý thuyết quản lý công việc" founder không thấy hiện hữu — vì nó chưa tồn tại ở tầng data. *Đề xuất tối thiểu:* thêm 2 tín hiệu vào task — `importance` (bool/enum do bố mẹ hoặc app suy) + `dueDate` (optional). Chưa cần UI ma trận; chỉ cần data để (a) đo North Star, (b) sắp thứ tự "bắt đầu từ đây".

**B-2. Không tách 4 loại việc → dính đúng bẫy overjustification ở tầng loại việc.**
Hiện: B7 ❌; mọi task cùng `completeTask`, dose-fade chỉ theo *streak* chứ không theo *loại* (C9 🟡). Nền tảng học thuật §5 + bảng 4 loại: **nghĩa vụ ổn định KHÔNG trả xu từng lần** (đo theo % giữ cam kết); chỉ **đóng góp thêm** mới có xu; **dự án** ghi nhận năng lực planning. Khoảng cách: app đang trả cùng một kiểu thưởng cho "đánh răng" (nghĩa vụ) và "giúp mẹ việc ngoài phần mình" (đóng góp) → dạy "có quà mới làm" đúng như Deci cảnh báo. *Đề xuất:* thêm `task.kind ∈ {obligation, habit, project, contribution}`; kinh tế xu (spec đang chờ) **chỉ chảy vào `contribution` + tạm thời cho `habit`** — điều này khớp cả spec mục 13 (hệ quả) lẫn spec kinh tế xu.

**B-3. Không có "dự án quan trọng chưa gấp".**
Hiện: B8 ❌ (Journey ≠ project). Nền tảng học thuật nói thẳng: *"'dự án quan trọng chưa gấp' phải có chỗ riêng, nếu không app vẫn chỉ là checklist việc lặp."* Đây là điểm **nâng cấp bắt buộc** để app vượt khỏi to-do list. Khoảng cách: không có nơi cho "bài thuyết trình còn 1 tuần" — đúng ví dụ nền tảng học thuật dùng. *Đề xuất:* một loại task `project` có `dueDate` + danh sách bước con; luồng "chia bước đầu tiên" (đã có `firstStep`, tái dùng).

### Nhóm C — Scoreboard (4DX) & Đo lường

**C-1. Không có 3 chỉ số Giữ lời / Chủ động / Đang rèn.**
Hiện: E15 ❌ — có level/exp/streak/trustScore/5 stats game. Nền tảng học thuật: trẻ chỉ cần thấy 3 vòng tiến bộ (Giữ lời = % cam kết; Chủ động = việc quan trọng làm trước khi gấp; Đang rèn = thói quen mới). Khoảng cách: **`trustScore` (0-100) đã tồn tại và gần như CHÍNH LÀ "Giữ lời"** — nhưng đang bị đặt tên/định vị sai (điểm "tin tưởng để auto-duyệt") thay vì "giữ lời". Một cơ hội tái định vị rẻ. *Đề xuất:* tái nhãn trustScore → "Giữ lời"; thêm "Chủ động" (đếm task importance làm trước due); "Đang rèn" tái dùng journey/habit streak. Đây cũng là hạ tầng cho spec mục 13 tầng-2 (hệ quả = chỉ số Giữ lời giảm).

**C-2. Thiếu lead measures của 4DX & North Star.**
Hiện: E16 ❌. Nền tảng học thuật liệt kê thước đo: số lần cần nhắc, % việc quan trọng lên lịch trước, % kế hoạch khả thi, % việc Q2 bị đẩy thành Q1, tỷ lệ tự-điều-chỉnh sau khi lỡ. Khoảng cách: không đo → 4DX không có "scoreboard" thật, chỉ có điểm game. *Đề xuất:* mở rộng daily snapshot (`economy.js:621`) thêm vài trường: `remindersNeeded`, `importantDoneBeforeDue`, `plannedLastNight(bool)`. Rẻ, chỉ ghi thêm số.

### Nhóm D — Lập kế hoạch thông minh (chống quá tải)

**D-1. Không phát hiện quá tải / không bảo vệ thời gian nghỉ.**
Hiện: D12 ❌. Nền tảng học thuật §"Kế hoạch phải bảo vệ thời gian nghỉ": trẻ giỏi vẫn bị quá tải; app **không được chỉ đẩy năng suất**; phải phát hiện không-có-nghỉ, không-buffer, quá-nhiều-block, việc-dời-nhiều-ngày. Khoảng cách: TomorrowPlanner nhồi hết task, không cảnh báo. Rủi ro thương hiệu: app "dạy con" lại vô tình dạy nhồi việc. *Đề xuất:* một cảnh báo mềm khi số việc/ngày vượt ngưỡng: "Ngày mai hơi đầy. Con muốn bỏ/chuyển việc nào?" (đúng câu chữ nền tảng học thuật).

**D-2. WIP & "bắt đầu từ đây" chưa đúng tinh thần.**
Hiện: D13 🟡 — focus single-select nhưng mọi task phơi hết ở "today". Nền tảng học thuật (câu 20 + dữ liệu trẻ 9t chọn A): **giữ TOÀN BỘ danh sách** làm "bộ nhớ ngoài", nhưng thêm vùng "Bắt đầu từ đây" nổi bật 1 việc quan trọng + việc tiếp theo. Khoảng cách: có kanban nhưng chưa có tầng "bắt đầu từ đây" dẫn dắt. *Đề xuất:* thêm block "Bắt đầu từ đây" trên dashboard, tính từ importance/dueDate.

### Nhóm E — Phụ huynh: management by exception

**E-1. Kế hoạch của con VÔ HÌNH với bố mẹ.**
Hiện: G20 ❌ — 4 tab parent không cho biết "con đã có kế hoạch ngày mai chưa". Nền tảng học thuật coi đây là **giá trị trả tiền chính** (painkiller "đỡ phải nhắc" = lý do bán được, theo chính founder ở câu 10/phần thang giá trị). Khoảng cách: phụ huynh vẫn phải duyệt từng task (mode giám sát), chưa có mode "chỉ xem ngoại lệ". *Đề xuất:* 1 card ở phòng phụ huynh: "Ngày mai của [con] đã sẵn sàng · 3 việc thường ngày · 1 việc quan trọng" + chỉ báo bất thường ("deadline sát chưa có thời gian"). Nút "Gợi ý cho con", KHÔNG "Duyệt/Từ chối kế hoạch".

**E-2. Thiếu micro-coaching đúng thời điểm.**
Hiện: có `recognition.js` (lời khen) nhưng không có coaching cho phụ huynh lúc căng. Nền tảng học thuật §dữ liệu thật (phụ huynh câu 5: lý tưởng chia nhỏ, thực tế nhắc-rồi-để-mặc): đúng lúc phụ huynh sắp nhắc lần 2 → gợi *một hành động*: "Thử hỏi con: bước đầu tiên con muốn làm là gì?" Khoảng cách: bỏ lỡ khoảnh khắc chuyển khoa học thành hành vi. *Đề xuất:* 1 dòng gợi ý theo ngữ cảnh trong phòng phụ huynh, không phải bài giảng.

### Nhóm F — Ngoài màn hình & nghịch lý engagement

**F-1. "Chế độ sổ / không màn hình" mới ở mức print.**
Hiện: F18 🟡 (chỉ `window.print()`). Nền tảng học thuật (insight #1 từ gia đình thật) đòi hẳn một **"Chế độ không màn hình"**: mẫu A4/A5 ép plastic, template chép vào sổ ("Phải làm – Nên làm sớm – Con muốn làm"), "Chế độ sổ" hiện kế hoạch 20 giây để chép rồi kết thúc phiên, widget/lockscreen chỉ-đọc, gửi tóm tắt Zalo cho ông bà. Khoảng cách: đây là giải pháp trực tiếp cho "cửa ngõ YouTube" — mà app gần như chưa làm. *Đề xuất:* "Chế độ sổ" (một màn danh sách sạch, không game/xu/hiệu ứng, có nút in + đếm giờ kết thúc phiên). Rẻ và đánh đúng insight đắt nhất.

**F-2. Nghịch lý engagement chưa được giải (xem GỐC-2).**
*Đề xuất chiến lược (cần founder quyết):* định vị lại game thành "lớp mồi rút dần" — ví dụ game/đào mỏ chỉ mở trong phiên check cuối ngày, không phải thứ kéo trẻ mở app giữa ngày; North Star đo bằng **giảm** session. Đây là quyết định sản phẩm, ghi vào mục Câu hỏi (§5).

### Nhóm G — Định nghĩa "Xong" & Quyền tự chủ

**G-1. Không có Definition of Done.**
Hiện: G21 ❌. Nền tảng học thuật §6: mỗi việc mơ hồ cần tiêu chuẩn nhìn được ("Dọn bàn học: sách lên kệ · mặt bàn trống · rác đúng chỗ") — giải xung đột "con làm rồi / chưa đạt" mà **không cần ảnh bằng chứng** (app đã bỏ photo-evidence, đúng hướng). *Đề xuất:* field `doneCriteria` (2-3 gạch đầu dòng) hiện trước khi trẻ làm task mơ hồ; tùy chọn, chỉ cho task bố mẹ đánh dấu "mơ hồ".

**G-2. Quyền tự chủ "khi nào & bằng cách nào" chưa thành cơ chế trung tâm.**
Hiện: có chọn focus task, nhưng phần lớn là checklist bố mẹ đặt. Nền tảng học thuật §3 (giải mâu thuẫn bố mẹ–con): gia đình xác định *nghĩa vụ*; trẻ chọn *thứ tự/thời điểm/cách làm*, được đề nghị dời/chia/nhờ, **không được âm thầm xóa nghĩa vụ**. Khoảng cách: app chưa phân tách rạch ròi "Gia đình cần" vs "Con tự chọn" (nền tảng học thuật §dữ liệu thật câu 9 đòi phân biệt này + mọi thay đổi của bố mẹ phải minh bạch với con). *Đề xuất:* đánh dấu nguồn task (family-required vs child-chosen); thay đổi của bố mẹ hiện rõ cho con ("Bố đổi giờ vì…").

---

## 4. Ba rủi ro lớn nhất nếu giữ nguyên hướng hiện tại

1. **Không chứng minh được giá trị → churn ở lần gia hạn.** Vì mù North Star (GỐC-1), sau 3 tháng phụ huynh không có bằng chứng "con tiến bộ/đỡ phải nhắc" → lý do trả 199k năm 2 biến mất. *Dấu hiệu sớm:* phòng phụ huynh không trả lời được câu "tuần này con tiến bộ ở đâu" bằng số.

2. **Game loop nuốt tính năng planning.** Nếu không giải nghịch lý engagement (GỐC-2), mọi Plan/Review mới thêm vào sẽ bị đào-mỏ/pet/boss lấn át, và app tiếp tục tăng child time-on-site — ngược North Star, đồng thời củng cố "cửa ngõ YouTube". *Dấu hiệu sớm:* session/ngày của trẻ tăng sau khi ra tính năng planning.

3. **Trở thành "máy nhồi việc có phạt".** Nếu thêm hệ quả/phạt (feedback founder) mà **không** kèm pha Review nhân văn + xử-lý-việc-chưa-xong 4-lối + chống quá tải, app trượt sang giám sát-trừng phạt — đúng thứ nền tảng học thuật cảnh báo, và là cách nhanh nhất khiến trẻ (nhất là 12+) bỏ app. *Dấu hiệu sớm:* trẻ bắt đầu "khai gian đã làm" hoặc chỉ nhập phiên bản bố mẹ muốn thấy.

---

## 5. Câu hỏi nền tảng học thuật + code CHƯA trả lời (cần founder quyết trước khi code lớn)

1. **Game là mồi-rút-dần hay trung tâm?** (GỐC-2) Quyết định này định hình mọi thứ. Khuyến nghị: mồi rút dần, North Star đo bằng giảm session.
2. **App có nhận `importance`/`dueDate` không?** Không có nó thì không đo được North Star và không có "quản lý công việc". Khuyến nghị: CÓ, tối thiểu 2 field, app tự suy phần lớn để bố mẹ không phải nhập.
3. **"Giữ lời" tái định vị từ `trustScore` hay xây mới?** Khuyến nghị: tái định vị (rẻ, đã có hạ tầng 0-100 + auto-approve).
4. **Thứ tự ưu tiên: đo lường trước hay trải nghiệm Review trước?** Khuyến nghị: đo lường (GỐC-1) trước vì nó là hạ tầng cho cả scoreboard lẫn hệ quả.

---

## 6. Nếu chỉ được sửa MỘT điều

**Thêm 2 tín hiệu vào task — `importance` và `dueDate` — rồi bắt đầu GHI LẠI (đo) hành vi quanh chúng.**

Vì một thay đổi rẻ này mở khóa đồng thời: (a) đo được North Star; (b) sắp "Bắt đầu từ đây"; (c) phát hiện quá tải; (d) chỉ số "Chủ động"; (e) hệ quả tầng-2 ở spec kinh tế xu; (f) chính là "lý thuyết quản lý công việc" hiện hình. Không có nó, mọi lý thuyết còn lại vẫn treo lơ lửng.

---

## 7. Lộ trình đề xuất (thứ tự, không phải khối lượng)

Nguyên tắc: **đo trước, khép vòng sau, giải nghịch lý cuối.** Mỗi bước độc lập giao được.

1. **Đo lường & phân loại (hạ tầng, ưu tiên #1):** thêm `importance` + `dueDate` + `task.kind` (4 loại); mở rộng daily snapshot (reminders/important-before-due/planned-last-night). → mở khóa North Star + GỐC-1.
2. **Khép vòng Review:** thêm pha "nhìn lại hôm nay" nhẹ + xử-lý-việc-chưa-xong 4 lối + màn "Con sẵn sàng" + moment sáng. → chữa GỐC-3.
3. **Scoreboard 3 chỉ số:** tái định vị trustScore→"Giữ lời", thêm "Chủ động"/"Đang rèn". → 4DX + hệ quả tầng-2.
4. **Management by exception (phụ huynh):** card "kế hoạch con đã sẵn sàng" + gợi-ý-cho-con + micro-coaching. → giá trị trả tiền.
5. **Chế độ sổ / không màn hình** + bắt đầu giải nghịch lý engagement. → chữa GỐC-2, đánh insight gia đình thật.
6. **Kinh tế xu** (spec đang chờ) gắn vào `task.kind`: xu chỉ chảy vào `contribution` (+ tạm `habit`), khớp mục 13 hệ quả.

> Ghi chú móc nối: bước 1 & 3 là **tiền đề của spec kinh tế xu** (`docs/SPEC_KINH_TE_XU_MINH_BACH.md` mục 13). Nên cân nhắc làm hạ tầng đo-lường/phân-loại **trước hoặc song song** với kinh tế xu, thay vì sau — kẻo lại trả xu cho nghĩa vụ đúng lỗi Deci.
