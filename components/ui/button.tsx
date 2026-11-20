
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-primary-light text-primary hover:bg-indigo-100",
    outline: "border border-border bg-surface text-foreground hover:bg-background",
    danger: "bg-error text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-colors
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
