# SPEC A0.4 — Scaffolding Level 1-2-3

> **Tác giả:** Claude (Opus 4.8) · **Ngày:** 2026-07-28 · **Bước roadmap:** §7 A0.4 (🔴 O)
> **Trạng thái:** Spec đóng băng để A0.5 (🟡 S) code. Không có điểm chờ founder (roadmap §7.4 chỉ chặn D3.2).
> **Nguyên tắc chủ đạo:** trải độ phức tạp theo trục THỜI GIAN + NĂNG LỰC THỰC, không cắt, không ẩn vĩnh viễn (§4 mục 2, §7.3).

---

## 0. Vì sao cần (khớp mục căng thẳng #2)

`uiMode` hiện tại (`kid`/`teen`) chỉ đổi **theming** → sai bản chất: hai đứa trẻ cùng tuổi có năng lực tự-điều-hành (self-regulation) rất khác nhau. Phân tầng theo **tuổi khai sinh** là lệch pha. Scaffolding (Vygotsky ZPD + fading) = **hỗ trợ tạm thời, rút dần khi năng lực lên, phục hồi khi con đuối** — điều khiển bằng **hành vi đo được**, không bằng tuổi.

Level KHÔNG phải rank, KHÔNG hiển thị như con số phán xét cho trẻ (T3). Với trẻ, level chỉ biểu hiện qua **luồng nào đang bật** (bao nhiêu bước, app dẫn hay con tự lập). Con số/lý do chỉ sống ở tầng hệ thống + phòng phụ huynh.

---

## 1. Ba level = ba cơ chế luồng (không chỉ theming)

| | **Level 1 — App dẫn, con tick** | **Level 2 — Con chọn, app gợi ý** | **Level 3 — Con tự lập kế hoạch** |
|---|---|---|---|
| **Lịch ngày** | App auto-fill lịch cơ bản; con chỉ tick | App auto-fill + con đổi thứ tự / chọn focus | Con tự thêm/bỏ/sắp việc trọn ngày |
| **Micro-choice tối (A0.3)** | 1 chạm "mai bắt đầu từ việc nào" | 1 chạm + hiện nhãn **Quan trọng** để con phân biệt | Con tự đặt focus + thấy trục **quan trọng ↔ gấp** |
| **WOOP (anchor/bước đầu)** | ẨN. Chỉ bung khi con **fail cùng 1 việc ≥ N ngày** (rescue, B1.2) | Bung khi vướng lặp; "Nếu…thì…" gợi ý sẵn | Có sẵn, con chủ động dùng |
| **Review cuối ngày** | không (hoặc chỉ 1 icon cảm xúc tuỳ chọn) | **emoji 1-tap** (B1.1) — SRL self-reflection | emoji + 1 dòng "mai khác gì" (tuỳ chọn) |
| **Scoreboard tiến bộ** | ẨN | ẨN | HIỆN (so con-với-chính-con, D3.2) |
| **Vai trò app** | dẫn dắt tối đa | gợi ý, con quyết | lùi về hậu trường (North Star: con tự khởi động, thời gian trên app GIẢM) |
| **Framework ẩn bên dưới** | Habit loop; Plan tối thiểu (SRL-Forethought) | + SRL-Self-reflection; Eisenhower (ẩn); WOOP mini | + SRL đầy đủ; Kanban WIP=1; 4DX (ẩn) |

**Ánh xạ roadmap 12 tháng (§7.3):** Level 1 = tháng 1–4 · Level 2 = tháng 5–10 · Level 3 = tháng 11–12. Roadmap là **nhịp mặc định** (dùng cho lời mời "mở lớp" gửi phụ huynh); auto-eval bên dưới là lớp **tăng tốc / an toàn** cho từng bé cụ thể — nhanh hơn nếu bé sẵn sàng, chậm lại nếu chưa.

---

## 2. State — nơi lưu, mặc định, tương thích ngược

Level thuộc **phụ huynh sở hữu** (khớp "đề xuất phụ huynh mở lớp" §7.3) → đặt trong `parentConfig`. Toàn bộ field additive, thiếu → coi như Level 1 auto (state cũ chạy y nguyên).

```js
// bổ sung vào DEFAULT_PARENT_CONFIG (constants.js)
scaffoldLevel: 1,           // 1|2|3 — level HIỆU LỰC hiện tại (con đang trải luồng này)
scaffoldMode: "auto",       // "auto" | "manual". manual = phụ huynh khoá tay, tắt auto
scaffoldPendingLevel: null, // null | 2 | 3 — khuyến nghị THĂNG đang chờ phụ huynh mở
scaffoldChangedAt: "",      // YYYY-MM-DD lần đổi level gần nhất (cho cooldown)
```

- **Đọc level ở mọi nơi qua 1 selector** `getScaffoldLevel(state)` → `state.parentConfig?.scaffoldLevel || 1` (không đọc trực tiếp rải rác).
- `uiMode` (kid/teen) **giữ nguyên vai trò theming** (nền/màu/xưng hô). Level điều khiển **cơ chế luồng**. Hai trục **độc lập**: một teen (uiMode) vẫn có thể ở Level 1 (mới bắt đầu), một kid vẫn lên Level 3 nếu năng lực cho phép.

---

## 3. Tiêu chí tự chuyển level (data-driven, tính từ `history`)

Tính trên **cửa sổ trượt 14 ngày gần nhất** trong `state.history` (snapshot A0.1 đã có đủ tín hiệu). Chỉ đánh giá khi có **≥ 7 ngày có dữ liệu** trong cửa sổ (tránh đổi non). Mỗi snapshot có: `mandatoryDone/mandatoryTotal`, `remindersNeeded`, `importantDone/importantTotal`, `plannedLastNight`, `streak`, `trustScore`, `completed/total`.

Định nghĩa tỉ lệ trung bình trên các ngày có dữ liệu:
- `mandatoryRate` = trung bình `mandatoryDone / max(1, mandatoryTotal)`
- `importantRate` = trung bình `importantDone / max(1, importantTotal)`
- `plannedRate` = tỉ lệ ngày `plannedLastNight === true`
- `remindersAvg` = trung bình `remindersNeeded`
- `reviewedRate` = tỉ lệ ngày có review cuối ngày *(tín hiệu này do **B1.1** thêm vào snapshot; **cho tới khi B1.1 ship → bỏ qua điều kiện review** = coi như thoả. Ponytail: nối lại khi field `reviewed` xuất hiện trong snapshot.)*

### 3.1 THĂNG (promote) — năng lực đã chứng minh ở level hiện tại

| Chuyển | Điều kiện (ĐỦ tất cả) |
|---|---|
| **1 → 2** | `mandatoryRate ≥ 0.80` **và** `remindersAvg ≤ 1.0` **và** `plannedRate ≥ 0.50` **và** `streak ≥ 7` |
| **2 → 3** | `importantRate ≥ 0.75` **và** `remindersAvg ≤ 0.5` (gần-0 nhắc = North Star) **và** `plannedRate ≥ 0.70` **và** `reviewedRate ≥ 0.60` |

THĂNG **không tự nhảy level**. Nó đặt `scaffoldPendingLevel = nextLevel` → phòng phụ huynh hiện thẻ *"Bé đã sẵn sàng cho lớp năng lực mới — mở?"* (đúng ngữ "đề xuất phụ huynh" của roadmap). Phụ huynh xác nhận → `scaffoldLevel = nextLevel`, `scaffoldPendingLevel = null`, `scaffoldChangedAt = today`. Bỏ qua → thẻ vẫn treo, không nhắc lại gắt (không nag).

### 3.2 GIÁNG (demote) — con đang đuối, phục hồi hỗ trợ

| Chuyển | Điều kiện (BẤT KỲ) |
|---|---|
| **3 → 2** hoặc **2 → 1** | `mandatoryRate < 0.50` **hoặc** `remindersAvg ≥ 3.0` **hoặc** `streak` gãy lặp lại (≥ 2 lần reset trong cửa sổ) |

GIÁNG **tự động + im lặng** (không cần phụ huynh quyết — phục hồi hỗ trợ không nên có ma sát), hạ đúng **1 bậc**, đặt `scaffoldChangedAt = today`, xoá `scaffoldPendingLevel`. **Tuyệt đối không** hiện cho trẻ dưới dạng "con bị tụt hạng" — với trẻ chỉ là luồng có thêm bước dẫn dắt trở lại (T3).

### 3.3 Ổn định — trễ (hysteresis) + hồi (cooldown)

- **Hysteresis:** ngưỡng THĂNG cao hơn hẳn ngưỡng GIÁNG (vd nhắc: thăng cần ≤1.0/≤0.5, giáng cần ≥3.0) → vùng ở-giữa = **giữ nguyên**, không dao động.
- **Cooldown:** sau mỗi lần đổi level (thăng hoặc giáng), **không đổi tiếp trong `COOLDOWN_DAYS = 7`** (đổi luồng cần thời gian ổn định). Tính bằng `today − scaffoldChangedAt`.
- **Manual mode:** `scaffoldMode === "manual"` → auto-eval **không đụng** `scaffoldLevel` (phụ huynh khoá tay). GIÁNG cũng không chạy. Trả về nguyên trạng.

---

## 4. Hợp đồng pure-function cho A0.5 (viết test trước)

Đặt tại `src/lib/game/scaffolding.js` (module thuần, immutable, không side-effect). A0.5 code + TDD.

```js
// Hằng số (export để test khỏi magic-number)
export const SCAFFOLD_WINDOW_DAYS = 14;
export const SCAFFOLD_MIN_DATA_DAYS = 7;
export const SCAFFOLD_COOLDOWN_DAYS = 7;

/** Level hiệu lực hiện tại (single source, dùng khắp nơi). */
export function getScaffoldLevel(state) { /* → 1|2|3, mặc định 1 */ }

/**
 * Đánh giá level dựa dữ liệu hành vi. THUẦN — không mutate, không I/O.
 * @param {object} args
 * @param {Array}  args.history   state.history (mảng snapshot)
 * @param {object} args.config    state.parentConfig (đọc scaffoldLevel/Mode/ChangedAt)
 * @param {string} args.today     YYYY-MM-DD (inject, không gọi new Date bên trong)
 * @returns {{
 *   level: 1|2|3,          // level MỚI sau đánh giá (đã áp GIÁNG nếu có; THĂNG KHÔNG tự áp)
 *   pending: null|2|3,     // khuyến nghị THĂNG chờ phụ huynh mở (null nếu không)
 *   changed: boolean,      // level có đổi so với config.scaffoldLevel không (chỉ true khi GIÁNG)
 *   reason: string         // mã lý do cho log/phòng phụ huynh (vd "demote:mandatory_low")
 * }}
 */
export function evaluateScaffoldLevel({ history, config, today }) { /* … */ }

/**
 * Phụ huynh xác nhận mở lớp đang chờ → trả parentConfig MỚI.
 * @returns {object} parentConfig mới (scaffoldLevel=pending, pending=null, changedAt=today)
 */
export function confirmScaffoldPromotion(config, today) { /* … */ }
```

**Nơi gọi `evaluateScaffoldLevel`:** trong `economy.resetDailyTasks` **sau khi** đã append snapshot ngày đóng vào `history` (để cửa sổ gồm cả ngày vừa xong), rồi ghi `level/pending/changedAt` trở lại `parentConfig`. GIÁNG áp ngay; THĂNG chỉ set `pending`. Inject `today = newDate` (đã có sẵn trong hàm) — **không** gọi `new Date()` trong module thuần.

**`confirmScaffoldPromotion`** gọi từ action phòng phụ huynh (GameState) khi phụ huynh bấm "Mở lớp".

---

## 5. Onboarding 3 câu → level KHỞI ĐẦU (chi tiết ở A0.5/A0.6)

3 câu chỉ **gieo level bắt đầu** (seed), sau đó dữ liệu tiếp quản. Không khoá.

1. **Tuổi bé?** (prior thô: <9 → nghiêng L1; ≥12 → cho phép seed L2)
2. **Việc nào con đã tự làm mà không cần nhắc?** (baseline tự-khởi-động: nhiều → +1 bậc seed)
3. **Con đã tự sắp thời gian/việc của mình chưa?** (baseline lập kế hoạch: "tự làm tốt" → cho seed L2, hiếm khi L3)

Quy tắc gộp (A0.6 chốt copy): mặc định **L1**; chỉ seed L2 khi cả (2)+(3) mạnh; **không seed thẳng L3** (L3 phải do dữ liệu chứng minh, tránh đặt kỳ vọng quá cao gây nản). Seed ghi vào `parentConfig.scaffoldLevel`, `scaffoldMode="auto"`.

---

## 6. Phụ thuộc & nợ (ponytail)

- **B1.1 (review emoji)** phải thêm field `reviewed: boolean` vào daily snapshot để mở khoá điều kiện `reviewedRate` (2→3). Tới đó bỏ qua điều kiện review. → ghi nhắc trong `evaluateScaffoldLevel`.
- **B1.2 (rescue card)** dùng chung tín hiệu "fail cùng 1 việc ≥ N ngày" để bung WOOP ở Level 1 — cùng nguồn `history`, tách hàm riêng, không nhét vào evaluator này.
- **D3.2 (scoreboard)** chỉ hiện ở Level 3 → gate bằng `getScaffoldLevel(state) === 3`. (D3.2 vẫn chờ founder xác nhận nghĩa "đo theo nhóm" trước khi code — không thuộc phạm vi A0.4.)
- **A0.5** hiện thực: module `scaffolding.js` + selector + gọi trong `resetDailyTasks` + gate luồng theo level + 3 câu onboarding. **A0.6** copy onboarding.

## 7. DoD của A0.4 (bước này)

- [x] Spec cơ chế luồng 3 level (bảng §1) — cụ thể, khớp roadmap 12 tháng §7.3.
- [x] Tiêu chí tự chuyển dựa dữ liệu (§3) — tính từ field snapshot THẬT đã có (A0.1), có hysteresis + cooldown + manual override.
- [x] Hợp đồng pure-function (§4) để A0.5 viết test trước.
- [x] Vị trí state + tương thích ngược (§2). Nợ/phụ thuộc ghi rõ (§6).
