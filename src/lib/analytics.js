"use client";

import { getSupabase } from "@/lib/supabase/client";

const SESSION_KEY = "luk_session_id";

function getSessionId() {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget funnel event. No-op when Supabase is not configured.
 * Funnel names: demo_start, paywall_view, signup_success, signin_success,
 * code_redeemed, child_created, onboarding_completed.
 * @param {string} name
 * @param {object} [props]
 */
export function track(name, props) {
  const supabase = getSupabase();
  if (!supabase) return;

  const payload = {
    name,
    session_id: getSessionId(),
    props: props || null,
  };

  // attach user when logged in; never block the UI on analytics
  supabase.auth
    .getUser()
    .then(({ data }) =>
      supabase.from("events").insert({ ...payload, user_id: data?.user?.id || null })
    )
    .then(() => {})
    .catch(() => {});
}
