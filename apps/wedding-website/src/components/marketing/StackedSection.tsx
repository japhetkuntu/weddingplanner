import type { ReactNode } from "react";
import { cn } from "@ovutor/ui";

/** Height of the pinned title strip at the top of every stacked section. Each section's sticky
 * `top` offset is `index * HEADER_HEIGHT`, so once a later section's opaque body scrolls up to
 * cover an earlier one, it only ever reaches down to its own top edge — leaving exactly this many
 * pixels of the section(s) above it, where their title lives, still uncovered. Stack five sections
 * and you get five titles staircasing down the screen, each one staying put once revealed. */
const HEADER_HEIGHT = 96;

/** A section that sticks near the top of the viewport and stays there as later `StackedSection`s
 * scroll up and cover it — the "cards stacking as you scroll" effect. Unlike a plain sticky overlay,
 * each section's `title` is pinned to its own top strip (see `HEADER_HEIGHT`), so titles never get
 * hidden: as each new card slides over the one before it, only the body content underneath its
 * title gets covered, and the title itself keeps staircasing down the screen. Pass the section's
 * position in the sequence as `index` — both the sticky offset and the z-index (later cards need a
 * higher one so they visually cover earlier ones, not the reverse) are computed from it. A shadow
 * on the top edge sells the "a card sliding in over the one beneath" look even though every card
 * shares the same flat background. */
export function StackedSection({
  index,
  title,
  children,
  className,
}: {
  index: number;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky flex min-h-screen flex-col overflow-hidden bg-bg shadow-[0_-24px_48px_-16px_rgba(30,30,30,0.18)]",
        className,
      )}
      style={{ top: index * HEADER_HEIGHT, zIndex: 10 + index }}
    >
      <div
        className="flex shrink-0 items-center justify-center px-6 text-center"
        style={{ height: HEADER_HEIGHT }}
      >
        <h3 className="line-clamp-2 font-display text-xl leading-tight text-ink sm:text-2xl">{title}</h3>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-hidden">{children}</div>
    </div>
  );
}
