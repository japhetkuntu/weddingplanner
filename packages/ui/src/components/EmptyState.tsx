import type { ReactNode } from "react";
import { cn } from "../cn";

export interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
  /** Compact removes the vertical padding/mark for use inside tight spaces like table cells. */
  compact?: boolean;
  className?: string;
}

/** Branded empty/near-empty placeholder — a soft heart mark, a title, and an optional next action. */
export function EmptyState({ title, message, action, compact, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border border-dashed border-[#d8d3cd] bg-bg-warm text-center",
        compact ? "px-6 py-8" : "px-8 py-14",
        className,
      )}
    >
      {compact ? null : (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-primary/25 bg-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary/70">
            <path
              d="M12 20.5s-8-4.9-8-11.2A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8 3.2c0 6.3-8 11.2-8 11.2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <p className={cn("font-display", compact ? "text-lg" : "text-2xl")}>{title}</p>
      {message ? <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/55">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
