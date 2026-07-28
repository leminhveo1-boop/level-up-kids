# SPEC D3.2 — SCOREBOARD: CHẤM & ĐO THEO NHÓM

> Thiết kế: Claude / Opus 4.8 / 2026-07-28. Deliverable của bước **D3.2** (🔴 O) trong
> `docs/KE_HOACH_HOAN_THIEN_SAN_PHAM.md` §7.2. **NỀN cho Pha E (xu).**
> Founder đã chốt (28/07) nghĩa **"đo theo nhóm"** = (a) theo nhóm **loại việc** + (b) **chuẩn nhóm-tuổi**
> để **so con-với-chính-con theo thời gian**, **KHÔNG xếp hạng công khai giữa các trẻ**.
>
> DoD: *Spec khớp North Star + spec xu.* Code ở D3.3 (🟡 S). **Chưa code gì ở bước này.**

---

## 0. Một câu

Scoreboard = tấm gương **con-soi-chính-con**: gộp việc theo **5 vùng năng lực** (trùng đúng 5 chỉ số
anh hùng trẻ đã thấy), đo **nỗ lực + tự khởi động + đều đặn** của mỗi vùng **kỳ này so kỳ trước**,
hiệu chỉnh kỳ vọng theo **lứa tuổi** — **tuyệt đối không** so con với anh em/bạn bè, **không** phô %.

---

## 1. Nguyên tắc bất biến (kế thừa, không được phá)

| # | Luật | Nguồn |
|---|---|---|
| P1 | **T3 — "Đo tất cả, phô rất ít".** Tầng máy đo đầy đủ; UI chỉ phô sự thật nỗ lực để khen. | `insight.js`, `progress.js` |
| P2 | **CẤM %** hoàn thành trong mọi text trẻ/phụ huynh THẤY. Được nêu **số đếm nỗ lực** (số việc, số ngày). | `insight.js` luật ẩn số |
| P3 | **So-với-chính-mình** (Dweck process praise). **KHÔNG** so anh em/bạn. | `progress.js` |
| P4 | **Nghĩa vụ (mandatory) KHÔNG mint xu** ("a fine is a price" — Gneezy). Scoreboard đo nghĩa vụ như **nỗ lực**, không như tiền. | [[spec-kinh-te-xu-minh-bach]] mục 13 |
| P5 | **Không dán nhãn/So-kè.** Mọi "sụt" chỉ trên tài nguyên game, phục hồi được, không về 0, không báo động. | spec-xu mục 13 |
| P6 | **Trung thực dữ liệu.** Không bịa mức máy không đo được; **không bịa percentile lứa tuổi** (ta KHÔNG có dữ liệu dân số thật). | ghi chú trung thực §7.2 roadmap |

---

## 2. "NHÓM" = 5 Vùng Năng Lực (đã tồn tại, không phát minh mới)

6 `category` của task map sẵn vào **5 `statKey`** (xem `constants.js`: connection→`help`). Vì vậy nhóm
scoreboard = **đúng 5 chỉ số "⚔️ SỨC MẠNH ANH HÙNG"** trẻ đang thấy trên dashboard. Không thêm từ vựng.

```
CATEGORY_TO_GROUP = {
  strength:   "strength",   // 🏃 Thể Lực
  intellect:  "intellect",  // 🧠 Trí Tuệ
  discipline: "discipline",  // ⚡ Kỷ Luật
  creative:   "creative",   // 🎨 Sáng Tạo
  help:       "help",       // 🤝 Giúp Đỡ
  connection: "help",       // 💞 Kết nối → gộp vào Giúp Đỡ (đã trùng statKey "help")
}
```

**Quyết định (khuyến nghị, chờ founder xác nhận §9-Q1):** giữ **5 vùng** (gộp connection vào help) —
khớp radar chỉ số sẵn có, trẻ không phải học nhóm mới. *Ceiling:* nếu sau này muốn tách "Kết nối" thành
vùng riêng (giá trị: nêu bật quan hệ gia đình) thì đây là chỗ đổi map — 1 dòng.

---

## 3. Data model — mở rộng ADDITIVE (khó-đổi, tương thích ngược)

### 3.1 Vấn đề

Daily snapshot hiện (`economy.js` `closeDay`) chỉ lưu **TỔNG/ngày**:
`{date, completed, total, mandatoryDone, mandatoryTotal, screenMinutes, trustScore, streak, remindersNeeded, importantDone, importantTotal, plannedLastNight, reviewed, reviewMood}`.
**KHÔNG có breakdown theo nhóm** → không thể "đo theo nhóm theo thời gian". Phải bổ sung.

### 3.2 Field mới trên snapshot (thêm, không sửa cũ)

```jsonc
// mỗi phần tử history[] thêm:
"groups": {
  "strength":   { "done": 1, "total": 1, "importantDone": 1, "importantTotal": 1 },
  "intellect":  { "done": 2, "total": 3, "importantDone": 2, "importantTotal": 2 },
  "discipline": { "done": 1, "total": 2, "importantDone": 0, "importantTotal": 1 },
  "creative":   { "done": 0, "total": 1, "importantDone": 0, "importantTotal": 0 },
  "help":       { "done": 2, "total": 2, "importantDone": 0, "importantTotal": 0 }
}
```

- **`done`/`total`**: số việc nhóm đó đã-làm / tổng, trong ngày đóng.
- **`importantDone`/`importantTotal`**: nhánh North Star theo nhóm (`task.importance`).
- Tính tại `closeDay` từ `settled.tasks` (đúng chỗ `northStarSignals` chạy), qua hàm thuần mới
  `groupSignals(tasks)` trong `progress.js`.
- **Không phình JSONB**: 5 nhóm × 4 int = 20 int/ngày; `HISTORY_LIMIT_DAYS=60` → ~1.2k int. Chấp nhận
  được tạm; **đích cuối là bảng log append-only T.1/T.2** — ghi chú nối, không chặn D3.3.

### 3.3 Tương thích ngược (BẮT BUỘC — khớp A0.1)

- Snapshot cũ **thiếu `groups`** → mọi hàm đọc coi như `{}` (nhóm vắng = `{done:0,total:0,importantDone:0,importantTotal:0}`). **Không** migrate/backfill lịch sử cũ (không bịa số quá khứ — P6).
- Scoreboard chỉ tính trên các ngày **có** `groups`; khi chưa đủ ngày → trạng thái `"insufficient"`
  (giống `compareWeeks`), UI hiện lời nâng đỡ hướng tới, **không** con số trống.
- `createInitialState` không cần đổi (history vẫn `[]`).

---

## 4. Chỉ số scoreboard (hàm thuần, `progress.js`/module mới `scoreboard.js`)

Tất cả **so kỳ này (7 ngày đóng gần nhất) vs kỳ trước (7 ngày trước đó)** — cùng khung `compareWeeks`.

Cho **mỗi vùng**:

| Chỉ số | Định nghĩa | Phô cho ai | Cấm |
|---|---|---|---|
| **Nỗ lực** `effort` | Σ `done` trong kỳ | Trẻ 9+ (số đếm), phụ huynh | Không "%", không "x/y" dạng điểm |
| **Xu hướng** `trend` | `effort` kỳ này vs kỳ trước → `up/flat/down/insufficient` | Trẻ 9+, phụ huynh | Down = lời nâng đỡ, không đổ lỗi |
| **Tự khởi động** `selfStart` | Σ `importantDone` khi ngày đó `remindersNeeded=0` | Phụ huynh (North Star), teen summary | — |
| **Đều đặn** `activeDays` | Số ngày trong kỳ có `done≥1` ở vùng | Trẻ 9+ ("giữ nhịp"), phụ huynh | Không streak-về-0 gây hoảng |
| **Phong độ / Độ bền Khiên** `form` | Thước game bền: **tăng** theo `activeDays`, **chớm sụt** khi đứt nhịp, **kẹp sàn > 0** | Trẻ 9-11 (game, khỏe lại được), 12-13 (tự xem) | Không %, không về 0, không báo phụ huynh dạng điểm |

**`form` (điểm giao then chốt với spec-xu mục 13):** hàm thuần, đầu vào = chuỗi `activeDays`/đứt-nhịp
theo vùng; đầu ra = mức 0<`form`≤1 (hoặc 5 nấc icon Khiên). Quy tắc: mỗi ngày active +Δ, mỗi ngày đứt −Δ′
với **Δ′<Δ và có sàn** (không extinction cứng). Đây là thứ cơ chế "Độ bền Khiên/Phong độ" (spec-xu Q1)
đọc để render, và UI 2-bên-đồng-thuận restitution (spec-xu Q2) tham chiếu — **nhưng `form` KHÔNG tự trừ xu**.

---

## 5. Chuẩn nhóm-tuổi (b) — HIỆU CHỈNH KỲ VỌNG, KHÔNG XẾP HẠNG (trung thực)

**Ta KHÔNG có dữ liệu dân số thật** → **cấm** mọi câu kiểu "con giỏi hơn 80% bạn cùng tuổi" (P6). "Chuẩn
nhóm-tuổi" ở đây = **dải kỳ vọng phát triển do app/founder thiết kế**, đúng như [[value-gap-age-appropriate]],
dùng để:

1. **Chọn TẦNG hệ quả xu** (khớp spec-xu mục 13): **6-8t** extinction thuần, **ẩn scoreboard** (chỉ pet xìu);
   **9-11t** hiện `form`/"Độ bền Khiên" (game, khỏe lại được); **12-13t** thêm "tự xem phong độ".
2. **Hiệu chỉnh mục tiêu/nhịp** theo Scaffolding Level (A0.4) + roadmap 12 tháng (§7.3): số vùng theo dõi
   tích cực, độ dài phiên, kỳ vọng cân bằng vùng — **để tránh quá/thiếu tải** (nối D3.5 `workload.js`).
3. **Diễn ngôn tự-quy-chiếu**: "phù hợp lứa tuổi con", KHÔNG "hơn/kém bạn".

Ánh xạ tuổi→tầng lấy từ `uiMode` (kid/teen) + tuổi onboarding; hằng số dải kỳ vọng khai báo tường minh trong
`scoreboard.js` (không rải magic number), có `ponytail:` ghi rõ "dải thiết kế, chưa phải chuẩn thực nghiệm".

---

## 6. Chống so-kè anh em (guardrail cứng)

- Scoreboard **chỉ đọc `state` của MỘT trẻ** (1 document GameState — CLAUDE.md). Không có đường dẫn dữ liệu
  nào nạp trẻ khác vào cùng view. **Test bắt buộc:** hàm scoreboard nhận đúng 1 history, không tham số "trẻ khác".
- **Không** render tên/điểm trẻ khác ở bất kỳ đâu; **không** bảng xếp hạng số.
- Mọi diễn ngôn tự-quy-chiếu (kế thừa `progress.js`). Copy review: "con **của tuần này** vs **con của tuần trước**".
- Đa-con (nếu có ở tài khoản): mỗi con một scoreboard riêng, **không** màn tổng hợp cạnh-nhau dạng thi đua.

---

## 7. Điểm giao với Pha E — XU (rõ ràng, để E.1 rà khớp)

| Scoreboard (D3.2/D3.3) | Xu economy (Pha E) |
|---|---|
| Đo **nỗ lực theo vùng** (số đếm, không tiền) | `contribution` (xu = lương có trần, KHÔNG trả theo từng việc) |
| Nghĩa vụ = **nỗ lực** trong vùng | Nghĩa vụ **KHÔNG** `coinReward` (P4) |
| `form`/"Độ bền Khiên" theo vùng (game, có sàn) | Nền cho **hệ quả theo tuổi** mục 13 (9-11 "khỏe lại", 12-13 "tự xem") |
| `form` **không tự trừ xu** | Restitution **2-bên-đồng-thuận** (spec-xu Q2), Cọc cam kết opt-in (Q3) |

→ **E.1** (🔴 O) rà spec xu khớp các định nghĩa trên; **E.2** code kinh tế xu đọc `contribution` từ tầng
nỗ lực này. Scoreboard **không** biết gì về VNĐ/tỷ giá — tách bạch sạch.

---

## 8. Bề mặt UI (spec để D3.3 code — chưa dựng ở bước này)

- **Trẻ 6-8t:** **ẩn** scoreboard (extinction/pet, tránh phán xét sớm). 
- **Trẻ 9-11t:** radar "⚔️ 5 chỉ số" sẵn có → **chạm mở** "So với chính mình": mỗi vùng hiện `trend` (mũi tên),
  `effort` (số việc), `activeDays` ("giữ nhịp N ngày"), `form` (nấc Khiên). **Không %.**
- **Teen 12-13t:** như trên, gọn hơn (summary), thêm "tự xem phong độ".
- **Phụ huynh (WeekTab):** thẻ "Cân bằng vùng năng lực" — vùng nào đang khỏe/đang lặng, để **gợi ý khích lệ**
  (nối `insight.js`), **không** bảng điểm phán xét, **không** %.
- Quân luật giao diện Kid/Parent áp nguyên (1 điểm nhấn/màn, xanh `#2E7CD6`, nâu ấm; parent monochrome).

---

## 9. Câu hỏi khó-đổi cần founder chốt trước khi code D3.3

- **Q1 — Số vùng:** *(KN: 5 vùng, gộp Kết nối vào Giúp Đỡ — khớp radar sẵn có)* hay tách 6 vùng (Kết nối riêng)?
- **Q2 — Chuẩn tuổi trung thực:** xác nhận "chuẩn nhóm-tuổi" là **dải kỳ vọng thiết kế** (không percentile thực
  nghiệm, không "hơn X% bạn") — *(KN: đúng, đây là ràng buộc trung thực P6)*.
- **Q3 — Tuổi hiện `form`:** *(KN: 9+ theo spec-xu mục 13)* — ẩn hoàn toàn dưới 9t đúng chứ?

---

## 10. Definition of Done cho D3.3 (code theo spec này)

1. `progress.js`+`scoreboard.js`: `groupSignals(tasks)`, `buildScoreboard(history, {uiMode, now})` — **thuần**, vitest.
2. `economy.js closeDay`: ghi `groups` vào snapshot (additive); test đọc/ghi **tương thích ngược** (snapshot cũ thiếu `groups` không nổ).
3. Số đo đúng ở `/demo` (demo.js seed `groups` cho vài ngày để phô).
4. UI theo §8, **ẩn %**, **ẩn dưới 9t**; screenshot.
5. **Không** đường dẫn dữ liệu trẻ khác (test khẳng định 1-history).
```
