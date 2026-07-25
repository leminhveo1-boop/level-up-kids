"use client";

import ThemeScope from "@/components/ThemeScope";
import AppFrame from "@/ui/AppFrame";

export default function AdminLayout({ children }) {
  return (
    <>
      <ThemeScope mode="parent" />
      <AppFrame wide>{children}</AppFrame>
    </>
  );
}
