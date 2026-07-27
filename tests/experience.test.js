import { describe, expect, test } from "vitest";
import { getExperienceBrand } from "@/lib/experience";

describe("getExperienceBrand — tên sản phẩm theo tuổi", () => {
  test("6–11 dùng Level Up Kids", () => {
    expect(getExperienceBrand("kid")).toEqual({
      name: "Level Up Kids",
      ageLabel: "6–11 tuổi",
    });
  });

  test("12+ dùng Level Up Teens", () => {
    expect(getExperienceBrand("teen")).toEqual({
      name: "Level Up Teens",
      ageLabel: "12+ tuổi",
    });
  });

  test("mode lạ fallback về Kids để tương thích dữ liệu cũ", () => {
    expect(getExperienceBrand(undefined).name).toBe("Level Up Kids");
  });
});
