import { cn } from "@ovutor/ui";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { MarketingSectionDto } from "@/lib/marketingApi";
import type { FocalPoint } from "@/types";

/** One admin-added section, appended after a page's hero. Unlike the page's own fixed sections,
 * these have no static counterpart to fall back to — they only exist because an admin added them,
 * so a section with nothing in it yet (no heading, body, or image) renders nothing rather than an
 * empty box. */
export function DynamicContentBlock({ section }: { section: MarketingSectionDto }) {
  const { heading, body, image, layout } = section;
  if (!heading && !body && !image?.url) return null;

  const textBlock = (
    <div className="flex flex-1 flex-col justify-center px-6 py-14 sm:px-10 sm:py-16">
      {heading ? <h2 className="font-display text-2xl leading-snug text-ink sm:text-3xl">{heading}</h2> : null}
      {body ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">{body}</p> : null}
    </div>
  );

  if (layout === "text-only" || !image?.url) {
    return <div className="text-center">{textBlock}</div>;
  }

  const imageEl = (
    <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:flex-1">
      <PlaceholderImage image={{ src: image.url, label: image.label ?? "", focalPoint: (image.focalPoint as FocalPoint) ?? "center" }} className="absolute inset-0" />
    </div>
  );

  if (layout === "image-full") {
    return (
      <div className="relative">
        <div className="aspect-[16/9] w-full">
          <PlaceholderImage image={{ src: image.url, label: image.label ?? "", focalPoint: (image.focalPoint as FocalPoint) ?? "center" }} className="absolute inset-0 h-full w-full" />
        </div>
        {heading || body ? <div className="bg-bg text-center">{textBlock}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row", layout === "image-right" && "sm:flex-row-reverse")}>
      {imageEl}
      {textBlock}
    </div>
  );
}
