import { cn } from "../cn";

/** The Ovutor wordmark: a cursive "Ovutor" with a small red heart nested into the "O", matching
 * the studio's logo mark. Rendered as live text in the "Alex Brush" script font rather than a
 * raster image, so it has no background of its own — it drops onto a photo, a color block, or a
 * plain page and always looks right — and the word itself inherits `currentColor` so callers over
 * a dark hero can make it white the same way they already color the rest of their header. Only the
 * heart is a fixed color: it's red in the source mark on every background, not something that
 * should flip with the surrounding text color. Shared across all three apps (wedding-website,
 * admin-portal, client-portal) since it's the one platform-wide brand mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block whitespace-nowrap font-script normal-case leading-none tracking-normal", className)}>
      <span aria-hidden="true" className="relative inline-block leading-none">
        O
        <span
          className="absolute"
          style={{ left: "0.22em", top: "0.78em", fontSize: "0.38em", color: "#E2231A", lineHeight: 1 }}
        >
          &#9829;
        </span>
      </span>
      <span aria-hidden="true">vutor</span>
      <span className="sr-only">Ovutor</span>
    </span>
  );
}
