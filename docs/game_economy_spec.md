# ĐẶC TẢ CÔNG THỨC KINH TẾ GAME — "CHIẾN BINH MÙA HÈ TỰ GIÁC"

> **Mục đích:** Tài liệu kỹ thuật để cập nhật logic phần thưởng trong game.
> **Phạm vi:** Đường cong cấp độ (EXP), kinh tế Coin (đào mỏ), trần hệ số buff, định giá nhiệm vụ.
> **Nguyên tắc gốc:** Mọi phần thưởng quy về 1 đơn vị nền tảng — **Effort Unit (EU) = 1 nhiệm vụ trung bình**.

---

## 1. THAM SỐ TRUNG TÂM (CONFIG)

Đặt toàn bộ tham số ở một file config tập trung. Mọi công thức tham chiếu tới đây, KHÔNG hardcode giá trị trong logic.

```js
const CONFIG = {
  // --- Nền tảng nỗ lực ---
  EU_BASE_EXP: 10,        // EXP cho 1 nhiệm vụ trung bình (1 EU)
  TASKS_PER_DAY: 5,       // số nhiệm vụ ước lượng/ngày (chỉ để mô phỏng & cân bằng)
  CAMPAIGN_DAYS: 75,      // số ngày chiến dịch (mùa hè)

  // --- Đường cong cấp độ ---
  LEVEL_B: 0.0926,        // hằng số cơ sở (đã giải ngược, xem mục 2)
  LEVEL_K: 1.5,           // độ dốc (1.0=tuyến tính, 1.5=chuẩn RPG, 2.0=rất dốc)
  LEVEL_MAX: 100,         // cấp đỉnh = cuối chiến dịch

  // --- Kinh tế Coin ---
  ENERGY_DAILY_CAP: 100,  // năng lượng tối đa/ngày = số cú đập tối đa
  COIN_TARGET_PER_DAY: 250, // coin/ngày mục tiêu (chưa buff)

  // --- Trần buff ---
  BUFF_CAP: 1.0,          // trần cộng dồn. Hệ số tối đa = 1 + BUFF_CAP = 2.0

  // --- Định giá quà ---
  TOP_REWARD_VALUE: 3500, // giá trị (coin) của quà ĐỈNH lớn nhất
};
```

---

## 2. ĐƯỜNG CONG CẤP ĐỘ (LEVEL CURVE)

### Công thức

EXP cần để lên **cấp n** (từ cấp n-1 lên n):

```
EXP_needed(n) = LEVEL_B × n ^ LEVEL_K
```

EXP tích lũy để **đạt cấp N**:

```
EXP_total(N) = LEVEL_B × Σ(n=1..N) n^LEVEL_K
```

### Cách giải ngược hằng số B (QUAN TRỌNG)

`LEVEL_B` KHÔNG đặt cảm tính. Nó được tính ngược từ mục tiêu "đạt cấp đỉnh đúng cuối chiến dịch":

```
Tổng ngân sách EXP cả mùa = EU_BASE_EXP × TASKS_PER_DAY × CAMPAIGN_DAYS
                          = 10 × 5 × 75 = 3750

S = Σ(n=1..100) n^1.5 ≈ 40501.2

LEVEL_B = 3750 / 40501.2 ≈ 0.0926
```

> **Nếu đổi CAMPAIGN_DAYS / TASKS_PER_DAY / LEVEL_MAX → phải tính lại LEVEL_B theo đúng công thức trên.**

### Pseudo-code

```js
function expNeeded(level) {
  return CONFIG.LEVEL_B * Math.pow(level, CONFIG.LEVEL_K);
}

function expTotalToReach(level) {
  let sum = 0;
  for (let n = 1; n <= level; n++) sum += Math.pow(n, CONFIG.LEVEL_K);
  return CONFIG.LEVEL_B * sum;
}

// Tính cấp hiện tại từ tổng EXP đã tích lũy
function currentLevel(totalExp) {
  let lvl = 0;
  while (lvl < CONFIG.LEVEL_MAX && expTotalToReach(lvl + 1) <= totalExp) lvl++;
  return lvl;
}
```

### Kết quả kỳ vọng (kiểm tra)

| Cấp | Ngày đạt được (giả định 5 việc/ngày) |
|----:|------:|
| 10  | ~ngày 0.3 (ngay đầu — tạo hứng khởi) |
| 25  | ~ngày 2.4 |
| 50  | ~ngày 13.4 (giữa hè) |
| 75  | ~ngày 36.7 |
| 100 | **~ngày 75 (đúng cuối hè)** |

---

## 3. KINH TẾ COIN — ĐÀO MỎ (LOOT ECONOMY)

### Bảng Loot Table (đã cân bằng chống lạm phát)

| Loại quặng | Xác suất `p` | Coin min | Coin max | Coin TB |
|---|---:|---:|---:|---:|
| ⚙️ Đá thường | 0.70 | 1 | 1 | 1.0 |
| 🔷 Quặng Bạc | 0.20 | 2 | 3 | 2.5 |
| 👑 Hũ Vàng | 0.08 | 4 | 7 | 5.5 |
| ⚡ Rương Thần Thoại | 0.02 | 8 | 15 | 11.5 |

> Tỷ lệ trúng Rương Thần Thoại được giữ nguyên ở mức **2%** để giữ trải nghiệm dopamine nổ pháo hoa kịch tính cho con, nhưng lượng coin thực tế được kéo xuống mức cân bằng hoàn hảo để chống lạm phát dài hạn.

### Giá trị kỳ vọng mỗi cú đập

```
E[coin/cú] = Σ p_i × (min_i + max_i) / 2
           = 0.70×1.0 + 0.20×2.5 + 0.08×5.5 + 0.02×11.5
           = 0.70 + 0.50 + 0.44 + 0.23
           ≈ 1.87 coin/cú
```

→ Với lượng năng lượng thực tế tối đa tích lũy được trung bình khoảng 39 ⚡ mỗi ngày (khi con hoàn thành 100% nhiệm vụ), số xu kiếm được trung bình sẽ nằm trong khoảng **70 coin/ngày** (sát mức kỳ vọng chống lạm phát lý tưởng).

### Quy tắc tự kiểm tra lạm phát

```
coin_max_per_day = E[coin/cú] × ENERGY_DAILY_CAP_REAL
inflation_gap    = coin_max_per_day - COIN_TARGET_PER_DAY
// inflation_gap > 0 đáng kể  → GIẢM coin các tầng hiếm (Vàng, Thần Thoại)
// inflation_gap < 0          → tăng nhẹ coin để con không nản
```

### Pseudo-code đập đá

```js
const LOOT_TABLE = [
  { type: 'common',    p: 0.70, min: 1,  max: 1  },
  { type: 'silver',    p: 0.20, min: 2,  max: 3  },
  { type: 'gold',      p: 0.08, min: 4,  max: 7  },
  { type: 'mythic',    p: 0.02, min: 8,  max: 15 },
];
```

function mineOnce() {
  const roll = Math.random();
  let acc = 0;
  for (const tier of LOOT_TABLE) {
    acc += tier.p;
    if (roll <= acc) {
      const coin = tier.min + Math.floor(Math.random() * (tier.max - tier.min + 1));
      return { tier: tier.type, coin };
    }
  }
}
```

---

## 4. TRẦN HỆ SỐ BUFF (BUFF CAP)

### Vấn đề

Các buff hiện nhân chồng nhau (multiplicative): Critical x2 × Streak x2 × MayMắn x1.3 × Mount x1.05 = **x5.46** → mất cân bằng nghiêm trọng, đứa "max buff" giàu gấp 5 lần đứa mới chơi.

### Giải pháp: chuyển NHÂN → CỘNG CÓ TRẦN (additive cap)

```
M_total = 1 + MIN( Σ(m_i − 1) , BUFF_CAP )
```

Với `BUFF_CAP = 1.0` → hệ số tổng tối đa luôn ≤ **2.0**, dù bật bao nhiêu buff.

| Buff | Hệ số đơn `m` | Phần vượt `(m-1)` |
|---|---:|---:|
| Cú Đập Sức Mạnh | 2.0 | 1.00 |
| Streak x1.5 (7 ngày) | 1.5 | 0.50 |
| Ấn Pháp Chuyên Cần | 1.1 | 0.10 |
| Mount +Sức Mạnh | 1.05 | 0.05 |

### Pseudo-code

```js
function totalBuffMultiplier(activeBuffs) {
  // activeBuffs: mảng các hệ số đơn, ví dụ [2.0, 1.3]
  const sumExcess = activeBuffs.reduce((s, m) => s + (m - 1), 0);
  return 1 + Math.min(sumExcess, CONFIG.BUFF_CAP);
}

// Áp khi đập đá:
function mineWithBuff(activeBuffs) {
  const base = mineOnce().coin;
  return Math.round(base * totalBuffMultiplier(activeBuffs));
}
```

### So sánh

| Cách tính | Kết quả khi bật cả 4 buff |
|---|---:|
| ❌ Cũ (nhân chồng) | **x5.46** (loạn) |
| ✅ Mới (cộng có trần) | **x2.00** (kiểm soát) |

---

## 5. ĐỊNH GIÁ NHIỆM VỤ THEO TRỌNG SỐ (TASK PRICING)

### Công thức

Vì nhiệm vụ "linh hoạt", thưởng KHÔNG cố định mà neo theo độ khó × thời lượng của từng việc:

```
EXP_task    = EU_BASE_EXP × w_difficulty × w_duration
Energy_task = ENERGY_DAILY_CAP × (w_difficulty × w_duration) / Σ(tất cả w trong ngày)
Coin_task   = Energy_task × E[coin/cú]   // coin gián tiếp qua năng lượng
```

> Khớp với phân khu **Habits / Dailies / To-Dos**: việc nhỏ lặp lại (Habit) có trọng số thấp, To-Do lớn có trọng số cao.

### Bảng trọng số gợi ý

| Nhiệm vụ | Phân loại | `w_khó` | `w_thời lượng` |
|---|---|---:|---:|
| Uống nước | Habit (+) | 0.2 | 1.0 |
| Chào hỏi lễ phép | Habit (+) | 0.2 | 1.0 |
| Đánh răng | Daily | 0.5 | 1.0 |
| Dọn bàn sau ăn | Daily | 0.6 | 1.0 |
| Tập thể dục sáng | Daily | 1.0 | 1.5 |
| Đọc sách 20 phút | To-Do | 1.2 | 1.5 |
| Học Tiếng Anh 20 phút | To-Do | 2.0 | 1.5 |
| Làm bài tập cô giao | To-Do | 2.0 | 2.0 |
| Dọn nhà vệ sinh | To-Do | 3.0 | 2.0 |

### Pseudo-code

```js
function taskRewards(task, allTodayTasks) {
  const w = task.wDifficulty * task.wDuration;
  const totalW = allTodayTasks.reduce((s, t) => s + t.wDifficulty * t.wDuration, 0);

  const exp    = CONFIG.EU_BASE_EXP * w;
  const energy = CONFIG.ENERGY_DAILY_CAP * (w / totalW);
  return {
    exp:    Math.round(exp),
    energy: Math.round(energy),
    // coin không trao trực tiếp — con dùng energy để đào mỏ
  };
}
```

---

## 6. ĐỊNH GIÁ CỬA HÀNG QUÀ (REWARD SHOP)

Neo giá quà theo "số ngày nỗ lực" mong muốn, KHÔNG đặt số tròn cảm tính:

```
Giá quà (coin) = COIN_TARGET_PER_DAY × số_ngày_nỗ_lực_mong_muốn
```

| Hạng quà | Số ngày nỗ lực | Giá (coin) |
|---|---:|---:|
| Quà nhỏ (kem, đồ chơi nhỏ) | 2 ngày | ~500 |
| Quà vừa (đồ chơi tự chọn) | 5 ngày | ~1.250 |
| Quà lớn (LEGO xịn) | 10 ngày | ~2.500 |
| Quà ĐỈNH (mơ ước) | 14 ngày | ~3.500 |

---

## 9. THAM SỐ THIẾT LẬP CỦA BỐ MẸ (PARENT CONFIG)

```js
const PARENT_CONFIG = {
  // --- Giới hạn giải trí (đầu TIÊU điểm ⭐) ---
  SCREEN_MAX_MINUTES_PER_DAY: 60,   // giờ chơi TV/game/iPad tối đa MỖI NGÀY (phút)
  SCREEN_REDEEM_MAX_PER_WEEK: 5,    // số lần đổi giải trí tối đa MỖI TUẦN
  SCREEN_PACK_MINUTES: 20,          // 1 gói giải trí = bao nhiêu phút

  // --- Ngân sách quà (đầu TIÊU Hero Coin 🪙) ---
  TOP_REWARD_MONEY_VND: 500000,     // giá trị TIỀN của quà ĐỈNH (VNĐ)
  TOP_REWARD_EFFORT_DAYS: 14,       // số ngày nỗ lực mong muốn để đổi quà đỉnh

  // --- Ràng buộc đạo đức/giáo dục ---
  REQUIRE_ALL_MANDATORY: true,      // phải xong hết nhiệm vụ BẮT BUỘC 🔴 mới được đổi quà
  MANUAL_COIN_BONUS_MAX_PER_DAY: 50,// trần thưởng coin thủ công/ngày (chống lạm phát)
};
```

---

## 10. RULE 1 — QUY ĐỔI GIỜ GIẢI TRÍ RA ĐIỂM ⭐

### Nguyên tắc

Điểm ⭐ là "tiền tiêu vặt" để đổi giờ giải trí. Bố mẹ đặt **giới hạn cứng = 1 tiếng/ngày**, game không cho con vượt qua dù có dư điểm.

### Bước 1 — Xác định "giá" 1 gói giải trí (tính bằng Điểm ⭐)

Quy tắc neo: **làm xong trọn vẹn nhiệm vụ trong ngày mới đổi được tối đa số giờ giải trí cho phép**. Tức là 1 ngày nỗ lực = 1 tiếng giải trí.

```
Điểm ⭐ kiếm được/ngày  ≈ EU_BASE_EXP × TASKS_PER_DAY   // dùng EXP làm chuẩn quy đổi 1:1 cho Điểm
                       = 10 × 5 = 50 điểm/ngày

Số gói giải trí tối đa/ngày = SCREEN_MAX_MINUTES_PER_DAY / SCREEN_PACK_MINUTES
                            = 60 / 20 = 3 gói

Giá 1 gói (20 phút) = Điểm kiếm/ngày / Số gói tối đa
                    = 50 / 3 ≈ 17 điểm  (làm tròn 15-20 điểm)
```

> **Diễn giải cho bố mẹ:** Con làm hết việc trong ngày kiếm ~50 điểm, vừa đủ đổi 3 gói = 60 phút = đúng trần 1 tiếng. Con làm ít việc → kiếm ít điểm → tự động chơi ít hơn. Game tự cân, bố mẹ không phải canh.

### Bước 2 — Hai lớp giới hạn cứng (HARD LIMITS)

Dù con có bao nhiêu điểm, game vẫn chặn theo 2 lớp:

```js
function canRedeemScreenTime(child, packMinutes) {
  // Lớp 1: trần phút/ngày
  if (child.screenMinutesUsedToday + packMinutes > PARENT_CONFIG.SCREEN_MAX_MINUTES_PER_DAY)
    return { ok: false, reason: 'Đã đạt giới hạn 1 tiếng giải trí hôm nay' };

  // Lớp 2: trần số lần đổi/tuần
  if (child.screenRedeemsThisWeek >= PARENT_CONFIG.SCREEN_REDEEM_MAX_PER_WEEK)
    return { ok: false, reason: 'Đã hết lượt đổi giải trí tuần này' };

  // Lớp 3: phải xong nhiệm vụ bắt buộc
  if (PARENT_CONFIG.REQUIRE_ALL_MANDATORY && !child.allMandatoryDone)
    return { ok: false, reason: 'Cần hoàn thành hết nhiệm vụ bắt buộc 🔴 trước' };

  return { ok: true };
}
```

> **Lưu ý quan trọng:** Điểm ⭐ và giới hạn giờ là HAI tầng độc lập. Có điểm KHÔNG có nghĩa là được chơi — vẫn phải nằm trong trần phút/ngày VÀ còn lượt đổi/tuần. Đây là điểm mấu chốt chống "con cày điểm để chơi cả ngày".

---

## 11. RULE 2 — QUY ĐỔI TIỀN QUÀ RA HERO COIN 🪙

### Nguyên tắc

Quà thật được mua bằng tiền của bố mẹ. Cần một "tỷ giá" cố định: **1 VNĐ tương ứng bao nhiêu Coin**, để mọi món quà được định giá nhất quán.

### Bước 1 — Tính tỷ giá gốc (Coin ↔ Tiền)

Neo từ quà ĐỈNH: quà 500k phải cần đúng 14 ngày nỗ lực.

```
Coin cần cho quà đỉnh = COIN_TARGET_PER_DAY × TOP_REWARD_EFFORT_DAYS
                      = 250 × 14 = 3500 coin

Tỷ giá = TOP_REWARD_MONEY_VND / Coin cần cho quà đỉnh
       = 500000 / 3500 ≈ 143 VNĐ / coin
```

> **Diễn giải cho bố mẹ:** Mỗi Hero Coin con đào được "đáng giá" khoảng 143 đồng. Con cần dồn 3.500 coin (≈ 2 tuần chăm chỉ) để đổi món quà 500k. Đây là cách giữ quà đỉnh có giá trị, không bị đổi quá sớm.

### Bước 2 — Định giá MỌI món quà tự động theo tiền

Bố mẹ chỉ cần nhập **giá tiền thật** của món quà, game tự tính ra số coin:

```js
function giftPriceInCoin(moneyVND) {
  const RATE = PARENT_CONFIG.TOP_REWARD_MONEY_VND /
               (CONFIG.COIN_TARGET_PER_DAY * PARENT_CONFIG.TOP_REWARD_EFFORT_DAYS);
  return Math.round(moneyVND / RATE);
}
```

### Bảng quy đổi mẫu (tỷ giá ~143đ/coin)

| Món quà | Giá tiền thật | Coin cần | Số ngày nỗ lực |
|---|---:|---:|---:|
| Ly kem | 30.000đ | ~210 | ~1 ngày |
| Đồ chơi nhỏ | 80.000đ | ~560 | ~2 ngày |
| Vé xem phim | 120.000đ | ~840 | ~3 ngày |
| Đồ chơi tự chọn | 200.000đ | ~1.400 | ~6 ngày |
| LEGO xịn | 350.000đ | ~2.450 | ~10 ngày |
| **Quà ĐỈNH (mơ ước)** | **500.000đ** | **~3.500** | **~14 ngày** |

---

## 12. RULE 3 — KHUNG ĐẶT NHIỆM VỤ CHO BỐ MẸ (TASK DESIGN RULES)

Hướng dẫn bố mẹ đặt nhiệm vụ cân bằng, tránh 2 lỗi thường gặp (giao quá ít → con nhàm; giao quá nhiều → con nản).

### Quy tắc số lượng

| Độ tuổi con | Habits (+) | Dailies | To-Dos | Bắt buộc 🔴 |
|---|---:|---:|---:|---:|
| 4-6 tuổi | 2-3 | 2-3 | 1-2 | tối đa 2 |
| 7-9 tuổi | 3-4 | 3-4 | 2-3 | tối đa 3 |
| 10-12 tuổi | 4-5 | 4-5 | 3-4 | tối đa 4 |

> **Quy tắc vàng:** Nhiệm vụ BẮT BUỘC 🔴 không quá 1/3 tổng số việc. Quá nhiều việc bắt buộc → con thấy như "đi làm", mất tính chơi.

### Quy tắc gán trọng số (nhắc lại mục 5)

- Việc dễ, ngắn (uống nước, chào hỏi): `w` thấp 0.2-0.5 → thưởng nhỏ, khuyến khích làm nhiều lần.
- Việc vừa (đánh răng, dọn bàn): `w` ~0.5-1.0.
- Việc khó, dài, có giá trị giáo dục cao (học, đọc sách, việc nhà lớn): `w` cao 1.5-3.0 → thưởng đậm.

### Quy tắc cân bằng 3 hệ năng lực

Đảm bảo nhiệm vụ trải đều 3 trục để con phát triển toàn diện (khớp 3 lớp nhân vật Warrior/Mage/Druid):

```
- Thể chất (Warrior): tập thể dục, vận động, việc nhà tay chân
- Trí tuệ (Mage): học, đọc, giải đố
- Giúp đỡ (Druid): phụ việc nhà, chăm em, lễ phép
```

Tỷ lệ gợi ý: mỗi trục chiếm ~1/3 tổng trọng số nhiệm vụ trong tuần.

---

## 13. RULE 4 — MỤC TIÊU & PHẦN THƯỞNG CỘT MỐC (MILESTONE RULES)

Quy đổi mốc cấp độ ra phần thưởng tiền thật, dùng cùng tỷ giá mục 11:

| Cột mốc | Ngày đạt (ước lượng) | Ngân sách quà gợi ý | Coin tương đương |
|---|---:|---:|---:|
| Cấp 10 | ~tuần 1 | ~80.000đ | ~560 |
| Cấp 25 | ~tuần 1-2 | ~150.000đ | ~1.050 |
| Cấp 50 | ~giữa hè | ~250.000đ | ~1.750 |
| Cấp 100 | ~cuối hè | ~500.000đ (quà đỉnh) | ~3.500 |

> **Lưu ý:** Phần thưởng cột mốc (theo cấp độ) NÊN tách khỏi quà mua bằng coin, để tránh con nhận thưởng hai lần cho cùng một nỗ lực. Cột mốc = "thưởng thành tích danh dự", coin = "tiền con tự tích để mua". Nếu muốn gộp, trừ coin khi trao quà cột mốc.

---

## 14. RULE 5 — TRẦN AN TOÀN TỔNG (SAFETY CAPS)

Các giới hạn cứng để hệ thống không bao giờ "vỡ trận":

```js
const SAFETY_CAPS = {
  MAX_SCREEN_MINUTES_DAY: 60,        // tuyệt đối không vượt
  MAX_GIFT_MONEY_MONTH: 800000,      // tổng tiền quà tối đa/tháng (kiểm soát ngân sách bố mẹ)
  MAX_MANUAL_COIN_DAY: 50,           // thưởng tay tối đa/ngày
  MAX_COIN_BALANCE: 7000,            // trần ví coin (chống tích trữ vô hạn → ép con tiêu, tránh chán)
};
```

> **Vì sao cần trần ví coin:** Nếu con tích quá nhiều coin không tiêu, động lực giảm (kiểu "đủ rồi, khỏi làm nữa"). Đặt trần ~2 lần giá quà đỉnh để con luôn có lý do tiêu và tiếp tục cố gắng.

---

## 15. BẢNG TÓM TẮT CHO BỐ MẸ (QUICK REFERENCE)

| Bố mẹ muốn đặt | Nhập gì vào game | Game tự tính ra |
|---|---|---|
| Giới hạn giờ chơi | Số phút/ngày + số lần/tuần | Giá mỗi gói (điểm ⭐) + chặn vượt trần |
| Quà thật | Giá tiền (VNĐ) | Số coin cần + số ngày nỗ lực |
| Nhiệm vụ | Tên việc + độ khó + thời lượng | EXP + năng lượng mỗi việc |
| Mục tiêu cột mốc | Ngân sách quà mốc | Coin tương đương + thời điểm đạt |

**Quy trình thiết lập 4 bước cho bố mẹ:**
1. Đặt trần giờ giải trí (1 tiếng/ngày, 5 lần/tuần) → game khóa cứng.
2. Nhập giá tiền các món quà → game tự ra số coin.
3. Tạo danh sách nhiệm vụ, gán độ khó → game tự chia EXP & năng lượng.
4. Chọn quà cột mốc theo cấp độ → trao khi con đạt mốc.

---

## 16. CHECKLIST CẬP NHẬT CHO DEV

- [ ] Đưa toàn bộ tham số vào `CONFIG` tập trung, bỏ mọi hardcode.
- [ ] Thay công thức cấp độ bằng `EXP_needed(n) = B × n^k`, tính lại B khi đổi tham số.
- [ ] Cập nhật `LOOT_TABLE` theo bảng mục 3 (giữ xác suất, giảm coin tầng hiếm).
- [ ] Thay logic buff: từ `PRODUCT(...)` → `1 + MIN(Σ(m-1), BUFF_CAP)`.
- [ ] Áp định giá nhiệm vụ theo trọng số (mục 5), thay vì thưởng đồng đều.
- [ ] Neo giá cửa hàng quà theo công thức mục 6.
- [ ] Thêm cảnh báo `inflation_gap` ở cổng phụ huynh để giám sát cân bằng.

---

## 17. LƯU Ý GIỚI HẠN

- Các con số dựa trên giả định **5 việc/ngày**. Con làm nhiều/ít hơn → coin và tốc độ lên cấp lệch theo. Có thể cho cổng phụ huynh nhập "số việc thực tế trung bình" để hiệu chỉnh tự động.
- `E[coin/cú] = 2.89` là **giá trị trung bình kỳ vọng**. Một ngày cụ thể có thể dao động mạnh do may rủi (đặc biệt khi trúng Rương Thần Thoại). Nếu muốn ổn định hơn, cân nhắc thêm **pity timer** (đảm bảo phần thưởng tối thiểu sau N cú đập không trúng gì lớn).
- `TOP_REWARD_VALUE = 3500` là giá trị tâm lý ví dụ — nên neo lại theo giá trị thật mà gia đình cảm nhận.
