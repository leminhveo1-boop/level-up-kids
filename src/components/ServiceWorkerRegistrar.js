"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker (production only) and self-heals stale caches:
 * when a NEW worker (bumped CACHE_VERSION) takes control, reload once so the open
 * page swaps to fresh app-shell/chunks instead of hanging on old assets. Without
 * this, a deploy that adds a route (vd /admin) leaves phones spinning forever
 * until the user manually clears site data. See public/sw.js.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // Chỉ reload khi trang ĐÃ có SW điều khiển sẵn lúc load (tức SW mới THAY SW cũ).
    // Lần cài đầu tiên (chưa có controller) thì bỏ qua để khỏi reload thừa.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded || !hadController) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Ép dò bản SW mới ngay mỗi lần mở app, không đợi trình duyệt tự kiểm.
        reg.update().catch(() => {});
      })
      .catch(() => {
        /* SW registration failure is non-fatal — app still works online */
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
