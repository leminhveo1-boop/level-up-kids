# BÁO CÁO KIỂM TOÁN VÀ ĐÁNH GIÁ TOÀN DIỆN DỰ ÁN "LEVEL UP KIDS"

**Ngày thực hiện**: 15 tháng 07 năm 2026  
**Trạng thái kiểm toán**: Hoàn thành  
**Phiên bản codebase**: Next.js 14.2.35  

---

## TỔNG QUAN KẾT QUẢ KIỂM TOÁN (EXECUTIVE SUMMARY)

Dự án "Level Up Kids" là ứng dụng quản lý thói quen gia đình được phát triển trên nền tảng Next.js, kết hợp cơ sở dữ liệu Supabase và triển khai trên Cloudflare Workers. Hệ thống có cấu trúc tổ chức mã nguồn rất tinh gọn, phân tách rõ ràng Route Groups và thư mục features. Tầng logic nghiệp vụ game được bao phủ rất chặt chẽ bởi hệ thống unit/integration tests với tỷ lệ pass tuyệt đối.

Tuy nhiên, cuộc kiểm toán toàn diện đã phát hiện một số **điểm yếu quan trọng về An ninh (Bypass PIN Gate)** và **hiệu năng Runtime (lặp đĩa ghi liên tục & nghẽn sync đám mây)**, cùng một số điểm chưa tuân thủ triệt để **Quân luật giao diện UX/UI**.

### Bảng Điểm Đánh Giá (Audit Scorecard)

| Yêu cầu kiểm toán | Đánh giá | Trạng thái | Ghi chú chính |
|---|---|---|---|
| **R1. Kiến trúc, Theming & UX/UI** | Khá | ⚠️ Cần khắc phục | Vi phạm BottomNav viết tay, lỗi FOUC, vi phạm quân luật phòng bố mẹ. |
| **R2. An ninh & Cấu hình** | Trung bình | ❌ Nghiêm trọng | Lỗi bypass PIN Gate hoàn toàn, expose plaintext PIN, thiếu auth ở Edge Functions. |
| **R3. Kiểm thử & Build** | Xuất sắc |  Đạt | 220/220 test cases pass (100%), build thành công sạch sẽ không lỗi. |
| **R4. Tối ưu & Dead Code** | Khá | ⚠️ Cần khắc phục | Vấn đề Screen Time Timer làm nghẽn đồng bộ đám mây, 2 dead dependencies. |

---

## CHI TIẾT KẾT QUẢ KIỂM TOÁN THEO CÁC YÊU CẦU

### R1. Kiểm toán Kiến trúc, Theming và UX/UI (Dual Bounded Context & Theme Scope)

Hệ thống đã triển khai đúng cấu trúc Dual Bounded Context thông qua việc chia Route Groups thành `app/(kid)` và `app/(parent)`. Tuy nhiên, quá trình rà soát phát hiện các điểm vi phạm nghiêm trọng về tính nhất quán, quân luật giao diện và cơ chế theming:

#### 1. Trùng lặp BottomNav & Vi phạm sử dụng Emoji chrome (Kid Context)
Các trang của Trẻ em tự viết tay BottomNav inline thay vì import component dùng chung [BottomNav.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/ui/BottomNav.js). Việc này làm phân mảnh điều hướng và vi phạm quân luật: *"cấm emoji làm icon chrome; emoji chỉ sống trong game-data"*. Các file vi phạm gồm:
- **Trang Góc Của Tớ (`/me`)** — [me/page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(kid)/me/page.js) (Dòng 333-350): Tự định nghĩa thanh điều hướng, dùng emoji `🌳`, `🛒`, `⛏️`, `🏠`.
- **Trang Cửa Hàng Quà (`/rewards`)** — [rewards/page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(kid)/rewards/page.js) (Dòng 406-438): Dùng BottomNav viết tay, chứa emoji `🌳`, `🛒`, `⛏️`, `🔑`.
- **Trang Hang Khai Thác (`/mining`)** — [mining/page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(kid)/mining/page.js) (Dòng 724-756): Viết tay BottomNav tương tự.
- **Trang Quyết Đấu Trùm (`/boss`)** — [boss/page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(kid)/boss/page.js) (Dòng 210-242): Viết tay BottomNav chứa nút `👾 Boss`.

#### 2. Tuyến đường Quyết Đấu Trùm bị cô lập (Orphaned Route)
Trang chính Dashboard [dashboard/page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(kid)/dashboard/page.js) dùng component `@/ui/BottomNav` chung (chỉ gồm 4 nút: Adventure, Rewards, Mining, Parent) và không có liên kết điều hướng nào khác dẫn tới `/boss`. Nút Boss `👾` chỉ tồn tại trong BottomNav tự định nghĩa của chính trang `/boss`. Trẻ em không có cách nào tự điều hướng tới tính năng đấu Boss từ các màn hình khác.

#### 3. Vi phạm Quân luật giao diện ở Parent Context (Phòng Bố Mẹ)
Phụ huynh phản hồi giao diện bị "ngợp" và quân luật quy định thiết kế SaaS monochrome tối giản. Tuy nhiên:
- **Sử dụng chữ IN HOA và font weight quá đậm (900/font-black)**:
  - Tại PIN Gate: [page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(parent)/parent/page.js) (Dòng 118) viết `🔑 QUẢN TRỊ`.
  - Tại [WeekTab.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/features/parent/components/WeekTab.js) (Dòng 317) - Nút phụ `XUẤT THẺ KHOE CON` viết hoa hoàn toàn và dùng `font-black`.
- **Vi phạm quy tắc màu sắc**: Nút Xuất thẻ khoe con tại [WeekTab.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/features/parent/components/WeekTab.js) dùng màu tím `bg-clay`, phá vỡ tôn chỉ monochrome và quy tắc chỉ dùng xanh forest cho primary action.
- **Lạm dụng Emoji làm icon chrome**: Tiêu đề các tab dùng emoji thay vì `lucide-react` (ví dụ: `✍️ Tick giúp con` trong [ApprovalTab.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/features/parent/components/ApprovalTab.js) hay `⚙️ Giới hạn` trong [SystemTab.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/features/parent/components/SystemTab.js)).

#### 4. Nguy cơ FOUC (Nhấp nháy giao diện khi tải trang)
Component [ThemeScope.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/components/ThemeScope.js) áp thuộc tính `data-ui-mode` lên thẻ `<html>` thông qua `useEffect` ở client-side:
```javascript
export default function ThemeScope({ mode }) {
  useEffect(() => {
    if (mode) document.documentElement.dataset.uiMode = mode;
  }, [mode]);
  return null;
}
```
Khi Next.js render phía server (SSR), thuộc tính `data-ui-mode` chưa được gán. Trình duyệt tải trang lần đầu sẽ hiển thị theme mặc định (:root palette công khai), sau đó khi hydrat hóa thành công, `useEffect` mới chạy và đổi sang theme Kid/Parent. Việc này tạo ra một khoảng nhấp nháy màu sắc (FOUC), ảnh hưởng tới cảm giác cao cấp của ứng dụng.

---

### R2. Kiểm toán An ninh và Cấu hình Hệ thống (Security & Configuration Audit)

#### 1. Rà soát rò rỉ Cấu hình và API Keys
Quá trình quét phát hiện rò rỉ Anon Key của production trong repo:
- **GitHub Workflow**: File [.github/workflows/deploy.yml](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/.github/workflows/deploy.yml) (Dòng 40-41) hardcode trực tiếp URL và Anon Key của production làm giá trị mặc định.
- **SQL Migrations**:
  - File [20260702000008_cron_schedules.sql](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/supabase/migrations/20260702000008_cron_schedules.sql) (Dòng 18-19) hardcode Anon Key của production trong cấu hình gọi cron gửi push notification.
  - File [20260703000010_lifecycle.sql](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/supabase/migrations/20260703000010_lifecycle.sql) (Dòng 52-53) hardcode Anon Key của production tương tự để gọi email lifecycle.

#### 2. Lỗ hổng rò rỉ PIN và Bypass PIN Gate hoàn toàn ở Client-side (Nghiêm trọng)
- **Rò rỉ PIN dạng plaintext**: Trong file [GameState.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/context/GameState.js) (Dòng 840), mã PIN của phụ huynh (`parentPin`) được đồng bộ trực tiếp trong JSON game state của trẻ, sau đó được lưu dạng plaintext ở `localStorage` của trình duyệt tại dòng 127 dưới key `luk_state_<childId>`. Trẻ chỉ cần mở Console DevTools chạy `localStorage.getItem` là đọc được mã PIN.
- **Kiểm tra PIN Gate hoàn toàn ở client**: Trong file [page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(parent)/parent/page.js) (Dòng 49-50), logic chỉ so sánh `pinEntry === parentPin` trên client-side. Bất kỳ ai sử dụng React DevTools đều có thể thay đổi trạng thái `isAuthenticated` thành `true` để vượt qua hoàn toàn màn hình nhập PIN và thực hiện các chức năng của phụ huynh.
- **Rủi ro Session dùng chung**: Vì trẻ và bố mẹ dùng chung một thiết bị (và chung một JWT access token của phụ huynh ở client), API REST của Supabase cho phép sửa đổi dữ liệu `game_states` nếu có token hợp lệ. Trẻ em có kiến thức kỹ thuật có thể gửi trực tiếp request HTTP PATCH qua REST API để tự phê duyệt nhiệm vụ, đổi quà hoặc tăng điểm mà RLS của Supabase không thể ngăn chặn (do token mang định danh của phụ huynh).

#### 3. Thiếu Authentication/Authorization tại các Edge Functions
Các Edge Functions xử lý tác vụ gửi email hoặc push notification hàng loạt không thực hiện xác thực an toàn:
- Hàm `lifecycle-email` ([index.ts](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/supabase/functions/lifecycle-email/index.ts) dòng 85).
- Hàm `weekly-email` ([index.ts](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/supabase/functions/weekly-email/index.ts) dòng 93).
- Hàm `send-push` ([index.ts](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/supabase/functions/send-push/index.ts) dòng 18).
Các hàm này dùng `Deno.serve` nhận request mà không kiểm tra token `service_role`. Bất kỳ ai nắm giữ Anon Key của dự án đều có thể gửi POST request trực tiếp lên production endpoints này để gửi email/notifications rác hàng loạt, làm cạn kiệt tài nguyên và hạn ngạch API.

#### 4. Rủi ro drift cấu hình SQL Migrations
Trong file [20260702000009_referral.sql](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/supabase/migrations/20260702000009_referral.sql) (Dòng 119) định nghĩa lại hàm `public.activate_from_payment` nhưng thiếu lệnh `revoke execute ... from public, anon, authenticated` ở cuối file. Điều này dẫn tới nguy cơ trôi cấu hình bảo mật nếu signature hàm được cập nhật trong tương lai.

#### 5. Lỗi Modulo Bias khi sinh mã kích hoạt
Trong script [generate-codes.mjs](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/scripts/generate-codes.mjs) (Dòng 25) sử dụng phép toán chia lấy dư `b % ALPHABET.length` đối với byte ngẫu nhiên. Vì `256` không chia hết cho độ dài bảng chữ cái, điều này tạo ra sai lệch xác suất (modulo bias) nhỏ, khiến một số ký tự xuất hiện nhiều hơn ký tự khác, giảm nhẹ tính ngẫu nhiên của mã kích hoạt.

---

### R3. Đánh giá chất lượng và độ bao phủ của hệ thống kiểm thử & Build

Hệ thống kiểm thử và build của dự án hoạt động cực kỳ hoàn hảo và đạt tiêu chuẩn chất lượng cao.

#### 1. Đánh giá kiểm thử tự động (Vitest)
- Tổng cộng **16 file test** (nằm trong thư mục `tests/`) chạy hoàn thành xuất sắc trong **869ms** với **220/220 test cases pass (100%)**.
- Các file test tiêu biểu như [tests/economy.test.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/tests/economy.test.js) (64 tests) và [tests/pets.test.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/tests/pets.test.js) (16 tests) bao phủ rất sâu logic nghiệp vụ cốt lõi: escrow điểm thưởng, tự động duyệt (auto-approve) khi Uy Tín >= 80, tiến hóa thú cưng và tăng trưởng cây thế giới.
- Việc sử dụng cơ chế queue RNG (`rngQueue`) giúp kiểm soát chặt chẽ các hành động mang tính ngẫu nhiên khi viết unit test.

**Log thực tế chạy `npx vitest run`**:
```text
 RUN  v4.1.9 D:/Antigravity/Pain Tool/Level Up Kids/level-up-kids

 ✓ tests/season.test.js (6 tests) 4ms
 ✓ tests/rewards-age.test.js (10 tests) 9ms
 ✓ tests/intake.test.js (10 tests) 10ms
 ✓ tests/gifting.test.js (10 tests) 8ms
 ✓ tests/migrate.test.js (3 tests) 5ms
 ✓ tests/progress.test.js (8 tests) 5ms
 ✓ tests/boss.test.js (12 tests) 8ms
 ✓ tests/pets.test.js (16 tests) 10ms
 ✓ tests/worldtree.test.js (7 tests) 6ms
 ✓ tests/cosmetics.test.js (8 tests) 7ms
 ✓ tests/habits.test.js (6 tests) 9ms
 ✓ tests/reward-dose.test.js (12 tests) 11ms
 ✓ tests/moments.test.js (12 tests) 12ms
 ✓ tests/journeys.test.js (25 tests) 24ms
 ✓ tests/economy.test.js (64 tests) 30ms
 ✓ tests/referral.test.js (11 tests) 3ms

Test Files  16 passed (16)
     Tests  220 passed (220)
  Start at  15:52:50
  Duration  869ms (transform 1.38s, setup 0ms, import 1.94s, tests 159ms, environment 2ms)
```

#### 2. Đánh giá tính khả thi và độ ổn định của Build
Lệnh `npm run build` kết thúc thành công với Next.js 14.2.35. Trình biên dịch tối ưu hóa thành công 18 static/dynamic routes mà không gặp bất kỳ lỗi cú pháp, kiểu dữ liệu hay linting nào.

**Log thực tế chạy `npm run build`**:
```text
> quocbao-summer-game@0.1.0 build
> next build

  ▲ Next.js 14.2.35
  - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/18) ...
   Generating static pages (4/18) 
   Generating static pages (8/18) 
   Generating static pages (13/18) 
 ✓ Generating static pages (18/18)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    2.28 kB         191 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ƒ /api/webhooks/sepay                  0 B                0 B
├ ○ /auth                                2.08 kB         175 kB
├ ○ /boss                                2.49 kB         205 kB
├ ○ /dashboard                           12.1 kB         214 kB
├ ○ /demo                                858 B           174 kB
├ ○ /family                              1.98 kB         175 kB
├ ○ /me                                  3.28 kB         206 kB
├ ○ /mining                              5.59 kB         208 kB
├ ○ /parent                              23.2 kB         225 kB
├ ○ /premium                             4.6 kB          178 kB
├ ○ /register                            3.08 kB         163 kB
├ ○ /rewards                             3.35 kB         206 kB
└ ○ /setup                               5.23 kB         194 kB
+ First Load JS shared by all            87.3 kB
  ├ chunks/117-4266c62f1bb06c8c.js       31.7 kB
  ├ chunks/fd9d1056-40982339ec9e224e.js  53.6 kB
  └ other shared chunks (total)          1.95 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

### R4. Tối ưu mã nguồn và quản lý tài nguyên (Code Optimization & Dead Code)

#### 1. Thư viện thừa (Dead Dependencies)
Trong cấu hình file [package.json](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/package.json), dự án khai báo `"framer-motion": "^12.40.0"` (dòng 23) và `"@vitejs/plugin-react": "^6.0.3"` (dòng 32) nhưng không có bất kỳ component nào trong `src/` import hay sử dụng chúng. Thư viện confetti sử dụng thực tế là `canvas-confetti`. Việc này làm tăng dung lượng thư mục cài đặt (`node_modules`) không cần thiết.

#### 2. Vấn đề Screen Time Timer gây lãng phí CPU/IO và Nghẽn Đồng Bộ (Cloud Sync Starvation)
Trong file [src/context/GameState.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/context/GameState.js):
- Khi timer đếm ngược screen time chạy, nó gọi `setState` mỗi **500ms** (dòng 173-190).
- Hàm tự động lưu và đồng bộ (dòng 120-142) chạy qua một `useEffect` có dependency array chứa `state`.
- Khi timer chạy, `state` đổi liên tục mỗi 500ms -> Kích hoạt `localStorage.setItem` ghi đĩa mỗi 500ms, đồng thời gọi `clearTimeout` để debounce việc đồng bộ đám mây (thời gian debounce là 2500ms).
- Do tần suất reset timeout (500ms) nhanh hơn thời gian chờ sync (2500ms), **dữ liệu tiến trình của trẻ không bao giờ được đồng bộ lên Supabase** trong suốt quá trình đếm ngược timer, và chỉ được đồng bộ khi timer bị tắt. Điều này gây hao pin, hại bộ nhớ flash thiết bị và tăng nguy cơ mất dữ liệu nếu trẻ đóng ứng dụng đột ngột.

#### 3. Thiếu Memoization cho GameContext Provider value
Trong file [src/context/GameState.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/context/GameState.js) (Dòng 784-893), đối tượng `value` truyền vào `<GameContext.Provider>` được định nghĩa trực tiếp dạng inline object. Mỗi khi `state` thay đổi (chẳng hạn mỗi 500ms khi timer chạy), một tham chiếu object mới được sinh ra và ép buộc hơn 10 components con tiêu thụ context (Dashboard, các tabs quản trị...) phải re-render không cần thiết, làm giảm đáng kể hiệu năng mượt mà của giao diện.

#### 4. Lặp lại logic ánh xạ chỉ số
Hàm `addCustomTask` (dòng 600) và `splitTask` (dòng 634) trong file [src/context/GameState.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/context/GameState.js) đều khai báo thủ công trùng lặp biến:
`const statKeyMap = { strength: "strength", intellect: "intellect", creative: "creative", help: "help", connection: "help" };`

#### 5. Script PWA mồ côi
File [scripts/render-icons.mjs](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/scripts/render-icons.mjs) dùng để render icon PWA bằng `sharp` nhưng không được đăng ký trong scripts của `package.json`, khiến dev khó chạy tự động.

---

## ĐỀ XUẤT TỐI ƯU HÓA & KẾ HOẠCH REFACTOR CHI TIẾT

Dựa trên kết quả kiểm toán, nhóm phân tích đề xuất 4 giải pháp refactor chi tiết sau đây để cải thiện bảo mật và tối ưu hóa hệ thống:

### Đề xuất 1: Sửa lỗi bảo mật PIN Gate (Bảo mật - Mức độ: Cao)
*   **Giải pháp**: Tách mã PIN ra khỏi Game State của Trẻ. Lưu trữ `parentPin` trong bảng `profiles` của Bố Mẹ trong cơ sở dữ liệu.
*   **Kế hoạch Refactor**:
    1. Xóa trường `parentPin` khỏi struct game state trả về cho trẻ.
    2. Viết một database function RPC trong Postgres (Supabase):
       ```sql
       create or replace function verify_parent_pin(p_pin text)
       returns boolean as $$
       begin
         return exists (
           select 1 from public.profiles
           where id = auth.uid() and parent_pin = p_pin
         );
       end;
       $$ language plpgsql security definer;
       ```
    3. Revoke execute hàm trên khỏi public và chỉ grant cho authenticated users.
    4. Cập nhật giao diện nhập PIN [page.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/app/(parent)/parent/page.js) để gọi RPC xác thực này lên server thay vì so sánh client-side.

### Đề xuất 2: Khắc phục nghẽn đồng bộ đám mây và tối ưu ghi đĩa của Timer (Hiệu năng - Mức độ: Cao)
*   **Giải pháp**: Tách trạng thái tick giây của Screen Time khỏi Game State chung để không kích hoạt `useEffect` lưu đĩa và debounce sync.
*   **Kế hoạch Refactor**:
    1. Trong [src/context/GameState.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/context/GameState.js), tạo một state riêng biệt cho số giây còn lại của timer:
       ```javascript
       const [timerSecondsLeft, setTimerSecondsLeft] = useState(s.screenTimeLeft);
       ```
    2. Cập nhật dependency array của `useEffect` lưu tự động để nó không lắng nghe sự thay đổi của timer: loại bỏ `state.screenTimeLeft` ra khỏi luồng lưu tự động định kỳ 500ms.
    3. Chỉ đồng bộ số giây còn lại vào state chính và ghi xuống cơ sở dữ liệu khi:
       - Timer được bật/tắt (change state).
       - Hoặc định kỳ 60 giây một lần (throttle) để đảm bảo không mất quá nhiều tiến trình nếu sập nguồn đột ngột.

### Đề xuất 3: Memoize Context Value của GameProvider (Hiệu năng - Mức độ: Trung bình)
*   **Giải pháp**: Tránh re-render không cần thiết cho toàn bộ cây UI khi chỉ có một trường dữ liệu nhỏ thay đổi.
*   **Kế hoạch Refactor**:
    1. Bọc value của GameContext trong `useMemo` tại [src/context/GameState.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/context/GameState.js):
       ```javascript
       const contextValue = useMemo(() => ({
         isLoaded: authLoaded && isLoaded,
         hasActiveChild: Boolean(activeChildId && state),
         charName: s.charName,
         charClass: s.charClass,
         level: s.level,
         exp: s.exp,
         expToNextLevel: s.level * 100,
         streak: s.streak,
         // ... các callbacks khác đã được bọc useCallback ...
       }), [authLoaded, isLoaded, activeChildId, state, s, ...callbacks]);
       ```
    2. Truyền `contextValue` vào Provider: `<GameContext.Provider value={contextValue}>`.

### Đề xuất 4: Cải tiến UX/UI, gom nhóm BottomNav và loại bỏ Dead Dependencies (Trải nghiệm người dùng - Mức độ: Thấp)
*   **Giải pháp**: Đồng bộ hóa toàn bộ BottomNav và làm sạch file cấu hình.
*   **Kế hoạch Refactor**:
    1. Thay thế toàn bộ BottomNav tự viết tay bằng việc import component dùng chung [BottomNav.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/ui/BottomNav.js) tại 4 trang: `me/page.js`, `rewards/page.js`, `mining/page.js`, và `boss/page.js`.
    2. Thêm nút Boss `👾` (sử dụng icon `lucide-react` thay vì emoji) vào component [BottomNav.js](file:///d:/Antigravity/Pain%20Tool/Level%20Up%20Kids/level-up-kids/src/ui/BottomNav.js) để trẻ em có thể truy cập `/boss` từ mọi màn hình, giải quyết triệt để lỗi cô lập route.
    3. Chạy lệnh gỡ cài đặt các thư viện thừa để giải phóng dung lượng:
       `npm uninstall framer-motion @vitejs/plugin-react`
    4. Đăng ký script render icon vào `package.json`:
       `"generate:pwa-icons": "node scripts/render-icons.mjs"`
