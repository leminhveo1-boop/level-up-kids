import React from "react";

/**
 * Themeable surface card (Core UI). White surface, hairline border, soft shadow
 * — separation by whitespace, not heavy frames (8pt padding).
 * @param {{ as?: any, className?: string } & React.HTMLAttributes<HTMLDivElement>} props
 */
export default function Card({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={`bg-white border border-sand rounded-2xl p-4 shadow-game-flat ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
