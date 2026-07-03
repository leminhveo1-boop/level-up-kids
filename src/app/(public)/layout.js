"use client";

import ThemeScope from "@/components/ThemeScope";
import DemoBanner from "@/components/DemoBanner";
import AppFrame from "@/ui/AppFrame";

/**
 * PUBLIC context — landing / auth / onboarding. Base palette (no accent remap)
 * so marketing keeps the forest-green brand identity intact.
 */
export default function PublicLayout({ children }) {
  return (
    <>
      <ThemeScope mode="public" />
      <AppFrame>{children}</AppFrame>
      <DemoBanner />
    </>
  );
}
