
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-card border border-border
        bg-surface p-6 shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
