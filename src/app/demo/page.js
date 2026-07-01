"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";

/** Entry point: switches into showcase demo mode then drops into the dashboard. */
export default function DemoPage() {
  const router = useRouter();
  const { authLoaded, enterDemo } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    if (!authLoaded) return;
    track("demo_start");
    enterDemo();
    router.replace("/dashboard");
  }, [authLoaded, enterDemo, router]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      <p className="mt-4 text-forest font-medium">{t("common.loading")}</p>
    </div>
  );
}
