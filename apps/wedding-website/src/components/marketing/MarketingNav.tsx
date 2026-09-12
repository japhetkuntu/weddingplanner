import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@ovutor/ui";
import { NAV_LINKS } from "@/content/marketing";

/** Fixed top bar (logo + a "Menu" trigger, transparent so it sits over a hero) plus a full-screen
 * overlay menu — the pattern borrowed from nordicadventureweddings.eu's navigation: opening the
 * menu doesn't drop a small dropdown, it takes over the whole viewport with large stacked links,
 * closed by an explicit X. Closes automatically on route change so a link click doesn't leave the
 * overlay sitting open on the next page.
 *
 * `dark` controls the closed top bar's own text color, not the overlay (which is always the same
 * light/ink combination) — pass `dark={false}` on a page whose very top is a light background
 * (Journal's masthead has no hero image behind it), or the white default becomes unreadable. */
export function MarketingNav({ dark = true }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

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
          "absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-6 sm:px-10",
          dark ? "text-white" : "text-ink",
        )}
      >
        <Link to="/" className="font-display text-2xl">
          Ovutor <span className="text-primary">&#9825;</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em]"
          aria-expanded={open}
          aria-label="Open menu"
        >
          Menu
          <span className={cn("flex h-10 w-10 flex-col items-center justify-center gap-[5px] border", dark ? "border-white/50" : "border-ink/30")}>
            <span className={cn("h-px w-4", dark ? "bg-white" : "bg-ink")} />
            <span className={cn("h-px w-4", dark ? "bg-white" : "bg-ink")} />
          </span>
        </button>
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
          className="absolute right-6 top-6 grid h-11 w-11 place-items-center border border-ink/15 text-lg sm:right-10 sm:top-6"
        >
          &#10005;
        </button>

        <nav className="flex h-full flex-col items-end justify-center gap-3 px-8 sm:gap-4 sm:px-16">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "font-display text-4xl leading-tight transition-opacity hover:opacity-60 sm:text-5xl",
                location.pathname === link.to ? "text-primary" : "text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="mt-6 border border-primary bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-[.12em] text-white hover:brightness-110"
          >
            Enquire now
          </Link>
        </nav>
      </div>
    </>
  );
}
