# 💰 PHƯƠNG ÁN: HỆ THU TIỀN & QUẢN TRỊ ĐĂNG KÝ (bản 2 — thiết kế lại từ gốc)

> **Người soạn:** Claude Code (model **Opus 5**, `claude-opus-5`) — 25/07/2026
> **Bối cảnh:** founder phát hiện điểm mù — không có UI quản trị; SePay webhook đang chờ duyệt nên tưởng phải kích hoạt tay.
> **Trạng thái:** đề xuất, CHƯA implement. §1 có dẫn chứng `file:line`; §2 có dẫn chứng tài liệu SePay; §3–§6 là thiết kế đề xuất.
> Thay thế bản 1 cùng tên. Liên quan [[OPERATIONS_PLAYBOOK.md]], [[PLAN_MAP.md]].

---

## 0. ĐỊNH KHUNG LẠI VẤN ĐỀ

Đề bài ban đầu là "thiếu UI admin". Nhưng UI chỉ là mặt tiền. Vấn đề thật lộ ra khi hỏi 3 câu mà **bất kỳ hệ thu tiền nào cũng phải trả lời được**:

| Câu hỏi | LUK trả lời được không? |
|---|---|
| "Vì sao nhà này hết hạn ngày 12/09/2027?" | ❌ Không tái dựng được — `premium_until` bị 4 nguồn cộng đè lên nhau, không lưu vết |
| "Tuần qua có đồng nào vào ngân hàng mà chưa thành quyền không?" | ❌ Không biết — nằm im trong `payments.status='unmatched'`, không ai nhìn |
| "Ai đã đụng vào quyền của nhà này, lúc nào, vì sao?" | ❌ Không có audit |

**0/3.** Nếu chỉ dán một trang admin lên schema hiện tại, ta được một cái nút bấm cho nhanh — nhưng vẫn 0/3. Phương án này sửa cái gốc, và UI là hệ quả.

---

## 1. HIỆN TRẠNG (đã đọc code, có dẫn chứng)

### 1.1 Ba đường cấp quyền premium — không đường nào có giao diện quản trị

| Đường | Cơ chế | File | Trạng thái |
|---|---|---|---|
| SePay webhook | RPC `activate_from_payment`, cộng `365 × số kỳ` | [route.js:107](../src/app/api/webhooks/sepay/route.js) | Code + E2E test sẵn sàng, **chờ SePay duyệt** ⏸ |
| Mã `LUKID-XXXX-XXXX` | RPC `redeem_activation_code` | [init.sql:159](../supabase/migrations/20260702000001_init.sql) | Chạy được, nhưng mã **chỉ sinh bằng script chạy tay ở máy local** (cần SERVICE_ROLE_KEY) |
| Referral | `grant_referral_bonus` +180 ngày cả 2 nhà | [referral.sql:96](../supabase/migrations/20260702000009_referral.sql) | **Migration 0009 chưa chạy prod** |

### 1.2 Không có admin — xác nhận bằng grep

- 13 file `page.js`, chỉ thuộc `(kid)`/`(parent)`/`(public)` — không có `/admin`.
- `profiles` không có `is_admin`/`role` ([init.sql:7](../supabase/migrations/20260702000001_init.sql)).
- `activation_codes`, `payments` **không có RLS policy nào cho client** ([init.sql:122](../supabase/migrations/20260702000001_init.sql) — "service-role only") ⇒ chỉ đọc được qua Supabase Studio.

### 1.3 Ba lỗi thiết kế (không phải "thiếu tính năng")

**(a) `premium_until` là trạng thái bị ghi đè, không phải sổ sách.**
Cả 4 nguồn đều dùng cùng một mẫu `premium_until = greatest(coalesce(premium_until, now()), now()) + interval`. Đây là **read-modify-write**. Hệ quả: không tái dựng được, **không hoàn tác được** (cấp nhầm 365 ngày → phải trừ tay, dễ trừ nhầm), và chỉ có webhook là idempotent (nhờ `sepay_tx_id` unique) — referral/code/tay thì không.

**(b) Không có trạng thái cuối cho tiền vào.** `payments.status` có `unmatched` nhưng **không có cơ chế nào buộc nó phải được xử lý**. Tiền vào mà khách ghi sai nội dung → hệ thống ghi log rồi im lặng vĩnh viễn. Đây là **rò rỉ doanh thu im lặng** — dạng lỗi tệ nhất vì không ai biết mình đang mất.

**(c) `plan` không bao giờ hạ về `free` khi hết hạn.** Không cron nào làm ([0008_cron_schedules.sql](../supabase/migrations/20260702000008_cron_schedules.sql) chỉ có send-push + weekly-email). Mà [weekly-email:107](../supabase/functions/weekly-email/index.ts) và [lifecycle-email:99](../supabase/functions/lifecycle-email/index.ts) lọc `.eq("plan","premium")` **không kiểm `premium_until`** ⇒ nhà đã hết hạn vẫn nhận email tuần mãi mãi, và mọi số đếm khách trả tiền đều bị thổi phồng.
*Cổng tính năng vẫn đúng* ([AuthContext.js:36](../src/context/AuthContext.js) kiểm cả hai) — nên đây là lỗi sổ sách/email, không phải lỗ hổng truy cập.

---

## 2. 🔑 PHÁT HIỆN LÀM ĐỔI CẢ PHƯƠNG ÁN: **không cần chờ SePay duyệt webhook**

Giả định "SePay pending ⇒ phải kích hoạt tay" là **sai**. SePay có **API tra cứu giao dịch**, dùng API Token do chính mình tự tạo trong `my.sepay.vn → Cấu hình Công ty → API Access` — **không đi qua quy trình duyệt webhook**:

| | Webhook (đang chờ) | **API tra cứu (dùng được ngay)** |
|---|---|---|
| Cơ chế | SePay đẩy sang mình (push) | Mình chủ động hỏi SePay (pull) |
| Điều kiện | Chờ duyệt/cấu hình bên SePay | Tự tạo API Token, xong ngay |
| Endpoint | — | `GET https://userapi.sepay.vn/v2/transactions` (v2, có sandbox)<br>hoặc v1 `my.sepay.vn/userapi/transactions/list` có tham số `since_id` (cursor) |
| Xác thực | HMAC | `Authorization: Bearer <API_TOKEN>` |
| Rate limit | — | v1: 2 req/giây (thừa sức cho 1 lần/phút) |
| Test an toàn | khó | có **sandbox** `userapi-sandbox.sepay.vn` — thử không đụng tiền thật |

**Hạ tầng chạy pull đã có sẵn, không phải dựng mới:** `pg_cron` + `pg_net` đã cài và đang chạy 2 job ([0008](../supabase/migrations/20260702000008_cron_schedules.sql)), pattern edge function đã có 3 cái (`send-push`, `weekly-email`, `lifecycle-email`), cơ chế `CRON_SECRET` đã có ([0011](../supabase/migrations/20260703000011_cron_secret_auth.sql)).

> **Hệ quả:** tự động hoá 100% việc kích hoạt **trong tuần này**, độ trễ ≤ 1–2 phút, không phụ thuộc SePay duyệt gì cả. Việc "kích hoạt tay" từ chỗ là **quy trình chính** rớt xuống thành **ca ngoại lệ**. Đó là lý do bản 2 đảo ngược thứ tự ưu tiên so với bản 1: *xây máy trước, xây bàn tay sau*.

⚠️ Cần verify khi implement (chưa kiểm bằng token thật): v2 có cursor kiểu `since_id` không, hay chỉ pagination. **Thiết kế bên dưới cố tình không phụ thuộc vào cursor** để không hỏng nếu v2 khác v1 (xem §3.3).

---

## 3. THIẾT KẾ

### 3.1 Lõi: **Sổ cái quyền (entitlement ledger)** — append-only

Thay vì cộng thẳng vào `premium_until`, mọi lần cấp quyền ghi **một dòng bất biến**:

```sql
entitlement_grants (
  id            bigint identity,
  profile_id    uuid not null,
  source        text not null,      -- 'sepay' | 'code' | 'referral' | 'admin' | 'provisional'
  source_ref    text not null,      -- sepay tx id | mã code | referee_id | uuid thao tác
  days          int  not null,      -- có thể âm? KHÔNG — thu hồi = void dòng cũ
  amount_vnd    numeric,            -- tiền thực nhận (0 với referral/tặng)
  granted_by    uuid,               -- admin nào (null nếu tự động)
  reason        text,
  status        text not null default 'active',  -- 'active' | 'voided'
  voided_by     uuid, voided_reason text, voided_at timestamptz,
  created_at    timestamptz default now(),
  unique (source, source_ref)       -- ⭐ idempotency ở TẦNG DỮ LIỆU
)
```

Bốn thứ có ngay lập tức, không phải viết thêm code:

1. **Idempotency thật.** `unique(source, source_ref)` nghĩa là dù webhook (nếu sau này SePay duyệt) **và** pull worker cùng bắt được một giao dịch, chỉ 1 dòng tồn tại. Không cần khoá, không cần "nhớ đã xử lý chưa". Đây là điểm phải làm *trước* khi bật pull — nếu không, ngày SePay duyệt webhook là ngày khách được cấp đôi.
2. **Hoàn tác = `void` 1 dòng** + tính lại. Không trừ tay, không sai số.
3. **Tái dựng được:** "vì sao hết hạn 2027?" → liệt kê 4 dòng ledger, có lý do, có người ký.
4. **Sổ doanh thu có sẵn:** `sum(amount_vnd)` theo tháng — không cần bảng riêng.

**`premium_until` giữ nguyên, trở thành cache dẫn xuất:**
```
recompute_entitlement(profile_id):
   premium_until = base + sum(days của các grant status='active')
   plan          = 'premium' nếu premium_until > now() else 'free'
```
Gọi sau mọi thay đổi + 1 cron mỗi đêm dò lệch. **Không sửa 216 chỗ đọc `premium_until`** — đúng nguyên tắc "không churn vô hình" trong `CLAUDE.md`. Ledger là nguồn sự thật, cột cũ là mặt tiền tương thích.

**Backfill:** dựng ledger từ dữ liệu đang có (`payments` đã activated + `activation_codes` đã redeem + `referrals` đã rewarded), phần chênh còn lại ghi 1 dòng `source='migration'`. Làm bây giờ rẻ vì ít khách; sau 500 khách thì đắt.

### 3.2 Bất biến vận hành: **mọi đồng tiền vào phải có trạng thái cuối**

Không phải "thêm màn hình xem unmatched" — mà là **luật**:

> Mọi giao dịch tiền vào ≥ 1.000₫ phải kết thúc ở đúng 1 trong 3 trạng thái: `activated` · `refunded` · `written_off` (kèm lý do người ghi).
> Giao dịch treo > **6 giờ** ⇒ **chủ động báo động**, không chờ ai nhớ mở admin.

Cụ thể: job đối soát hằng ngày gửi "Sổ đối soát" (dùng Resend đã cấu hình sẵn trong các edge function) — tiền vào / đã thành quyền / đang treo / lệch giữa ledger và `premium_until`. **Đây là kiểm soát nội bộ (control), không phải tính năng** — khác biệt lớn nhất giữa hệ nghiệp dư và hệ vận hành được.

### 3.3 Pull worker (`sepay-poll` edge function) — chống mất giao dịch

Ba lớp phòng vệ chồng nhau, **cố ý dư thừa**:

1. **Poll nhanh mỗi 1–2 phút**, dùng cursor (`since_id` v1 / pagination v2) lưu ở bảng `integration_state` → nhẹ, độ trễ thấp.
2. **Quét lại (sweep) mỗi giờ**: lấy toàn bộ giao dịch 24h qua bất kể cursor → bắt giao dịch đến muộn, bắt ca cursor bị trôi/reset.
3. **Idempotency không dựa vào cursor** mà dựa `unique(source='sepay', source_ref=<tx id>)` → hai lớp trên có chạy trùng bao nhiêu lần cũng vô hại.

Cursor là tối ưu băng thông; **khoá duy nhất mới là bảo hiểm**. Trộn lẫn hai vai trò đó là lỗi kinh điển của hệ đồng bộ.

Bảo mật: `SEPAY_API_TOKEN` chỉ nằm trong secret của edge function (server-side), **không bao giờ xuống client** — đúng khuyến cáo của SePay. Test bằng **sandbox** trước.

### 3.4 Xoá khoảng chờ của khách — quyền tạm 48h *(cần founder chốt)*

Ngay cả khi poll 2 phút, vẫn còn ca: khách ghi sai nội dung chuyển khoản, chuyển từ tài khoản người khác, ngân hàng sync chậm. Khi đó khách **đã trả tiền và đang ngồi chờ** — đúng khoảnh khắc conversion dễ chết nhất và dễ sinh yêu cầu hoàn tiền nhất.

**Đề xuất:** nút "Tôi đã chuyển khoản" → tạo `payment_claims` + **cấp ngay 1 grant `source='provisional'`, hạn 48h**. App hiển thị "Đang xác nhận thanh toán". Khi pull worker khớp được → ghi grant thật, void grant tạm. Sau 48h không khớp → tự hết hạn + email hỏi khách.

- **Rủi ro:** người khai man dùng chùa tối đa 48h. Có ledger nên void sạch, có lịch sử nên bắt được người lặp lại.
- **Được:** khách không bao giờ phải chờ. Với giá 199k/năm và tệp phụ huynh Việt, tôi đánh giá **rủi ro nhỏ hơn nhiều so với mất đơn** — nhưng đây là **quyết định kinh doanh của founder, không phải quyết định kỹ thuật**, nên ghi ra để anh chốt.
- Khuyến nghị: **BẬT**, kèm giới hạn 1 lần/tài khoản (lần 2 phải chờ xác nhận thật).

### 3.5 Quyền admin + rào chắn (kiểm soát nội bộ)

- `profiles.is_admin boolean default false`, bật bằng **1 câu SQL chạy tay 1 lần** — không có UI cấp quyền (chống leo thang quyền). Thêm `is_admin` vào danh sách cột bị đóng băng bởi `protect_profile_columns` ([referral.sql:22](../supabase/migrations/20260702000009_referral.sql)).
- Mọi thao tác qua RPC `security definer`, dòng đầu `if not is_admin() then raise exception 'FORBIDDEN'`. **Không mở RLS policy mới** trên `profiles`/`payments`; **không bao giờ** đưa `SUPABASE_SERVICE_ROLE_KEY` xuống client. `/admin` không đủ quyền → **404** (không phải 403 — không lộ sự tồn tại).
- **Trần một lần cấp: ≤ 400 ngày.** Cấp nhiều hơn phải bấm nhiều lần, mỗi lần ghi lý do → chống fat-finger "cấp nhầm 10 năm".
- `admin_actions` append-only: `revoke update, delete` trên bảng ngay trong migration. Ghi giá trị trước/sau.
- ⚠️ Bẫy có sẵn trong schema: **mọi RPC sửa hạn phải gọi `set_config('app.allow_plan_change','on',true)`**, nếu không trigger `protect_profile_columns` sẽ **âm thầm nuốt thay đổi** — sai kiểu này không báo lỗi, rất khó phát hiện.

### 3.6 Giao diện `/admin` — nhỏ hơn bản 1, vì máy đã tự chạy

```
┌ Sức khoẻ: Đang premium · Hết hạn ≤30 ngày · Thu 30 ngày · ⚠️ Giao dịch treo (N)
├ [Tìm: email / LUKxxxxxxxx / REFxxxxxx]
│    → thẻ gia đình + SỔ CÁI của nhà đó (mỗi dòng: nguồn, ngày, số ngày, lý do, [Void])
│      [+365] [+180] [+30] [Đặt ngày…]  ← bắt buộc nhập lý do
├ ⚠️ Đối soát: giao dịch treo  → [Gán vào gia đình…] | [Ghi nhận bỏ qua + lý do]
└ Mã kích hoạt: [Sinh N mã / M ngày] + bảng trạng thái (thay `scripts/generate-codes.mjs`)
```
Route group riêng `(admin)`, theo quân luật **Parent (SaaS monochrome)** trong `CLAUDE.md` — màn của người lớn, không dính shell/BottomNav phụ huynh.

---

## 4. CÁI CỐ Ý **KHÔNG** LÀM (và vì sao)

| Không làm | Lý do |
|---|---|
| Dashboard BI, biểu đồ doanh thu, funnel/cohort | Chưa đủ khách để có ý nghĩa thống kê. Ledger đã lưu đủ dữ liệu để dựng sau bất cứ lúc nào |
| RBAC nhiều vai trò, mời admin phụ | Một founder. `is_admin` bool là đủ; RBAC là chi phí không có người dùng |
| Migrate 216 usage `premium_until` sang API mới | Churn vô hình, đúng thứ `CLAUDE.md` cấm. Giữ cột cũ làm mặt tiền tương thích |
| Tự động hoàn tiền / tự động thu hồi khi nghi gian lận | Đụng tiền + oan sai khách. Để người quyết, máy chỉ báo động |
| Bỏ webhook đi vì đã có pull | Giữ cả hai: webhook nhanh hơn, pull là lưới an toàn. Ledger cho phép chạy song song vô hại |
| Tự viết scheduler | `pg_cron` đã cài và đang chạy |

---

## 5. LỘ TRÌNH (đảo thứ tự so với bản 1 — máy trước, tay sau)

| # | Bước | Ai | Ước lượng | Vì sao thứ tự này |
|---|---|---|---|---|
| **OPS-0** | Tạo API Token ở `my.sepay.vn → Cấu hình Công ty → API Access`, chạy 1 lệnh `curl` xác nhận đọc được giao dịch TPBank `0934567698` | 👤 Founder | 15 phút | **Chặn toàn bộ REV-2.** Nếu token không đọc được thì cả nhánh pull sụp → phải biết ngay hôm nay |
| **REV-1** | Ledger + `recompute_entitlement` + backfill + đấu 3 đường cấp quyền hiện có vào ledger | 🔴/🟡 | ~nửa ngày | Nền móng. Làm trước khi bật pull, nếu không ngày webhook được duyệt là ngày cấp quyền đôi |
| **REV-2** | Edge function `sepay-poll` (poll 2 phút + sweep 1 giờ) + `integration_state` + test trên **sandbox** | 🟡 | ~nửa ngày | **Xoá việc tay ngay tuần này** — giá trị lớn nhất trên mỗi giờ công |
| **REV-3** | Bất biến đối soát + báo động > 6h + email "Sổ đối soát" hằng ngày | 🟡 | ~3 giờ | Bịt rò rỉ doanh thu im lặng |
| **REV-4** | `/admin`: tìm, xem sổ cái, cấp/void, gán giao dịch treo, sinh mã | 🟡 | ~nửa ngày | Giờ chỉ còn xử ca ngoại lệ → nhỏ và rõ hơn nhiều |
| **REV-5** | Quyền tạm 48h + `payment_claims` | 🟡 | ~2 giờ | **Chỉ làm nếu founder duyệt §3.4** |
| **REV-6** | Vá §1.3(c): cron hạ `plan`, 2 edge function lọc thêm `premium_until`, rồi renewal reminder 350/360/364 | 🟡 | ~3 giờ | Reminder chỉ có nghĩa khi dữ liệu hạn đã đúng — nên nó đi sau, không đi trước |

**Ngày SePay duyệt webhook:** không phải làm lại gì. Webhook ghi vào cùng ledger, `unique(source, source_ref)` khử trùng lặp với pull. Pull tự trở thành lưới an toàn.

---

## 6. ĐỊNH NGHĨA HOÀN THÀNH — test đỏ trước, không "có vẻ chạy"

| # | Test (viết TRƯỚC khi code) | Bắt lỗi gì |
|---|---|---|
| 1 | **Bất biến:** với mọi profile, `premium_until == recompute(ledger)` (property test, dữ liệu sinh ngẫu nhiên) | Ledger và cache trôi khỏi nhau |
| 2 | **Idempotency:** nạp cùng 1 giao dịch qua *pull* rồi qua *webhook* → đúng **1** grant, `premium_until` không đổi lần 2 | Cấp quyền đôi ngày SePay duyệt |
| 3 | **Void:** cấp 365 → void → `premium_until` trở về **đúng** giá trị trước đó | Hoàn tác sai số |
| 4 | **FORBIDDEN:** user thường gọi mọi RPC admin → exception, không rò 1 byte dữ liệu | Leo thang quyền |
| 5 | **Trần cấp:** `admin_grant(days=4000)` → từ chối | Fat-finger đụng tiền |
| 6 | **Đối soát:** bơm giao dịch nội dung sai → xuất hiện ở danh sách treo + báo động sau 6h, **không im lặng** | Rò rỉ doanh thu |
| 7 | **`allow_plan_change`:** RPC quên `set_config` → test phải ĐỎ | Bẫy §3.5, sai mà không báo lỗi |

**An toàn dữ liệu khi verify:** SePay **sandbox** + tài khoản `luktest` + unit test. Tuyệt đối **không** đụng gia đình thật ([[verify-data-safety]]). Build: `npm run build` (dừng dev server trước — [[vitest-not-build-gate]]).

---

## 7. TÓM TẮT QUYẾT ĐỊNH CẦN FOUNDER

1. **OPS-0** — tạo SePay API Token (15 phút). Chặn REV-2; nên làm trước tiên.
2. **Quyền tạm 48h (§3.4)** — khuyến nghị BẬT. Đánh đổi: rủi ro dùng chùa 48h ↔ không mất đơn ở khoảnh khắc khách đang chờ.
3. **Migration referral 0009** vẫn chưa chạy prod — REV-1 sẽ backfill referral, nên chạy 0009 trước hoặc chấp nhận referral chưa hoạt động.

---

*Soạn bởi Claude Code (Opus 5) ngày 25/07/2026. Hiện trạng §1 có dẫn chứng `file:line`; §2 dẫn từ [developer.sepay.vn](https://developer.sepay.vn/vi/sepay-api/v1/api-giao-dich) và [docs.sepay.vn](https://docs.sepay.vn/api-giao-dich.html) — **chưa kiểm bằng API Token thật**. §3–§6 là thiết kế đề xuất.*

---

## 8. SLICE 1 — ĐÃ IMPLEMENT (branch `feat/entitlement-ledger-admin`, 25/07/2026)

Không làm cả §5 một lượt. Slice 1 = **kích hoạt tay + sổ cái + vá plan-không-hạ**, tất cả **CHỈ THÊM MỚI, không đụng 3 RPC tiền đang chạy** (`activate_from_payment` / `redeem_activation_code` / `grant_referral_bonus`). Lý do cắt: vitest không có DB thật (E2E webhook chỉ stub HTTP), nên **không refactor an toàn 3 RPC tiền** khi chưa verify được trên Postgres thật. Đường admin là đường mới, rủi ro 0 với khách hiện tại.

### Đã có (code + test xanh, build xanh)

| Hạng mục | File | Trạng thái verify |
|---|---|---|
| Ledger `entitlement_grants` + `admin_actions` + `is_admin` + freeze cột + 7 RPC admin | [20260725000001_admin_ops.sql](../supabase/migrations/20260725000001_admin_ops.sql) | ⏳ **chưa apply/verify DB thật** |
| Vá §1.3(c): `expire_premium()` + cron `luk-expire-premium-daily` (00:00 VN) | [20260725000002_expire_premium_cron.sql](../supabase/migrations/20260725000002_expire_premium_cron.sql) | ⏳ chưa apply |
| Vá §1.3(c) belt-and-suspenders: 2 edge function lọc thêm `premium_until` | [weekly-email](../supabase/functions/weekly-email/index.ts), [lifecycle-email](../supabase/functions/lifecycle-email/index.ts) | ⏳ chưa deploy |
| Money-math thuần JS (oracle cho SQL) + parse mã CK | [entitlement.js](../src/lib/entitlement.js), [payments.js](../src/lib/payments.js) | ✅ 14 unit test xanh |
| Webhook dùng lại `parsePaymentCode` (bỏ regex inline) | [route.js](../src/app/api/webhooks/sepay/route.js) | ✅ build xanh |
| `/admin` console (gate quyền, stats, tìm/cấp/đặt-hạn/thu-hồi, đối soát, sinh mã) | [(admin)/admin/page.js](../src/app/(admin)/admin/page.js) | ✅ build xanh; ✅ khách vãng lai bị đẩy về đăng nhập (preview) |
| Script verify DB (mô phỏng JWT + ROLLBACK, 10 assert) | [scripts/verify-admin-ops.sql](../scripts/verify-admin-ops.sql) | ⏳ **founder chạy** |

**Chưa chứng minh được (nói thẳng):** toàn bộ tầng SQL (7 RPC + `expire_premium`) **chưa chạy trên Postgres thật** — máy dev không có DB, prod Supabase ở tài khoản khác (không phải CLI mặc định). Money-math đã có oracle JS xanh, nhưng SQL vs oracle **chưa đối chiếu bằng máy**. `scripts/verify-admin-ops.sql` là để đóng lỗ hổng đó.

### Founder apply theo THỨ TỰ (mỗi bước xong mới đi tiếp)

1. **Apply migration** trên prod Supabase (SQL Editor tài khoản `khoabuia1+lukids`), đúng thứ tự:
   `20260725000001_admin_ops.sql` → `20260725000002_expire_premium_cron.sql`.
2. **Chạy verify:** dán `scripts/verify-admin-ops.sql` vào SQL Editor. Kỳ vọng in `✅ ALL ADMIN-OPS TESTS PASSED` rồi tự ROLLBACK (không để lại dữ liệu). Nếu bất kỳ assert nào ĐỎ → **dừng, báo lại**, chưa dùng admin.
3. **Tự cấp quyền admin** (1 lần): `update public.profiles set is_admin = true where email = 'khoabuia1@gmail.com';` (hoặc email tài khoản founder dùng để đăng nhập app).
4. **Deploy 2 edge function** đã sửa: `weekly-email`, `lifecycle-email` (bằng Supabase CLI/dashboard của tài khoản lukids).
5. **Merge + deploy app** (`npm run cf:deploy`) để `/admin` lên prod. Đăng nhập bằng tài khoản đã bật `is_admin` → vào `/admin`.

### Hoãn (blocked / chờ quyết định)
- **REV-1 hợp nhất 3 RPC tiền lên ledger** — chờ verify DB thật (bước 2 ở trên mở đường).
- **REV-2/REV-3 SePay pull worker** — chặn bởi **OPS-0** (founder tạo API Token). "SePay vẫn pending" nên chưa chạm.
- **REV-5 quyền tạm 48h** — chờ founder chốt §3.4/§7.2.
- **Migration referral 0009** vẫn chưa chạy prod (§7.3).

*Slice 1 soạn & implement bởi Claude Code (Opus 5) ngày 25/07/2026.*
