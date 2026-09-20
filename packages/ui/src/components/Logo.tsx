import { cn } from "../cn";
import logoWordmark from "../assets/logo-wordmark.png";
import logoWordmarkWhite from "../assets/logo-wordmark-white.png";

/** The Ovutor wordmark — the studio's actual logo mark (cursive "Ovutor" with a red heart nested
 * into the "O"), rendered from the source artwork. Sized by height, not font-size: pass a
 * `className` with an `h-*` utility (or a literal height) the way you'd size any image logo.
 *
 * Two fixed-color variants exist because a raster mark can't shift with `currentColor` the way
 * the old CSS-text version could: `invert` swaps in the all-white recolor for the couple of spots
 * where the logo sits directly over a dark photo/gradient overlay (the wedding-website's
 * transparent nav bar, a couple-site header) — everywhere else (plain or light/color-block
 * backgrounds) use the default, true-to-source colors. Shared across all three apps
 * (wedding-website, admin-portal, client-portal) since it's the one platform-wide brand mark. */
export function Logo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <img
      src={invert ? logoWordmarkWhite : logoWordmark}
      alt="Ovutor"
      className={cn("inline-block h-8 w-auto object-contain align-middle", className)}
    />
  );
}
