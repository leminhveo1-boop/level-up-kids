"use client";

import ThemeScope from "@/components/ThemeScope";
import DemoBanner from "@/components/DemoBanner";

/** PUBLIC context — landing / auth / onboarding. Warm kid look by default. */
export default function PublicLayout({ children }) {
  return (
    <>
      <ThemeScope mode="kid" />
      {children}
      <DemoBanner />
    </>
  );
}
