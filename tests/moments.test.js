import { describe, test, expect } from "vitest";
import { JOURNEY_PAINPOINTS } from "@/lib/game/journeys";
import { MOMENT_CATALOG, getMomentById, rankMoments, pickMoment } from "@/lib/game/moments";

const validPainpoints = new Set(JOURNEY_PAINPOINTS.map((p) => p.id));

const bareState = { tasks: [], journey: null, parentConfig: {} };
const stateWithIntake = (painpoints) => ({ ...bareState, parentConfig: { intake: { painpoints } } });

describe("MOMENT_CATALOG — bộ thẻ Khoảnh khắc 7–11", () => {
  test("đủ 10 thẻ phủ đủ 10 painpoint, id không trùng", () => {
    expect(MOMENT_CATALOG).toHaveLength(10);
    expect(new Set(MOMENT_CATALOG.map((m) => m.id)).size).toBe(10);
    const covered = new Set(MOMENT_CATALOG.map((m) => m.painpoint));
    expect(covered).toEqual(validPainpoints);
  });

  test("mỗi thẻ đủ 4 mảnh: tình huống + NÊN + TRÁNH + vì sao (giọng ẩn khoa học)", () => {
    for (const m of MOMENT_CATALOG) {
      expect(m.situation.length, m.id).toBeGreaterThan(20);
      expect(m.nen.length, m.id).toBeGreaterThanOrEqual(1);
      expect(m.tranh.length, m.id).toBeGreaterThanOrEqual(1);
      for (const line of [...m.nen, ...m.tranh]) expect(line.length).toBeGreaterThan(8);
      expect(m.visao.length, m.id).toBeGreaterThan(60);
      // Ẩn khoa học: không phô thuật ngữ trong phần hiện cho bố mẹ
      const shown = [m.situation, ...m.nen, ...m.tranh, m.visao].join(" ");
      for (const jargon of ["Erikson", "SDT", "Dweck", "authoritative", "intrinsic"]) {
        expect(shown.includes(jargon), `${m.id} lộ thuật ngữ: ${jargon}`).toBe(false);
      }
    }
  });

  test("QUÂN LUẬT an toàn: không thẻ nào quy kết kiểu 'thao túng/chọc tức' (loại độc hại nhất)", () => {
    for (const m of MOMENT_CATALOG) {
      const shown = [m.situation, ...m.nen, ...m.tranh, m.visao].join(" ").toLowerCase();
      for (const banned of ["thao túng", "chọc tức", "điều khiển bố mẹ", "cố tình hư"]) {
        expect(shown.includes(banned), `${m.id} chứa quy kết cấm: ${banned}`).toBe(false);
      }
    }
  });

  test("getMomentById trả đúng và null khi không có", () => {
    expect(getMomentById(MOMENT_CATALOG[0].id)).toEqual(MOMENT_CATALOG[0]);
    expect(getMomentById("khong_co")).toBeNull();
  });
});

describe("rankMoments — thẻ liên quan lên trước theo tín hiệu thật", () => {
  test("không tín hiệu → giữ nguyên thứ tự catalog, điểm 0", () => {
    const ranked = rankMoments(bareState);
    expect(ranked).toHaveLength(10);
    expect(ranked.every((r) => r.score === 0)).toBe(true);
    expect(ranked.map((r) => r.moment.id)).toEqual(MOMENT_CATALOG.map((m) => m.id));
  });

  test("painpoint trong intake được cộng điểm — kể cả loại chưa có lộ trình (nói dối/ganh em)", () => {
    const ranked = rankMoments(stateWithIntake(["noi_doi", "ganh_em"]));
    expect(ranked[0].moment.painpoint).toBe("noi_doi");
    expect(ranked[1].moment.painpoint).toBe("ganh_em");
    expect(ranked[0].score).toBeGreaterThan(0);
    expect(ranked[2].score).toBe(0);
  });

  test("việc bị bỏ nhiều đêm (missStreak ≥ 3) đẩy thẻ theo nhóm việc lên", () => {
    const state = {
      ...bareState,
      tasks: [{ id: "t1", category: "intellect", missStreak: 3, completed: false }],
    };
    const ranked = rankMoments(state);
    expect(["nan_bai", "luoi_hoc"]).toContain(ranked[0].moment.painpoint);
    expect(ranked[0].score).toBeGreaterThan(0);
  });

  test("lộ trình đang chạy cộng điểm theo tag lộ trình; missStreak nặng ký hơn intake", () => {
    const state = {
      tasks: [{ id: "t1", category: "help", missStreak: 4, completed: false }],
      journey: { id: "homework_1012" }, // tags: luoi_hoc, nan_bai
      parentConfig: { intake: { painpoints: ["thua_cuoc"] } },
    };
    const ranked = rankMoments(state);
    // bua_bon (missStreak, nặng nhất) phải đứng trên thua_cuoc (chỉ intake)
    const pos = (pid) => ranked.findIndex((r) => r.moment.painpoint === pid);
    expect(pos("bua_bon")).toBeLessThan(pos("thua_cuoc"));
    // tag lộ trình cũng có điểm
    expect(ranked.find((r) => r.moment.painpoint === "luoi_hoc").score).toBeGreaterThan(0);
  });

  test("thuần: không mutate state đầu vào", () => {
    const state = stateWithIntake(["noi_doi"]);
    const snapshot = JSON.parse(JSON.stringify(state));
    rankMoments(state);
    expect(state).toEqual(snapshot);
  });
});

describe("pickMoment — chọn 1 thẻ/ngày, xoay được", () => {
  const DAY = 86400000;

  test("có tín hiệu → thẻ liên quan ra trước, 'Thẻ khác' đi hết nhóm rồi mới tràn sang thẻ khác", () => {
    const state = stateWithIntake(["noi_doi", "ganh_em"]);
    const first2 = [pickMoment(state, 0, 10 * DAY).painpoint, pickMoment(state, 1, 10 * DAY).painpoint];
    expect(new Set(first2)).toEqual(new Set(["noi_doi", "ganh_em"]));
    // offset vượt nhóm liên quan → vẫn ra thẻ (không kẹt xoay 1 chỗ), và là thẻ ngoài nhóm
    const third = pickMoment(state, 2, 10 * DAY);
    expect(third).toBeTruthy();
    expect(["noi_doi", "ganh_em"]).not.toContain(third.painpoint);
    // đi đủ 10 offset phải gặp đủ 10 thẻ khác nhau
    const seen = new Set();
    for (let offset = 0; offset < 10; offset++) seen.add(pickMoment(state, offset, 10 * DAY).id);
    expect(seen.size).toBe(10);
  });

  test("không tín hiệu → xoay cả bộ theo ngày, deterministic", () => {
    const a = pickMoment(bareState, 0, 10 * DAY);
    const b = pickMoment(bareState, 0, 10 * DAY);
    const c = pickMoment(bareState, 0, 11 * DAY);
    expect(a.id).toBe(b.id);
    expect(c.id).not.toBe(a.id);
  });

  test("state rỗng/thiếu không nổ", () => {
    expect(pickMoment({}, 0, 0)).toBeTruthy();
    expect(pickMoment(undefined, 0, 0)).toBeTruthy();
  });
});
