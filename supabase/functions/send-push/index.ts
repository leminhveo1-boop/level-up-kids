// V1.2 — Evening reminder push (schedule ~20:00 VN via Supabase Cron)
// For every child with pending approvals, notify the parent's subscribed devices.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") || "mailto:hello@levelupkids.vn",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

Deno.serve(async (_req) => {
  // Quiet hours guard: never push after 20:30 VN (13:30 UTC)
  const utcMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes();
  if (utcMinutes > 13 * 60 + 30 && utcMinutes < 23 * 60) {
    return Response.json({ skipped: "quiet_hours" });
  }

  const { data: states, error } = await supabase
    .from("game_states")
    .select("child_id, state, children!inner(name, parent_id)");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  const stale: number[] = [];

  for (const row of states ?? []) {
    const tasks = (row.state?.tasks ?? []) as Array<{ approval?: string }>;
    const pending = tasks.filter((t) => t.approval === "pending").length;
    if (pending === 0) continue;

    const child = Array.isArray(row.children) ? row.children[0] : row.children;
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", child.parent_id)
      .eq("audience", "parent");

    const payload = JSON.stringify({
      title: `⏳ ${child.name} có ${pending} nhiệm vụ chờ duyệt`,
      body: "Chỉ 30 giây thôi — vào duyệt điểm cho con nhé! ✅",
      url: "/parent",
      tag: `approve_${row.child_id}`,
    });

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        // 404/410 = subscription expired → clean up
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) stale.push(sub.id);
      }
    }
  }

  if (stale.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", stale);
  }

  return Response.json({ sent, cleaned: stale.length });
});
