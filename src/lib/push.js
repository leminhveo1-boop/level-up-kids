"use client";

import { getSupabase } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** @returns {boolean} */
export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Ask permission, subscribe this device, persist to Supabase.
 * @param {"parent"|"child"} audience
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function enablePush(audience = "parent") {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "CLOUD_DISABLED" };
  if (!isPushSupported()) return { success: false, error: "UNSUPPORTED" };

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return { success: false, error: "VAPID_MISSING" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { success: false, error: "PERMISSION_DENIED" };

  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid),
  });

  const json = sub.toJSON();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: "NOT_AUTHENTICATED" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userData.user.id,
      audience,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Unsubscribe this device and remove from Supabase. */
export async function disablePush() {
  const supabase = getSupabase();
  if (!isPushSupported()) return { success: false, error: "UNSUPPORTED" };
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (sub) {
    if (supabase) await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
  return { success: true };
}

/** @returns {Promise<boolean>} whether this device currently has a push subscription */
export async function getPushStatus() {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(await registration.pushManager.getSubscription());
  } catch {
    return false;
  }
}
