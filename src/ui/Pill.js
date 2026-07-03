import React from "react";

/**
 * Small rounded chip/tag (Core UI). `tone`: neutral | accent | amber | muted.
 * @param {{ tone?: "neutral"|"accent"|"amber"|"muted", className?: string } & React.HTMLAttributes<HTMLSpanElement>} props
 */
export default function Pill({ tone = "neutral", className = "", children, ...rest }) {
  const tones = {
    neutral: "bg-sand-light text-gray-600 border border-sand",
    accent: "accent-soft-bg",
    amber: "bg-amber-light text-amber-dark",
    muted: "text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-scale-2xs font-black rounded-full px-2.5 py-1 select-none ${tones[tone] || tones.neutral} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
