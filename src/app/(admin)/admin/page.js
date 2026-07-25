"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase/client";
import Card from "@/ui/Card";
import Button from "@/ui/Button";
import Pill from "@/ui/Pill";
import {
  Search,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  Download,
  Ticket,
  Copy,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtVnd(n) {
  return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const RPC_ERRORS = {
  INVALID_DAYS: "Số ngày không hợp lệ (1–400)",
  REASON_REQUIRED: "Cần nhập lý do",
  PROFILE_NOT_FOUND: "Không tìm thấy gia đình",
  FORBIDDEN: "Bạn không có quyền",
};

function mapError(msg) {
  if (!msg) return "Có lỗi xảy ra";
  for (const [key, val] of Object.entries(RPC_ERRORS)) {
    if (msg.includes(key)) return val;
  }
  return msg;
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, highlight }) {
  return (
    <div className="bg-white border border-sand rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${highlight ? "text-red-500" : "text-gray-800"}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─── ActionForm — cấp / đặt hạn / thu hồi ───────────────────────────────────

function ActionForm({ profileId, action, onClose, onSuccess }) {
  const supabase = getSupabase();
  const [days, setDays] = useState("365");
  const [dateStr, setDateStr] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [txRef, setTxRef] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!supabase) return;
      setErr(null);
      setOk(null);
      setLoading(true);
      try {
        let data, error;
        if (action === "grant") {
          ({ data, error } = await supabase.rpc("admin_grant_premium", {
            p_profile_id: profileId,
            p_days: Number(days),
            p_reason: reason,
            p_amount: amount ? Number(amount) : 0,
            p_tx_ref: txRef || null,
          }));
        } else if (action === "set_until") {
          ({ data, error } = await supabase.rpc("admin_set_premium_until", {
            p_profile_id: profileId,
            p_until: new Date(dateStr).toISOString(),
            p_reason: reason,
          }));
        } else if (action === "revoke") {
          ({ data, error } = await supabase.rpc("admin_revoke_premium", {
            p_profile_id: profileId,
            p_reason: reason,
          }));
        }
        if (error) {
          setErr(mapError(error.message));
        } else {
          const msg =
            action === "grant"
              ? `Đã cấp ${days} ngày (hết hạn ${fmtDate(data?.premium_until)})`
              : action === "set_until"
              ? `Đã đặt hạn thành công`
              : `Đã thu hồi Premium`;
          setOk(msg);
          onSuccess && onSuccess();
        }
      } catch (e) {
        setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
    [supabase, action, profileId, days, dateStr, reason, amount, txRef, onSuccess]
  );

  const title =
    action === "grant"
      ? "Cấp Premium"
      : action === "set_until"
      ? "Đặt ngày hết hạn"
      : "Thu hồi Premium";

  return (
    <div className="mt-3 border border-sand rounded-xl p-4 bg-gray-50 text-sm">
      <p className="font-bold text-gray-700 mb-3">{title}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {action === "grant" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Số ngày (1–400)</span>
              <input
                type="number"
                min={1}
                max={400}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Số tiền (VNĐ, tuỳ chọn)</span>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Mã giao dịch ngân hàng (tuỳ chọn)</span>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                className="border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </label>
          </>
        )}
        {action === "set_until" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Ngày hết hạn</span>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
              required
            />
          </label>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            Lý do <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Thanh toán chuyển khoản, quà tặng..."
            className="border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
            required
          />
        </label>
        {action === "revoke" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-xs text-red-600">Xác nhận thu hồi quyền Premium của gia đình này</span>
          </label>
        )}
        {err && (
          <p className="text-red-500 text-xs flex items-center gap-1">
            <XCircle size={13} /> {err}
          </p>
        )}
        {ok && (
          <p className="text-green-600 text-xs flex items-center gap-1">
            <CheckCircle size={13} /> {ok}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            variant={action === "revoke" ? "secondary" : "primary"}
            disabled={loading || (action === "revoke" && !confirmed)}
            className={action === "revoke" ? "text-red-600 border-red-300" : ""}
          >
            {loading ? "Đang xử lý..." : title}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── FamilyRow ────────────────────────────────────────────────────────────────

function FamilyRow({ row, onRefresh }) {
  const [openAction, setOpenAction] = useState(null);
  const isPremiumActive =
    row.plan === "premium" && row.premium_until && new Date(row.premium_until) > new Date();

  function toggleAction(key) {
    setOpenAction((prev) => (prev === key ? null : key));
  }

  function handleSuccess() {
    onRefresh && onRefresh();
  }

  return (
    <Card className="text-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-bold text-gray-800">{row.display_name || "(chưa đặt tên)"}</p>
            <p className="text-gray-500 text-xs">{row.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isPremiumActive ? (
              <Pill tone="accent">Premium · hết {fmtDate(row.premium_until)}</Pill>
            ) : (
              <Pill tone="muted">Free</Pill>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
          <span>{row.child_count ?? 0} trẻ</span>
          {row.payment_code && <span>Mã TT: {row.payment_code}</span>}
          {row.referral_code && <span>Ref: {row.referral_code}</span>}
          {row.referred_by && <span>Giới thiệu: {row.referred_by}</span>}
          <span>Tạo: {fmtDate(row.created_at)}</span>
        </div>
        <div className="flex gap-2 flex-wrap mt-1">
          <button
            onClick={() => toggleAction("grant")}
            className="text-xs text-forest font-bold border border-sand rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
          >
            Cấp Premium {openAction === "grant" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => toggleAction("set_until")}
            className="text-xs text-gray-600 font-bold border border-sand rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
          >
            Đặt hạn {openAction === "set_until" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => toggleAction("revoke")}
            className="text-xs text-red-500 font-bold border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 flex items-center gap-1"
          >
            Thu hồi {openAction === "revoke" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
        {openAction && (
          <ActionForm
            profileId={row.id}
            action={openAction}
            onClose={() => setOpenAction(null)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Card>
  );
}

// ─── trang chính ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { authLoaded, user, profile } = useAuth();
  const supabase = getSupabase();

  // stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsErr, setStatsErr] = useState(null);

  // search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchErr, setSearchErr] = useState(null);

  // payments
  const [payments, setPayments] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsErr, setPaymentsErr] = useState(null);

  // codes
  const [codeCount, setCodeCount] = useState("5");
  const [codeDays, setCodeDays] = useState("365");
  const [codeNote, setCodeNote] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState(null);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codesErr, setCodesErr] = useState(null);
  const [copied, setCopied] = useState(false);

  // ── redirect nếu chưa đăng nhập ──
  useEffect(() => {
    if (authLoaded && !user) {
      router.replace("/auth");
    }
  }, [authLoaded, user, router]);

  // ── load stats khi mount (chỉ khi is_admin) ──
  useEffect(() => {
    if (profile?.is_admin) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.is_admin]);

  // ─── handlers ───────────────────────────────────────────────────────────────

  async function loadStats() {
    if (!supabase) return;
    setStatsLoading(true);
    setStatsErr(null);
    try {
      const { data, error } = await supabase.rpc("admin_stats");
      if (error) setStatsErr(mapError(error.message));
      else setStats(data);
    } catch (e) {
      setStatsErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setStatsLoading(false);
    }
  }

  async function handleSearch(e) {
    e && e.preventDefault();
    if (!supabase || query.trim().length < 2) return;
    setSearchLoading(true);
    setSearchErr(null);
    setSearchResults(null);
    try {
      const { data, error } = await supabase.rpc("admin_search_families", {
        p_q: query.trim(),
      });
      if (error) setSearchErr(mapError(error.message));
      else setSearchResults(data || []);
    } catch (e) {
      setSearchErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleRefreshSearch() {
    if (query.trim().length >= 2) {
      await handleSearch();
    }
  }

  async function loadPayments() {
    if (!supabase) return;
    setPaymentsLoading(true);
    setPaymentsErr(null);
    try {
      const { data, error } = await supabase.rpc("admin_list_payments", {
        p_status: "unmatched",
        p_limit: 50,
      });
      if (error) setPaymentsErr(mapError(error.message));
      else setPayments(data || []);
    } catch (e) {
      setPaymentsErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function handleCreateCodes(e) {
    e.preventDefault();
    if (!supabase) return;
    setCodesLoading(true);
    setCodesErr(null);
    setGeneratedCodes(null);
    try {
      const { data, error } = await supabase.rpc("admin_create_codes", {
        p_count: Number(codeCount),
        p_days: Number(codeDays),
        p_note: codeNote || null,
      });
      if (error) setCodesErr(mapError(error.message));
      else setGeneratedCodes(data || []);
    } catch (e) {
      setCodesErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setCodesLoading(false);
    }
  }

  async function handleCopyCodes() {
    if (!generatedCodes) return;
    try {
      await navigator.clipboard.writeText(generatedCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard không khả dụng
    }
  }

  // ─── gates ──────────────────────────────────────────────────────────────────

  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest" />
      </div>
    );
  }

  if (!user) return null;

  if (profile && !profile.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-sm w-full text-center">
          <ShieldAlert size={40} className="text-red-400 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">Không có quyền truy cập</p>
          <p className="text-gray-400 text-sm mb-4">Trang này chỉ dành cho quản trị viên.</p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Về trang chủ
          </Button>
        </Card>
      </div>
    );
  }

  // profile chưa load xong (null) → spinner
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest" />
      </div>
    );
  }

  // ─── console ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* A. Tiêu đề */}
      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <TrendingUp size={20} className="text-forest shrink-0" />
          <h1 className="text-xl font-bold text-gray-800">Bảng vận hành</h1>
          <Pill tone="neutral" className="text-xs">{user.email}</Pill>
        </div>
      </Card>

      {/* B. Thống kê */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700">Thống kê</h2>
          <Button variant="ghost" onClick={loadStats} disabled={statsLoading} className="text-xs gap-1">
            <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
            Làm mới
          </Button>
        </div>
        {statsErr && <p className="text-red-500 text-xs mb-3">{statsErr}</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Đang Premium" value={stats?.active_premium ?? "—"} />
          <StatCard label="Sắp hết hạn (30n)" value={stats?.expiring_30d ?? "—"} />
          <StatCard label="Doanh thu 30n" value={stats ? fmtVnd(stats.revenue_30d) : "—"} />
          <StatCard label="Nhà mới (7n)" value={stats?.new_families_7d ?? "—"} />
          <StatCard
            label="Chờ đối soát"
            value={stats?.unmatched_payments ?? "—"}
            highlight={Boolean(stats?.unmatched_payments > 0)}
          />
        </div>
      </Card>

      {/* C. Tìm gia đình */}
      <Card>
        <h2 className="font-bold text-gray-700 mb-4">Tìm gia đình</h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Email, tên hoặc mã thanh toán..."
            className="flex-1 border border-sand rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={searchLoading || query.trim().length < 2}
            className="gap-1.5"
          >
            <Search size={15} />
            {searchLoading ? "Đang tìm..." : "Tìm"}
          </Button>
        </form>
        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="text-xs text-gray-400 mb-3">Nhập ít nhất 2 ký tự</p>
        )}
        {searchErr && <p className="text-red-500 text-xs mb-3">{searchErr}</p>}
        {searchResults !== null && (
          <div className="flex flex-col gap-3">
            {searchResults.length === 0 ? (
              <p className="text-gray-400 text-sm">Không tìm thấy kết quả.</p>
            ) : (
              searchResults.map((row) => (
                <FamilyRow key={row.id} row={row} onRefresh={handleRefreshSearch} />
              ))
            )}
          </div>
        )}
      </Card>

      {/* D. Thanh toán chờ đối soát */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700">Thanh toán chờ đối soát</h2>
          <Button variant="secondary" onClick={loadPayments} disabled={paymentsLoading} className="text-xs gap-1">
            <Download size={14} />
            {paymentsLoading ? "Đang tải..." : "Tải"}
          </Button>
        </div>
        {paymentsErr && <p className="text-red-500 text-xs mb-3">{paymentsErr}</p>}
        {payments === null && !paymentsLoading && (
          <p className="text-gray-400 text-sm">Nhấn &quot;Tải&quot; để xem danh sách.</p>
        )}
        {payments !== null && payments.length === 0 && (
          <p className="text-gray-500 text-sm">Không có khoản nào chờ đối soát.</p>
        )}
        {payments && payments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-sand">
                  <th className="py-2 pr-4 font-medium">Mã TX</th>
                  <th className="py-2 pr-4 font-medium">Số tiền</th>
                  <th className="py-2 pr-4 font-medium">Nội dung</th>
                  <th className="py-2 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.sepay_tx_id} className="border-b border-sand last:border-0">
                    <td className="py-2 pr-4 font-mono text-gray-600">{p.sepay_tx_id}</td>
                    <td className="py-2 pr-4 font-bold text-gray-800">{fmtVnd(p.amount)}</td>
                    <td className="py-2 pr-4 text-gray-500 max-w-xs truncate">{p.transfer_content || "—"}</td>
                    <td className="py-2 text-gray-400">{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* E. Tạo mã kích hoạt */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Ticket size={16} className="text-forest" />
          <h2 className="font-bold text-gray-700">Tạo mã kích hoạt</h2>
        </div>
        <form onSubmit={handleCreateCodes} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Số lượng (1–100)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={codeCount}
                onChange={(e) => setCodeCount(e.target.value)}
                className="border border-sand rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Số ngày hiệu lực</span>
              <input
                type="number"
                min={1}
                max={1000}
                value={codeDays}
                onChange={(e) => setCodeDays(e.target.value)}
                className="border border-sand rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Ghi chú (tuỳ chọn)</span>
            <input
              type="text"
              value={codeNote}
              onChange={(e) => setCodeNote(e.target.value)}
              placeholder="VD: Batch tặng trường, sự kiện..."
              className="border border-sand rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </label>
          {codesErr && <p className="text-red-500 text-xs">{codesErr}</p>}
          <Button type="submit" variant="primary" disabled={codesLoading} className="self-start">
            {codesLoading ? "Đang tạo..." : "Tạo mã"}
          </Button>
        </form>
        {generatedCodes && generatedCodes.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">
                {generatedCodes.length} mã đã tạo
              </p>
              <button
                onClick={handleCopyCodes}
                className="flex items-center gap-1 text-xs text-forest font-bold hover:underline"
              >
                {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied ? "Đã copy!" : "Copy tất cả"}
              </button>
            </div>
            <textarea
              readOnly
              value={generatedCodes.join("\n")}
              rows={Math.min(generatedCodes.length, 10)}
              className="w-full border border-sand rounded-xl px-3 py-2 text-xs font-mono text-gray-700 bg-gray-50 resize-none focus:outline-none"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
