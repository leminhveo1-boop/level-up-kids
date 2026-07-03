import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameState";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

// Be Vietnam Pro — designed for Vietnamese; includes the `vietnamese` subset
// (U+1EA0–1EF9 etc.) that Outfit lacked, which broke every accented char on
// iOS Safari. Keep the --font-outfit variable name to avoid touching every
// consumer of the `font-outfit` utility.
const appFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata = {
  title: "Level Up Kids - Game Phát Triển Bản Thân Cho Trẻ",
  description: "Biến quá trình phát triển bản thân, học tập và rèn luyện của trẻ thành một cuộc phiêu lưu nhập vai kỳ thú ngoài đời thực.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }, { url: "/favicon.ico" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Level Up Kids",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${appFont.variable} font-outfit antialiased bg-sand-light text-forest-dark`}>
        {/* Root = providers only. Theme + banner live in each route group's
            layout (dual bounded context); the phone frame stays shared for now. */}
        <div className="min-h-screen flex flex-col max-w-md mx-auto bg-sand-light shadow-2xl relative border-x border-sand">
          <LanguageProvider>
            <AuthProvider>
              <GameProvider>{children}</GameProvider>
            </AuthProvider>
          </LanguageProvider>
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
