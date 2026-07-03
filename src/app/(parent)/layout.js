"use client";

import ThemeScope from "@/components/ThemeScope";
import DemoBanner from "@/components/DemoBanner";
import AppFrame from "@/ui/AppFrame";

/**
 * PARENT bounded context — SaaS-clean admin. Always theme "parent" and a wider
 * frame on desktop, independent of the active child's kid/teen mode.
 */
export default function ParentLayout({ children }) {
  return (
    <>
      <ThemeScope mode="parent" />
      <AppFrame wide>{children}</AppFrame>
      <DemoBanner />
    </>
  );
}
