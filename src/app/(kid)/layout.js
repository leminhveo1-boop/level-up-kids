"use client";

import { useAuth } from "@/context/AuthContext";
import ThemeScope from "@/components/ThemeScope";
import DemoBanner from "@/components/DemoBanner";

/**
 * KID bounded context — the child's playful world.
 * Theme follows the active child's ui_mode (kid 6-11 / teen 12+).
 */
export default function KidLayout({ children }) {
  const { uiMode } = useAuth();

  return (
    <>
      <ThemeScope mode={uiMode || "kid"} />
      {children}
      <DemoBanner />
    </>
  );
}
