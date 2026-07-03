/**
 * Thẻ "Khoảnh khắc" — tri thức nuôi dạy đóng gói dùng-ngay cho bố mẹ
 * (docs/KHOANH_KHAC_7_11.md, giọng ẩn khoa học đã duyệt trong SPEC_APP_LA_CHUYEN_GIA.md).
 * Mỗi thẻ 4 mảnh: tình huống + NÊN nói + TRÁNH nói + vì sao.
 *
 * PURE functions (no React), cùng contract với journeys.js.
 * QUÂN LUẬT (DEEP_03): chỉ mô tả + lăng kính rộng lượng; KHÔNG chẩn đoán tâm lý,
 * KHÔNG quy kết "thao túng/chọc tức" — loại quy kết độc hại nhất.
 */

import { getJourneyById } from "./journeys";

export const MOMENT_CATALOG = [
  {
    id: "nan_bai_kho",
    painpoint: "nan_bai",
    situation: "Con làm được vài phút thì bỏ, kêu “khó quá, con không làm được đâu.”",
    nen: [
      "“Câu này khó thật. Con thử làm phần dễ nhất trước, mẹ ngồi cạnh.”",
      "Chỉ vào phần con ĐÃ làm được: “Đoạn này con tự nghĩ ra đấy.”",
    ],
    tranh: ["“Có thế mà cũng không làm được à.”", "Sốt ruột làm hộ cho xong."],
    visao:
      "Ở tuổi này, mỗi lần con tự vượt được một việc khó là một viên gạch xây lòng tin “mình làm được”. Chê làm con thấy mình kém; làm hộ thì con mất luôn cơ hội thấy mình giỏi. Khen sự cố gắng và chia nhỏ để con tự về đích — con sẽ dám thử việc khó hơn.",
  },
  {
    id: "nhac_mai_moi_hoc",
    painpoint: "luoi_hoc",
    situation: "Tối nào cũng phải nhắc 5–7 lần con mới ngồi vào bàn, cả nhà mệt mỏi.",
    nen: [
      "Thỏa thuận TRƯỚC, một lần: “Con muốn học lúc 7h hay 7h30? Con chọn, rồi mình theo giờ đó.”",
      "Đến giờ, nhắc gọn 1 câu: “7h rồi nhé.”",
    ],
    tranh: ["Nhắc đi nhắc lại kèm cằn nhằn: “Học đi! Nói bao nhiêu lần rồi!”", "Đe dọa chung chung: “Không học là biết tay.”"],
    visao:
      "Khi con được tự chọn giờ, việc học thành việc của con chứ không phải lệnh của bố mẹ — con giữ lời hơn hẳn. Nhắc nhiều lần vô tình dạy con “chưa cần làm ngay, mẹ sẽ nhắc tiếp.” Ít lời, đúng thỏa thuận, con tự giác dần.",
  },
  {
    id: "me_nheo_doi_mua",
    painpoint: "me_nheo",
    situation: "Ra siêu thị con đòi mua đồ chơi, không được là nằm ăn vạ, khóc to.",
    nen: [
      "Gọi tên cảm xúc + giữ ranh giới: “Con rất thích cái này, mẹ biết. Hôm nay mình không mua. Con buồn cứ buồn, mẹ đợi.”",
      "Bình tĩnh, không xuống nước giữa lúc con gào.",
    ],
    tranh: ["Mua cho xong để đỡ xấu hổ.", "Quát “nín ngay!” hoặc dọa bỏ con lại."],
    visao:
      "Con cần thấy cảm xúc thì được phép, nhưng đòi hỏi không tự động thành hiện thực. Nếu ăn vạ mà được mua, con học rằng gào to là có đồ, lần sau to hơn. Công nhận cảm xúc mà vẫn giữ ranh giới giúp con dần biết chịu đựng khi bị từ chối.",
  },
  {
    id: "giau_diem_kem",
    painpoint: "noi_doi",
    situation: "Con giấu bài kiểm tra điểm thấp, bị phát hiện mới nhận.",
    nen: [
      "Khen sự thành thật trước: “Cảm ơn con đã nói thật. Nói ra khó đấy.”",
      "Rồi mới bàn bài: “Giờ mình xem chỗ nào con chưa hiểu nhé.”",
    ],
    tranh: ["Nổi giận ngay khi con vừa thú nhận.", "“Sao ngu thế / dốt thế?”"],
    visao:
      "Nếu nói thật mà bị phạt nặng, con học được bài học sai: lần sau giấu kỹ hơn. Muốn con không nói dối, phải làm cho nói thật an toàn hơn giấu. Tách “thành thật” (khen) khỏi “điểm kém” (cùng sửa) — con sẽ dám kể cho bố mẹ nghe cả những chuyện khó.",
  },
  {
    id: "bua_bon_khong_don",
    painpoint: "bua_bon",
    situation: "Phòng con như bãi chiến trường, nhắc dọn thì con ì ra hoặc dọn qua loa.",
    nen: [
      "Chia nhỏ, cụ thể: “Con cất hết sách lên giá trước đã. Xong mình làm tiếp.”",
      "Lần đầu làm CÙNG con vài phút để con biết bắt đầu từ đâu.",
    ],
    tranh: ["Lệnh chung chung: “Dọn phòng đi!” — con không biết bắt đầu từ đâu.", "Bực mình dọn hộ hết."],
    visao:
      "Với con, “dọn phòng” là một việc quá to và mơ hồ nên con né. Chia thành từng bước nhỏ, rõ ràng thì con làm được. Làm hộ thì nhanh thật, nhưng con không bao giờ học được cách tự tổ chức. Việc nhỏ, làm cùng vài lần rồi buông dần.",
  },
  {
    id: "ganh_ti_voi_em",
    painpoint: "ganh_em",
    situation: "Con so bì “bố mẹ thương em hơn con”, hay cấu véo, tranh giành với em.",
    nen: [
      "Công nhận cảm xúc, không cãi lý: “Con thấy hình như em được nhiều hơn. Kể mẹ nghe.”",
      "Cho con một điều riêng chỉ của con: “Tối nay 15 phút đọc sách, chỉ mẹ với con thôi.”",
    ],
    tranh: ["“Con là anh/chị phải nhường chứ!”", "So sánh: “Sao không ngoan như em?”"],
    visao:
      "Trẻ ganh tị không phải vì hư, mà vì sợ bị yêu ít đi. Bắt nhường hay so sánh làm nỗi sợ đó nặng thêm và con ghét em hơn. Cho con chút thời gian riêng để con thấy “chỗ của mình vẫn còn” — ganh tị tự dịu.",
  },
  {
    id: "khoc_khi_thua",
    painpoint: "thua_cuoc",
    situation: "Chơi cờ, đá bóng, game… hễ thua là con khóc, giận, đòi chơi lại hoặc bỏ cuộc.",
    nen: [
      "Bình thường hóa: “Thua thì tức thật. Ai cũng vậy.”",
      "Khen cách chơi, không khen kết quả: “Ván này con nghĩ nước đi hay đấy.”",
    ],
    tranh: ["Cố tình thua cho con vui mãi.", "“Có mỗi ván game mà cũng khóc.”"],
    visao:
      "Con cần học rằng thua không phải là mình kém, mà là chuyện bình thường ai cũng gặp. Nếu lúc nào cũng cho con thắng, con không bao giờ tập được cách đứng dậy sau thất bại. Khen cách con chơi thay vì thắng thua giúp con bớt sợ thua và dám thử tiếp.",
  },
  {
    id: "dan_mat_dien_thoai",
    painpoint: "dien_thoai",
    situation: "Con xem điện thoại/máy tính bảng, gọi mãi không dậy, giật máy thì con gào.",
    nen: [
      "Chốt luật TRƯỚC khi đưa máy: “Xem 30 phút, hết giờ tự tắt. Con hẹn giờ nhé.”",
      "Báo trước 5 phút: “Còn 5 phút nữa nhé.”",
    ],
    tranh: ["Giật máy đột ngột giữa lúc con đang xem.", "Đưa máy không giới hạn rồi cáu khi con không chịu tắt."],
    visao:
      "Bị cắt đột ngột giữa lúc đang cuốn thì ai cũng phản kháng, huống chi trẻ con. Có luật rõ từ đầu và báo trước để con chuẩn bị dừng, con hợp tác hơn nhiều. Để con tự hẹn giờ, việc tắt máy thành con giữ lời chứ không phải bị tịch thu.",
  },
  {
    id: "ngang_khong_muon",
    painpoint: "ngang_buong",
    situation: "Bảo gì con cũng chống đối “con không muốn / con không làm”, dù việc nhỏ.",
    nen: [
      "Cho lựa chọn trong ranh giới: “Con đánh răng trước hay thay đồ ngủ trước?” — cả hai đều phải làm.",
      "Giữ giọng bình tĩnh, không biến thành cuộc thi ai thắng.",
    ],
    tranh: ["Ra lệnh đối đầu: “Mẹ bảo làm là phải làm!”", "Mặc cả xuống nước liên tục."],
    visao:
      "Tuổi này con bắt đầu muốn tự quyết, nên “ra lệnh” dễ bị chống lại chỉ để giành phần thắng. Cho con chọn giữa 2 phương án mình đã ưng — con thấy mình có tiếng nói, mà việc cần làm vẫn xong. Không có kẻ thắng người thua, cả hai đỡ mệt.",
  },
  {
    id: "lam_gi_cung_doi_thuong",
    painpoint: "doi_thuong",
    situation: "Con chỉ chịu làm khi có thưởng, hết thưởng là không đụng tay; vừa làm xong đã hỏi “được gì?”",
    nen: [
      "Chỉ ra ích lợi thật với chính con: “Con tự soạn cặp nên sáng nay không quên vở, khỏe ghê.”",
      "Khen cảm giác tự làm được: “Con tự làm hết đấy à? Oách thật.”",
    ],
    tranh: ["Treo thưởng cho mọi việc, kể cả việc bình thường.", "“Làm đi rồi cho tiền” với việc lẽ ra là bổn phận."],
    visao:
      "Nếu việc gì cũng gắn phần thưởng, con dần chỉ làm vì phần thưởng, hết thưởng là hết làm. Thỉnh thoảng thưởng thì tốt, nhưng điều giữ con lâu dài là cảm giác “tự làm được, thấy mình ngon”. Chỉ cho con thấy việc đó có ích cho chính con — động lực bền hơn tiền thưởng.",
  },
];

/** @param {string} momentId */
export function getMomentById(momentId) {
  return MOMENT_CATALOG.find((m) => m.id === momentId) || null;
}

// Việc con bỏ nhiều đêm thuộc nhóm nào → gợi thẻ painpoint nào (chỉ map chỗ khớp thật)
const CATEGORY_PAINPOINTS = {
  intellect: ["nan_bai", "luoi_hoc"],
  discipline: ["luoi_hoc", "ngang_buong"],
  help: ["bua_bon"],
};

/** Việc bị bỏ từng này đêm liên tiếp thì coi là tín hiệu "con đang né". */
const MISS_STREAK_SIGNAL = 3;

// Trọng số tín hiệu: hành vi thật (bỏ việc) > lời khai intake ≈ lộ trình đang chạy
const WEIGHT_MISS = 3;
const WEIGHT_INTAKE = 2;
const WEIGHT_JOURNEY = 2;

/**
 * Xếp thẻ theo tín hiệu thật trong state (thuần, không mutate):
 * việc bị bỏ ≥3 đêm (theo nhóm việc) > painpoint bố mẹ khai ở intake ≈ tag lộ trình đang chạy.
 * Không tín hiệu → giữ thứ tự catalog, điểm 0.
 * Lưu ý DEEP_03: điểm chỉ để CHỌN thẻ liên quan — không phải chẩn đoán về đứa trẻ.
 * @param {object} state
 * @returns {Array<{moment: object, score: number}>}
 */
export function rankMoments(state) {
  const s = state || {};
  const scores = {};
  const add = (pid, w) => {
    scores[pid] = (scores[pid] || 0) + w;
  };

  for (const t of s.tasks || []) {
    if ((t.missStreak || 0) >= MISS_STREAK_SIGNAL && !t.completed) {
      for (const pid of CATEGORY_PAINPOINTS[t.category] || []) add(pid, WEIGHT_MISS);
    }
  }
  for (const pid of s.parentConfig?.intake?.painpoints || []) add(pid, WEIGHT_INTAKE);
  if (s.journey?.id) {
    for (const pid of getJourneyById(s.journey.id)?.painpoints || []) add(pid, WEIGHT_JOURNEY);
  }

  return MOMENT_CATALOG.map((moment) => ({ moment, score: scores[moment.painpoint] || 0 })).sort(
    (a, b) => b.score - a.score
  );
}

/**
 * Chọn 1 thẻ cho hôm nay. Neo theo ngày xoay trong NHÓM thẻ liên quan (score > 0),
 * nhưng `offset` ("Thẻ khác") đi hết nhóm rồi tràn sang các thẻ còn lại —
 * để bố mẹ không bao giờ bị kẹt xoay 1 chỗ khi nhóm liên quan nhỏ.
 * @param {object} state
 * @param {number} [offset]
 * @param {number} [now]
 * @returns {object|null} thẻ Khoảnh khắc
 */
export function pickMoment(state, offset = 0, now = Date.now()) {
  const ranked = rankMoments(state);
  if (ranked.length === 0) return null;
  const relevantCount = ranked.filter((r) => r.score > 0).length;
  const day = Math.floor(now / 86400000);
  const anchor = day % (relevantCount || ranked.length);
  const index = (((anchor + offset) % ranked.length) + ranked.length) % ranked.length;
  return ranked[index].moment;
}
