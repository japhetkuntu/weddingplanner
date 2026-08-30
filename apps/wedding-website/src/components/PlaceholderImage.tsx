import { cn } from "@ovutor/ui";
import type { SiteImage } from "@/types";

const FOCAL_POSITION: Record<NonNullable<SiteImage["focalPoint"]>, string> = {
  top: "center top",
  center: "center center",
  bottom: "center bottom",
};

/** Renders the real photo once uploaded; falls back to a labeled placeholder so layouts never look empty.
 * `fit="contain"` shows the entire photo with no cropping — a softly blurred, scaled-up copy of the same
 * photo fills the rest of the frame behind it, so the section still reads as fully covered instead of
 * leaving flat empty space around the picture. The default `"cover"` fills tight grid/thumbnail spots. */
export function PlaceholderImage({
  image,
  className,
  fit = "cover",
  priority = false,
}: {
  image: SiteImage;
  className?: string;
  fit?: "cover" | "contain";
  /** Set for the one image visible above the fold (the hero) so it loads eagerly at high priority;
   * every other image defaults to lazy + async so the initial page load isn't held up by photos
   * the visitor hasn't scrolled to yet. */
  priority?: boolean;
}) {
  if (image.src) {
    const position = FOCAL_POSITION[image.focalPoint ?? "center"];
    const loading = priority ? "eager" : "lazy";
    const fetchPriority = priority ? "high" : "low";
    if (fit === "contain") {
      return (
        <div className={cn("relative h-full w-full overflow-hidden", className)}>
          <img
            src={image.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            style={{ objectPosition: position }}
            loading={loading}
            decoding="async"
            fetchPriority={fetchPriority}
          />
          <div className="absolute inset-0 bg-ink/35" />
          <img
            src={image.src}
            alt={image.label}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ objectPosition: position }}
            loading={loading}
            decoding="async"
            fetchPriority={fetchPriority}
          />
        </div>
      );
    }
    return (
      <img
        src={image.src}
        alt={image.label}
        className={cn("h-full w-full object-cover", className)}
        style={{ objectPosition: position }}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    );
  }
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br from-ink/15 to-ink/5 p-4 text-center", className)}>
      <span className="font-display text-sm italic text-ink/40">{image.label}</span>
    </div>
  );
}
