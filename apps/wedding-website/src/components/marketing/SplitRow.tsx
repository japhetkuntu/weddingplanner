import type { ReactNode } from "react";
import { cn } from "@ovutor/ui";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { MarketingMedia } from "@/content/marketing";

/** The recurring editorial row pattern behind both the About page's "flow" (annelaureweddings.com
 * /love-notes) and each Journal entry (juliaandevita.com/galleries): a large photo on one side,
 * a numbered/labeled text column on the other, alternating sides as it repeats down the page.
 * Deliberately full-bleed (no max-width) so it can sit directly on a page's vibrant background. */
export function SplitRow({
  media,
  index,
  meta,
  title,
  body,
  cta,
  reverse = false,
  minHeight = "min-h-[80vh]",
  tone = "pink",
}: {
  media: MarketingMedia;
  index?: string;
  meta?: string;
  title: string;
  body: ReactNode;
  cta?: ReactNode;
  reverse?: boolean;
  minHeight?: string;
  /** Panel color: pink (white text) or gold (ink text). */
  tone?: "pink" | "gold";
}) {
  const gold = tone === "gold";
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2", gold ? "bg-gold text-ink" : "bg-primary text-white", minHeight)}>
      <div className={cn("relative order-1 aspect-[4/3] lg:aspect-auto", reverse ? "lg:order-2" : "lg:order-1")}>
        <PlaceholderImage image={media} className="absolute inset-0" />
      </div>
      <div
        className={cn(
          "order-2 flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16",
          reverse ? "lg:order-1" : "lg:order-2",
        )}
      >
        {index ? <p className="font-display text-lg italic opacity-60">No. {index}</p> : null}
        <h2 className="mt-2 whitespace-pre-line font-display text-3xl leading-[1.15] sm:text-4xl">{title}</h2>
        <div className="mt-4 max-w-md text-sm leading-relaxed opacity-80">{body}</div>
        {meta ? <p className="mt-4 max-w-md font-display text-base italic opacity-60">{meta}</p> : null}
        {cta}
      </div>
    </div>
  );
}

/** Row colors for a run of SplitRows: mostly gold with pink mixed in, never starting gold when the
 * section above is gold (`afterGold`) and never ending gold, since the footer below is gold. */
export function splitTones(count: number, afterGold = false): ("gold" | "pink")[] {
  return Array.from({ length: count }, (_, i) => {
    let t: "gold" | "pink" = i % 3 === 2 ? "pink" : "gold";
    if (i === 0 && afterGold) t = "pink";
    if (i === count - 1) t = "pink";
    return t;
  });
}
