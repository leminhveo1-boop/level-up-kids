"use client";

import ThemeScope from "@/components/ThemeScope";
import DemoBanner from "@/components/DemoBanner";

/**
 * PUBLIC context — landing / auth / onboarding. Uses the BASE palette (no
 * accent remap) so marketing keeps the forest-green brand identity intact.
 */
export default function PublicLayout({ children }) {
  return (
    <>
      <ThemeScope mode="public" />
      {children}
      <DemoBanner />
    </>
  );
}
