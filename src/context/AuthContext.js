"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSupabase, isCloudEnabled } from "@/lib/supabase/client";
import { DEMO_CHILD, DEMO_CHILD_ID } from "@/lib/game/demo";

const AuthContext = createContext(null);

const LOCAL_CHILDREN_KEY = "luk_children";
const ACTIVE_CHILD_KEY = "luk_active_child";
const LEGACY_STATE_KEY = "quocbao_game_state";

/** Paid-only model: free accounts get demo only (0 real children) */
export const FREE_CHILD_LIMIT = 0;
export const PREMIUM_CHILD_LIMIT = 6;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const cloudEnabled = isCloudEnabled();
  const supabase = getSupabase();

  const [authLoaded, setAuthLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { plan, premium_until, payment_code, locale, display_name }
  const [childProfiles, setChildProfiles] = useState([]); // [{ id, name, char_class }]
  const [activeChildId, setActiveChildId] = useState(null);

  const isPremium = Boolean(
    profile?.plan === "premium" &&
      (!profile.premium_until || new Date(profile.premium_until) > new Date())
  );
  // Paid gate only applies in cloud mode; local mode (no env) stays open for self-host/dev
  const isPaid = !cloudEnabled || isPremium;
  const childLimit = !cloudEnabled ? PREMIUM_CHILD_LIMIT : isPremium ? PREMIUM_CHILD_LIMIT : FREE_CHILD_LIMIT;
  const isDemo = activeChildId === DEMO_CHILD_ID;

  // ---------- bootstrap ----------
  useEffect(() => {
    let cancelled = false;

    const bootstrapLocal = () => {
      // Local-only mode: children list in localStorage; migrate legacy single-child save
      let kids = readJson(LOCAL_CHILDREN_KEY, []);
      const legacyRaw = localStorage.getItem(LEGACY_STATE_KEY);
      if (kids.length === 0 && legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw);
          const legacyChild = {
            id: "local_legacy",
            name: legacy.charName || "Anh Hùng Nhí",
            char_class: legacy.charClass || "Warrior",
          };
          kids = [legacyChild];
          localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(kids));
          localStorage.setItem(`luk_state_${legacyChild.id}`, legacyRaw);
        } catch {
          /* corrupt legacy state — start fresh */
        }
      }
      if (cancelled) return;
      setChildProfiles(kids);
      const savedActive = localStorage.getItem(ACTIVE_CHILD_KEY);
      setActiveChildId(kids.some((k) => k.id === savedActive) ? savedActive : kids[0]?.id || null);
      setAuthLoaded(true);
    };

    const bootstrapCloud = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user || null;
      if (cancelled) return;
      setUser(sessionUser);
      if (sessionUser) {
        await refreshAccount(sessionUser.id);
      }
      if (!cancelled) setAuthLoaded(true);
    };

    if (cloudEnabled && supabase) {
      bootstrapCloud();
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user || null;
        setUser(nextUser);
        if (nextUser) refreshAccount(nextUser.id);
        else {
          setProfile(null);
          setChildProfiles([]);
          setActiveChildId(null);
        }
      });
      return () => {
        cancelled = true;
        sub?.subscription?.unsubscribe();
      };
    }

    bootstrapLocal();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- cloud account loaders ----------
  const refreshAccount = useCallback(
    async (uid) => {
      if (!supabase) return;
      const userId = uid || user?.id;
      if (!userId) return;

      const [{ data: prof }, { data: kids }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("children").select("id, name, char_class").eq("parent_id", userId).order("created_at"),
      ]);

      setProfile(prof || null);
      setChildProfiles(kids || []);
      const savedActive = localStorage.getItem(ACTIVE_CHILD_KEY);
      setActiveChildId((prev) => {
        const list = kids || [];
        if (list.some((k) => k.id === prev)) return prev;
        if (list.some((k) => k.id === savedActive)) return savedActive;
        return list[0]?.id || null;
      });
    },
    [supabase, user]
  );

  // ---------- actions ----------
  const signUp = useCallback(
    async (email, password, displayName) => {
      if (!supabase) return { success: false, error: "CLOUD_DISABLED" };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    [supabase]
  );

  const signIn = useCallback(
    async (email, password) => {
      if (!supabase) return { success: false, error: "CLOUD_DISABLED" };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(ACTIVE_CHILD_KEY);
  }, [supabase]);

  const selectChild = useCallback((childId) => {
    setActiveChildId(childId);
    // demo selection is session-only, never persisted
    if (childId && childId !== DEMO_CHILD_ID) localStorage.setItem(ACTIVE_CHILD_KEY, childId);
    else localStorage.removeItem(ACTIVE_CHILD_KEY);
  }, []);

  /** Enter showcase demo mode (view freely, nothing persisted). */
  const enterDemo = useCallback(() => {
    setActiveChildId(DEMO_CHILD_ID);
    localStorage.removeItem(ACTIVE_CHILD_KEY);
  }, []);

  const exitDemo = useCallback(() => {
    setActiveChildId(null);
  }, []);

  const createChild = useCallback(
    async (name, charClass) => {
      if (childProfiles.length >= childLimit) {
        return { success: false, error: "CHILD_LIMIT_REACHED", limit: childLimit };
      }

      if (cloudEnabled && supabase && user) {
        const { data, error } = await supabase
          .from("children")
          .insert({ parent_id: user.id, name, char_class: charClass })
          .select("id, name, char_class")
          .single();
        if (error) {
          const msg = error.message || "";
          const code = msg.includes("PREMIUM_REQUIRED")
            ? "PREMIUM_REQUIRED"
            : msg.includes("FREE_PLAN_CHILD_LIMIT") || msg.includes("MAX_CHILDREN_REACHED")
            ? "CHILD_LIMIT_REACHED"
            : msg;
          return { success: false, error: code, limit: childLimit };
        }
        setChildProfiles((prev) => [...prev, data]);
        selectChild(data.id);
        return { success: true, child: data };
      }

      // local mode
      const child = { id: "local_" + Date.now(), name, char_class: charClass };
      const next = [...childProfiles, child];
      setChildProfiles(next);
      localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(next));
      selectChild(child.id);
      return { success: true, child };
    },
    [childProfiles, childLimit, cloudEnabled, supabase, user, selectChild]
  );

  const deleteChild = useCallback(
    async (childId) => {
      if (cloudEnabled && supabase && user) {
        const { error } = await supabase.from("children").delete().eq("id", childId);
        if (error) return { success: false, error: error.message };
      } else {
        const next = childProfiles.filter((c) => c.id !== childId);
        localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(next));
      }
      localStorage.removeItem(`luk_state_${childId}`);
      setChildProfiles((prev) => prev.filter((c) => c.id !== childId));
      if (activeChildId === childId) selectChild(null);
      return { success: true };
    },
    [cloudEnabled, supabase, user, childProfiles, activeChildId, selectChild]
  );

  const redeemActivationCode = useCallback(
    async (code) => {
      if (!supabase || !user) return { success: false, error: "NOT_AUTHENTICATED" };
      const { data, error } = await supabase.rpc("redeem_activation_code", { p_code: code });
      if (error) return { success: false, error: error.message };
      if (data?.success) await refreshAccount();
      return data;
    },
    [supabase, user, refreshAccount]
  );

  const activeChild = isDemo
    ? DEMO_CHILD
    : childProfiles.find((c) => c.id === activeChildId) || null;

  return (
    <AuthContext.Provider
      value={{
        authLoaded,
        cloudEnabled,
        user,
        profile,
        isPremium,
        isPaid,
        isDemo,
        childLimit,
        childProfiles,
        activeChild,
        activeChildId,
        signUp,
        signIn,
        signOut,
        selectChild,
        enterDemo,
        exitDemo,
        createChild,
        deleteChild,
        redeemActivationCode,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
