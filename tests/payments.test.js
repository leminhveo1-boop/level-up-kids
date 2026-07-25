import { describe, test, expect } from "vitest";
import { parsePaymentCode } from "@/lib/payments";

describe("parsePaymentCode — extract LUK payment code from a bank transfer memo", () => {
  test("finds the code in a noisy transfer content", () => {
    expect(parsePaymentCode("CHUYEN KHOAN LUK1A2B3C4D noi dung")).toBe("LUK1A2B3C4D");
  });
  test("is case-insensitive (banks often lowercase)", () => {
    expect(parsePaymentCode("thanh toan luk1a2b3c4d")).toBe("LUK1A2B3C4D");
  });
  test("returns null when no code is present (unmatched transfer)", () => {
    expect(parsePaymentCode("MB tra luong thang 7")).toBeNull();
  });
  test("null/undefined/empty → null", () => {
    expect(parsePaymentCode(null)).toBeNull();
    expect(parsePaymentCode(undefined)).toBeNull();
    expect(parsePaymentCode("")).toBeNull();
  });
  test("requires exactly 8 chars after LUK (rejects short prefixes)", () => {
    expect(parsePaymentCode("LUK123")).toBeNull();
  });
  test("matches the first code when several appear", () => {
    expect(parsePaymentCode("LUKAAAAAAAA then LUKBBBBBBBB")).toBe("LUKAAAAAAAA");
  });
});
