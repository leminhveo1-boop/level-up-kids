// Lifecycle emails — automated, zero human support.
// Runs daily (cron). For each premium parent, picks at most ONE stage email
// based on days-since-activation + the child's real activity, and dedups via
// lifecycle_log so each stage is sent once. Retention lever, not a helpdesk.
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const TEST_OVERRIDE = Deno.env.get("EMAIL_TEST_OVERRIDE") || "";
const FROM = Deno.env.get("EMAIL_FROM") || "Level Up Kids <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_URL") || "https://level-up-kids.caevietnam.workers.dev";

const DAY_MS = 24 * 60 * 60 * 1000;

interface Snapshot { completed?: number; total?: number }
interface Kid { id: string; name: string }

const sumCompleted = (h: Snapshot[]) => h.reduce((s, x) => s + (x.completed || 0), 0);

const shell = (title: string, body: string, cta: string) => `
<div style="font-family:system-ui,sans-serif;background:#FDFBF7;padding:24px;max-width:520px;margin:0 auto;">
  <h1 style="color:#2E7D32;font-size:20px;margin:0 0 12px;">🌳 ${title}</h1>
  ${body}
  <a href="${APP_URL}/dashboard" style="display:inline-block;margin:16px 0 4px;background:#2E7D32;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;">${cta}</a>
  <p style="color:#bbb;font-size:11px;margin-top:16px;">Level Up Kids · Email tự động</p>
</div>`;

function buildEmail(kind: string, parentName: string, kidNames: string): { subject: string; html: string } | null {
  const p = parentName || "bố mẹ";
  if (kind === "welcome") {
    return {
      subject: "🎉 Chào mừng đến Level Up Kids!",
      html: shell(
        "Đã kích hoạt — bắt đầu trong 3 bước",
        `<p style="color:#555;font-size:14px;line-height:1.6;">Chào ${p}, tài khoản đã mở khoá trọn bộ! Để ${kidNames} vào guồng nhanh nhất:</p>
         <ol style="color:#444;font-size:14px;line-height:1.9;padding-left:20px;">
           <li><b>Chọn 1 Lộ Trình 3 tuần</b> đúng tuổi con (app soạn sẵn việc + mẹo).</li>
           <li><b>Giao vài việc</b> — con tick, điểm treo chờ duyệt.</li>
           <li><b>Tối mở app 30 giây</b> duyệt điểm cho con.</li>
         </ol>
         <p style="color:#888;font-size:13px;">Chỉ cần đều đặn 30 giây mỗi tối — phần còn lại app lo.</p>`,
        "Bắt đầu ngay"
      ),
    };
  }
  if (kind === "day3") {
    return {
      subject: `Cần giúp ${kidNames} bắt đầu không?`,
      html: shell(
        "Vài mẹo để con vào guồng",
        `<p style="color:#555;font-size:14px;line-height:1.6;">Chào ${p}, mình thấy ${kidNames} chưa hoàn thành việc nào — chuyện rất bình thường ở mấy ngày đầu. Vài gợi ý nhỏ:</p>
         <ul style="color:#444;font-size:14px;line-height:1.9;padding-left:20px;">
           <li>Bắt đầu bằng <b>1–2 việc thật dễ</b> con chắc chắn làm được (tạo đà thắng đầu tiên).</li>
           <li>Tối cùng con mở app, tick thử 1 việc — cảm giác "lên điểm" là thứ kéo con quay lại.</li>
           <li>Chưa biết giao gì? Mở tab <b>Việc &amp; Quà</b> → chọn 1 <b>Lộ Trình</b> theo tuổi, app giao sẵn.</li>
         </ul>`,
        "Mở app cùng con"
      ),
    };
  }
  if (kind === "week4") {
    return {
      subject: "Chững lại một chút? Hoàn toàn bình thường 🌱",
      html: shell(
        "Gần 8/10 gia đình cũng chững ở tuần 2–3",
        `<p style="color:#555;font-size:14px;line-height:1.6;">Chào ${p}, tuần qua ${kidNames} có vẻ chậm nhịp — và đây là điều <b>gần như nhà nào cũng gặp</b> khi một thói quen đang hình thành, không phải con hư hay app không hợp.</p>
         <p style="color:#444;font-size:14px;line-height:1.6;">Cách các nhà khác vượt qua:</p>
         <ul style="color:#444;font-size:14px;line-height:1.9;padding-left:20px;">
           <li><b>Rút xuống 1 việc mục tiêu</b> duy nhất trong tuần này — ít mà đều thắng nhiều mà bỏ.</li>
           <li>Bật <b>Tuần Bận</b> nếu bố mẹ đang quá tải: app tự duyệt, không cần mở mỗi tối.</li>
           <li>Gửi con <b>1 lời khen</b> qua Sổ Vàng — công nhận đúng lúc kéo con lại mạnh hơn điểm thưởng.</li>
         </ul>`,
        "Làm lại nhẹ nhàng"
      ),
    };
  }
  return null;
}

Deno.serve(async (_req) => {
  const { data: parents, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, premium_since, children(id, name)")
    .eq("plan", "premium")
    .not("premium_since", "is", null);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: logRows } = await supabase.from("lifecycle_log").select("profile_id, kind");
  const sent = new Set((logRows ?? []).map((r) => `${r.profile_id}:${r.kind}`));

  const now = Date.now();
  let sentCount = 0;
  const failures: string[] = [];

  for (const parent of parents ?? []) {
    const kids = (parent.children as Kid[]) ?? [];
    if (kids.length === 0) continue;

    const daysSince = Math.floor((now - new Date(parent.premium_since as string).getTime()) / DAY_MS);

    const { data: states } = await supabase
      .from("game_states")
      .select("state")
      .in("child_id", kids.map((k) => k.id));
    const histories = (states ?? []).map((s) => ((s.state as Record<string, unknown>)?.history as Snapshot[]) ?? []);
    const totalEver = histories.reduce((s, h) => s + sumCompleted(h), 0);
    const lastWeek = histories.reduce((s, h) => s + sumCompleted(h.slice(-7)), 0);

    // Pick at most ONE eligible, not-yet-sent stage (time windows don't overlap)
    let kind: string | null = null;
    if (daysSince <= 1) kind = "welcome";
    else if (daysSince >= 3 && daysSince <= 6 && totalEver === 0) kind = "day3";
    else if (daysSince >= 26 && daysSince <= 33 && lastWeek < 3) kind = "week4";
    if (!kind || sent.has(`${parent.id}:${kind}`)) continue;

    const kidNames = kids.map((k) => k.name).join(", ");
    const mail = buildEmail(kind, parent.display_name as string, kidNames);
    if (!mail) continue;

    const to = TEST_OVERRIDE || (parent.email as string);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject: mail.subject, html: mail.html }),
    });

    if (res.ok) {
      await supabase.from("lifecycle_log").insert({ profile_id: parent.id, kind });
      sentCount++;
    } else {
      failures.push(`${to}(${kind}): ${await res.text()}`);
    }
  }

  return Response.json({ sent: sentCount, failures });
});
