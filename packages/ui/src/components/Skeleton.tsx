import type { HTMLAttributes } from "react";
import { cn } from "../cn";

/** A single shimmering block — compose these to match the real layout being loaded
 * (a line of text, a card, a table row) rather than reaching for a generic spinner. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ovutor-skeleton bg-ink/10", className)} {...props} />;
}
