import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";
import type { MarketingMedia } from "@/content/marketing";

/** The photo-heavy grid from a real gallery post (juliaandevita.com/galleries) — a two-column
 * masonry (via CSS multi-column, so mixed portrait/landscape photos stack naturally without gaps)
 * with each photo cascading into view as it's scrolled to, staggered a little per column so the
 * whole grid doesn't just pop in at once.
 *
 * Deliberately doesn't reuse `PlaceholderImage` here: that component forces `h-full w-full
 * object-cover` to fill a fixed-size parent, which is exactly wrong for a masonry grid — the
 * whole point is each photo keeps its own natural aspect ratio so the columns stagger. */
export function GalleryGrid({ photos }: { photos: MarketingMedia[] }) {
  return (
    <div className="columns-1 gap-3 px-4 sm:columns-2 sm:gap-4 sm:px-8 lg:px-16">
      {photos.map((photo, i) => (
        <RevealOnScroll key={photo.label + i} delayMs={(i % 2) * 120} className="mb-3 break-inside-avoid sm:mb-4">
          {photo.src ? (
            <img src={photo.src} alt={photo.label} className="block w-full" loading="lazy" decoding="async" />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-ink/15 to-ink/5 p-4 text-center">
              <span className="font-display text-sm italic text-ink/40">{photo.label}</span>
            </div>
          )}
        </RevealOnScroll>
      ))}
    </div>
  );
}
