"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";

export default function AuthPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLang();
  const { authLoaded, cloudEnabled, user, signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (authLoaded && user) router.push("/family");
  }, [authLoaded, user, router]);

  useEffect(() => {
    if (authLoaded && !cloudEnabled) router.push("/family");
  }, [authLoaded, cloudEnabled, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setBusy(true);

    try {
      if (mode === "signup") {
        const res = await signUp(email.trim(), password, displayName.trim());
        if (!res.success) {
          setErrorMessage(res.error || t("common.error"));
        } else {
          track("signup_success");
          setInfoMessage(t("auth.checkEmail"));
        }
      } else {
        const res = await signIn(email.trim(), password);
        if (!res.success) {
          setErrorMessage(t("auth.error.invalid"));
        } else {
          track("signin_success");
          router.push("/family");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  if (!authLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[30%] bg-forest-light opacity-60 rounded-full blur-3xl -z-10"></div>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className="text-[10px] font-black text-forest bg-white border border-sand px-3 py-1 rounded-full uppercase tracking-wider shadow-sm active:scale-95 transition-transform"
        >
          {locale === "vi" ? "🇬🇧 English" : "🇻🇳 Tiếng Việt"}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow space-y-6">
        <div className="w-24 h-24 animate-float flex items-center justify-center bg-forest-light border-4 border-forest rounded-full shadow-game-forest text-4xl">
          🛡️
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-forest uppercase tracking-tight">{t("auth.title")}</h1>
          <p className="text-xs text-gray-500 max-w-xs">{t("auth.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full bg-white border-2 border-sand rounded-3xl p-5 shadow-game-flat space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("auth.displayName")}
              className="w-full bg-sand-light border-2 border-sand rounded-xl px-4 py-3 text-sm font-bold text-forest-dark focus:outline-none focus:border-forest transition-colors"
              maxLength={40}
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            className="w-full bg-sand-light border-2 border-sand rounded-xl px-4 py-3 text-sm font-bold text-forest-dark focus:outline-none focus:border-forest transition-colors"
            autoComplete="email"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.password")}
            className="w-full bg-sand-light border-2 border-sand rounded-xl px-4 py-3 text-sm font-bold text-forest-dark focus:outline-none focus:border-forest transition-colors"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            required
          />

          {errorMessage && (
            <p className="text-[11px] font-bold text-terracotta text-center bg-rose-50 border border-red-100 rounded-xl p-2">
              ⚠️ {errorMessage}
            </p>
          )}
          {infoMessage && (
            <p className="text-[11px] font-bold text-forest text-center bg-forest-light/20 border border-forest/20 rounded-xl p-2">
              {infoMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`w-full font-black text-sm py-3.5 rounded-2xl border-2 btn-game-transition ${
              busy
                ? "bg-gray-100 border-sand text-gray-400"
                : "bg-forest text-sand-light border-forest shadow-game-forest active:shadow-game-pressed"
            }`}
          >
            {busy ? t("common.loading") : mode === "signup" ? t("auth.signUp") : t("auth.signIn")}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setErrorMessage("");
              setInfoMessage("");
            }}
            className="w-full text-[11px] font-bold text-amber hover:underline uppercase tracking-wider pt-1"
          >
            {mode === "signup" ? t("auth.switchToSignIn") : t("auth.switchToSignUp")}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/family")}
          className="text-[10.5px] font-bold text-gray-400 hover:text-forest underline"
        >
          {t("auth.localMode")}
        </button>
      </div>
    </div>
  );
}
