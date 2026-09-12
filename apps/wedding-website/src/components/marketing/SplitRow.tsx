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
}: {
  media: MarketingMedia;
  index?: string;
  meta?: string;
  title: string;
  body: ReactNode;
  cta?: ReactNode;
  reverse?: boolean;
  minHeight?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2", minHeight)}>
      <div className={cn("relative order-1 aspect-[4/3] lg:aspect-auto", reverse ? "lg:order-2" : "lg:order-1")}>
        <PlaceholderImage image={media} className="absolute inset-0" />
      </div>
      <div
        className={cn(
          "order-2 flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16",
          reverse ? "lg:order-1" : "lg:order-2",
        )}
      >
        {index ? <p className="font-display text-lg italic text-white/60">No. {index}</p> : null}
        <h2 className="mt-2 whitespace-pre-line font-display text-3xl leading-[1.15] text-white sm:text-4xl">{title}</h2>
        <div className="mt-4 max-w-md text-sm leading-relaxed text-white/75">{body}</div>
        {meta ? <p className="mt-4 max-w-md font-display text-base italic text-white/60">{meta}</p> : null}
        {cta}
      </div>
    </div>
  );
}
