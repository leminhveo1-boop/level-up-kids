# SPEC — Kinh tế Xu minh bạch (Lương tiêu vặt có trần)

> **Tác giả:** Claude (Anthropic) · **Model:** Opus 4.8 · **Ngày:** 2026-07-27
> **Trạng thái:** DRAFT — chờ founder duyệt trước khi code (spec-first, core khó-đổi).
> **Phạm vi:** Thiết kế lại toàn bộ cơ chế trẻ KIẾM & TIÊU đồng Xu (HeroCoin 🪙 = tiền thật),
> tách bạch với Điểm ⭐ (tiền game). Tài liệu này là contract; code bám theo, không sáng tác thêm.

---

## 0. TL;DR (đọc 30 giây)

- **Bỏ** cơ chế "đào mỏ ra tiền thật ngẫu nhiên" — nó dạy cờ bạc, phá ngân sách bố mẹ, con không hiểu vì sao có tiền.
- **Xu = LƯƠNG minh bạch**: mỗi nhiệm vụ có giá xu rõ ràng (bố mẹ đặt / app gợi ý), con làm → bố mẹ duyệt → nhận đúng số xu đó. Cause-effect rõ như ban ngày.
- **Có TRẦN**: bố mẹ đặt "Quỹ tiêu vặt" tuần/tháng (VNĐ). Con kiếm tối đa bằng quỹ; chạm trần thì dừng trả xu (Điểm ⭐ vẫn chạy để không mất vui). Dạy khái niệm ngân sách.
- **Đào mỏ** giữ lại nhưng chỉ ra **Điểm ⭐ + nguyên liệu pet** — mini-game thuần, không dính tiền thật → giữ được sự vui/bất ngờ mà không dạy hên xui bằng tiền.
- **Pet/Trứng**: mua chủ yếu bằng **Điểm ⭐**; chỉ 1–2 loại hiếm mua bằng Xu nhưng rẻ (10–20k). Gắn ý nghĩa **trách nhiệm nuôi dưỡng** (đã có hunger decay) thay vì "ấp cho vui".
- **Quà thật** = danh mục chi tiêu đời thực có **giá VNĐ** (truyện, trà sữa, gà rán, pizza, patin, nhà sách…) → tự quy đổi ra Xu theo tỷ giá cố định `1 xu = 1.000đ`.
- Bố mẹ có **mục "Quỹ tiêu vặt" riêng** + **danh mục quà chi tiết theo tuổi**. Con có màn **"Quỹ của con"** minh bạch (kiếm gì, còn bao nhiêu, mỗi việc mấy xu).

---

## 1. Vấn đề hiện tại (chẩn đoán từ code + phản hồi founder)

### 1.1. Ba lỗi thiết kế gốc

| # | Lỗi | Bằng chứng trong code | Hệ quả giáo dục/kinh doanh |
|---|-----|----------------------|----------------------------|
| L1 | **Xu (tiền thật) sinh ra từ đào mỏ NGẪU NHIÊN** | `economy.js:mineTreasure` — `rand < legendaryChance` → `coinReward = floor(rng()*8)+8`, crit ×2 → tối đa ~30 xu/lượt, bấm nhiều lượt/ngày | Dạy trẻ **cờ bạc/hên xui**: bấm là ra tiền. "Anh ấn 1 phát 47 coin". Không có lao động ↔ thu nhập. |
| L2 | **Không có trần ngân sách của bố mẹ** | `parentConfig` chỉ có `maxCoinBalance: 2000` (trần TỒN, không phải trần KIẾM). Xu tạo ra từ hư không, không trừ vào quỹ nào của bố mẹ | Bố mẹ **vỡ kế hoạch tài chính**: con đổi quà 500k mà bố mẹ không định chi. Mất niềm tin → không trả 199k. |
| L3 | **Trứng/pet mua bằng Xu (tiền thật)** | `constants.js` `rp1..rp3` trứng `currency: "heroCoins"` 15–70 xu = 15k–70k thật | Lãng phí tiền thật cho vật phẩm ảo. Founder: *"ấp chơi chơi thôi à? đem lại giá trị gì?"* |

### 1.2. Lỗi phụ

- **Con không hiểu cách kiếm xu** (founder: *"Con vẫn chưa biết kiếm coin như thế nào?"*). Vì cơ chế đào = ngẫu nhiên, không có bảng "làm X → được Y".
- **Màu xu** đã sửa xong (token `.text-coin` = `#E8A13A`, đã bump SW cache v16) — KHÔNG nằm trong spec này nữa.

### 1.3. Vì sao xu PHẢI là tiền thật minh bạch (không phải điểm game)

Xu neo `1 xu = 1.000đ` (`COIN_RATE_VND`) và đổi được quà tốn tiền bố mẹ. Đây là **tiền tiêu vặt số hóa**. Tiền thật thì phải:
- Đến từ **lao động** (nhiệm vụ), không từ may rủi.
- Nằm trong **ngân sách** bố mẹ chủ động đặt.
- Tiêu vào việc **con thấy giá** (quà có giá VNĐ).

→ Cả 3 nguyên tắc tài chính cá nhân cơ bản. App đang vi phạm cả 3.

---

## 2. Nguyên tắc thiết kế mới

1. **Hai tiền tệ, hai vai trò TÁCH BẠCH** (không lẫn):
   - **Điểm ⭐ (points)** = *tiền GAME*. Từ nhiệm vụ (escrow → duyệt) + đào mỏ + boss. Tiêu cho: giờ chơi, thẻ game, pet/trứng, cosmetics, thẻ đóng băng. **Được phép ngẫu nhiên/gacha** (không phải tiền thật).
   - **Xu 🪙 (heroCoins)** = *tiền THẬT tiêu vặt*. CHỈ từ **lương nhiệm vụ minh bạch, có trần**. Tiêu cho: **quà đời thực có giá VNĐ**. **CẤM ngẫu nhiên.**
2. **Minh bạch tuyệt đối**: con nhìn thẻ nhiệm vụ biết ngay "+N xu"; nhìn màn Quỹ biết "tuần này kiếm được X / trần Y, còn Z".
3. **Bố mẹ nắm dây ví**: không đồng xu nào tồn tại ngoài quỹ bố mẹ đặt.
4. **Chạm trần ≠ mất vui**: hết quỹ xu tuần thì Điểm ⭐ vẫn chạy, đào mỏ vẫn vui, chỉ dừng tiền thật. Dạy "ngân sách có hạn" một cách tích cực.
5. **Diff tối thiểu, tái dùng**: bám escrow/approve sẵn có; thêm field vào `parentConfig` + task, không đập lại state. Migration default-merge (như `migrate.js` đang làm).

---

## 3. Mô hình kinh tế mới — tổng quan

```
NHIỆM VỤ ──hoàn thành──> ESCROW ──bố mẹ duyệt──> +Điểm ⭐ (luôn luôn)
                                              └──> +Xu 🪙 (nếu task có coinReward VÀ quỹ tuần chưa cạn)

ĐÀO MỎ ──tốn 1 năng lượng──> Điểm ⭐ + nguyên liệu pet (KHÔNG còn ra Xu)

QUỸ TIÊU VẶT (bố mẹ đặt tuần/tháng) = TRẦN kiếm Xu. Reset đầu mỗi chu kỳ.

TIÊU:
  Điểm ⭐  → giờ chơi, thẻ game, TRỨNG/PET, cosmetics, thẻ đóng băng, 1 loại thức ăn pet
  Xu 🪙   → quà đời thực (truyện/trà sữa/gà rán/pizza/patin…) + 1–2 trứng hiếm giá rẻ (10–20 xu)
```

---

## 4. Thuật toán "Lương minh bạch có trần" (phần cốt lõi)

### 4.1. Config bố mẹ (thêm vào `DEFAULT_PARENT_CONFIG`)

```js
// constants.js — DEFAULT_PARENT_CONFIG thêm 3 field (migrate.js default-merge tự vá cho state cũ)
allowanceBudgetVnd: 0,        // Quỹ tiêu vặt/chu kỳ, VNĐ. 0 = CHƯA bật lương xu (mặc định an toàn)
allowancePeriod: "week",      // "week" | "month" — chu kỳ nạp lại quỹ
// (maxCoinBalance giữ nguyên: trần TỒN ví, chống dồn cục; khác trần KIẾM)
```

- Mặc định `allowanceBudgetVnd: 0` → **lương xu TẮT** cho tới khi bố mẹ chủ động đặt. An toàn: state cũ không bỗng dưng phát tiền.
- Quy đổi: `budgetCoins = round(allowanceBudgetVnd / COIN_RATE_VND)`. VD 200.000đ/tháng → 200 xu/tháng.

### 4.2. State theo dõi trần (thêm vào state)

```js
// createInitialState + migrate default
allowance: {
  periodKey: "",        // khoá chu kỳ hiện tại, vd "2026-W30" hoặc "2026-07"
  earnedCoins: 0,       // đã kiếm trong chu kỳ này
  // budgetCoins KHÔNG lưu ở đây — luôn tính từ parentConfig để bố mẹ đổi quỹ là áp ngay
}
```

- **Khoá chu kỳ** `periodKey`:
  - `"week"` → ISO week: `YYYY-"W"WW` (tuần bắt đầu Thứ Hai, chuẩn VN).
  - `"month"` → `YYYY-MM`.
- **Reset trần**: khi `computePeriodKey(now) !== allowance.periodKey` → `earnedCoins = 0`, cập nhật `periodKey`. Chạy lazy tại thời điểm cấp xu (không cần cron) + tại `resetDailyTasks`.

### 4.3. Xu mỗi nhiệm vụ — `task.coinReward`

Thêm field `coinReward` (số nguyên ≥ 0) cho task. Nguồn:
- **Bố mẹ đặt trực tiếp** trong form Nhiệm vụ (ô "Xu 🪙" cạnh ô Điểm ⭐).
- **App gợi ý tự động** khi bố mẹ đặt quỹ (xem 4.5) — bố mẹ chỉ tinh chỉnh.
- Task chưa có `coinReward` (state cũ / chưa gán) → coi như `0` (không phát xu, chỉ Điểm ⭐). **Không tự bịa xu.**

### 4.4. Cấp xu tại bước DUYỆT (không phải lúc hoàn thành)

Xu bám đúng escrow: **chỉ cấp khi task được approve** (bố mẹ duyệt / auto-approve / trust-autopilot), song hành với việc nhả Điểm ⭐. Sửa tại `economy.approveTask` (và các đường auto):

```
Khi approve task T:
  released_points = T.pendingPoints            // logic cũ, giữ nguyên
  // --- MỚI: cấp xu trong trần ---
  state = rollPeriod(state, now)               // reset earnedCoins nếu sang chu kỳ mới
  budgetCoins = round(cfg.allowanceBudgetVnd / COIN_RATE_VND)
  wanted = T.coinReward || 0
  room   = max(0, budgetCoins - state.allowance.earnedCoins)
  granted = min(wanted, room)                  // CLAMP theo trần — không bao giờ vượt quỹ
  state.heroCoins        += granted            // (vẫn tôn trọng maxCoinBalance trần tồn)
  state.allowance.earnedCoins += granted
  → trả về event { coinsGranted: granted, coinsCapped: wanted > granted }
```

**Quy tắc chốt:**
- `budgetCoins = 0` (chưa bật lương) → `granted = 0` luôn. Xu không xuất hiện.
- Chạm trần giữa chừng (`room < wanted`) → cấp phần còn lại, đánh dấu `coinsCapped` để UI báo *"Con đã đạt quỹ xu tuần này! Điểm ⭐ vẫn tính nhé"*.
- **Reject** task đang pending: xu CHƯA từng cấp (chỉ cấp lúc approve) → không cần hoàn. `earnedCoins` không đổi. (Khác điểm: điểm pending cũng chưa vào ví.)
- **Uncomplete** task đã approved: cần hoàn xu đã cấp → `heroCoins -= grantedLần đó`, `earnedCoins -= grantedLần đó`. Lưu `earnedCoins` đã cấp trên task (`task.earnedCoins` cho điểm; thêm `task.earnedCoinReward`) để hoàn đúng.
- `maxCoinBalance` (trần tồn ví) vẫn áp: `heroCoins = min(maxCoinBalance, heroCoins + granted)`. Nếu trần tồn chặn bớt, phần bị chặn KHÔNG tính vào `earnedCoins` (chưa thực nhận) — hoặc đơn giản nâng/ bỏ `maxCoinBalance` khi đã có trần kiếm (xem Câu hỏi mở Q3).

### 4.5. Gợi ý xu tự động (giúp bố mẹ không phải tính tay)

Khi bố mẹ đặt quỹ, app đề xuất `coinReward` cho từng task theo tỷ trọng điểm, canh để **làm chăm cả tuần ≈ chạm trần** (không quá dễ, không bất khả):

```
budgetWeekCoins = budgetCoins quy về TUẦN
  (month → budgetCoins * 12 / 52 ; week → budgetCoins)
expectedWeeklyPoints = Σ(task.points) các task thường-ngày × 7
rate = budgetWeekCoins / expectedWeeklyPoints        // xu trên mỗi điểm
suggestedCoin(task) = round(task.points × rate)      // hiển thị "gợi ý", bố mẹ sửa được
```

- Chỉ là **gợi ý 1 lần** khi bố mẹ bấm "Tự động chia quỹ"; không tự động ghi đè giá trị bố mẹ đã tay.
- Cận trên/dưới: clamp `suggestedCoin ∈ [0, 20]` để 1 việc không lố (tránh 1 việc = 50k).

### 4.6. Vì sao chọn "gán trực tiếp" thay vì "tỷ giá ẩn tự động toàn cục"

| Tiêu chí | (A) Gán xu trực tiếp / task ⟵ **KHUYẾN NGHỊ** | (B) Tỷ giá điểm→xu ẩn, tự chia |
|---|---|---|
| Con hiểu "việc này mấy xu" | ✅ Nhìn thẻ là biết | ❌ Phải suy ra từ điểm |
| Bố mẹ kiểm soát từng đồng | ✅ | ⚠️ chỉ chỉnh được tổng |
| Công sức bố mẹ | ⚠️ phải gán (có nút auto-chia đỡ) | ✅ đặt 1 số |
| Dạy giá trị lao động | ✅ rõ ràng | ⚠️ mờ |
| Rủi ro code | Thấp (field tĩnh) | Cao (tính lại mỗi lần, khó test ổn định) |

→ Chọn **(A)** + nút "Tự động chia quỹ" (4.5) để bù nhược điểm công sức. (B) để dành nếu bố mẹ than phiền.

### 4.7. Yếu tố "ngẫu nhiên" mà founder nói "OK"

Founder chấp nhận *"kiểu ngẫu nhiên thì ok rồi, nhưng… đào ngẫu nhiên theo thuật toán quy định"* trong TRẦN. Hai lựa chọn:

- **P1 (khuyến nghị v1): Xu HOÀN TOÀN minh bạch, ngẫu nhiên dời sang Điểm ⭐.** Sự bất ngờ/vui nằm ở đào mỏ ra Điểm + nguyên liệu (mục 5). Tiền thật thì tuyệt đối minh bạch — giá trị giáo dục cao nhất, code đơn giản nhất.
- **P2 (tùy chọn, làm sau nếu muốn): "Túi lương may mắn".** Khi con hoàn thành 100% nhiệm vụ bắt buộc trong ngày, mở 1 túi thưởng **rút từ chính quỹ tuần** (không tạo tiền mới): số xu ngẫu nhiên trong `[0, min(room, 3)]`. Vẫn ≤ trần. Giữ chút hồi hộp nhưng gắn với điều kiện "làm hết việc" chứ không phải "bấm hên xui".

**Đề xuất:** làm **P1** trước (sạch, đúng giáo dục). P2 ghi nhận nợ, bật sau nếu retention cần.

---

## 5. Đào mỏ — repurpose thành mini-game Điểm ⭐

`economy.js:mineTreasure` sửa:
- **Bỏ nhánh cấp `heroCoins`.** Thay `coinReward` bằng `pointReward` (Điểm ⭐) cùng thang độ hiếm cũ (common/rare/epic/legendary, crit ×2). Giữ nguyên 15% nhánh nguyên liệu pet (thức ăn/thuốc/trứng) — đó là niềm vui gacha lành mạnh, không phải tiền.
- Lịch sử đào (`miningHistory`) đổi nhãn: hiển thị "+N ⭐" thay "+N 🪙".
- Ví Điểm ⭐ không có trần kiếm (nó là tiền game) — nhưng vẫn cân bằng bởi năng lượng (1 lượt = 1 năng lượng, năng lượng hồi từ nhiệm vụ). Vòng lặp giữ nguyên độ vui.
- Buff giữ nguyên (streak luckBonus, reading buff, mount crit) — chỉ đổi loại thưởng.

**Tác động UI:** `mining/page.js` đổi text/ví hiển thị từ xu → điểm ở khu vực đào; ví Xu vẫn hiện nhưng nguồn của nó giờ là Quỹ. Tab "pet" giữ nguyên.

---

## 6. Pet / Trứng — mua bằng Điểm ⭐ + gắn ý nghĩa trách nhiệm

### 6.1. Đổi tiền mua trứng/vật phẩm pet sang Điểm ⭐

`constants.js DEFAULT_REWARDS` — các mục `rp1..rp5` (trứng/thuốc/thức ăn) đổi `currency: "heroCoins" → "points"`, định lại giá theo thang Điểm ⭐ (điểm nhiều hơn xu nên số to hơn, vd trứng thường 60⭐, sói 150⭐, rồng 300⭐, thuốc 80⭐, combo thức ăn 60⭐ — **số cụ thể chốt ở bảng cân bằng khi code**).
- **Giữ 1–2 loại hiếm mua bằng Xu, GIÁ RẺ** (founder chọn): vd Trứng Sói `rp2` để `currency: "heroCoins"`, `cost: 10–20` (10–20k) như một lựa chọn "con dùng tiền tiêu vặt tự thưởng". Chỉ 1–2 mục, không hơn.

### 6.2. Trả lời "pet có ý nghĩa gì?"

Định vị pet = **bài học nuôi dưỡng & trách nhiệm** (đã có hạ tầng `PET_HUNGER_DAILY_DECAY`):
- Pet đói dần mỗi ngày; con phải cho ăn đều → dạy **chăm sóc đều đặn, kiên trì** (giống nuôi thú thật nhưng không rủi ro).
- Cho ăn = tiêu **Điểm ⭐** (kiếm từ nhiệm vụ) → vòng "làm việc tốt để chăm bạn nhỏ", không tốn tiền thật.
- Pet tiến hóa = phần thưởng cho **sự bền bỉ** (feed đủ) chứ không phải may rủi.
- Companion buff nhẹ (đã có `MOUNT_*`) là gia vị, không phải mục tiêu.
- **Không thêm cơ chế mới nặng nề** — chỉ định vị lại + copywriting trong UI pet ("Bạn nhỏ cần con chăm mỗi ngày nhé!"). Đây là thay đổi rẻ, đúng câu hỏi founder.

---

## 7. Danh mục quà thật (Xu) theo tuổi — có giá VNĐ

### 7.1. Cấu trúc

Quà Xu = perk đời thực, mỗi mục có **giá VNĐ** hiển thị + quy đổi Xu (`cost = round(vnd / 1000)`). `ManageTab` đã có ô nhập VNĐ cho reward `heroCoins` (dòng 507–519) — tái dùng, chỉ bổ sung **seed danh mục mẫu theo tuổi** để bố mẹ chọn nhanh thay vì gõ tay.

### 7.2. Seed mẫu (đề xuất — chốt số khi code)

**Kid (7–11):**
| Quà | VNĐ | Xu |
|---|---|---|
| 🧋 Một ly trà sữa | 25.000 | 25 |
| 🍗 Phần gà rán | 40.000 | 40 |
| 📚 Một cuốn truyện tranh | 25.000 | 25 |
| 🛼 Đi chơi patin | 60.000 | 60 |
| 📖 Đi nhà sách chọn 1 quyển | 50.000 | 50 |
| 🍕 Một phần pizza | 90.000 | 90 |
| 🍨 Ly kem tươi | 20.000 | 20 |

**Teen (12+):** giữ hướng `TEEN_PERKS` (tiền tiêu vặt tự quản, cà phê bạn bè, phụ kiện công nghệ) — đã có, chỉ đảm bảo hiển thị VNĐ.

- Seed đặt dạng "gợi ý bố mẹ 1 chạm thêm vào cửa hàng", **không auto-ghi-đè** quà bố mẹ đã tạo.
- **Giá chỉ là mẫu — bố mẹ chỉnh được toàn bộ trong cài đặt.** Mọi con số VNĐ/Xu ở bảng trên là giá trị khởi tạo gợi ý; sau khi thêm vào cửa hàng, bố mẹ sửa VNĐ (→ tự quy đổi Xu) qua ô nhập sẵn có ở `ManageTab` (dòng 507–519). App không khoá cứng giá seed; giá thực tế theo vùng miền/kinh tế mỗi gia đình do bố mẹ quyết.
- Chốt danh mục đúng tuổi = trả nợ **Value Gap** (memory `value-gap-age-appropriate`): teen không gợi ý "ly kem".

---

## 8. Thay đổi UI

### 8.1. Bố mẹ — mục "Quỹ tiêu vặt" riêng (SystemTab hoặc ManageTab)

Card mới **"💰 Quỹ tiêu vặt của con"**:
- Input **số tiền quỹ (VNĐ)** + chọn **chu kỳ** (Tuần / Tháng). Hiển thị quy đổi "= N xu/chu kỳ".
- Thanh tiến trình **"Đã phát tuần này: X / Y xu"** (từ `allowance.earnedCoins` / `budgetCoins`).
- Nút **"Tự động chia quỹ vào nhiệm vụ"** (4.5) — preview số xu gợi ý mỗi task trước khi áp.
- Copy ngắn (quân luật parent: ít chữ): *"Con chỉ kiếm được tối đa số tiền này mỗi [tuần]. Hết quỹ, việc tốt vẫn tính Điểm ⭐."*

Form Nhiệm vụ (ManageTab): thêm ô **"Xu 🪙"** cạnh ô "EXP/Điểm ⭐" (chỉ hiện khi quỹ > 0). Danh sách task hiển thị badge "+N🪙" nếu có.

Form/khu Quà: đảm bảo mọi quà Xu hiển thị **giá VNĐ**; thêm nút chọn nhanh từ **seed danh mục theo tuổi**.

### 8.2. Con — màn "Quỹ của con" (trả lời "con chưa biết kiếm xu thế nào")

Màn/section minh bạch (đặt trong `rewards` hoặc `me`):
- **"Tuần này con kiếm được: X / Y xu"** (thanh tiến trình) + "còn Z xu nữa là đạt quỹ".
- **Bảng "Làm gì để có xu?"**: liệt kê nhiệm vụ đang có `coinReward > 0` kèm "+N🪙 mỗi lần" → con thấy rõ đường kiếm.
- Khi chạm trần: thông điệp tích cực *"Con đạt quỹ tuần rồi, giỏi lắm! Tuần sau lại có quỹ mới nhé 🎉"* (không phải lỗi).
- Thẻ nhiệm vụ (màn chính) hiển thị "+N🪙" bên cạnh "+N⭐" nếu task có xu.

---

## 9. Data model & Migration

### 9.1. Field mới

| Nơi | Field | Kiểu | Mặc định | Ghi chú |
|---|---|---|---|---|
| `parentConfig` | `allowanceBudgetVnd` | number | `0` | 0 = lương xu TẮT |
| `parentConfig` | `allowancePeriod` | `"week"\|"month"` | `"week"` | |
| state | `allowance` | `{periodKey, earnedCoins}` | `{periodKey:"", earnedCoins:0}` | trần kiếm |
| task | `coinReward` | number | `0` (vắng = 0) | xu khi duyệt |
| task | `earnedCoinReward` | number | `0` | xu đã cấp (để hoàn khi uncomplete) |

### 9.2. Migration (`migrate.js`)

- `parentConfig: {...DEFAULT_PARENT_CONFIG, ...(data.parentConfig||{})}` — **đã** tự vá 2 field mới (pattern hiện có). Chỉ cần thêm field vào `DEFAULT_PARENT_CONFIG`.
- Thêm default `allowance` nếu thiếu: `data.allowance || { periodKey: "", earnedCoins: 0 }`.
- **KHÔNG rescale, KHÔNG đụng `heroCoins` đang có của trẻ.** Trẻ đang có bao nhiêu xu giữ nguyên (đó là tiền đã hứa). Chỉ đổi CÁCH kiếm về sau.
- Trứng/pet reward đang trong state cũ (`currency: heroCoins`): reconcile giống `reconcileRewardsForAge` — chỉ đổi các mục **seed mặc định CHƯA bị bố mẹ sửa** (khớp id+title) sang `points`; quà custom giữ nguyên. Thêm hàm `reconcilePetRewardsCurrency` cùng khuôn.

### 9.3. Bất biến cần giữ (invariants)

- I1: `allowance.earnedCoins ≤ budgetCoins` luôn đúng sau mỗi lần cấp.
- I2: Tổng xu cấp trong 1 chu kỳ ≤ `budgetCoins`.
- I3: `budgetCoins = 0` ⇒ không lần cấp nào tạo xu.
- I4: Đào mỏ không bao giờ đổi `heroCoins`.
- I5: uncomplete task đã approved hoàn đúng `earnedCoinReward`, `earnedCoins` không âm.

---

## 10. Test plan (TDD — đỏ trước, xanh sau)

Đơn vị (`vitest`, thêm vào `lib/game/__tests__/`):
1. `computePeriodKey`: week (ISO, ranh giới Thứ Hai, giao năm), month.
2. `rollPeriod`: sang chu kỳ mới reset `earnedCoins=0`; cùng chu kỳ giữ nguyên.
3. `approveTask` cấp xu: đúng `coinReward`; clamp khi `room < wanted`; `coinsCapped` flag; budget=0 → 0.
4. Trần cộng dồn nhiều task: Σ ≤ budgetCoins (I2).
5. `rejectTask`: không cấp/không trừ xu.
6. `uncompleteTask` approved: hoàn đúng xu, không âm (I5).
7. `mineTreasure`: `heroCoins` bất biến (I4); cấp Điểm ⭐ theo thang hiếm; nhánh material giữ.
8. Migration: state cũ (không `allowance`, không `coinReward`) → default đúng; `heroCoins` cũ giữ nguyên; trứng seed → `points`, trứng custom giữ.
9. Reconcile pet currency: chỉ đổi seed chưa sửa.

Mục tiêu: giữ **100% xanh** (`npx vitest run`) + `npm run build` xanh trước deploy (memory `vitest-not-build-gate`).

---

## 11. Rollout từng bước (baby-step, mỗi bước tests+build xanh)

> Core khó-đổi → theo CLAUDE.md: **branch riêng** `feat/allowance-economy`, baby-step, xong hết mới merge+deploy. Bump SW cache khi deploy.

1. **B1 — Hằng số & data model**: thêm field `parentConfig` + `allowance` + `createInitialState` + migration default-merge + test migration. (Chưa đổi hành vi kiếm.)
2. **B2 — Logic lương** (`economy.js`): `computePeriodKey`/`rollPeriod`, cấp xu trong `approveTask`/`approveAllPending`/auto-approve, hoàn xu `uncompleteTask`, `coinReward` gán khi tạo task. TDD đầy đủ.
3. **B3 — Bỏ xu khỏi đào mỏ**: `mineTreasure` → Điểm ⭐; test I4; đổi text `mining/page.js`.
4. **B4 — Pet/trứng đổi sang Điểm ⭐** + giữ 1–2 hiếm Xu rẻ; reconcile migration; copywriting trách nhiệm.
5. **B5 — UI bố mẹ**: card "Quỹ tiêu vặt", ô Xu trong form task, nút auto-chia, giá VNĐ + seed danh mục tuổi.
6. **B6 — UI con**: màn "Quỹ của con" + badge "+N🪙" thẻ nhiệm vụ.
7. **B7 — QA trên `/demo`** (không mutate trẻ thật), verify bằng test + build + screenshot, rồi merge + `cf:deploy` + bump SW.

---

## 12. Câu hỏi mở cần founder chốt trong lúc duyệt spec

- **Q1 — Chu kỳ mặc định**: đề xuất **Tuần** (`"week"`) vì phản hồi nhanh, con dễ cảm nhận "tuần này". Tháng để tùy chọn. → *Khuyến nghị: mặc định Tuần.*
- **Q2 — Ngẫu nhiên tiền thật**: P1 (xu minh bạch tuyệt đối) hay P2 ("túi lương may mắn" có trần) cho v1? → *Khuyến nghị: P1 trước, P2 ghi nợ.*
- **Q3 — `maxCoinBalance` (trần tồn ví, hiện 2000)**: khi đã có trần KIẾM theo quỹ, trần tồn 2000 gần như thừa. Đề xuất **nâng lên rất cao / bỏ** để không chặn nhầm khi con tiết kiệm nhiều tuần mua quà to. → *Khuyến nghị: đặt `maxCoinBalance` = budget×8 hoặc bỏ hẳn.*
- **Q4 — Số dư xu cũ của trẻ thật**: giữ nguyên (đã hứa) — spec chọn GIỮ. Cần founder xác nhận không muốn reset.

---

## 13. Hệ quả khi KHÔNG làm — thiết kế theo LỨA TUỔI (không phải hình phạt)

> **Cập nhật 2026-07-28** sau khi đối chiếu 4 bản phản biện độc lập (Claude Opus 4.8, Grok 4.5,
> Gemini 3.1 Pro, Gemini 3.6 Flash) — xem [PHUONG_AN_HE_QUA_THEO_LUA_TUOI.md](PHUONG_AN_HE_QUA_THEO_LUA_TUOI.md)
> và [PHAN_BIEN_CO_CHE_PHAT_XU.md](PHAN_BIEN_CO_CHE_PHAT_XU.md). Founder đã duyệt Q1–Q3 (28/07/2026).
>
> Founder phản hồi đúng: *"Cái này mới có thưởng và chưa có phạt."* Nhưng "phạt" đúng cách **phụ
> thuộc lứa tuổi** (Kohlberg — trẻ 6–9 ở giai đoạn tiền-ước-lệ, chưa thấm khái niệm trừu tượng như
> "danh dự"; teen mới có tư duy giao dịch). Bản thiết kế cũ (chỉ số "Giữ lời" đơn nhất cho mọi tuổi)
> đã bị **3/4 model** cảnh báo là **shaming trá hình** (kích hoạt Hiệu ứng buông xả AVE + bị bố mẹ
> vũ khí hóa). Mục 13 nay tách theo tuổi, game-hóa lớp hệ quả, và mở 2 ngoại lệ có kiểm soát.

### 13.1. Ba nguyên tắc BẤT BIẾN (mọi lứa tuổi)

1. **Nghĩa vụ KHÔNG gắn xu** — không thưởng xu, không phạt xu. Định giá nghĩa vụ bằng tiền (dù cộng hay trừ) biến bổn phận thành giao dịch mua-bán (Gneezy & Rustichini 2000 "A Fine is a Price"). Xu chỉ chảy vào **đóng góp thêm**.
2. **KHÔNG có nút "trừ xu một phía"** cho bố mẹ bấm để phạt — chặn tác dụng phụ trừng phạt ngoại tại (Azrin & Holz 1966: nói dối / đối phó / gây hấn). Bằng chứng thực địa: mọi persona phỏng vấn có "trừ điểm/xu phạt" đều đi kèm "báo cáo láo", "bấm gian lận", "khóc".
3. **Mọi "mất" (nếu có)** phải thoả cả 3: **trên tài nguyên game hoặc tự-nguyện** (không phải xu bị tước một phía) · **phục hồi được** (không AVE, không về 0) · **biết trước & không dán nhãn nhân cách**.

### 13.2. Hệ quả bỏ NGHĨA VỤ — theo 3 nhóm tuổi

| | **6–8 tuổi** (EF non, tiền-ước-lệ) | **9–11 tuổi** (EF đang lớn) | **12–13 tuổi** (EF khá, giao dịch) |
|---|---|---|---|
| **Nguyên lý** | Thuần White Hat (Octalysis). Không "mất" gì, kể cả streak. | Bắt đầu có "mất phục hồi được" trên tài nguyên **game**. | Thêm tự-ràng-buộc tự nguyện; đề phòng reactance. |
| **Hệ quả** | **Extinction thuần**: không làm = không có sao/xu cho việc đó. Pet **hơi xìu**, tươi lại ngay khi làm. **KHÔNG con số %**, KHÔNG báo "độ tin cậy" về máy bố mẹ. | **"Độ bền Khiên / Phong độ"** (game): bỏ việc → khiên **mẻ**, KHỎE lại được, **không về 0, không dán nhãn**. Vẫn không đụng xu. | Như 9–11 + trẻ **tự xem** phong độ tuần của mình (self-monitoring), bố mẹ không chấm điểm. |
| **Octalysis** | CD2 + CD3 + CD5 (pet) | CD2 + CD4 | CD2 + CD4 + chút CD6 (cọc) |

> **Đổi tên chính thức (Q1 đã duyệt):** chỉ số cũ **"Giữ lời"** (mang phán xét đạo đức) → **"Độ bền
> Khiên"** / **"Phong độ"** (game hóa). Khi trẻ hụt, đó là *mẻ khiên trong hành trình* — phục hồi
> được — **KHÔNG phải** bị hệ thống dán nhãn "đứa thất hứa". **KHÔNG đẩy % này về máy phụ huynh**
> như "điểm tin cậy" (chống vũ khí hóa + AVE). Bố mẹ nhận hệ quả qua Restitution + Tầng đời thực.

### 13.3. Hai NGOẠI LỆ có kiểm soát (KHÁC phạt xu — Hệ quả logic của Dreikurs)

**A. Bồi thường thiệt hại — Restitution (từ 9 tuổi).**
Trẻ gây thiệt hại vật chất cụ thể (làm hỏng đồ, lãng phí) → trích **≤20–30% số xu đang có** để "sửa/mua lại". Đây là *hệ quả logic*, không phải phạt tùy tiện: có nguyên nhân cụ thể, số tiền = giá trị thiệt hại, mục tiêu là **sửa chữa**, dạy trách nhiệm dân sự.
- **Q2 đã duyệt — CHỈ GHI NHẬN, không tự trừ:** app **KHÔNG** có nút "bố mẹ trừ xu". Cơ chế là **nghi thức 2 bên**: bố mẹ *đề nghị* đền bù cho một thiệt hại cụ thể → **con bấm đồng ý** → xu chuyển vào mục "sửa chữa". Không đồng thuận thì không trừ.

**B. Cọc cam kết tự nguyện — Commitment Device (chỉ 12–13 tuổi).**
Trẻ **tự khởi tạo** một cam kết + tự đặt cọc để thắng sự trì hoãn của chính mình (Bryan, Karlan & Nelson 2010).
- **Q3 đã duyệt:** **mặc định cọc bằng Điểm ⭐**; cho phép **nâng lên Xu thật NHỎ** nếu trẻ tự chọn (teen coi điểm game rẻ). Cọc mất → **vào "quỹ chung nhà"**, **KHÔNG** về tay bố mẹ → nên là *tự thắng bản thân* (commitment device), không phải *bị người lớn tước* (response cost).
- Điều kiện: hoàn toàn opt-in, trẻ tự đặt, cọc nhỏ có trần, biết trước. **Không mở cho <12** (EF chưa đủ → dễ tick khống giữ cọc).

### 13.4. Ranh giới ĐỎ (cấm tuyệt đối — mọi lứa tuổi)

- **CẤM trừ xu/điểm ĐÃ kiếm** vì một việc sau đó không làm (phạt nghĩa vụ). Chỉ "không cấp thêm", không "lấy lại". *(Restitution & Cọc ở 13.3 KHÔNG vi phạm: một cái do 2-bên-đồng-thuận đền thiệt hại cụ thể, một cái do trẻ tự nguyện đặt — cả hai không phải app/bố mẹ tước một phía.)*
- **CẤM reset streak về 0** — dùng cơ chế phục hồi ("Độ bền Khiên" khoẻ lại được).
- **CẤM ngôn ngữ trừng phạt/thua cuộc** ("Con thất bại", "Con bị phạt", "đứa thất hứa", màu đỏ báo động cho việc lỡ). Dùng giọng phục hồi: *"Việc này chưa xong. Con muốn làm gì?"*
- **CẤM app tự ý cắt quyền lợi** — Tầng đời thực chỉ **hiển thị trạng thái** để bố mẹ quyết, không tự động khoá tính năng.
- **CẤM đẩy chỉ số "Độ bền Khiên/Phong độ" về máy phụ huynh dạng "điểm tin cậy"** — chống bố mẹ vũ khí hóa để sỉ nhục con.

### 13.5. Hệ quả đời thực (Tầng bố mẹ — mọi tuổi, tùy chọn)

Bố mẹ đặt trước **quyền lợi gắn điều kiện** (vd "đủ 80% việc tuần mới có giờ chơi cuối tuần") — app chỉ **hiển thị trạng thái**, bố mẹ thực thi ngoài đời. Đây là hệ quả do gia đình thoả thuận TRƯỚC, minh bạch, không phải app tự phán. Đây cũng là câu trả lời cho lo ngại "app cấm tuyệt đối trừ xu thì yếu ớt, thiếu răng" (4/4 model nêu): **răng nằm ở hệ quả đời thực + Restitution, không nằm ở việc tước tiền của con.**

### 13.6. Phạm vi & thứ tự triển khai

- **Bất biến 13.1 + Extinction (6–8t)** nằm sẵn trong spec này (lương-theo-approve).
- **"Độ bền Khiên/Phong độ" (9–13t)** phụ thuộc **scoreboard** — làm cùng đợt scoreboard (deepdive), không code trước.
- **Restitution + Cọc tự nguyện** cần **UI 2-bên-xác-nhận** — đặc tả ở đợt scoreboard, không tự động hoá.
- **Streak an toàn + Tầng đời thực** ghi nợ, làm cùng đợt scoreboard.

→ Kết luận: đợt kinh tế-xu này giữ **ranh giới đỏ** (không tước xu một phía) và **tách hệ quả theo tuổi**; "răng" thật đến từ **Restitution + hệ quả đời thực**, không từ trừng phạt tiền — tránh biến app thành công cụ phạt trẻ.

---

## 14. Ngoài phạm vi (không làm trong đợt này)

- P2 "túi lương may mắn" (ghi nợ).
- Báo cáo chi tiêu xu cho bố mẹ (lịch sử con tiêu gì) — đợt sau.
- Lãi suất tiết kiệm / mục tiêu tiết kiệm dài hạn — ý tưởng tương lai.
- Đổi tỷ giá `COIN_RATE_VND` (giữ 1.000đ).
```
