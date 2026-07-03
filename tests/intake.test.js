import { describe, test, expect } from "vitest";
import {
  JOURNEY_CATALOG,
  JOURNEY_PAINPOINTS,
  getPainpointById,
  recommendJourneys,
} from "@/lib/game/journeys";

const painpointIds = () => JOURNEY_PAINPOINTS.map((p) => p.id);

describe("JOURNEY_PAINPOINTS — danh mục painpoint cho màn chẩn đoán", () => {
  test("đủ 10 painpoint, id không trùng, có nhãn đời thường", () => {
    expect(JOURNEY_PAINPOINTS).toHaveLength(10);
    expect(new Set(painpointIds()).size).toBe(10);
    for (const p of JOURNEY_PAINPOINTS) {
      expect(p.id).toMatch(/^[a-z_]+$/);
      expect(p.label.length).toBeGreaterThan(3);
    }
  });

  test("getPainpointById trả đúng và null khi không có", () => {
    const first = JOURNEY_PAINPOINTS[0];
    expect(getPainpointById(first.id)).toEqual(first);
    expect(getPainpointById("khong_ton_tai")).toBeNull();
  });

  test("mọi tag painpoints trong catalog đều tham chiếu painpoint có thật", () => {
    const valid = new Set(painpointIds());
    for (const j of JOURNEY_CATALOG) {
      for (const pid of j.painpoints || []) {
        expect(valid.has(pid), `${j.id} có tag lạ: ${pid}`).toBe(true);
      }
    }
  });

  test("lứa trọng tâm 7–9 và 10–12: mỗi lộ trình có ít nhất 1 tag", () => {
    const focus = JOURNEY_CATALOG.filter((j) => j.ageBand === "7-9" || j.ageBand === "10-12");
    expect(focus.length).toBeGreaterThan(0);
    for (const j of focus) {
      expect((j.painpoints || []).length, `${j.id} chưa gắn painpoint`).toBeGreaterThan(0);
    }
  });
});

describe("recommendJourneys — kê lộ trình theo tuổi + painpoint", () => {
  test("kê đúng lộ trình có tag khớp, kèm danh sách matched", () => {
    const { recommendations } = recommendJourneys("10-12", ["luoi_hoc"]);
    expect(recommendations.length).toBeGreaterThan(0);
    for (const r of recommendations) {
      expect(r.journey.ageBand).toBe("10-12");
      expect(r.matched).toContain("luoi_hoc");
      expect(r.journey.painpoints).toContain("luoi_hoc");
    }
  });

  test("xếp lộ trình khớp NHIỀU painpoint lên trước", () => {
    // chọn 2 painpoint sao cho có journey khớp cả 2
    const double = JOURNEY_CATALOG.find((j) => j.ageBand === "10-12" && (j.painpoints || []).length >= 2);
    expect(double).toBeTruthy();
    const [p1, p2] = double.painpoints;
    const { recommendations } = recommendJourneys("10-12", [p1, p2]);
    expect(recommendations[0].journey.id).toBe(double.id);
    expect(recommendations[0].matched).toEqual(expect.arrayContaining([p1, p2]));
    // đơn điệu giảm theo số painpoint khớp
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].matched.length).toBeGreaterThanOrEqual(recommendations[i].matched.length);
    }
  });

  test("painpoint chưa có lộ trình (nói dối/ganh em/thua cuộc) rơi vào unmatched — vẫn ghi nhận, không mất", () => {
    const { recommendations, unmatched } = recommendJourneys("7-9", ["noi_doi", "ganh_em", "thua_cuoc"]);
    expect(recommendations).toHaveLength(0);
    expect(unmatched).toEqual(expect.arrayContaining(["noi_doi", "ganh_em", "thua_cuoc"]));
  });

  test("trộn painpoint khớp + lẻ: kê phần khớp, phần lẻ vào unmatched", () => {
    const { recommendations, unmatched } = recommendJourneys("10-12", ["luoi_hoc", "ganh_em"]);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(unmatched).toContain("ganh_em");
    expect(unmatched).not.toContain("luoi_hoc");
  });

  test("đầu vào rỗng / band lạ / painpoint lạ — không nổ, trả rỗng hợp lý", () => {
    expect(recommendJourneys("7-9", []).recommendations).toHaveLength(0);
    expect(recommendJourneys("99-100", ["luoi_hoc"]).recommendations).toHaveLength(0);
    const r = recommendJourneys("7-9", ["painpoint_la"]);
    expect(r.recommendations).toHaveLength(0);
    expect(r.unmatched).toContain("painpoint_la");
    expect(recommendJourneys(undefined, undefined).recommendations).toHaveLength(0);
  });

  test("thuần: không mutate mảng painpoint đầu vào", () => {
    const input = ["luoi_hoc", "nan_bai"];
    const snapshot = [...input];
    recommendJourneys("10-12", input);
    expect(input).toEqual(snapshot);
  });
});
