import { describe, test, expect } from "vitest";
import {
  RESTITUTION_MAX_RATIO,
  maxRestitution,
  proposeRestitution,
  agreeRestitution,
  dismissRestitution,
  createPledge,
  resolvePledge,
} from "@/lib/game/consequences";
import { ageGroupFor } from "@/lib/game/age";

const NOW = new Date(2026, 6, 28);
const olderKid = ageGroupFor({ birthYear: 2017 }, NOW); // 9t → restitution bật
const youngKid = ageGroupFor({ birthYear: 2020 }, NOW); // 6t → restitution TẮT
const teen = ageGroupFor({ birthYear: 2013 }, NOW); // 13t → cọc bật
const unknownKid = ageGroupFor({ uiMode: "kid" }, NOW); // known:false

const baseState = (over = {}) => ({
  heroCoins: 20,
  points: 100,
  repairFund: 0,
  familyFund: 0,
  restitutions: [],
  pledges: [],
  ...over,
});

const idFn = () => "fix_id";

describe("consequences §13 Mảnh B — Restitution (đền bù 2 bên)", () => {
  test("maxRestitution = floor(30% ví), không âm", () => {
    expect(RESTITUTION_MAX_RATIO).toBe(0.3);
    expect(maxRestitution(20)).toBe(6);
    expect(maxRestitution(3)).toBe(0);
    expect(maxRestitution(0)).toBe(0);
  });

  describe("proposeRestitution — CHỈ tạo pending, KHÔNG trừ xu", () => {
    test("tuổi ≥9 + số hợp lệ → thêm pending, ví nguyên vẹn", () => {
      const s = baseState();
      const { state, result } = proposeRestitution(s, { reason: "Vỡ cốc", amount: 5 }, olderKid, idFn);
      expect(result.success).toBe(true);
      expect(state.heroCoins).toBe(20); // KHÔNG trừ khi mới đề nghị
      expect(state.restitutions).toHaveLength(1);
      expect(state.restitutions[0]).toMatchObject({ reason: "Vỡ cốc", amount: 5, status: "pending" });
      expect(s.restitutions).toHaveLength(0); // immutability
    });

    test("young_kid (≤8) → chặn (KHÔNG bật Restitution ở tuổi này)", () => {
      const { state, result } = proposeRestitution(baseState(), { reason: "x", amount: 3 }, youngKid, idFn);
      expect(result.success).toBe(false);
      expect(result.error).toBe("AGE_NOT_ELIGIBLE");
      expect(state.restitutions).toHaveLength(0);
    });

    test("thiếu tuổi (known:false) → chặn", () => {
      expect(proposeRestitution(baseState(), { reason: "x", amount: 3 }, unknownKid, idFn).result.error).toBe("AGE_NOT_ELIGIBLE");
    });

    test("vượt trần 30% ví → chặn", () => {
      const { result } = proposeRestitution(baseState({ heroCoins: 20 }), { reason: "x", amount: 7 }, olderKid, idFn);
      expect(result.success).toBe(false);
      expect(result.error).toBe("AMOUNT_TOO_HIGH");
    });

    test("số ≤0 hoặc không nguyên → chặn", () => {
      expect(proposeRestitution(baseState(), { reason: "x", amount: 0 }, olderKid, idFn).result.error).toBe("INVALID_AMOUNT");
      expect(proposeRestitution(baseState(), { reason: "x", amount: 2.5 }, olderKid, idFn).result.error).toBe("INVALID_AMOUNT");
    });

    test("thiếu lý do → chặn (đền bù phải gắn thiệt hại cụ thể)", () => {
      expect(proposeRestitution(baseState(), { reason: "  ", amount: 3 }, olderKid, idFn).result.error).toBe("REASON_REQUIRED");
    });
  });

  describe("agreeRestitution — con đồng ý → chuyển xu sang repairFund", () => {
    test("chuyển đúng số, đánh dấu agreed", () => {
      let s = baseState();
      s = proposeRestitution(s, { reason: "Vỡ cốc", amount: 5 }, olderKid, idFn).state;
      const { state, result } = agreeRestitution(s, "fix_id");
      expect(result.success).toBe(true);
      expect(state.heroCoins).toBe(15); // 20 - 5
      expect(state.repairFund).toBe(5);
      expect(state.restitutions[0].status).toBe("agreed");
      expect(state.restitutions[0].movedAmount).toBe(5);
    });

    test("ví tụt dưới mức đề nghị lúc đồng ý → chỉ chuyển phần còn (không âm ví)", () => {
      let s = baseState({ heroCoins: 20 });
      s = proposeRestitution(s, { reason: "x", amount: 6 }, olderKid, idFn).state;
      s = { ...s, heroCoins: 4 }; // ví tụt sau đề nghị
      const { state } = agreeRestitution(s, "fix_id");
      expect(state.heroCoins).toBe(0);
      expect(state.repairFund).toBe(4);
      expect(state.restitutions[0].movedAmount).toBe(4);
    });

    test("id không tồn tại → lỗi", () => {
      expect(agreeRestitution(baseState(), "nope").result.error).toBe("NOT_FOUND");
    });

    test("đã agreed rồi → không chuyển lần nữa (idempotent an toàn)", () => {
      let s = baseState();
      s = proposeRestitution(s, { reason: "x", amount: 5 }, olderKid, idFn).state;
      s = agreeRestitution(s, "fix_id").state;
      const { state, result } = agreeRestitution(s, "fix_id");
      expect(result.success).toBe(false);
      expect(state.heroCoins).toBe(15); // không trừ tiếp
    });
  });

  describe("dismissRestitution — 'nói chuyện đã' → bỏ pending, KHÔNG trừ", () => {
    test("xoá pending, ví nguyên", () => {
      let s = baseState();
      s = proposeRestitution(s, { reason: "x", amount: 5 }, olderKid, idFn).state;
      const { state, result } = dismissRestitution(s, "fix_id");
      expect(result.success).toBe(true);
      expect(state.restitutions).toHaveLength(0);
      expect(state.heroCoins).toBe(20);
    });

    test("không xoá được item đã agreed (đã chuyển xu, không hoàn tác một phía)", () => {
      let s = baseState();
      s = proposeRestitution(s, { reason: "x", amount: 5 }, olderKid, idFn).state;
      s = agreeRestitution(s, "fix_id").state;
      const { result } = dismissRestitution(s, "fix_id");
      expect(result.success).toBe(false);
    });
  });
});

describe("consequences §13 Mảnh B — Cọc cam kết (12t+/teen)", () => {
  describe("createPledge — giữ cọc (escrow) ngay khi đặt", () => {
    test("teen + cọc Điểm → trừ points, thêm pledge open", () => {
      const { state, result } = createPledge(baseState(), { goal: "Dậy đúng giờ", stake: 20, currency: "points" }, teen, "teen", idFn);
      expect(result.success).toBe(true);
      expect(state.points).toBe(80); // 100 - 20
      expect(state.pledges[0]).toMatchObject({ goal: "Dậy đúng giờ", stake: 20, currency: "points", status: "open" });
    });

    test("teen + cọc xu thật → trừ heroCoins", () => {
      const { state } = createPledge(baseState(), { goal: "x", stake: 5, currency: "coins" }, teen, "teen", idFn);
      expect(state.heroCoins).toBe(15);
    });

    test("<12 có tuổi → chặn", () => {
      expect(createPledge(baseState(), { goal: "x", stake: 5, currency: "points" }, olderKid, "kid", idFn).result.error).toBe("AGE_NOT_ELIGIBLE");
    });

    test("không đủ số dư → chặn", () => {
      expect(createPledge(baseState({ points: 10 }), { goal: "x", stake: 20, currency: "points" }, teen, "teen", idFn).result.error).toBe("INSUFFICIENT");
    });

    test("stake ≤0 → chặn", () => {
      expect(createPledge(baseState(), { goal: "x", stake: 0, currency: "points" }, teen, "teen", idFn).result.error).toBe("INVALID_STAKE");
    });
  });

  describe("resolvePledge — giữ được nhận lại; lỡ → quỹ chung nhà", () => {
    test("giữ được (met) → hoàn cọc về đúng loại", () => {
      let s = createPledge(baseState(), { goal: "x", stake: 20, currency: "points" }, teen, "teen", idFn).state;
      const { state } = resolvePledge(s, "fix_id", true);
      expect(state.points).toBe(100); // 80 + 20 hoàn lại
      expect(state.pledges[0].status).toBe("kept");
    });

    test("lỡ (not met) cọc xu → vào familyFund, KHÔNG hoàn con", () => {
      let s = createPledge(baseState(), { goal: "x", stake: 5, currency: "coins" }, teen, "teen", idFn).state;
      const { state } = resolvePledge(s, "fix_id", false);
      expect(state.heroCoins).toBe(15); // vẫn trừ, không hoàn
      expect(state.familyFund).toBe(5); // vào quỹ chung nhà (không về bố mẹ)
      expect(state.pledges[0].status).toBe("lost");
    });

    test("lỡ cọc Điểm → mất Điểm, familyFund KHÔNG cộng (quỹ chung tính bằng xu)", () => {
      let s = createPledge(baseState(), { goal: "x", stake: 20, currency: "points" }, teen, "teen", idFn).state;
      const { state } = resolvePledge(s, "fix_id", false);
      expect(state.points).toBe(80); // không hoàn
      expect(state.familyFund).toBe(0);
      expect(state.pledges[0].status).toBe("lost");
    });

    test("pledge đã resolve → không xử lý lại", () => {
      let s = createPledge(baseState(), { goal: "x", stake: 20, currency: "points" }, teen, "teen", idFn).state;
      s = resolvePledge(s, "fix_id", true).state;
      const { result } = resolvePledge(s, "fix_id", false);
      expect(result.success).toBe(false);
    });
  });
});
