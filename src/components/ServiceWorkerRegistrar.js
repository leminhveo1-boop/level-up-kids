"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (production only). */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW registration failure is non-fatal — app still works online */
    });
  }, []);

  return null;
}
