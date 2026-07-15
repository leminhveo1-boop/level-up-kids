import React from "react";

/**
 * The visual app frame (Core UI). Kid/public stay phone-width; parent widens on
 * desktop (SaaS). `relative` anchors any in-page absolutely-positioned overlays;
 * BottomNav itself is `fixed` and width-matches this column via its own max-w.
 * bg follows theme (bg-sand-light → warm for kid, #F2F3F5 for parent via token
 * override).
 * @param {{ wide?: boolean, children: React.ReactNode }} props
 */
export default function AppFrame({ wide = false, children }) {
  return (
    <div
      className={`flex-grow flex flex-col relative w-full mx-auto bg-sand-light shadow-2xl border-x border-sand ${
        wide ? "max-w-md md:max-w-4xl" : "max-w-md"
      }`}
    >
      {children}
    </div>
  );
}
