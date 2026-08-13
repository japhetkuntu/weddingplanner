import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";

export type ButtonVariant = "primary" | "outline" | "dark" | "ghost";
export type ButtonSize = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner + loadingText and disables the button — use while awaiting an API response. */
  loading?: boolean;
  loadingText?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white border border-primary hover:brightness-110",
  outline: "bg-white text-primary border border-primary hover:bg-primary/5",
  dark: "bg-ink text-white border border-ink hover:brightness-125",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-ink/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-[45px] px-5 text-[11px]",
  sm: "min-h-[38px] px-4 text-[10px]",
};

/** Shared with LinkButton so a Link can look identical to a <button>. */
export function buttonClassNames(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-[.1em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45",
    sizeClasses[size],
    variantClasses[variant],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, loading = false, loadingText = "Saving…", disabled, children, ...props }, ref) => (
    <button ref={ref} className={buttonClassNames(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = "Button";
