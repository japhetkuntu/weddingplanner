import type { ReactNode } from "react";
import { cn } from "../cn";

export type ToastTone = "default" | "error";

export interface ToastProps {
  open: boolean;
  children: ReactNode;
  action?: ReactNode;
  /** "error" for a failed save/action the user should notice as distinct from a plain confirmation. */
  tone?: ToastTone;
}

const toneClasses: Record<ToastTone, string> = {
  default: "bg-ink text-white",
  error: "bg-[#5d2924] text-white border border-primary",
};

/** Bottom-corner confirmation toast (e.g. "Saved · Undo") used across editable admin screens. */
export function Toast({ open, children, action, tone = "default" }: ToastProps) {
  if (!open) return null;
  return (
    <div
      className={cn(
        "fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 px-4 py-3 text-sm shadow-modal sm:left-auto sm:right-5 sm:translate-x-0",
        toneClasses[tone],
      )}
    >
      <span>{children}</span>
      {action}
    </div>
  );
}
