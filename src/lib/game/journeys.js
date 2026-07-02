/**
 * B-lite "Lộ Trình" — packaged 3-week habit journeys (the parent's "đường dẫn").
 * A journey = 3 weekly stages, each with tasks that get progressively harder
 * (Fogg: tiny → anchored → autonomous), a parent tip, and an expectation line
 * that normalizes the mid-week dip so parents don't feel lost or give up.
 *
 * PURE functions (no React). Same contract as economy.js:
 * take a full game state, return { state, result } — never mutate input.
 */

/** Days per stage (1 stage = 1 week). */
export const JOURNEY_STAGE_DAYS = 7;

/** One journey at a time — one habit at a time (Fogg). */
export const JOURNEY_ERRORS = {
  ACTIVE: "JOURNEY_ACTIVE",
  NOT_FOUND: "JOURNEY_NOT_FOUND",
  NONE: "NO_ACTIVE_JOURNEY",
};

export const JOURNEY_AGE_BANDS = [
  { id: "4-6", label: "4–6 tuổi 🧸", desc: "Thói quen cơ bản, việc nhẹ" },
  { id: "7-9", label: "7–9 tuổi 🚴", desc: "Tự lập, học tập, việc nhà" },
  { id: "10-12", label: "10–12 tuổi 🚀", desc: "Kỷ luật, trách nhiệm, kỹ năng" },
  { id: "13-15", label: "13–15 tuổi 🎧", desc: "Tự chủ, tiền bạc, màn hình" },
];

// Task spec fields: title, category, exp, points, energy, verifyType, [durationMin]
// verifyType: trust = con tự ghi nhận | parent = bố mẹ xác nhận | focus = timer tuỳ chọn
export const JOURNEY_CATALOG = [
  // ============================== 4–6 TUỔI ==============================
  {
    id: "brush_teeth_46",
    icon: "🦷",
    title: "Đánh răng không cần nhắc",
    ageBand: "4-6",
    weeks: 3,
    goal: "Sau 3 tuần, bé tự đánh răng sáng & tối như một thói quen — không cằn nhằn, không rượt đuổi.",
    identity: "Tớ là Dũng Sĩ Răng Trắng! ✨",
    stages: [
      {
        title: "Tuần 1 — Chạm bàn chải là thắng",
        tasks: [
          { title: "🦷 Đánh răng tối cùng bố mẹ", category: "discipline", exp: 10, points: 10, energy: 8, verifyType: "parent" },
        ],
        parentTip:
          "Tuần này chỉ cần bé CHỊU đánh răng buổi tối — chưa cần đúng kỹ thuật, chưa cần buổi sáng. Đứng đánh răng cùng bé cho vui (bắt chước là siêu năng lực của tuổi này), xong thì đập tay ăn mừng. Tránh: chê “đánh chưa sạch” — tuần này xây niềm vui trước, kỹ thuật tính sau.",
        expectation:
          "Ngày 3–4 nhiều bé bắt đầu “quên” hoặc mè nheo — đó là dấu hiệu bình thường của một thói quen đang hình thành, không phải bé hư. Cứ rủ lại nhẹ nhàng như chưa có gì xảy ra.",
      },
      {
        title: "Tuần 2 — Sáng & tối đủ đôi",
        tasks: [
          { title: "🦷 Đánh răng buổi sáng", category: "discipline", exp: 10, points: 10, energy: 8, verifyType: "parent" },
          { title: "🌙 Đánh răng buổi tối", category: "discipline", exp: 10, points: 10, energy: 8, verifyType: "parent" },
        ],
        parentTip:
          "Gắn “neo”: đánh răng tối xong mới đến truyện trước giờ ngủ — thói quen bám vào thói quen sẵn có sẽ rất khó rơi. Thử để bé tự bóp kem đánh răng: quyền được tự làm khiến bé hào hứng hơn mọi lời khen.",
        expectation:
          "Buổi sáng thường khó hơn buổi tối vì cả nhà vội. Nếu tuần này chỉ đều buổi tối, bé vẫn đang đi đúng lộ trình.",
      },
      {
        title: "Tuần 3 — Tự giác không cần gọi",
        tasks: [
          { title: "🦷 Tự đánh răng sáng & tối không cần ai nhắc", category: "discipline", exp: 15, points: 15, energy: 10, verifyType: "trust" },
        ],
        parentTip:
          "Lùi lại làm khán giả: thay vì ra lệnh, hỏi “ơ, con đánh răng chưa nhỉ?” rồi im lặng chờ. Khen đúng quá trình: “Con tự nhớ đánh răng, không ai nhắc — con lớn thật rồi.”",
        expectation:
          "Tuần này bé có thể thử “bỏ một buổi xem có sao không”. Bình tĩnh nhắc đúng một lần rồi thôi — hôm sau bé thường tự quay lại nếp cũ.",
      },
    ],
  },
  {
    id: "tidy_toys_46",
    icon: "🧸",
    title: "Cất đồ chơi gọn gàng",
    ageBand: "4-6",
    weeks: 3,
    goal: "Bé tự cất đồ chơi sau khi chơi — nhà bớt “bãi chiến trường”, bố mẹ bớt hẳn một việc mỗi tối.",
    identity: "Tớ là Chủ Nhà Tí Hon! 🏠",
    stages: [
      {
        title: "Tuần 1 — Cất 3 món là thắng",
        tasks: [
          { title: "🧸 Cất 3 món đồ chơi vào đúng chỗ", category: "help", exp: 10, points: 10, energy: 8, verifyType: "parent" },
        ],
        parentTip:
          "Biến thành trò chơi: “đua xem ai cất nhanh hơn” hoặc đếm to 1-2-3. Dán ảnh lên giỏ/hộp để bé biết món nào về đâu. Tránh: sốt ruột dọn hộ khi bé đang chậm — chậm mà tự tay làm mới là mục tiêu.",
        expectation:
          "Bé tuổi này dọn rất chậm và hay… lạc đề giữa chừng để chơi tiếp. Hoàn toàn bình thường — chỉ cần 3 món về đúng chỗ là thắng.",
      },
      {
        title: "Tuần 2 — Chơi xong là cất",
        tasks: [
          { title: "🧸 Cất hết đồ chơi sau mỗi lần chơi", category: "help", exp: 12, points: 12, energy: 10, verifyType: "parent" },
        ],
        parentTip:
          "Gắn neo: cất xong mới chuyển sang trò mới hoặc giờ ăn nhẹ. Bật một bài “nhạc dọn đồ” cố định 5 phút — khi nhạc hết, đồ về giỏ hết.",
        expectation:
          "Sẽ có hôm bé “đình công”. Đừng biến thành cuộc chiến — hôm đó cùng dọn “mỗi người một nửa” vẫn tính là ngày thành công của tuần này.",
      },
      {
        title: "Tuần 3 — Chủ nhà tí hon",
        tasks: [
          { title: "🧸 Tự cất đồ chơi không cần nhắc", category: "help", exp: 15, points: 15, energy: 10, verifyType: "trust" },
        ],
        parentTip:
          "Phong bé làm “đội trưởng góc đồ chơi” — bố mẹ chỉ đến nghiệm thu và ngạc nhiên: “Ơ, ai dọn mà gọn thế này?” Sự công nhận trước cả nhà đáng giá hơn mọi phần thưởng.",
        expectation:
          "Đừng kỳ vọng góc chơi đẹp như tạp chí — “đồ về đúng giỏ” là tiêu chuẩn vàng của tuổi này rồi.",
      },
    ],
  },
  {
    id: "morning_dress_46",
    icon: "👕",
    title: "Sáng tự mặc đồ",
    ageBand: "4-6",
    weeks: 3,
    goal: "Bé tự mặc quần áo buổi sáng — bố mẹ có thêm 10 phút quý giá mỗi sáng.",
    identity: "Tớ tự mặc đồ siêu nhanh! ⚡",
    stages: [
      {
        title: "Tuần 1 — Tự mặc 1 món",
        tasks: [
          { title: "👕 Tự mặc 1 món (áo hoặc quần)", category: "discipline", exp: 10, points: 10, energy: 8, verifyType: "parent" },
        ],
        parentTip:
          "Soạn đồ từ tối hôm trước CÙNG bé, cho bé chọn giữa 2 bộ — được quyền chọn khiến bé hợp tác gấp đôi. Bắt đầu bằng món dễ (quần chun, áo chui đầu rộng).",
        expectation:
          "Mặc ngược, mặc trái sẽ xảy ra thường xuyên. Thỉnh thoảng cứ để bé ra đường với chiếc áo hơi lệch — đó là huy chương của sự tự lập, không phải lỗi của bố mẹ.",
      },
      {
        title: "Tuần 2 — Tự mặc cả bộ",
        tasks: [
          { title: "👕 Tự mặc cả bộ quần áo", category: "discipline", exp: 12, points: 12, energy: 10, verifyType: "parent" },
        ],
        parentTip:
          "Cho cả nhà dậy sớm hơn 10 phút — bé tự mặc chỉ chậm khi bị giục. Ngồi cạnh động viên nhưng giữ tay sau lưng: giúp bằng lời, không giúp bằng tay.",
        expectation:
          "Hôm nào vội, bố mẹ sẽ rất muốn mặc hộ cho nhanh — cố nhịn. Một lần mặc hộ “cho kịp” thường kéo lùi nếp mất vài ngày.",
      },
      {
        title: "Tuần 3 — Tự chọn & tự mặc",
        tasks: [
          { title: "👕 Tự chọn và mặc đồ không cần nhắc", category: "discipline", exp: 15, points: 15, energy: 10, verifyType: "trust" },
        ],
        parentTip:
          "Chấp nhận “gu thời trang” của bé trong giới hạn thời tiết. Câu thần chú: thẩm mỹ tính sau, tự chủ tính trước.",
        expectation:
          "Bé có thể phối đồ “không giống ai” cả tuần này. Miễn ấm/mát đúng thời tiết là đạt — quyền tự quyết nhỏ hôm nay là nền của tự tin sau này.",
      },
    ],
  },

  // ============================== 7–9 TUỔI ==============================
  {
    id: "school_bag_79",
    icon: "🎒",
    title: "Tự soạn cặp sách",
    ageBand: "7-9",
    weeks: 3,
    goal: "Hết cảnh 21h phát hiện thiếu vở — con tự soạn cặp theo thời khoá biểu, quên đồ giảm hẳn.",
    identity: "Cặp sách của tớ, tớ làm chủ! 🎒",
    stages: [
      {
        title: "Tuần 1 — Soạn cùng nhau",
        tasks: [
          { title: "🎒 Soạn cặp theo thời khoá biểu cùng bố mẹ", category: "discipline", exp: 15, points: 15, energy: 10, verifyType: "parent" },
        ],
        parentTip:
          "In thời khoá biểu dán ngay góc học tập. Con đọc từng môn — bố mẹ chỉ phụ lấy đồ. Chốt một giờ cố định sau bữa tối để soạn cặp: thói quen cần một cái neo thời gian rõ ràng.",
        expectation:
          "Tuần đầu vẫn sẽ quên đồ 1–2 lần. Đừng “giải cứu” bằng cách mang đến trường hộ — quên một buổi là bài học rẻ nhất con từng được học.",
      },
      {
        title: "Tuần 2 — Con soạn, bố mẹ kiểm",
        tasks: [
          { title: "🎒 Tự soạn cặp, bố mẹ kiểm tra lại", category: "discipline", exp: 18, points: 18, energy: 12, verifyType: "parent" },
        ],
        parentTip:
          "Chỉ hỏi đúng một câu: “Con kiểm tra lại theo thời khoá biểu chưa?” — thay vì mở cặp lục. Nếu phát hiện thiếu, gợi ý (“mai có môn gì nhỉ?”) chứ đừng lấy hộ.",
        expectation:
          "Con sẽ soạn nhanh-ẩu để còn đi chơi — bình thường. Câu hỏi kiểm tra 10 giây của bố mẹ là đủ; đừng biến mỗi tối thành buổi tổng duyệt.",
      },
      {
        title: "Tuần 3 — Chủ chiếc cặp",
        tasks: [
          { title: "🎒 Tự soạn cặp không cần kiểm tra", category: "discipline", exp: 20, points: 20, energy: 15, verifyType: "trust" },
        ],
        parentTip:
          "Buông hẳn — kể cả khi bố mẹ biết con thiếu đồ. Cuối tuần cùng nhìn lại 5 phút: “Tuần này quên gì? Làm sao để tuần sau nhớ?” — con tự rút kinh nghiệm sẽ nhớ lâu hơn bị nhắc 100 lần.",
        expectation:
          "Sẽ có một lần quên đồ đúng hôm quan trọng. Đó không phải lộ trình thất bại — đó chính là ngày con học được nhiều nhất.",
      },
    ],
  },
  {
    id: "reading_79",
    icon: "📚",
    title: "Mê đọc sách 15 phút",
    ageBand: "7-9",
    weeks: 3,
    goal: "Đọc sách thành “giờ vàng” mỗi tối con tự đòi — không phải bị ép.",
    identity: "Tớ là Mọt Sách Nhí! 📖",
    stages: [
      {
        title: "Tuần 1 — 5 phút cùng nhau",
        tasks: [
          { title: "📖 Đọc sách 5 phút cùng bố mẹ", category: "intellect", exp: 15, points: 15, energy: 10, verifyType: "parent" },
        ],
        parentTip:
          "Cho con TỰ CHỌN sách — kể cả truyện tranh. Đọc gì không quan trọng bằng việc thấy đọc là vui. Chọn giờ cố định (sau đánh răng tối là neo đẹp nhất) và đọc cùng con.",
        expectation:
          "Con chọn sách “nhảm” theo mắt người lớn? Cứ kệ. Ép đọc sách hay là cách nhanh nhất giết chết thói quen đọc.",
      },
      {
        title: "Tuần 2 — 10 phút của tớ",
        tasks: [
          { title: "📚 Tự đọc sách 10 phút", category: "intellect", exp: 18, points: 18, energy: 12, verifyType: "focus", durationMin: 10 },
        ],
        parentTip:
          "Bố mẹ cầm sách của mình ngồi đọc cạnh con — làm gương mạnh hơn mọi lời giục. Hỏi “đoạn nào hay nhất?” thay vì “đọc được mấy trang?” — tò mò, đừng kiểm tra.",
        expectation:
          "Ngày 3–5 của tuần này là điểm rơi phổ biến nhất: con kêu chán. Cho đổi sách thoải mái — mục tiêu là phút đọc mỗi ngày, không phải đọc xong quyển nào.",
      },
      {
        title: "Tuần 3 — 15 phút mỗi tối",
        tasks: [
          { title: "📚 Tự đọc sách 15 phút", category: "intellect", exp: 20, points: 20, energy: 15, verifyType: "focus", durationMin: 15 },
        ],
        parentTip:
          "Cuối tuần dẫn con đi nhà sách hoặc thư viện tự chọn quyển mới — “phần thưởng tri thức” nuôi tiếp thói quen bằng chính thói quen. Hỏi con kể lại chuyện trong sách ở bữa cơm.",
        expectation:
          "Có hôm con đọc 30 phút, có hôm chỉ 5 phút. Nhìn tổng cả tuần đi lên là thắng — đều đặn quan trọng hơn kỷ lục.",
      },
    ],
  },
  {
    id: "morning_79",
    icon: "🌅",
    title: "Buổi sáng tự lập",
    ageBand: "7-9",
    weeks: 3,
    goal: "Sáng không còn là cuộc chiến: con tự dậy, gấp chăn, vệ sinh — đúng giờ ra khỏi nhà.",
    identity: "Tớ là Chiến Binh Bình Minh! 🌅",
    stages: [
      {
        title: "Tuần 1 — Dậy khi chuông reo",
        tasks: [
          { title: "⏰ Dậy sau tiếng chuông đầu tiên", category: "discipline", exp: 15, points: 15, energy: 10, verifyType: "parent" },
        ],
        parentTip:
          "Cho con TỰ chọn nhạc chuông và đặt đồng hồ xa giường một sải tay. Bí mật của buổi sáng nằm ở buổi tối: đi ngủ đủ sớm là 80% trận đánh.",
        expectation:
          "2–3 hôm đầu con vẫn nướng. Gọi đúng MỘT lần rồi để hệ quả tự nhiên làm việc (trễ thì tự giải thích với cô) — gọi đến lần thứ 5 là dạy con rằng 4 lần đầu không cần dậy.",
      },
      {
        title: "Tuần 2 — Thêm gấp chăn",
        tasks: [
          { title: "⏰ Dậy đúng giờ", category: "discipline", exp: 15, points: 15, energy: 10, verifyType: "parent" },
          { title: "🛏️ Gấp chăn màn ngay khi dậy", category: "discipline", exp: 12, points: 12, energy: 8, verifyType: "trust" },
        ],
        parentTip:
          "Luật neo: “gấp chăn xong mới ra khỏi phòng” — hành vi mới bám vào hành vi cũ là cách thói quen tự chạy. Chăn gấp xấu cũng khen: đang xây nếp, chưa xây khách sạn 5 sao.",
        expectation:
          "Con sẽ hỏi “gấp làm gì tối lại ngủ?” — câu trả lời hay nhất: “Đó là chiến thắng đầu tiên trong ngày của con.” Thắng việc nhỏ đầu ngày kéo theo cả ngày.",
      },
      {
        title: "Tuần 3 — Buổi sáng của con",
        tasks: [
          { title: "🌅 Tự hoàn thành buổi sáng (dậy + chăn + vệ sinh) không cần nhắc", category: "discipline", exp: 20, points: 20, energy: 15, verifyType: "trust" },
        ],
        parentTip:
          "Dán checklist 3 việc sau cửa phòng, con tự tick trong đầu — bố mẹ rút hẳn khỏi vai trò đồng hồ báo thức. Buổi sáng yên tĩnh đầu tiên sẽ đến trong tuần này, hãy tận hưởng nó.",
        expectation:
          "Sáng thứ 2 luôn khó nhất — sau cuối tuần nếp bị lỏng. Đừng nản vào đúng sáng thứ 2 rồi kết luận “lộ trình hỏng”.",
      },
    ],
  },

  // ============================== 10–12 TUỔI ==============================
  {
    id: "homework_1012",
    icon: "✍️",
    title: "Tự giác làm bài về nhà",
    ageBand: "10-12",
    weeks: 3,
    goal: "Bài về nhà xong trước giờ chơi — không cằn nhằn, không phải ngồi canh.",
    identity: "Việc hôm nay không để ngày mai! ✍️",
    stages: [
      {
        title: "Tuần 1 — Giờ học cố định",
        tasks: [
          { title: "✍️ Ngồi vào bàn học đúng giờ đã hẹn (25 phút)", category: "intellect", exp: 20, points: 20, energy: 15, verifyType: "focus", durationMin: 25 },
        ],
        parentTip:
          "Cùng con CHỌN khung giờ học — giờ mình chọn thì mình giữ. Bàn học sạch, điện thoại để phòng khác. Công thức 25 phút tập trung + 5 phút nghỉ (Pomodoro) vừa sức tuổi này.",
        expectation:
          "Tuần này chỉ chấm “ngồi vào bàn đúng giờ”, chưa chấm “xong hết bài”. Nếp trước, lượng sau — đảo ngược thứ tự là lý do đa số cuộc chiến bài tập thất bại.",
      },
      {
        title: "Tuần 2 — Xong việc chính",
        tasks: [
          { title: "✍️ Hoàn thành bài tập trước giờ chơi tối", category: "intellect", exp: 25, points: 25, energy: 18, verifyType: "focus", durationMin: 30 },
        ],
        parentTip:
          "Mở đầu bằng câu hỏi kế hoạch: “Hôm nay có mấy bài? Con định làm bài nào trước?” — giúp con tự lên kế hoạch thay vì bị kiểm soát. Xong trước giờ chơi = giờ chơi trọn vẹn không ai cằn nhằn.",
        expectation:
          "Con sẽ có hôm khai “hôm nay không có bài”. Kiểm chứng nhẹ nhàng qua nhóm phụ huynh MỘT lần rồi quay lại tin con — nghi ngờ thường trực phá nếp nhanh hơn một lần nói dối.",
      },
      {
        title: "Tuần 3 — Tự quản deadline",
        tasks: [
          { title: "✍️ Tự hoàn thành bài + tự kiểm tra lại trước khi cất", category: "intellect", exp: 25, points: 25, energy: 18, verifyType: "trust" },
        ],
        parentTip:
          "Chuyển vai từ giám sát viên sang hậu cần: “Có gì cần bố mẹ giúp không?” — rồi để con tự chạy. Tự kiểm tra lại bài là kỹ năng ăn điểm lớn nhất mà ít ai dạy.",
        expectation:
          "Điểm số chưa chắc tăng ngay trong 3 tuần. Thứ tăng trước là số buổi tối cả nhà không cãi nhau về bài vở — và đó chính là nền móng của điểm số.",
      },
    ],
  },
  {
    id: "chores_1012",
    icon: "🍽️",
    title: "Việc nhà chính chủ",
    ageBand: "10-12",
    weeks: 3,
    goal: "Con có một việc nhà “chính chủ” mỗi ngày — làm không cần nhắc, cả nhà thấy rõ đóng góp.",
    identity: "Nhà mình có phần của tớ! 🏠",
    stages: [
      {
        title: "Tuần 1 — Nhận việc chính chủ",
        tasks: [
          { title: "🍽️ Làm việc nhà của mình (con tự chọn: rửa bát / quét nhà / phơi đồ...)", category: "help", exp: 20, points: 20, energy: 15, verifyType: "parent" },
        ],
        parentTip:
          "Cho con CHỌN việc — việc mình chọn khó bỏ hơn việc bị giao gấp nhiều lần. Làm mẫu một lần đúng chuẩn, rồi giao hẳn. Từ giờ đó là “việc của con”, không phải “giúp mẹ”.",
        expectation:
          "Chất lượng tuần đầu sẽ “tàm tạm”: bát còn vệt, nhà còn sót góc. Nghiệm thu bằng lời cảm ơn trước, góp ý đúng MỘT điểm sau — sửa từng thứ một.",
      },
      {
        title: "Tuần 2 — Đúng giờ, đúng chuẩn",
        tasks: [
          { title: "🍽️ Làm việc nhà của mình đúng giờ, đúng chuẩn đã thống nhất", category: "help", exp: 22, points: 22, energy: 16, verifyType: "trust" },
        ],
        parentTip:
          "Cùng con viết “chuẩn nghiệm thu” 3 gạch đầu dòng dán ở bếp (vd: bát sạch – úp đúng chỗ – bồn rửa khô). Khen con trước mặt ông bà, khách đến chơi — sự công nhận công khai là lương của việc nhà.",
        expectation:
          "Giữa tuần con sẽ thử làm qua loa xem có ai để ý không. Chỉ cần chỉ vào bảng chuẩn, không cần giảng — chuẩn đã thống nhất thì không phải tranh luận lại.",
      },
      {
        title: "Tuần 3 — Không cần ai nhắc",
        tasks: [
          { title: "🍽️ Tự làm việc nhà của mình không cần nhắc", category: "help", exp: 25, points: 25, energy: 18, verifyType: "trust" },
        ],
        parentTip:
          "Nếu con quên — đừng nhắc, để hệ quả tự nhiên lên tiếng (bát dồn đến sáng ai cũng thấy). Hệ quả tự nhiên mạnh hơn mười lần cằn nhằn và không tốn tình cảm của ai.",
        expectation:
          "Sẽ có hôm “con bận học thật”. Cho phép ĐỔI CA như người lớn (báo trước, làm bù) — nhưng không cho phép biến mất im lặng. Đó là trách nhiệm kiểu trưởng thành.",
      },
    ],
  },
  {
    id: "sleep_1012",
    icon: "😴",
    title: "Ngủ đúng giờ",
    ageBand: "10-12",
    weeks: 3,
    goal: "Đèn tắt đúng giờ, sáng dậy không “zombie” — cả nhà ngủ ngon hơn.",
    identity: "Ngủ sớm để mạnh hơn! 💪",
    stages: [
      {
        title: "Tuần 1 — Giờ G cố định",
        tasks: [
          { title: "😴 Lên giường đúng giờ đã hẹn", category: "discipline", exp: 20, points: 20, energy: 15, verifyType: "parent" },
        ],
        parentTip:
          "Cùng con tính ngược từ giờ dậy để CON tự chốt giờ ngủ — con tự chọn thì con tự giữ. Màn hình rời tay 30 phút trước giờ G, và luật này áp dụng cho CẢ BỐ MẸ trong phòng con — công bằng tạo hợp tác.",
        expectation:
          "3 hôm đầu con nằm mãi chưa ngủ được và thấy “phí thời gian”. Không sao — lên giường đúng giờ là mục tiêu, giấc ngủ sẽ tự đến khi nhịp sinh học quen dần.",
      },
      {
        title: "Tuần 2 — Nghi thức trước ngủ",
        tasks: [
          { title: "😴 Lên giường đúng giờ", category: "discipline", exp: 20, points: 20, energy: 15, verifyType: "trust" },
          { title: "🌙 Nghi thức trước ngủ: vệ sinh + soạn đồ mai + vài trang sách", category: "discipline", exp: 15, points: 15, energy: 10, verifyType: "trust" },
        ],
        parentTip:
          "Nghi thức 15 phút giống nhau mỗi tối là “thuốc ngủ tự nhiên” tốt nhất: cơ thể nhận tín hiệu và tự buồn ngủ. Soạn đồ mai từ tối cũng cứu luôn buổi sáng.",
        expectation:
          "Con sẽ mặc cả “5 phút nữa thôi” mỗi tối. Trả lời một lần duy nhất: “Hẹn giờ G rồi mà” — nhất quán vài hôm thì mặc cả tự biến mất.",
      },
      {
        title: "Tuần 3 — Chủ giấc ngủ",
        tasks: [
          { title: "😴 Tự lên giường đúng giờ không cần nhắc", category: "discipline", exp: 25, points: 25, energy: 18, verifyType: "trust" },
        ],
        parentTip:
          "Buông vai trò “đồng hồ của con”. Nếu con phá giờ, sáng hôm sau để con tự gánh cơn buồn ngủ — một buổi sáng vật vờ dạy nhanh hơn mười buổi thuyết trình về giấc ngủ.",
        expectation:
          "Cuối tuần con muốn thức khuya hơn? Thoả thuận hẳn một “giờ cuối tuần” riêng, rõ ràng — linh hoạt có kế hoạch bền hơn cấm cứng bị phá lén.",
      },
    ],
  },

  // ============================== 13–15 TUỔI ==============================
  {
    id: "money_1315",
    icon: "💰",
    title: "Quản lý tiền tiêu vặt",
    ageBand: "13-15",
    weeks: 3,
    goal: "Con tự quản ngân sách tuần — biết tiền đi đâu, biết để dành cho mục tiêu của mình.",
    identity: "Tiền của mình, mình làm chủ. 💼",
    stages: [
      {
        title: "Tuần 1 — Nhìn rõ dòng tiền",
        tasks: [
          { title: "💰 Ghi lại mọi khoản chi trong ngày (30 giây)", category: "discipline", exp: 20, points: 20, energy: 15, verifyType: "trust" },
        ],
        parentTip:
          "Phát tiền tuần cố định vào Chủ nhật như “lương”. Tuần này KHÔNG phán xét bất kỳ khoản chi nào — cần dữ liệu thật trước, bài học đến sau. Phán xét sớm = sổ chi ma.",
        expectation:
          "Con sẽ tiêu hết veo trong 2 ngày đầu — ĐỪNG cứu trợ giữa tuần. “Cháy túi ngày thứ 5” là bài học tài chính đầu đời rẻ nhất con từng được học.",
      },
      {
        title: "Tuần 2 — Chia 3 hũ",
        tasks: [
          { title: "💰 Chia tiền tuần: Tiêu – Để dành – Chia sẻ, và ghi chép chi", category: "discipline", exp: 22, points: 22, energy: 16, verifyType: "trust" },
        ],
        parentTip:
          "Gợi ý tỷ lệ (vd 60–30–10) nhưng để CON chốt con số cuối. Mở một “mục tiêu để dành” cho món đồ con đang thèm — mục tiêu nhìn thấy được là động cơ tiết kiệm mạnh nhất.",
        expectation:
          "Hũ “để dành” sẽ bị con dòm ngó ngay tuần này. Quy tắc: rút hũ để dành phải đợi 24 giờ suy nghĩ — kỹ thuật chống mua bốc đồng mà người lớn cũng nên dùng.",
      },
      {
        title: "Tuần 3 — CFO của chính mình",
        tasks: [
          { title: "💰 Chi theo kế hoạch + chốt sổ mỗi tối (1 phút)", category: "discipline", exp: 25, points: 25, energy: 18, verifyType: "trust" },
        ],
        parentTip:
          "Cuối tuần “họp tài chính” 5 phút: con báo cáo, bố mẹ chỉ đặt câu hỏi, không phán quyết. Nếu con giữ được nếp, cân nhắc tăng “lương” kèm thêm trách nhiệm chi (tự trả tiền ăn vặt/đi lại).",
        expectation:
          "Con có thể tiêu vào thứ bố mẹ thấy “phí tiền”. Trong hạn mức thì đó là quyền của con — thứ ta đang dạy là ra quyết định, không phải vâng lời.",
      },
    ],
  },
  {
    id: "screen_1315",
    icon: "📱",
    title: "Tự quản giờ màn hình",
    ageBand: "13-15",
    weeks: 3,
    goal: "Từ “bị tịch thu điện thoại” sang “tự quản hạn mức” — bớt hẳn những trận cãi nhau vì màn hình.",
    identity: "Mình dùng máy, không để máy dùng mình. 📵",
    stages: [
      {
        title: "Tuần 1 — Nhìn rõ con số",
        tasks: [
          { title: "📱 Xem & ghi lại tổng giờ màn hình hôm nay", category: "discipline", exp: 20, points: 20, energy: 15, verifyType: "trust" },
        ],
        parentTip:
          "Tuần này KHÔNG phạt dựa trên con số — mục tiêu duy nhất là con tự nhìn thấy sự thật (Screen Time / Digital Wellbeing có sẵn trong máy). Bố mẹ công khai luôn con số của mình: công bằng mở cửa đối thoại.",
        expectation:
          "Con số tuần đầu thường khiến cả nhà giật mình. Bình tĩnh — nhìn thấy được chính là bước một của mọi thay đổi, chưa cần làm gì thêm.",
      },
      {
        title: "Tuần 2 — Hạn mức tự chọn",
        tasks: [
          { title: "📱 Giữ trong hạn mức tự đặt + không màn hình sau giờ ngủ", category: "discipline", exp: 22, points: 22, energy: 16, verifyType: "trust" },
        ],
        parentTip:
          "Để CON đề xuất hạn mức trước — các bạn tuổi này thường tự đặt khắt khe hơn bố mẹ tưởng, và hạn mức tự đặt thì tự giữ. Thống nhất vùng không-điện-thoại: bàn ăn và giường ngủ.",
        expectation:
          "Sẽ có hôm vỡ hạn mức vì “dở trận / dở tập phim”. Vỡ CÓ BÁO TRƯỚC và bù hôm sau là trưởng thành; vỡ im lặng mới là thứ cần ngồi nói chuyện.",
      },
      {
        title: "Tuần 3 — Chủ thiết bị",
        tasks: [
          { title: "📱 Giữ hạn mức + máy ra khỏi phòng trước giờ ngủ", category: "discipline", exp: 25, points: 25, energy: 18, verifyType: "trust" },
        ],
        parentTip:
          "Sắm trạm sạc chung ngoài phòng khách cho CẢ NHÀ — máy của bố mẹ cũng nằm đó. Đêm không màn hình cải thiện giấc ngủ tuổi teen rõ hơn bất kỳ lời khuyên nào.",
        expectation:
          "Tuần cuối là lúc con thương lượng lại hạn mức. Rất tốt — đàm phán dựa trên dữ liệu 3 tuần chính là kỹ năng tự quản ta muốn có. Hãy đàm phán như với người lớn.",
      },
    ],
  },
  {
    id: "fitness_1315",
    icon: "💪",
    title: "Rèn sức bền 3 tuần",
    ageBand: "13-15",
    weeks: 3,
    goal: "20 phút vận động thành nếp mỗi ngày — khoẻ hơn, ngủ ngon hơn, bớt dính màn hình.",
    identity: "Mỗi ngày mạnh hơn hôm qua 1%. 🏋️",
    stages: [
      {
        title: "Tuần 1 — 10 phút khởi động",
        tasks: [
          { title: "💪 Vận động 10 phút (môn tự chọn)", category: "strength", exp: 20, points: 20, energy: 15, verifyType: "focus", durationMin: 10 },
        ],
        parentTip:
          "Con chọn môn — nhảy dây, bóng rổ, tập theo video, đi bộ nhanh đều tính. Cùng một khung giờ mỗi ngày; rủ được bạn hoặc anh chị em thì độ bền tăng gấp đôi. Bố mẹ tập cùng là vàng.",
        expectation:
          "Ngày 4–6 là lúc cơ thể mỏi và lười nhất. Hôm đó “bản nhỏ 5 phút” vẫn tính là thắng — giữ chuỗi quan trọng hơn giữ cường độ.",
      },
      {
        title: "Tuần 2 — 20 phút thật",
        tasks: [
          { title: "💪 Vận động 20 phút", category: "strength", exp: 25, points: 25, energy: 18, verifyType: "focus", durationMin: 20 },
        ],
        parentTip:
          "Tăng thời lượng, giữ nguyên khung giờ — chỉ đổi một biến số mỗi lần. Ghi nhận thành tích nhỏ (“hôm nay chạy được xa hơn hôm qua”) thay vì so với chuẩn nào đó trên mạng.",
        expectation:
          "Tuần này dễ xuất hiện đau cơ nhẹ — bình thường và sẽ hết. Đau khớp/đau nhói thì nghỉ và điều chỉnh, đừng cố “lì đòn”.",
      },
      {
        title: "Tuần 3 — Nếp của mình",
        tasks: [
          { title: "💪 Vận động 20 phút theo lịch tự xếp", category: "strength", exp: 25, points: 25, energy: 18, verifyType: "focus", durationMin: 20 },
        ],
        parentTip:
          "Để con tự xếp lịch tuần (môn nào ngày nào) — sở hữu lịch là sở hữu thói quen. Cuối lộ trình, hỏi con muốn nâng cấp gì tiếp: giải chạy? lớp võ? — mở đường dài hơi.",
        expectation:
          "Thành quả nhìn thấy được (dáng, sức, tâm trạng) đến sau 4–6 tuần — tuần 3 mới là giữa đường. Chuỗi ngày đều đặn chính là thành tích thật, cơ bắp chỉ là phần thưởng đến sau.",
      },
    ],
  },
];

const STAT_KEY_MAP = { strength: "strength", intellect: "intellect", creative: "creative", help: "help", connection: "help" };

/** @param {string} ageBand */
export function getJourneysForAge(ageBand) {
  return JOURNEY_CATALOG.filter((j) => j.ageBand === ageBand);
}

/** @param {string} journeyId */
export function getJourneyById(journeyId) {
  return JOURNEY_CATALOG.find((j) => j.id === journeyId) || null;
}

/** Build the concrete task objects for one stage (deterministic ids per start). */
function buildStageTasks(journey, stageIndex, seed) {
  return journey.stages[stageIndex].tasks.map((spec, i) => ({
    id: `j_${journey.id}_s${stageIndex}_${i}_${seed}`,
    title: spec.title,
    exp: spec.exp,
    points: spec.points,
    energy: spec.energy,
    category: spec.category,
    completed: false,
    statKey: STAT_KEY_MAP[spec.category] || "discipline",
    statVal: 2,
    custom: true,
    isMandatory: false,
    verifyType: spec.verifyType,
    durationMin: spec.verifyType === "focus" ? spec.durationMin : undefined,
    journeyId: journey.id,
    journeyStage: stageIndex,
    // resetDailyTasks bumps missStreak for uncompleted tasks tonight;
    // -1 keeps a task added today at 0 after its first reset (no false at-risk)
    missStreak: -1,
  }));
}

/**
 * Start a journey: one at a time, inserts week-1 tasks.
 * @param {object} state full game state
 * @param {string} journeyId
 * @param {number} [now] injected for deterministic tests
 * @returns {{ state: object, result: { success: boolean, error?: string, journey?: object } }}
 */
export function startJourney(state, journeyId, now = Date.now()) {
  if (state.journey) return { state, result: { success: false, error: JOURNEY_ERRORS.ACTIVE } };
  const journey = getJourneyById(journeyId);
  if (!journey) return { state, result: { success: false, error: JOURNEY_ERRORS.NOT_FOUND } };

  const seed = now.toString(36);
  return {
    state: {
      ...state,
      journey: {
        id: journey.id,
        // denormalized for reports (weekly email) that can't reach the catalog
        title: journey.title,
        icon: journey.icon,
        startedAt: now,
        seed,
        stage: 0,
        dayInStage: 0,
        successDays: 0,
        totalDays: 0,
        stageSuccessDays: 0,
      },
      tasks: [...state.tasks, ...buildStageTasks(journey, 0, seed)],
    },
    result: { success: true, journey },
  };
}

/** Stop the active journey and remove its remaining tasks. */
export function cancelJourney(state) {
  if (!state.journey) return { state, result: { success: false, error: JOURNEY_ERRORS.NONE } };
  return {
    state: {
      ...state,
      journey: null,
      tasks: state.tasks.filter((t) => t.journeyId !== state.journey.id),
    },
    result: { success: true },
  };
}

/**
 * Close one journey day. Called from resetDailyTasks AFTER escrow settle,
 * while today's `completed` flags are still on the tasks.
 * A day counts as a success when every journey task of the current stage
 * was completed. After JOURNEY_STAGE_DAYS days the journey advances a stage;
 * after the last stage it completes: final-stage tasks stay on the board as
 * regular tasks (→ they can later graduate 🎓), and a celebration is queued.
 * @param {object} state settled game state (pre task-reset)
 * @returns {object} next state
 */
export function advanceJourneyDaily(state) {
  const j = state.journey;
  if (!j) return state;

  const journey = getJourneyById(j.id);
  if (!journey) {
    // Catalog drift (old save, removed pack): clean up instead of crashing
    return { ...state, journey: null, tasks: state.tasks.filter((t) => t.journeyId !== j.id) };
  }

  const stageTasks = state.tasks.filter((t) => t.journeyId === j.id && t.journeyStage === j.stage);
  const success = stageTasks.length > 0 && stageTasks.every((t) => t.completed);

  const progressed = {
    ...j,
    dayInStage: j.dayInStage + 1,
    totalDays: j.totalDays + 1,
    successDays: j.successDays + (success ? 1 : 0),
    stageSuccessDays: j.stageSuccessDays + (success ? 1 : 0),
  };

  if (progressed.dayInStage < JOURNEY_STAGE_DAYS) {
    return { ...state, journey: progressed };
  }

  const isLastStage = j.stage >= journey.stages.length - 1;
  if (!isLastStage) {
    // Week is over → swap current stage tasks for next stage's
    const nextStage = j.stage + 1;
    return {
      ...state,
      journey: { ...progressed, stage: nextStage, dayInStage: 0, stageSuccessDays: 0 },
      tasks: [
        ...state.tasks.filter((t) => t.journeyId !== j.id),
        ...buildStageTasks(journey, nextStage, j.seed),
      ],
    };
  }

  // Journey complete 🎉 — final-stage tasks live on as regular daily tasks
  const record = {
    id: journey.id,
    title: journey.title,
    icon: journey.icon,
    completedAt: Date.now(),
    successDays: progressed.successDays,
    totalDays: progressed.totalDays,
    weeks: journey.weeks,
  };
  return {
    ...state,
    journey: null,
    journeysCompleted: [...(state.journeysCompleted || []), record],
    lastJourneyCompleted: record,
    tasks: state.tasks.map((t) =>
      t.journeyId === j.id ? { ...t, journeyId: undefined, journeyStage: undefined } : t
    ),
  };
}

/**
 * Everything the UI needs about the active journey (null when none).
 * @param {object} state
 */
export function getJourneyStatus(state) {
  const j = state?.journey;
  if (!j) return null;
  const journey = getJourneyById(j.id);
  if (!journey) return null;

  const stage = journey.stages[j.stage];
  const stageTasks = (state.tasks || []).filter((t) => t.journeyId === j.id && t.journeyStage === j.stage);
  return {
    def: journey,
    week: j.stage + 1,
    weeks: journey.stages.length,
    dayInStage: j.dayInStage, // closed days this week (0..6)
    stageSuccessDays: j.stageSuccessDays,
    successDays: j.successDays,
    totalDays: j.totalDays,
    stageTitle: stage.title,
    parentTip: stage.parentTip,
    expectation: stage.expectation,
    stageTasks,
    todayAllDone: stageTasks.length > 0 && stageTasks.every((t) => t.completed),
  };
}
