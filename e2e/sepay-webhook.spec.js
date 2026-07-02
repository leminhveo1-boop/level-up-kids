/**
 * E2E — SePay webhook money flow (the revenue artery).
 * Runs against a REAL Next.js server (playwright.config webServer) with
 * Supabase pointed at a local stub, so the full HTTP path is exercised:
 * auth (HMAC / legacy Apikey) → payload validation → LUK code extraction
 * → Supabase RPC `activate_from_payment` / `payments` upsert logging.
 */
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { createHmac } from "node:crypto";

const WEBHOOK = "/api/webhooks/sepay";
const API_KEY = "e2e-api-key"; // must match playwright.config webServer env
const HMAC_SECRET = "e2e-hmac-secret";
const STUB_PORT = 4545;

// ---- Local Supabase stub: records every request, returns canned answers ----
let stubServer;
let stubRequests = [];

test.beforeAll(async () => {
  stubServer = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      stubRequests = [...stubRequests, { method: req.method, url: req.url, body: body ? JSON.parse(body) : null }];
      res.setHeader("content-type", "application/json");
      if (req.url.startsWith("/rest/v1/rpc/activate_from_payment")) {
        res.writeHead(200);
        res.end(JSON.stringify({ status: "activated", premium_until: "2027-07-02" }));
        return;
      }
      // payments upsert (unmatched logging)
      res.writeHead(201);
      res.end("[]");
    });
  });
  await new Promise((resolve) => stubServer.listen(STUB_PORT, "127.0.0.1", resolve));
});

test.afterAll(async () => {
  await new Promise((resolve) => stubServer.close(resolve));
});

test.beforeEach(() => {
  stubRequests = [];
});

/** Valid SePay HMAC headers for a raw body (sha256=(HMAC(ts + "." + body))). */
const hmacHeaders = (rawBody, timestampSec = Math.floor(Date.now() / 1000)) => {
  const mac = createHmac("sha256", HMAC_SECRET).update(`${timestampSec}.${rawBody}`).digest("hex");
  return {
    "content-type": "application/json",
    "x-sepay-signature": `sha256=${mac}`,
    "x-sepay-timestamp": String(timestampSec),
  };
};

const apikeyHeaders = {
  "content-type": "application/json",
  authorization: `Apikey ${API_KEY}`,
};

const basePayload = {
  id: 987654,
  transferType: "in",
  transferAmount: 199000,
  content: "chuyen tien LUKAB12CD34 cam on",
};

test("từ chối 401 khi không có chữ ký lẫn Apikey", async ({ request }) => {
  const res = await request.post(WEBHOOK, { data: basePayload });
  expect(res.status()).toBe(401);
  expect(await res.json()).toMatchObject({ success: false, error: "UNAUTHORIZED" });
  expect(stubRequests).toHaveLength(0); // never touches Supabase
});

test("từ chối 401 khi chữ ký HMAC đúng nhưng timestamp quá hạn 5 phút (chống replay)", async ({ request }) => {
  const raw = JSON.stringify(basePayload);
  const staleTs = Math.floor(Date.now() / 1000) - 600; // 10 phút trước
  const res = await request.post(WEBHOOK, { headers: hmacHeaders(raw, staleTs), data: raw });
  expect(res.status()).toBe(401);
  expect(stubRequests).toHaveLength(0);
});

test("từ chối 401 khi chữ ký HMAC sai", async ({ request }) => {
  const raw = JSON.stringify(basePayload);
  const headers = { ...hmacHeaders(raw), "x-sepay-signature": "sha256=" + "0".repeat(64) };
  const res = await request.post(WEBHOOK, { headers, data: raw });
  expect(res.status()).toBe(401);
});

test("Apikey hợp lệ + JSON hỏng → 400 INVALID_JSON", async ({ request }) => {
  // Buffer → gửi raw đúng nghĩa (Playwright tự stringify string khi content-type json)
  const res = await request.post(WEBHOOK, { headers: apikeyHeaders, data: Buffer.from("{not-json") });
  expect(res.status()).toBe(400);
  expect(await res.json()).toMatchObject({ success: false, error: "INVALID_JSON" });
});

test("giao dịch chuyển ĐI bị bỏ qua (chỉ nhận tiền vào)", async ({ request }) => {
  const res = await request.post(WEBHOOK, {
    headers: apikeyHeaders,
    data: { ...basePayload, transferType: "out" },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ success: true, status: "ignored_outgoing" });
  expect(stubRequests).toHaveLength(0);
});

test("thiếu mã giao dịch → 400 MISSING_TX_ID", async ({ request }) => {
  const { id, ...noId } = basePayload;
  const res = await request.post(WEBHOOK, { headers: apikeyHeaders, data: noId });
  expect(res.status()).toBe(400);
  expect(await res.json()).toMatchObject({ success: false, error: "MISSING_TX_ID" });
});

test("LUỒNG VÀNG: HMAC hợp lệ + mã LUK → gọi RPC activate_from_payment đúng tham số", async ({ request }) => {
  const raw = JSON.stringify(basePayload);
  const res = await request.post(WEBHOOK, { headers: hmacHeaders(raw), data: raw });

  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ success: true, status: "activated", premium_until: "2027-07-02" });

  const rpc = stubRequests.find((r) => r.url.startsWith("/rest/v1/rpc/activate_from_payment"));
  expect(rpc).toBeTruthy();
  expect(rpc.body).toMatchObject({
    p_payment_code: "LUKAB12CD34",
    p_amount: 199000,
    p_tx_id: "987654",
    p_min_amount: 199000,
    p_days_per_period: 365,
  });
});

test("chuyển khoản KHÔNG có mã LUK → log unmatched vào bảng payments để đối soát tay", async ({ request }) => {
  const res = await request.post(WEBHOOK, {
    headers: apikeyHeaders,
    data: { ...basePayload, content: "chuyen tien khong ghi ma" },
  });

  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ success: true, status: "unmatched" });

  const upsert = stubRequests.find((r) => r.url.startsWith("/rest/v1/payments"));
  expect(upsert).toBeTruthy();
  expect(upsert.body).toMatchObject({ sepay_tx_id: "987654", amount: 199000, status: "unmatched" });
});
