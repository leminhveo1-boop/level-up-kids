import { describe, test, expect, vi, afterEach } from "vitest";
import { parsePaymentCode, startActivationPoll } from "@/lib/payments";

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

describe("startActivationPoll — wait for the silent SePay webhook to flip premium", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("calls onCheck once per interval", () => {
    vi.useFakeTimers();
    const onCheck = vi.fn();
    startActivationPoll({ onCheck, intervalMs: 5000, maxMs: 60000 });
    expect(onCheck).not.toHaveBeenCalled(); // nothing before the first tick
    vi.advanceTimersByTime(15000);
    expect(onCheck).toHaveBeenCalledTimes(3);
  });

  test("stops itself after maxMs so it never polls forever", () => {
    vi.useFakeTimers();
    const onCheck = vi.fn();
    startActivationPoll({ onCheck, intervalMs: 5000, maxMs: 10000 });
    vi.advanceTimersByTime(60000); // long past maxMs
    expect(onCheck).toHaveBeenCalledTimes(2); // ticks at 5s and 10s, then cleared
  });

  test("stop() clears the timer (component unmount / activation)", () => {
    vi.useFakeTimers();
    const onCheck = vi.fn();
    const stop = startActivationPoll({ onCheck, intervalMs: 5000, maxMs: 60000 });
    vi.advanceTimersByTime(5000);
    expect(onCheck).toHaveBeenCalledTimes(1);
    stop();
    vi.advanceTimersByTime(30000);
    expect(onCheck).toHaveBeenCalledTimes(1); // no further ticks after stop
  });
});
