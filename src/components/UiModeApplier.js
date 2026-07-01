"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

/** Applies [data-ui-mode] to <html> so CSS tokens switch per active child. */
export default function UiModeApplier() {
  const { uiMode } = useAuth();

  useEffect(() => {
    document.documentElement.dataset.uiMode = uiMode || "kid";
  }, [uiMode]);

  return null;
}
