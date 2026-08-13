import type { ReactNode } from "react";

export interface ToastProps {
  open: boolean;
  children: ReactNode;
  action?: ReactNode;
}

/** Bottom-corner confirmation toast (e.g. "Saved · Undo") used across editable admin screens. */
export function Toast({ open, children, action }: ToastProps) {
  if (!open) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 bg-ink px-4 py-3 text-sm text-white shadow-modal sm:left-auto sm:right-5 sm:translate-x-0">
      <span>{children}</span>
      {action}
    </div>
  );
}
