import type { ReactNode } from "react";
import { cn } from "../cn";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Right-side detail panel on desktop; slides in as a full-screen overlay on mobile. */
export function Drawer({ open, onClose, title, children, className }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:absolute lg:inset-auto">
      <div className="absolute inset-0 bg-ink/30 lg:hidden" onClick={onClose} />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-t-[3px] border-primary bg-white p-5 shadow-modal sm:w-[400px]",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-sm font-bold uppercase tracking-[.1em] text-ink/60 hover:text-ink">
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
