"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";
import { normalizeReferralCode, isValidReferralCode, buildReferralLink } from "@/lib/referral";

const PRICE_VND = Number(process.env.NEXT_PUBLIC_PREMIUM_PRICE_VND) || 199000;
const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID || ""; // e.g. "MB", "VCB" (VietQR bank code)
const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "";
const BANK_HOLDER = process.env.NEXT_PUBLIC_BANK_HOLDER || "";

function PremiumContent() {
  const router = useRouter();
  const { t, locale } = useLang();
  const { authLoaded, cloudEnabled, user, profile, isPremium, redeemActivationCode, applyReferralCode } = useAuth();

  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("code") || "";
  const prefillRef = searchParams.get("ref") || "";
  const [codeInput, setCodeInput] = useState(prefillCode.toUpperCase());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { ok: boolean, text: string }
  const autoRedeemDone = useRef(false);

  // ---- Referral ----
  const [refInput, setRefInput] = useState(normalizeReferralCode(prefillRef));
  const [refBusy, setRefBusy] = useState(false);
  const [refMessage, setRefMessage] = useState(null); // { ok, text }
  const [copied, setCopied] = useState(false);
  const autoRefDone = useRef(false);
  const alreadyReferred = Boolean(profile?.referred_by);

  const handleApplyReferral = async (rawCode) => {
    const code = normalizeReferralCode(rawCode);
    if (!isValidReferralCode(code)) {
      setRefMessage({ ok: false, text: t("premium.refer.INVALID") });
      return;
    }
    setRefBusy(true);
    setRefMessage(null);
    const res = await applyReferralCode(code);
    setRefBusy(false);
    if (res?.success) {
      track("referral_applied");
      setRefMessage({ ok: true, text: t("premium.referApplied") });
      setRefInput("");
    } else {
      const key = `premium.refer.${res?.error}`;
      const translated = t(key);
      setRefMessage({ ok: false, text: translated === key ? t("common.error") : translated });
    }
  };

  const handleShareReferral = async () => {
    const code = profile?.referral_code;
    if (!code) return;
    const link = buildReferralLink(typeof window !== "undefined" ? window.location.origin : "", code);
    const text = `${t("premium.referDesc")}\n${link}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("premium.referTitle"), text });
        return;
      }
    } catch {
      /* user cancelled or unsupported — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — nothing else to do */
    }
  };

  useEffect(() => {
    if (authLoaded) track("paywall_view", { paid: isPremium });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded]);

  // Auto-redeem when arriving via deep-link ?code=LUKID-XXXX-XXXX
  useEffect(() => {
    if (!prefillCode || autoRedeemDone.current) return;
    if (!authLoaded || !cloudEnabled || !user) return;
    autoRedeemDone.current = true;
    (async () => {
      setBusy(true);
      const res = await redeemActivationCode(prefillCode.trim());
      setBusy(false);
      if (res?.success) {
        track("code_redeemed", { duration_days: res.duration_days, source: "deeplink" });
        setMessage({ ok: true, text: t("premium.codeSuccess") });
        setCodeInput("");
      } else {
        const key = `premium.code.${res?.error}`;
        const translated = t(key);
        setMessage({ ok: false, text: translated === key ? t("common.error") : translated });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, cloudEnabled, user, prefillCode]);

  // Auto-apply a referral code arriving via deep link ?ref=REFXXXXXX
  useEffect(() => {
    if (!prefillRef || autoRefDone.current) return;
    if (!authLoaded || !cloudEnabled || !user) return;
    if (isPremium || alreadyReferred) return; // no bonus possible / already set
    autoRefDone.current = true;
    handleApplyReferral(prefillRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, cloudEnabled, user, prefillRef, isPremium, alreadyReferred]);

  if (!authLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">{t("common.loading")}</p>
      </div>
    );
  }

  // Premium requires a cloud account
  if (!cloudEnabled || !user) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center space-y-4">
        <span className="text-5xl">👑</span>
        <p className="text-sm font-bold text-forest-dark max-w-xs">
          {locale === "vi"
            ? "Bạn cần tài khoản gia đình (đám mây) để nâng cấp Premium."
            : "You need a family (cloud) account to upgrade to Premium."}
        </p>
        <button
          onClick={() => router.push("/auth")}
          className="bg-forest text-sand-light font-black text-sm py-3 px-8 rounded-2xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
        >
          {t("auth.signIn")} / {t("auth.signUp")}
        </button>
      </div>
    );
  }

  const paymentCode = profile?.payment_code || "";
  const qrUrl =
    BANK_ID && BANK_ACCOUNT
      ? `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.png?amount=${PRICE_VND}&addInfo=${encodeURIComponent(paymentCode)}&accountName=${encodeURIComponent(BANK_HOLDER)}`
      : null;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setBusy(true);
    setMessage(null);

    const res = await redeemActivationCode(codeInput.trim());
    setBusy(false);

    if (res?.success) {
      track("code_redeemed", { duration_days: res.duration_days });
      setMessage({ ok: true, text: t("premium.codeSuccess") });
      setCodeInput("");
    } else {
      const key = `premium.code.${res?.error}`;
      const translated = t(key);
      setMessage({ ok: false, text: translated === key ? t("common.error") : translated });
    }
  };

  return (
    <div className="flex flex-col flex-grow p-6 space-y-5 overflow-y-auto">
      <button
        onClick={() => router.push("/family")}
        className="self-start text-xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider"
      >
        ⬅️ {t("common.back")}
      </button>

      <div className="text-center space-y-1">
        <span className="text-5xl">👑</span>
        <h1 className="text-xl font-black text-amber-dark uppercase tracking-tight">{t("premium.title")}</h1>
      </div>

      {/* Current status */}
      {isPremium ? (
        <div className="bg-amber-light border-2 border-amber rounded-2xl p-4 text-center space-y-1">
          <p className="text-sm font-black text-amber-dark">👑 {t("premium.badge")}</p>
          {profile?.premium_until && (
            <p className="text-[11px] font-bold text-gray-600">
              {t("premium.activeUntil")}:{" "}
              {new Date(profile.premium_until).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Features */}
          <div className="bg-white border-2 border-sand rounded-2xl p-4 shadow-game-flat space-y-2.5">
            {["premium.feature.multiChild", "premium.feature.sync", "premium.feature.support"].map((key) => (
              <div key={key} className="flex items-center gap-2 text-xs font-bold text-forest-dark">
                <span className="text-forest">✓</span>
                <span>{t(key)}</span>
              </div>
            ))}
            <div className="border-t border-sand pt-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500">{t("premium.price")}:</span>
              <span className="text-base font-black text-amber-dark">{PRICE_VND.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          {/* Auto bank-transfer payment (SePay) */}
          <div className="bg-white border-2 border-sand rounded-2xl p-4 shadow-game-flat space-y-3">
            <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">💳 {t("premium.payTitle")}</h3>
            <p className="text-[10.5px] text-gray-500 leading-relaxed">{t("premium.payDesc")}</p>

            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="VietQR" className="w-56 mx-auto rounded-xl border border-sand" />
            )}

            <div className="bg-sand-light border-2 border-dashed border-amber rounded-xl p-3 text-center space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("premium.payContent")}</p>
              <p className="text-lg font-black text-amber-dark font-mono tracking-widest select-all">{paymentCode}</p>
            </div>

            {BANK_ACCOUNT && (
              <div className="text-[10.5px] font-bold text-gray-500 text-center space-y-0.5">
                <p>{BANK_ID} — {BANK_ACCOUNT}</p>
                {BANK_HOLDER && <p>{BANK_HOLDER}</p>}
              </div>
            )}
          </div>
        </>
      )}

      {/* Referral: enter a friend's code (before paying) */}
      {!isPremium && (
        alreadyReferred ? (
          <div className="bg-forest-light/20 border-2 border-forest/20 rounded-2xl p-3 text-center">
            <p className="text-[11px] font-black text-forest-dark">{t("premium.referredBadge")}</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-sand rounded-2xl p-4 shadow-game-flat space-y-3">
            <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">🎟️ {t("premium.enterReferTitle")}</h3>
            <p className="text-[10.5px] text-gray-500 leading-relaxed">{t("premium.enterReferDesc")}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(normalizeReferralCode(e.target.value))}
                placeholder={t("premium.referPlaceholder")}
                className="flex-grow bg-sand-light border-2 border-sand rounded-xl px-3 py-2.5 text-sm font-black text-forest-dark font-mono focus:outline-none focus:border-forest transition-colors uppercase"
                maxLength={9}
              />
              <button
                type="button"
                onClick={() => handleApplyReferral(refInput)}
                disabled={refBusy || !refInput.trim()}
                className={`font-black text-[11px] px-4 rounded-xl border-2 btn-game-transition ${
                  refBusy || !refInput.trim()
                    ? "bg-gray-100 border-sand text-gray-400"
                    : "bg-forest text-white border-forest shadow-game-forest active:shadow-game-pressed"
                }`}
              >
                {t("premium.applyRefer")}
              </button>
            </div>
            {refMessage && (
              <p
                className={`text-[11px] font-bold text-center rounded-xl p-2 border ${
                  refMessage.ok
                    ? "text-forest bg-forest-light/20 border-forest/20"
                    : "text-terracotta bg-rose-50 border-red-100"
                }`}
              >
                {refMessage.text}
              </p>
            )}
          </div>
        )
      )}

      {/* Referral: share your own code to earn +6 months */}
      {profile?.referral_code && (
        <div className="bg-amber-light/40 border-2 border-amber/40 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-black text-amber-dark uppercase tracking-wider">{t("premium.referTitle")}</h3>
          <p className="text-[10.5px] text-gray-600 leading-relaxed font-medium">{t("premium.referDesc")}</p>
          <div className="bg-white border-2 border-dashed border-amber rounded-xl p-3 text-center space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("premium.yourCode")}</p>
            <p className="text-lg font-black text-amber-dark font-mono tracking-widest select-all">{profile.referral_code}</p>
          </div>
          <button
            type="button"
            onClick={handleShareReferral}
            className="w-full bg-amber text-white font-black text-xs py-3 rounded-xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
          >
            {copied ? t("premium.copied") : t("premium.shareBtn")}
          </button>
        </div>
      )}

      {/* Activation code redemption */}
      <form onSubmit={handleRedeem} className="bg-white border-2 border-sand rounded-2xl p-4 shadow-game-flat space-y-3">
        <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">🗝️ {t("premium.enterCode")}</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="LUKID-XXXX-XXXX"
            className="flex-grow bg-sand-light border-2 border-sand rounded-xl px-3 py-2.5 text-sm font-black text-forest-dark font-mono focus:outline-none focus:border-forest transition-colors uppercase"
            maxLength={24}
          />
          <button
            type="submit"
            disabled={busy || !codeInput.trim()}
            className={`font-black text-[11px] px-4 rounded-xl border-2 btn-game-transition ${
              busy || !codeInput.trim()
                ? "bg-gray-100 border-sand text-gray-400"
                : "bg-amber text-white border-amber shadow-game-amber active:shadow-game-pressed"
            }`}
          >
            {t("premium.redeem")}
          </button>
        </div>
        {message && (
          <p
            className={`text-[11px] font-bold text-center rounded-xl p-2 border ${
              message.ok
                ? "text-forest bg-forest-light/20 border-forest/20"
                : "text-terracotta bg-rose-50 border-red-100"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center flex-grow p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
        </div>
      }
    >
      <PremiumContent />
    </Suspense>
  );
}
