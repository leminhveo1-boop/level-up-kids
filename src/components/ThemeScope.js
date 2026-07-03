"use client";

import { useEffect } from "react";

/**
 * Applies the interface theme for a route group by setting [data-ui-mode]
 * on <html>. Each bounded context (kid / parent / public) declares its own
 * mode in its layout — replaces the old global UiModeApplier + per-page hacks.
 * No cleanup on purpose: navigating to another group simply sets its own mode.
 * @param {{ mode: "kid" | "teen" | "parent" }} props
 */
export default function ThemeScope({ mode }) {
  useEffect(() => {
    if (mode) document.documentElement.dataset.uiMode = mode;
  }, [mode]);

  return null;
}
