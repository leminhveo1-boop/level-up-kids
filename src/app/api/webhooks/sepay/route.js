import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Cloudflare Pages requires edge runtime for API routes
export const runtime = "edge";

const SIGNATURE_MAX_AGE_SEC = 300; // reject webhooks older than 5 minutes (replay guard)

/**
 * Verify SePay HMAC-SHA256 signature (Web Crypto, edge-compatible).
 * signature = "sha256=" + HMAC_SHA256(timestamp + "." + rawBody, secret)
 */
async function verifyHmac(signatureHeader, timestampHeader, rawBody, secret) {
  if (!signatureHeader || !timestampHeader || !secret) return false;

  const ts = parseInt(timestampHeader, 10);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > SIGNATURE_MAX_AGE_SEC) {
    return false;
  }

  const expectedHex = signatureHeader.replace(/^sha256=/, "").toLowerCase();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestampHeader}.${rawBody}`));
  const computedHex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  // constant-time-ish compare
  if (computedHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computedHex.length; i++) diff |= computedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}

/**
 * SePay webhook — bank transfer IPN (https://developer.sepay.vn).
 * Auth: HMAC-SHA256 headers (X-Sepay-Signature/X-Sepay-Timestamp) — preferred,
 *       or legacy "Authorization: Apikey <key>".
 * Response contract: HTTP 200 + {"success": true} for every processed event
 * (business-level rejections are logged to `payments` for reconciliation).
 */
export async function POST(request) {
  const rawBody = await request.text();

  // ---- authenticate: HMAC first, legacy Apikey fallback ----
  const hmacOk = await verifyHmac(
    request.headers.get("x-sepay-signature"),
    request.headers.get("x-sepay-timestamp"),
    rawBody,
    process.env.SEPAY_WEBHOOK_SECRET
  );

  const legacyKey = process.env.SEPAY_WEBHOOK_API_KEY;
  const apikeyOk = Boolean(
    legacyKey && legacyKey !== "CHANGE_ME" && request.headers.get("authorization") === `Apikey ${legacyKey}`
  );

  if (!hmacOk && !apikeyOk) {
    return Response.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  // Only inbound transfers are relevant
  if (payload.transferType && payload.transferType !== "in") {
    return Response.json({ success: true, status: "ignored_outgoing" });
  }

  const amount = Number(payload.transferAmount) || 0;
  const txId = String(payload.id ?? payload.referenceCode ?? "");
  const content = String(payload.content ?? payload.description ?? payload.code ?? "");

  if (!txId) {
    return Response.json({ success: false, error: "MISSING_TX_ID" }, { status: 400 });
  }

  // ---- extract payment code (LUK + 8 alphanumerics) from transfer content ----
  const match = content.toUpperCase().match(/LUK[A-Z0-9]{8}/);
  const paymentCode = match ? match[0] : null;

  const supabase = getSupabaseAdmin();

  if (!paymentCode) {
    // log unmatched for manual reconciliation
    await supabase.from("payments").upsert(
      {
        sepay_tx_id: txId,
        amount,
        transfer_content: content,
        status: "unmatched",
        raw: payload,
      },
      { onConflict: "sepay_tx_id", ignoreDuplicates: true }
    );
    return Response.json({ success: true, status: "unmatched" });
  }

  const minAmount = Number(process.env.PREMIUM_PRICE_VND) || 199000;
  const daysPerPeriod = Number(process.env.PREMIUM_DAYS_PER_PERIOD) || 365;

  const { data, error } = await supabase.rpc("activate_from_payment", {
    p_payment_code: paymentCode,
    p_amount: amount,
    p_tx_id: txId,
    p_content: content,
    p_raw: payload,
    p_min_amount: minAmount,
    p_days_per_period: daysPerPeriod,
  });

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  // SePay contract: 200 + success=true means "received & processed" —
  // business rejections (amount too low, code not found) are logged, not retried
  return Response.json({ success: true, ...(data ?? {}) });
}
