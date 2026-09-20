import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn, Logo } from "@ovutor/ui";
import { NAV_LINKS, STUDIO } from "@/content/marketing";
import { pick } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingSocialDto } from "@/lib/marketingApi";
import overlayImage from "@/assets/photos/couple-trad-portrait-gold.jpg";

/** Fixed top bar (icon / centered logo / bare hamburger, no "Menu" label — transparent so it sits
 * over a hero) plus a full-screen overlay menu — the pattern from nordicadventureweddings.eu's
 * navigation: an icon-left, logo-center, hamburger-right top bar, and opening the menu takes over
 * the whole viewport with a decorative photo on one side and large stacked links on the other,
 * rather than a small dropdown. Closes automatically on route change so a link click doesn't leave
 * the overlay sitting open on the next page.
 *
 * `dark` controls the closed top bar's own text color, not the overlay (which is always the same
 * light/ink combination) — pass `dark={false}` on a page whose very top is a light background
 * (Journal's masthead has no hero image behind it), or the white default becomes unreadable. */
export function MarketingNav({ dark = true }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [instagram, setInstagram] = useState(STUDIO.instagram);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    getMarketingPage("studio")
      .then((data) => setInstagram(pick(getContentBlock<MarketingSocialDto>(data, "social")?.instagram, STUDIO.instagram)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "absolute inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-6 sm:px-10",
          dark ? "text-white" : "text-ink",
        )}
      >
        <a
          href={`https://instagram.com/${instagram.replace("@", "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Ovutor on Instagram"
          className="justify-self-start opacity-80 hover:opacity-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>

        <Link to="/" className="justify-self-center">
          <Logo className="h-8 sm:h-10" invert={dark} />
        </Link>

        <div className="flex items-center justify-self-end gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Open menu"
            className={cn("flex h-10 w-10 flex-col items-center justify-center gap-[5px] border", dark ? "border-white/50" : "border-ink/30")}
          >
            <span className={cn("h-px w-4", dark ? "bg-white" : "bg-ink")} />
            <span className={cn("h-px w-4", dark ? "bg-white" : "bg-ink")} />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-bg text-ink transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute left-1/2 top-6 z-10 grid h-11 w-11 -translate-x-1/2 place-items-center border border-primary text-lg text-primary"
        >
          &#10005;
        </button>

        <div className="grid h-full grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:block">
            <img src={overlayImage} alt="" className="h-full w-full object-cover" />
          </div>
          <nav className="flex flex-col items-start justify-center gap-3 px-8 py-24 sm:gap-4 sm:px-16">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "font-display text-3xl leading-tight transition-opacity hover:opacity-60 sm:text-4xl",
                  location.pathname === link.to ? "text-primary" : "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://client.ovutor.com"
              className="mt-6 border border-gold bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[.12em] text-ink hover:brightness-90"
            >
              Enquire now
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
