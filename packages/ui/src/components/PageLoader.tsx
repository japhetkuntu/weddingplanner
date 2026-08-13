import { cn } from "../cn";

export interface PageLoaderProps {
  label?: string;
  /** Fills the viewport (route-level boot/auth) vs. sitting inline within a page that already has chrome. */
  fullScreen?: boolean;
  className?: string;
}

/** The shared branded "wait" moment — an Ovutor heart mark that breathes gently while something
 * loads. Used for route-level Suspense fallbacks and auth bootstrap; pages with their own chrome
 * (sidebar, header) already visible should reach for Skeleton blocks instead so the shell doesn't flash. */
export function PageLoader({ label, fullScreen = true, className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "grid place-items-center bg-bg",
        fullScreen ? "min-h-screen" : "min-h-[320px]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="ovutor-breathe font-display text-4xl text-primary" aria-hidden="true">
          &#9825;
        </span>
        {label ? <p className="text-xs font-bold uppercase tracking-[.14em] text-ink/40">{label}</p> : null}
      </div>
    </div>
  );
}
