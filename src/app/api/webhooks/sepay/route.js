import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Cloudflare Pages requires edge runtime for API routes
export const runtime = "edge";

/**
 * SePay webhook — bank transfer IPN.
 * Config in SePay dashboard: URL = /api/webhooks/sepay, Auth = "Apikey <SEPAY_WEBHOOK_API_KEY>".
 * Flow: parent transfers with content containing their payment_code (LUKXXXXXXXX)
 *       → webhook matches profile → RPC activates premium (idempotent per tx id).
 */
export async function POST(request) {
  // ---- authenticate webhook caller ----
  const authHeader = request.headers.get("authorization") || "";
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY;
  if (!expectedKey || authHeader !== `Apikey ${expectedKey}`) {
    return Response.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  // Only inbound transfers are relevant
  if (payload.transferType && payload.transferType !== "in") {
    return Response.json({ success: true, status: "ignored_outgoing" });
  }

  const amount = Number(payload.transferAmount) || 0;
  const txId = String(payload.id ?? payload.referenceCode ?? "");
  const content = String(payload.content ?? payload.description ?? "");

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

  // Always 200 so SePay does not retry storms on business-level rejections
  return Response.json(data ?? { success: true });
}
