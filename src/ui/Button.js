import React from "react";

/**
 * Themeable button (Core UI). Colour comes from the active theme's --accent,
 * so one component is blue for kid, forest for parent, emerald for teen.
 * @param {{ variant?: "primary"|"secondary"|"ghost", className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({ variant = "primary", className = "", children, ...rest }) {
  const base = "min-h-tap inline-flex items-center justify-center gap-1.5 rounded-xl text-scale-2xs font-black px-4 active:scale-95 transition-transform";
  const styles = {
    primary: "accent-bg",
    secondary: "bg-white border border-sand text-gray-600",
    ghost: "accent-text",
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}
