import { defineConfig } from "@playwright/test";

/**
 * E2E config — money-flow tests hit a REAL Next.js server on a dedicated port
 * with deterministic test env (webhook secrets + Supabase pointed at a local
 * stub started inside the spec). Request-only: no browser binaries needed.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false, // single Next dev server + single Supabase stub
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
  },
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Deterministic test env — OS env overrides .env in Next.js
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:4545",
      SUPABASE_SERVICE_ROLE_KEY: "e2e-service-role-key",
      SEPAY_WEBHOOK_API_KEY: "e2e-api-key",
      SEPAY_WEBHOOK_SECRET: "e2e-hmac-secret",
      PREMIUM_PRICE_VND: "199000",
      PREMIUM_DAYS_PER_PERIOD: "365",
    },
  },
});
