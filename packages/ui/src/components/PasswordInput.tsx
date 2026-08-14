import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../cn";
import { Input } from "./Field";

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.24 4.24M6.6 6.7C4.16 8.3 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.85-1.24M9.9 5.2C10.58 5.07 11.28 5 12 5c6.5 0 10 7 10 7-.42.77-1.07 1.75-1.98 2.72"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A password <Input> with a show/hide toggle — so the person typing can double-check what they
 * entered instead of trusting a row of dots, without ever changing the field's actual value. */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
          className="absolute right-0 top-0 grid h-[46px] w-11 place-items-center text-ink/40 hover:text-ink"
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
