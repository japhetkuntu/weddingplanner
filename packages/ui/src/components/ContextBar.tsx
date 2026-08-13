import type { ReactNode } from "react";

export interface ContextBarProps {
  coupleName: string;
  weddingDate: string;
  daysToGo?: number;
  action?: ReactNode;
}

export function ContextBar({ coupleName, weddingDate, daysToGo, action }: ContextBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-[#ddd] bg-bg-warm px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-lg">{coupleName}</span>
        <span className="text-sm text-ink/60">{weddingDate}</span>
        {daysToGo !== undefined ? (
          <span className="text-xs font-bold uppercase tracking-[.08em] text-primary">{daysToGo} days to go</span>
        ) : null}
      </div>
      {action}
    </div>
  );
}
