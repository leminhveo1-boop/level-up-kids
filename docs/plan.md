# 🗺️ KẾ HOẠCH TÍCH HỢP HỆ THỐNG KHAI THÁC ANH HÙNG (HERO MINING SYSTEM)

Hệ thống **Hero Mining System** là sự nâng cấp đột phá, chuyển đổi toàn bộ cơ chế game hóa từ thưởng tiền mặt trực tiếp thành cơ chế **Đào kho báu ảo - Đổi phần quà thật**. Sự thay đổi này kích thích tính kiên nhẫn, thói quen tích lũy dài hạn và tạo ra dopamine tích cực thông qua hành trình nỗ lực chinh phục.

---

## 🧐 PHÂN TÍCH KIẾN TRÚC & KINH TẾ GAME MỚI

### 1. Dịch Chuyển Mô Kinh Tế

* **Mô hình cũ**: Hoàn thành nhiệm vụ ➔ Nhận Điểm ⭐ & Tiền Vàng 🪙 ➔ Đổi quà.
* **Mô hình mới (Ví Kép Cải Tiến)**:
  1. **Điểm Tích Lũy (Points - ⭐)**: Vẫn được giữ nguyên làm **Điểm Giải Trí**, dùng để đổi trực tiếp lấy các gói giờ chơi TV/Game lành mạnh.
  2. **Năng Lượng (Energy - ⚡)**: Thay thế cho Tiền Vàng cũ. Con làm nhiệm vụ ngày hoặc duy trì Streak để nhận Energy (Tối đa 100 ⚡ mỗi ngày).
  3. **Hero Coin (🪙)**: Tiền tệ ảo tối cao trong game. Con dùng Energy để đào mỏ trong **Hero Mining Cave** ➔ Nhận ngẫu nhiên Hero Coin theo tỷ lệ ➔ Tích lũy Hero Coin ➔ Quy đổi lấy quà thực tế từ bố mẹ.

---

## 🛠️ CÁC THAY ĐỔI CẦN THỰC HIỆN (PROPOSED CHANGES)

### 1. Cấu Trúc Trạng Thái & Logic (`src/context/GameState.js`)

* **State mới**:
  * Loại bỏ `gold` và thay thế hoàn toàn bằng `heroCoins` (Ví Hero Coin 🪙).
  * `energy`: Chuyển từ biến tạm thời thành biến tài sản tích lũy chính (nhận từ nhiệm vụ, tiêu hao khi đào mỏ, tối đa 100/ngày).
  * Bổ sung thêm lịch sử đào: `miningHistory` (lưu trữ các lượt trúng vàng/bạc/kho báu thần thoại).
* **Nhiệm vụ mặc định (`DEFAULT_TASKS`)**:
  * Cập nhật phần thưởng: loại bỏ hoàn toàn `gold` và thêm `energy` tương ứng với bảng nguồn năng lượng (Ví dụ: Tập thể dục +20 Energy, Rửa bát +15 Energy...).
* **Cửa hàng mặc định (`DEFAULT_REWARDS`)**:
  * Chuyển đổi Tab Tiền Mặt sang thanh toán bằng `heroCoins` (Ví dụ: Thưởng 20k tiền mặt yêu cầu 200 Hero Coins).
* **Hàm `completeTask`**:
  * Khi hoàn thành nhiệm vụ: cộng EXP, cộng Điểm ⭐, và cộng **Energy ⚡** (giới hạn tối đa 100/ngày).
* **Hàm `mineTreasure` (Hàm mới)**:
  * Mỗi lần đập đá tốn **1 Energy ⚡**.
  * Tính toán tỷ lệ Loot Table:
    * `Small Hero Coin` (70% cơ hội) ➔ +1 đến +3 Coin.
    * `Silver Coin` (20% cơ hội) ➔ +5 đến +10 Coin.
    * `Golden Coin` (8% cơ hội) ➔ +15 đến +25 Coin.
    * `Legendary Treasure` (2% cơ hội) ➔ +50 đến +100 Coin.
  * Áp dụng **Lucky Strike** (tỷ lệ nhỏ nhận rương báu siêu khổng lồ) và **Streak Buff / Habit Buff** (nếu con có streak cao hoặc chăm chỉ đọc sách/thể dục, tỷ lệ ra rương Epic/Legendary sẽ tăng lên).
  * Kích hoạt nổ pháo hoa Confetti và hiệu ứng âm thanh ảo tương ứng.

### 2. Màn Hình "Động Khai Thác" (`src/app/mining/page.js` - NEW PAGE)

Chúng ta sẽ thay thế hoàn toàn Tab **Boss Tuần** (hoặc gộp Boss Tuần thành một sự kiện nhỏ trong phiêu lưu) và đổi Tab thứ 3 trong Bottom Navigation thành **"Đào Kho Báu ⛏️"** dẫn tới màn hình **"Hero Mining Cave"**:

* **Giao Diện Clicker / Simulator**:
  * Thiết kế một tảng đá ma thuật khổng lồ lấp lánh (Magic Ore) ở giữa màn hình.
  * Hiệu ứng đập đá: Khi con click vào tảng đá, tiêu hao 1 Energy ⚡, tảng đá sẽ rung chuyển, bắn ra các mảnh vụn (Spark/Rock break particle effects) và nổ ra xu vàng bay lên lấp lánh (Coin explosion).
  * Thanh hiển thị Năng Lượng ⚡ hiện tại dưới dạng một bình thuốc ma thuật (Mana elixir) cực kỳ sinh động.
  * Hộp thông tin **"Lịch sử đào mỏ"** hiển thị những kho báu hiếm mà con vừa đào được.
  * Hiệu ứng âm thanh khi đập đá (Click lách cách) và khi mở rương huyền thoại.

### 3. Cập Nhật Màn Hình Cửa Hàng (`src/app/rewards/page.js`)

* Hiển thị Ví Kép mới ở Header: `{points} ⭐` (Điểm giải trí) và `{heroCoins} 🪙` (Hero Coins).
* Tab 2 đổi từ "Đổi Tiền Mặt (Vàng)" sang **"Đổi Quà Lớn (Hero Coin 🪙)"**.
* Khi click đổi quà Vàng, hệ thống kiểm tra số lượng `heroCoins` của con và hiển thị modal thiếu Hero Coin tương ứng.

### 4. Cập Nhật Màn Hình Quản Trị Bố Mẹ (`src/app/parent/page.js`)

* Bảng điều chỉnh ví: Cho phép bố mẹ thưởng/phạt thủ công **Điểm ⭐** hoặc **Hero Coin 🪙** cho con.
* Bảng thiết lập nhiệm vụ: Cho phép bố mẹ thiết lập EXP, Điểm ⭐ và **Energy ⚡** thưởng cho nhiệm vụ.
* Dropdown Nhiệm vụ mẫu và Bong bóng Chạm nhanh tự động điền form khớp hoàn toàn với cấu trúc Energy mới.

---

## 🔮 CÂU HỎI SOCRATIC GATE DÀNH CHO ANH

Để đảm bảo thiết kế game chuẩn xác và hấp dẫn nhất cho bé Quốc Bảo, anh giúp An giải đáp 3 câu hỏi chiến lược này nhé:

1. **Về vị trí của "Hero Mining Cave"**:
   Anh thấy phương án **thay thế hoàn toàn Tab "Boss Tuần"** ở thanh điều hướng dưới cùng bằng Tab **"Đào Mỏ ⛏️"** có tốt không? *(Con có một phân khu Đào kho báu riêng biệt, còn việc tấn công Boss Tuần sẽ được An tự động tích hợp luôn vào Dashboard khi con làm nhiệm vụ để game gọn gàng).*
2. **Về tỷ lệ quy đổi trong Cửa Hàng Quà Tặng**:
   Chúng ta nên thiết lập mức Hero Coin quy đổi cho các món quà thế nào để kích thích sự kiên trì (Delayed Gratification)? An đề xuất:
   * *Ăn kem 🍨*: 100 Hero Coins (cần khoảng 4-5 ngày tích cực làm việc).
   * *Xem phim rạp 🍿*: 300 Hero Coins (khoảng 2 tuần kiên trì).
   * *Bộ đồ chơi Lego 🧸*: 1000 Hero Coins (khoảng 1-2 tháng nỗ lực).
     👉 Mức quy đổi này có vừa sức với Quốc Bảo không hay anh muốn tăng/giảm thêm?
3. **Về các hiệu ứng đập đá đập rương (Mining Visuals)**:
   Khi đập đá trúng rương "Legendary Treasure" (2%), anh muốn có hiệu ứng pháo hoa toàn màn hình hoành tráng để chúc mừng con không?

---

## 📐 KẾ HOẠCH KIỂM THỬ (VERIFICATION PLAN)

* **Kiểm thử thủ công**:
  * Bố mẹ vào Parent page, tạo nhiệm vụ mới có thưởng 20 Energy ⚡.
  * Sang màn hình con, tích hoàn thành ➔ Năng Lượng ⚡ tăng lên chính xác.
  * Vào **Hero Mining Cave**, click đập đá ➔ Energy giảm đi 1, hiện hiệu ứng đá vỡ và nổ xu, Hero Coin trong ví tăng ngẫu nhiên theo Loot Table.
  * Click đập đá liên tục đến khi hết Energy ➔ Nút đập đá chuyển xám và hiện thông báo hết Năng lượng, hướng dẫn con đi làm nhiệm vụ ngoài đời để nạp đầy bình ⚡.
  * Vào Cửa hàng đổi quà, kiểm tra ví Hero Coin và thực hiện đổi quà bằng PIN thành công.
