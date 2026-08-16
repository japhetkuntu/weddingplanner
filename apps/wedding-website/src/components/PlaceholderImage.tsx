import { cn } from "@ovutor/ui";
import type { SiteImage } from "@/types";

const FOCAL_POSITION: Record<NonNullable<SiteImage["focalPoint"]>, string> = {
  top: "center top",
  center: "center center",
  bottom: "center bottom",
};

/** Renders the real photo once uploaded; falls back to a labeled placeholder so layouts never look empty. */
export function PlaceholderImage({ image, className }: { image: SiteImage; className?: string }) {
  if (image.src) {
    return (
      <img
        src={image.src}
        alt={image.label}
        className={cn("h-full w-full object-cover", className)}
        style={{ objectPosition: FOCAL_POSITION[image.focalPoint ?? "center"] }}
      />
    );
  }
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br from-ink/15 to-ink/5 p-4 text-center", className)}>
      <span className="font-display text-sm italic text-ink/40">{image.label}</span>
    </div>
  );
}
