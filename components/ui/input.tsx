
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          w-full rounded-lg border bg-surface px-3.5 py-2.5
          text-sm text-foreground outline-none transition
          placeholder:text-muted
          focus:border-primary focus:ring-2 focus:ring-primary/10
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-error focus:border-error focus:ring-error/10" : "border-border"}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}
