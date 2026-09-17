import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@ovutor/ui";
import type { MarketingMedia } from "@/content/marketing";

const FOCAL_POSITION: Record<NonNullable<MarketingMedia["focalPoint"]>, string> = {
  top: "center top",
  center: "center center",
  bottom: "center bottom",
};

const SLIDE_DURATION_MS = 6000;

function HeroSlide({ media, active }: { media: MarketingMedia; active: boolean }) {
  const position = FOCAL_POSITION[media.focalPoint ?? "center"];
  const videoRef = useRef<HTMLVideoElement>(null);

  // The <video> element is reused across a slide's active/inactive transitions (same key, so React
  // doesn't remount it) — toggling the `autoPlay` attribute after mount does NOT restart playback
  // in any browser, so switching back to a video slide via the carousel would otherwise leave it
  // frozen on its last frame. Driving play()/pause() imperatively is what actually resumes it, and
  // pausing when inactive stops it decoding video it isn't showing.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  return (
    <div className={cn("absolute inset-0 transition-opacity duration-1000 ease-in-out", active ? "opacity-100" : "opacity-0")} aria-hidden={!active}>
      {media.video ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
          src={media.video}
          poster={media.src}
          autoPlay={active}
          muted
          loop
          playsInline
        />
      ) : media.src ? (
        <img
          src={media.src}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
          loading={active ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={active ? "high" : "low"}
        />
      ) : (
        <div className="flex h-full w-full items-end justify-end bg-gold p-6 text-right">
          <span className="font-display text-sm italic text-ink/40">{media.label}</span>
        </div>
      )}
    </div>
  );
}

/** Full-bleed hero background — a single image/video, or (pass an array) a slow auto-advancing
 * crossfade carousel mixing images and videos freely. Falls back to the same labeled-gradient
 * placeholder the rest of the app uses wherever an entry has no real asset yet. `children` render
 * absolutely on top via a relative z-10 wrapper, so each page controls its own overlay layout
 * instead of this component opinionating about it. */
export function HeroMedia({
  media,
  children,
  className,
  heightClassName = "min-h-[78vh]",
  overlay = "gradient",
  dotsClassName = "bottom-5",
}: {
  media: MarketingMedia | MarketingMedia[];
  children?: ReactNode;
  className?: string;
  heightClassName?: string;
  overlay?: "gradient" | "dark" | "none";
  /** Vertical position for the slide dots — override when a page overlaps something (like About/
   * Services' title card) onto the bottom of the hero, or the default position sits underneath it. */
  dotsClassName?: string;
}) {
  const slides = Array.isArray(media) ? media : [media];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_DURATION_MS);
    return () => window.clearInterval(timer);
    // Slide count only changes if the content file itself changes, not per-render — re-keying the
    // timer on the array reference would restart it every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  return (
    <section className={cn("relative flex overflow-hidden bg-gold", heightClassName, className)}>
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <HeroSlide key={slide.video ?? slide.src ?? slide.label} media={slide} active={i === index} />
        ))}
        {overlay === "gradient" ? <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" /> : null}
        {overlay === "dark" ? <div className="absolute inset-0 bg-ink/45" /> : null}

        {slides.length > 1 ? (
          <div className={cn("absolute left-1/2 z-10 flex -translate-x-1/2 gap-2", dotsClassName)}>
            {slides.map((slide, i) => (
              <button
                key={slide.video ?? slide.src ?? slide.label}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                className={cn("h-1 transition-all", i === index ? "w-7 bg-white" : "w-3 bg-white/40 hover:bg-white/70")}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
    </section>
  );
}
