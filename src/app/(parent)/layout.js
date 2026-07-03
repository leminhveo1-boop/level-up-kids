"use client";

import ThemeScope from "@/components/ThemeScope";
import DemoBanner from "@/components/DemoBanner";

/**
 * PARENT bounded context — SaaS-clean admin. Always theme "parent",
 * independent of the active child's kid/teen mode.
 */
export default function ParentLayout({ children }) {
  return (
    <>
      <ThemeScope mode="parent" />
      {children}
      <DemoBanner />
    </>
  );
}
