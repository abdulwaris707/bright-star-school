import React from "react";

export interface BadgeProps {
  variant?: "active" | "inactive" | "neutral";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
  style,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
};

export default Badge;
