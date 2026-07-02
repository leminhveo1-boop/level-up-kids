// V1.2 — Weekly family report email via Resend (schedule Sunday ~19:00 VN)
// One email per parent, summarizing each child's last-7-day snapshots.
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
// Until a domain is verified, Resend only delivers to the account owner —
// set EMAIL_TEST_OVERRIDE to route every mail there during testing.
const TEST_OVERRIDE = Deno.env.get("EMAIL_TEST_OVERRIDE") || "";
const FROM = Deno.env.get("EMAIL_FROM") || "Level Up Kids <onboarding@resend.dev>";

interface Snapshot {
  date: string;
  completed: number;
  total: number;
  screenMinutes?: number;
  trustScore?: number;
  streak?: number;
}

function childSection(name: string, state: Record<string, unknown>): string {
  const history = ((state.history as Snapshot[]) ?? []).slice(-7);
  const days = history.length;
  const done = history.reduce((s, h) => s + (h.completed || 0), 0);
  const total = history.reduce((s, h) => s + (h.total || 0), 0);
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
  const streak = (state.streak as number) ?? 0;
  const trust = (state.trustScore as number) ?? 0;
  const graduated = ((state.graduatedHabits as unknown[]) ?? []).length;

  const bars = history
    .map((h) => {
      const pct = h.total ? Math.round((h.completed / h.total) * 100) : 0;
      const height = Math.max(6, Math.round(pct * 0.5));
      return `<td style="vertical-align:bottom;text-align:center;padding:0 3px;">
        <div style="font-size:10px;color:#666;">${h.completed}</div>
        <div style="width:22px;height:${height}px;background:#4CAF50;border-radius:4px 4px 0 0;margin:0 auto;"></div>
        <div style="font-size:9px;color:#999;">${String(h.date).split("/").slice(0, 2).join("/")}</div>
      </td>`;
    })
    .join("");

  return `
  <div style="background:#fff;border:1px solid #E4DCCF;border-radius:14px;padding:18px;margin:14px 0;">
    <h2 style="margin:0 0 6px;color:#1B5E20;font-size:17px;">🦸 ${name}</h2>
    <p style="margin:0 0 10px;color:#555;font-size:13px;">
      ${days} ngày ghi nhận · hoàn thành <b>${done}/${total}</b> nhiệm vụ (${rate}%) ·
      🔥 streak <b>${streak}</b> · 🤝 uy tín <b>${trust}/100</b>${graduated ? ` · 🎓 <b>${graduated}</b> thói quen đã thành bản năng` : ""}
    </p>
    ${history.length ? `<table style="border-collapse:collapse;"><tr>${bars}</tr></table>` : `<p style="color:#999;font-size:12px;">Chưa đủ dữ liệu tuần này.</p>`}
  </div>`;
}

Deno.serve(async (_req) => {
  const { data: parents, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, children(id, name)")
    .eq("plan", "premium");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sentCount = 0;
  const failures: string[] = [];

  for (const parent of parents ?? []) {
    const kids = parent.children ?? [];
    if (kids.length === 0) continue;

    const { data: states } = await supabase
      .from("game_states")
      .select("child_id, state")
      .in("child_id", kids.map((k: { id: string }) => k.id));

    const sections = kids
      .map((k: { id: string; name: string }) => {
        const st = states?.find((s) => s.child_id === k.id)?.state ?? {};
        return childSection(k.name, st as Record<string, unknown>);
      })
      .join("");

    const html = `
    <div style="font-family:system-ui,sans-serif;background:#FDFBF7;padding:24px;max-width:560px;margin:0 auto;">
      <h1 style="color:#2E7D32;font-size:20px;">🌳 Báo cáo tuần — Level Up Kids</h1>
      <p style="color:#555;font-size:14px;">Chào ${parent.display_name || "bố mẹ"}, đây là hành trình tuần qua của các anh hùng nhí nhà mình:</p>
      ${sections}
      <p style="color:#888;font-size:12px;">💡 Mẹo tuần này: một lời khen đúng lúc đáng giá hơn mọi điểm thưởng — mở app, tab Tuần, mục Sổ Vàng để gửi lời khen soạn sẵn cho con nhé.</p>
      <p style="color:#bbb;font-size:11px;">Level Up Kids · Email tự động hằng tuần</p>
    </div>`;

    const to = TEST_OVERRIDE || parent.email;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject: `🌳 Tuần qua của ${kids.map((k: { name: string }) => k.name).join(", ")}`, html }),
    });

    if (res.ok) sentCount++;
    else failures.push(`${to}: ${await res.text()}`);
  }

  return Response.json({ sent: sentCount, failures });
});
