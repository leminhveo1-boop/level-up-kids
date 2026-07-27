/* Level Up Kids — Service Worker (offline-first app shell) */

// ponytail: BUMP chuỗi này MỖI lần deploy đổi asset được cache — activate sẽ xoá
// cache phiên bản cũ (dòng dưới). Không bump = điện thoại giữ app-shell/chunk cũ →
// mở trang mới (vd /admin) xoay vô hạn. Nâng cấp thật: inject BUILD_ID lúc build.
const CACHE_VERSION = "luk-v18";
const APP_SHELL = ["/", "/dashboard", "/mining", "/rewards", "/family", "/offline.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ===== V1.2 Web Push ===== */
self.addEventListener("push", (event) => {
  // Lớp chặn cuối tại thiết bị: cron/server có gọi muộn cũng không làm phiền
  // gia đình trong giờ ngủ. `getHours()` là giờ địa phương của thiết bị.
  const localHour = new Date().getHours();
  if (localHour >= 22 || localHour < 7) return;

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Level Up Kids", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Level Up Kids 🌳", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" },
      tag: data.tag || "luk",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache API / Supabase calls
  if (url.pathname.startsWith("/api/") || url.hostname.endsWith("supabase.co")) return;

  // HTML navigations: network-first, fallback to cache, then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // Static assets (Next chunks, fonts, images): stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
